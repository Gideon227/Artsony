import { useEffect, useRef } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  sellerService,
  type AdminSellerFilters,
  type SellerRegistration,
  type DispatchAddressInput,
  type SellerRegistrationStatus,
  type SellerReviewAction,
} from '@/services/seller.service'
import { authService } from '@/services/auth.service'
import { selectIsHydrated, useAuthStore } from '@/store'
import { useToast } from '@/components/ui/toaster'
import { HttpError } from '@/lib/api-client'
import { STALE_TIMES } from '@/constants'

const KEY = ['my-seller-registration'] as const
const ADMIN_KEY = ['admin-seller-registrations'] as const

const PENDING_POLL_MS = 60_000

const errorMessage = (err: unknown) => (err instanceof HttpError ? err.message : 'Please try again.')

// A 404 here just means "never applied to sell" — a normal, common state,
// not an error — so this doesn't retry or surface a toast on failure.
export function useMySellerRegistration(options: { poll?: boolean; enabled?: boolean } = {}) {
  return useQuery({
    queryKey: KEY,
    enabled: options.enabled ?? true,
    queryFn: () => sellerService.getMyRegistration().then((r) => r.data),
    staleTime: STALE_TIMES.fast,
    retry: false,
    throwOnError: false,
    refetchInterval: options.poll
      ? (query) => (query.state.data?.status === 'PENDING' ? PENDING_POLL_MS : false)
      : false,
  })
}

// users.role is persisted in the auth store and only refreshed at session
// bootstrap, so an admin approving (or suspending) the applicant would leave
// the footer, mobile nav and upload access stale until a reload. When the
// registration status disagrees with the stored role, pull a fresh /me.
export function useSyncSellerRole(status: SellerRegistrationStatus | undefined) {
  const role = useAuthStore((s) => s.user?.role)
  const setUser = useAuthStore((s) => s.setUser)
  const inFlight = useRef(false)

  useEffect(() => {
    if (!status || !role || role === 'ADMIN' || role === 'MODERATOR') return
    if ((status === 'APPROVED') === (role === 'ARTIST')) return
    if (inFlight.current) return

    inFlight.current = true
    authService
      .me()
      .then((res) => setUser(res.data))
      .catch((err) => console.error('[seller] could not refresh the session after a status change:', err))
      .finally(() => {
        inFlight.current = false
      })
  }, [status, role, setUser])
}

export function useSubmitSellerRegistration() {
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (input: Parameters<typeof sellerService.submitRegistration>[0]) =>
      sellerService.submitRegistration(input),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(KEY, data)
      success('Application submitted', "We'll email you as soon as it has been reviewed.")
    },
    onError: (err) => {
      error('Could not submit your application', errorMessage(err))
    },
  })
}

// The two code mutations deliberately do not toast: the verification step shows
// their errors inline, next to the code inputs.
export function useSendSellerEmailCode() {
  return useMutation({
    mutationFn: (email: string) => sellerService.sendEmailCode(email).then((r) => r.data),
  })
}

export function useVerifySellerEmailCode() {
  return useMutation({
    mutationFn: (input: { email: string; code: string }) => sellerService.verifyEmailCode(input),
  })
}

export function useUpdateDispatchAddress() {
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (input: DispatchAddressInput) => sellerService.updateDispatchAddress(input),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(KEY, data)
      success('Saved', 'Your dispatch address has been updated.')
    },
    onError: (err) => {
      error('Could not save', errorMessage(err))
    },
  })
}

export function useAdminSellerRegistrations(filters: AdminSellerFilters) {
  return useQuery({
    queryKey: [...ADMIN_KEY, filters],
    queryFn: () => sellerService.adminList(filters).then((r) => r.data),
    placeholderData: keepPreviousData,
    staleTime: STALE_TIMES.fast,
  })
}

const REVIEW_SUCCESS: Record<SellerReviewAction, string> = {
  approve: 'Application approved',
  reject: 'Application rejected',
  suspend: 'Seller suspended',
  reactivate: 'Seller reactivated',
}

export function useReviewSellerRegistration() {
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (input: { id: string; action: SellerReviewAction; notes?: string }) =>
      sellerService.adminReview(input.id, input.action, input.notes).then((r) => r.data),
    onSuccess: (_data, { action }) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEY })
      success(REVIEW_SUCCESS[action], 'The applicant has been notified by email.')
    },
    onError: (err) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEY })
      error('Action failed', errorMessage(err))
    },
  })
}
export type SellerAccountState =
  | { status: 'loading' }
  | { status: 'error'; retry: () => void }
  | { status: 'approved' }
  | { status: 'none' }
  | { status: 'pending' | 'rejected' | 'suspended'; registration: SellerRegistration }

// Single answer to "does this user have a seller account?". The role in the
// auth store is what the backend authorizes against, so ARTIST means approved.
// Anyone else is looked up in their registration to tell "never applied" (404)
// apart from pending, rejected and suspended.
export function useSellerAccountState(): SellerAccountState {
  const isHydrated = useAuthStore(selectIsHydrated)
  const isArtist = useAuthStore((s) => s.user?.role === 'ARTIST')
  const registration = useMySellerRegistration({ poll: true, enabled: isHydrated && !isArtist })
  useSyncSellerRole(registration.data?.status)

  if (!isHydrated) return { status: 'loading' }
  if (isArtist) return { status: 'approved' }
  if (registration.isPending) return { status: 'loading' }

  if (registration.isError) {
    if (registration.error instanceof HttpError && registration.error.statusCode === 404) return { status: 'none' }
    return { status: 'error', retry: () => void registration.refetch() }
  }

  const current = registration.data
  switch (current.status) {
    case 'PENDING':
      return { status: 'pending', registration: current }
    case 'REJECTED':
      return { status: 'rejected', registration: current }
    case 'SUSPENDED':
      return { status: 'suspended', registration: current }
    case 'APPROVED':
      // Approved but the stored role is stale; useSyncSellerRole is refreshing it.
      return { status: 'loading' }
  }
}