'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
  type QueryClient,
} from '@tanstack/react-query'
import { physicalOrderService } from '@/services/order/physical-order.service'
import type {
  ActivatePickupInput,
  AddDeliveryProofInput,
  InTransitInput,
  PickupFailureInput,
  ProcessRefundInput,
  UpdateCourierInfoInput,
  PhysicalOrderQueryParams,
} from '@/services/order/physical-order.service'
import { HttpError } from '@/lib/api-client'
import { useAuthStore, selectUser, selectIsAuthenticated } from '@/store'
import { useToast } from '@/components/ui/toaster'
import { STALE_TIMES } from '@/constants'
import type {
  OrderItemPhysical,
  BuyerOrderView,
  ArtistOrderView,
  CommerceApiSuccess,
  PhysicalOrderDetailView,
  ShippingAddressSnapshot,
} from '@/types/order'

export const physicalOrderKeys = {
  all: ['physical-orders'] as const,
  buyer: (view: BuyerOrderView, filters: PhysicalOrderQueryParams) =>
    [...physicalOrderKeys.all, 'buyer', view, filters] as const,
  artist: (view: ArtistOrderView, filters: PhysicalOrderQueryParams) =>
    [...physicalOrderKeys.all, 'artist', view, filters] as const,
  admin: (filters: PhysicalOrderQueryParams) => [...physicalOrderKeys.all, 'admin', filters] as const,
  refundRequests: () => [...physicalOrderKeys.all, 'refund-requests'] as const,
  detail: (physicalId: string) => [...physicalOrderKeys.all, 'detail', physicalId] as const,
}

function describeError(err: unknown, fallback: string): string {
  if (err instanceof HttpError) {
    if (err.statusCode === 409) return 'This item was just updated by someone else. Refreshing…'
    if (err.statusCode === 403) return "You don't have permission to do this."
    if (err.statusCode === 422 || err.statusCode === 400) return err.message
    return err.message || fallback
  }
  return fallback
}

// ── Queries ────────────────────────────────────────────────────────────────────

export function useBuyerPhysicalOrders(view: BuyerOrderView, filters: PhysicalOrderQueryParams = {}) {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  return useQuery({
    queryKey: physicalOrderKeys.buyer(view, filters),
    queryFn: () => physicalOrderService.getBuyerOrders(view, filters),
    enabled: isAuthenticated,
    staleTime: STALE_TIMES.fast,
    placeholderData: keepPreviousData,
  })
}

export function useArtistPhysicalOrders(view: ArtistOrderView, filters: PhysicalOrderQueryParams = {}) {
  const user = useAuthStore(selectUser)
  const enabled = user?.role === 'ARTIST' || user?.role === 'ADMIN'
  return useQuery({
    queryKey: physicalOrderKeys.artist(view, filters),
    queryFn: () => physicalOrderService.getArtistOrders(view, filters),
    enabled,
    staleTime: STALE_TIMES.fast,
    placeholderData: keepPreviousData,
  })
}

export function useAdminPhysicalOrders(filters: PhysicalOrderQueryParams = {}) {
  const user = useAuthStore(selectUser)
  const enabled = user?.role === 'ADMIN'
  return useQuery({
    queryKey: physicalOrderKeys.admin(filters),
    queryFn: () => physicalOrderService.getAdminOrders(filters),
    enabled,
    staleTime: STALE_TIMES.fast,
    placeholderData: keepPreviousData,
  })
}

export function usePendingRefundRequests() {
  const user = useAuthStore(selectUser)
  const enabled = user?.role === 'ADMIN'
  return useQuery({
    queryKey: physicalOrderKeys.refundRequests(),
    queryFn: () => physicalOrderService.getPendingRefundRequests().then((r) => r.data),
    enabled,
    staleTime: STALE_TIMES.fast,
  })
}

export function usePhysicalOrderDetail(physicalId: string | undefined) {
  return useQuery({
    queryKey: physicalOrderKeys.detail(physicalId ?? ''),
    queryFn: () => physicalOrderService.getOrderView(physicalId!),
    enabled: Boolean(physicalId),
    staleTime: 30_000,
  })
}

