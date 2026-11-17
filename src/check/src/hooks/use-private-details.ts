'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { userService, type PrivateDetails } from '@/services/user.service'
import { useAuthStore } from '@/store/auth.store'
import { useToast } from '@/components/ui/toaster'
import { HttpError } from '@/lib/api-client'
import { QUERY_KEYS, STALE_TIMES } from '@/constants'

// Phone number (Account Details) and billing address (Billings & Payments).
// One record, two settings tabs — each tab only sends the keys it owns.

export function usePrivateDetails() {
  const isAuthenticated = useAuthStore((s) => s.user !== null)
  return useQuery({
    queryKey: QUERY_KEYS.privateDetails,
    queryFn: () => userService.getPrivateDetails().then((r) => r.data),
    enabled: isAuthenticated,
    staleTime: STALE_TIMES.fast,
  })
}

export function useUpdatePrivateDetails() {
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (changes: Partial<PrivateDetails>) => userService.updatePrivateDetails(changes),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(QUERY_KEYS.privateDetails, data)
      success('Saved', 'Your details have been updated.')
    },
    onError: (err) => {
      const message =
        err instanceof HttpError && err.message !== 'Validation failed'
          ? err.message
          : err instanceof HttpError && err.fields && !Array.isArray(err.fields)
            ? Object.values(err.fields)[0] ?? 'Please check the highlighted fields.'
            : 'Your details could not be saved. Please try again.'
      error('Failed to save', message)
    },
  })
}