// ── Optimistic patch helper ────────────────────────────────────────────────────

function patchDetailCache(
  queryClient: QueryClient,
  physicalId: string,
  patch: Partial<OrderItemPhysical>,
) {
  const key = physicalOrderKeys.detail(physicalId)
  const previous = queryClient.getQueryData<CommerceApiSuccess<PhysicalOrderDetailView>>(key)
  if (!previous) return previous

  queryClient.setQueryData<CommerceApiSuccess<PhysicalOrderDetailView>>(key, {
    ...previous,
    data: { ...previous.data, physical: { ...previous.data.physical, ...patch } },
  })
  return previous
}

function rollbackDetailCache(
  queryClient: QueryClient,
  physicalId: string,
  previous: CommerceApiSuccess<PhysicalOrderDetailView> | undefined,
) {
  if (previous) queryClient.setQueryData(physicalOrderKeys.detail(physicalId), previous)
}

function invalidateListsFor(queryClient: QueryClient, scope: 'buyer' | 'artist' | 'admin' | 'all') {
  if (scope === 'all') {
    void queryClient.invalidateQueries({ queryKey: physicalOrderKeys.all })
    return
  }
  void queryClient.invalidateQueries({ queryKey: [...physicalOrderKeys.all, scope] })
}

// ── Buyer / artist mutations ───────────────────────────────────────────────────

export function useArtistConfirmOrder() {
  const queryClient = useQueryClient()
  const { error } = useToast()

  return useMutation({
    mutationFn: (physicalId: string) => physicalOrderService.artistConfirm(physicalId),

    onMutate: async (physicalId) => {
      await queryClient.cancelQueries({ queryKey: physicalOrderKeys.detail(physicalId) })
      const previous = patchDetailCache(queryClient, physicalId, { timeline_status: 'AWAITING_PICKUP' })
      return { previous }
    },

    onError: (err, physicalId, ctx) => {
      rollbackDetailCache(queryClient, physicalId, ctx?.previous)
      error('Could not confirm order', describeError(err, 'Please try again.'))
    },

    onSettled: (_data, _err, physicalId) => {
      void queryClient.invalidateQueries({ queryKey: physicalOrderKeys.detail(physicalId) })
      invalidateListsFor(queryClient, 'artist')
    },
  })
}

export function useCancelPhysicalItem() {
  const queryClient = useQueryClient()
  const { error, success } = useToast()

  return useMutation({
    mutationFn: ({ physicalId, reason }: { physicalId: string; reason: string }) =>
      physicalOrderService.cancelItem(physicalId, reason),

    onMutate: async ({ physicalId }) => {
      await queryClient.cancelQueries({ queryKey: physicalOrderKeys.detail(physicalId) })
      const previous = patchDetailCache(queryClient, physicalId, {
        timeline_status: 'ORDER_FAILED_TO_CONFIRM',
        delivery_status: 'CANCELLED',
      })
      return { previous }
    },

    onError: (err, { physicalId }, ctx) => {
      rollbackDetailCache(queryClient, physicalId, ctx?.previous)
      if (err instanceof HttpError && err.statusCode === 409) {
        error('Already being processed', 'This item is mid-update elsewhere. Refreshing…')
      } else {
        error('Could not cancel order', describeError(err, 'Please try again.'))
      }
    },

    onSuccess: () => success('Order cancelled'),

    onSettled: (_data, _err, { physicalId }) => {
      void queryClient.invalidateQueries({ queryKey: physicalOrderKeys.detail(physicalId) })
      invalidateListsFor(queryClient, 'all')
    },
  })
}

export function useRequestRefund() {
  const queryClient = useQueryClient()
  const { error, success } = useToast()

  return useMutation({
    mutationFn: ({ physicalId, reason }: { physicalId: string; reason: string }) =>
      physicalOrderService.requestRefund(physicalId, reason),

    onSuccess: (_data, { physicalId }) => {
      success('Refund request submitted')
      void queryClient.invalidateQueries({ queryKey: physicalOrderKeys.detail(physicalId) })
      invalidateListsFor(queryClient, 'artist')
    },

    onError: (err) => {
      if (err instanceof HttpError && err.statusCode === 409) {
        error('Refund already requested', 'A refund has already been initiated for this item.')
      } else {
        error('Could not submit refund request', describeError(err, 'Please try again.'))
      }
    },
  })
}

// ── Admin transition mutations ─────────────────────────────────────────────────

function useAdminTransitionMutation<TInput extends { physicalId: string }>(
  mutationFn: (input: TInput) => Promise<CommerceApiSuccess<OrderItemPhysical>>,
  optimisticPatch: (input: TInput) => Partial<OrderItemPhysical> | undefined,
  errorTitle: string,
) {
  const queryClient = useQueryClient()
  const { error } = useToast()

  return useMutation({
    mutationFn,

    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: physicalOrderKeys.detail(input.physicalId) })
      const patch = optimisticPatch(input)
      const previous = patch ? patchDetailCache(queryClient, input.physicalId, patch) : undefined
      return { previous }
    },

    onError: (err, input, ctx) => {
      rollbackDetailCache(queryClient, input.physicalId, ctx?.previous)
      error(errorTitle, describeError(err, 'Please try again.'))
    },

    onSettled: (_data, _err, input) => {
      void queryClient.invalidateQueries({ queryKey: physicalOrderKeys.detail(input.physicalId) })
      invalidateListsFor(queryClient, 'admin')
      invalidateListsFor(queryClient, 'buyer')
      invalidateListsFor(queryClient, 'artist')
    },
  })
}

export function useActivatePickup() {
  return useAdminTransitionMutation(
    (input: { physicalId: string } & ActivatePickupInput) =>
      physicalOrderService.activatePickup(input.physicalId, input),
    () => ({ timeline_status: 'AWAITING_PICKUP_ACTIVE' }),
    'Could not activate pickup',
  )
}

export function useUpdateCourierInfo() {
  return useAdminTransitionMutation(
    (input: { physicalId: string } & UpdateCourierInfoInput) =>
      physicalOrderService.updateCourierInfo(input.physicalId, input),
    (input) => {
      const { physicalId: _physicalId, ...patch } = input
      return patch
    },
    'Could not update courier info',
  )
}

export function useMarkPickedUp() {
  return useAdminTransitionMutation(
    (input: { physicalId: string }) => physicalOrderService.markPickedUp(input.physicalId),
    () => ({ timeline_status: 'PICKED_UP_ACTIVE' }),
    'Could not mark as picked up',
  )
}

export function useMarkInTransit() {
  return useAdminTransitionMutation(
    (input: { physicalId: string } & InTransitInput) =>
      physicalOrderService.markInTransit(input.physicalId, input),
    () => ({ timeline_status: 'IN_TRANSIT_ACTIVE' }),
    'Could not mark as in transit',
  )
}

export function useMarkOutForDelivery() {
  return useAdminTransitionMutation(
    (input: { physicalId: string }) => physicalOrderService.markOutForDelivery(input.physicalId),
    () => ({ timeline_status: 'OUT_FOR_DELIVERY_ACTIVE' }),
    'Could not mark as out for delivery',
  )
}

export function useMarkDelivered() {
  return useAdminTransitionMutation(
    (input: { physicalId: string }) => physicalOrderService.markDelivered(input.physicalId),
    () => ({ timeline_status: 'DELIVERED', delivery_status: 'DELIVERED' }),
    'Could not mark as delivered',
  )
}

export function useMarkDeliveryFailed() {
  return useAdminTransitionMutation(
    (input: { physicalId: string; notes?: string }) =>
      physicalOrderService.markDeliveryFailed(input.physicalId, input.notes),
    () => ({ timeline_status: 'DELIVERY_FAILED' }),
    'Could not mark delivery as failed',
  )
}

export function useMarkDelayed() {
  return useAdminTransitionMutation(
    (input: { physicalId: string; notes?: string }) =>
      physicalOrderService.markDelayed(input.physicalId, input.notes),
    () => ({ timeline_status: 'DELAYED_DELIVERY' }),
    'Could not mark as delayed',
  )
}

export function useReportPickupFailure() {
  return useAdminTransitionMutation(
    (input: { physicalId: string } & PickupFailureInput) =>
      physicalOrderService.reportPickupFailure(input.physicalId, input),
    (input) => ({ timeline_status: input.reason }),
    'Could not report pickup failure',
  )
}

// ── Refund processing (admin) — no optimistic patch, deliberate review action ──

export function useProcessRefund() {
  const queryClient = useQueryClient()
  const { error, success } = useToast()

  return useMutation({
    mutationFn: ({ requestId, ...payload }: { requestId: string } & ProcessRefundInput) =>
      physicalOrderService.processRefund(requestId, payload),

    onSuccess: (res) => {
      success(res.data.request.status === 'APPROVED' ? 'Refund approved' : 'Refund rejected')
      void queryClient.invalidateQueries({ queryKey: physicalOrderKeys.refundRequests() })
      void queryClient.invalidateQueries({
        queryKey: physicalOrderKeys.detail(res.data.physical.id),
      })
      invalidateListsFor(queryClient, 'all')
    },

    onError: (err) => error('Could not process refund', describeError(err, 'Please try again.')),
  })
}

// ── Delivery proof (admin) — no optimistic patch, array append ────────────────

export function useAddDeliveryProof() {
  const queryClient = useQueryClient()
  const { error, success } = useToast()

  return useMutation({
    mutationFn: ({ physicalId, ...payload }: { physicalId: string } & AddDeliveryProofInput) =>
      physicalOrderService.addDeliveryProof(physicalId, payload),

    onSuccess: (_data, { physicalId }) => {
      success('Delivery proof uploaded')
      void queryClient.invalidateQueries({ queryKey: physicalOrderKeys.detail(physicalId) })
    },

    onError: (err) => error('Could not upload delivery proof', describeError(err, 'Please try again.')),
  })
}

// ── Shipping address (admin, order-scoped) ─────────────────────────────────────
// Detail cache is keyed by physicalId, this mutation only knows orderId — cannot
// invalidate by direct key, so we predicate-match cached detail entries by their
// embedded physical.order_id.

export function useUpdateShippingAddress() {
  const queryClient = useQueryClient()
  const { error, success } = useToast()

  return useMutation({
    mutationFn: ({ orderId, address }: { orderId: string; address: ShippingAddressSnapshot }) =>
      physicalOrderService.updateShippingAddress(orderId, address),

    onSuccess: (_data, { orderId }) => {
      success('Shipping address updated')
      void queryClient.invalidateQueries({
        predicate: (query) => {
          if (query.queryKey[0] !== 'physical-orders' || query.queryKey[1] !== 'detail') return false
          const cached = query.state.data as CommerceApiSuccess<PhysicalOrderDetailView> | undefined
          return cached?.data.physical.order_id === orderId
        },
      })
      invalidateListsFor(queryClient, 'all')
    },

    onError: (err) => error('Could not update shipping address', describeError(err, 'Please try again.')),
  })
}

// ── Downloads (imperative, click-triggered) ────────────────────────────────────

export function useDownloadInvoice() {
  const { error } = useToast()
  return useMutation({
    mutationFn: (physicalId: string) => physicalOrderService.getInvoice(physicalId).then((r) => r.data),
    onError: (err) =>
      error('Invoice unavailable', describeError(err, 'This order has no invoice yet.')),
  })
}

export function useDownloadReceipt() {
  const { error } = useToast()
  return useMutation({
    mutationFn: (physicalId: string) => physicalOrderService.getReceipt(physicalId).then((r) => r.data),
    onError: (err) =>
      error('Receipt unavailable', describeError(err, 'This order has no receipt yet.')),
  })
}