import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { physicalOrderService } from '@/services/physical-order.service'
import { useToast } from '@/components/ui/toaster'
import { STALE_TIMES } from '@/constants'
import { HttpError } from '@/lib/api-client'
import type {
  PhysicalOrderFilters,
  ActivatePickupInput,
  UpdateCourierInfoInput,
  NotesInput,
  TransitUpdateInput,
  PickupFailureInput,
  CancelItemInput,
  RefundRequestInput,
  ProcessRefundInput,
  DeliveryProofInput,
  UpdateShippingAddressInput,
} from '@/types/physical-order'

const PHYSICAL_KEYS = {
  all: ['physical-orders'] as const,
  lists: () => [...PHYSICAL_KEYS.all, 'list'] as const,
  buyer: (f: PhysicalOrderFilters) => [...PHYSICAL_KEYS.lists(), 'buyer', f] as const,
  artist: (f: PhysicalOrderFilters) => [...PHYSICAL_KEYS.lists(), 'artist', f] as const,
  admin: (f: PhysicalOrderFilters) => [...PHYSICAL_KEYS.lists(), 'admin', f] as const,
  refundRequests: () => [...PHYSICAL_KEYS.all, 'refund-requests'] as const,
  detail: () => [...PHYSICAL_KEYS.all, 'detail'] as const,
  byId: (id: string) => [...PHYSICAL_KEYS.detail(), id] as const,
}

function invalidateAllLists(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: PHYSICAL_KEYS.lists() })
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof HttpError ? err.message : fallback
}

// ── Queries ──────────────────────────────────────────────────────────────────

export function useBuyerPhysicalOrders(filters: PhysicalOrderFilters = {}) {
  return useQuery({
    queryKey: PHYSICAL_KEYS.buyer(filters),
    queryFn: () => physicalOrderService.getBuyerItems(filters),
    staleTime: STALE_TIMES.fast,
  })
}

export function useArtistPhysicalOrders(filters: PhysicalOrderFilters = {}) {
  return useQuery({
    queryKey: PHYSICAL_KEYS.artist(filters),
    queryFn: () => physicalOrderService.getArtistItems(filters),
    staleTime: STALE_TIMES.fast,
  })
}

export function useAdminPhysicalOrders(filters: PhysicalOrderFilters = {}) {
  return useQuery({
    queryKey: PHYSICAL_KEYS.admin(filters),
    queryFn: () => physicalOrderService.getAdminItems(filters),
    staleTime: STALE_TIMES.fast,
  })
}

export function useAdminRefundRequests() {
  return useQuery({
    queryKey: PHYSICAL_KEYS.refundRequests(),
    queryFn: () => physicalOrderService.getAdminRefundRequests().then((r) => r.data),
    staleTime: STALE_TIMES.fast,
  })
}

export function usePhysicalOrderView(physicalId: string) {
  return useQuery({
    queryKey: PHYSICAL_KEYS.byId(physicalId),
    queryFn: () => physicalOrderService.getOrderView(physicalId).then((r) => r.data),
    staleTime: STALE_TIMES.fast,
    enabled: Boolean(physicalId),
  })
}

// ── Shared mutation factory for the fulfillment pipeline ─────────────────────

function usePhysicalMutation<TInput>(
  mutationFn: (physicalId: string, payload: TInput) => Promise<unknown>,
  successMessage: string,
  failureFallback = 'Something went wrong. Please try again.',
) {
  const qc = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: ({ physicalId, payload }: { physicalId: string; payload: TInput }) =>
      mutationFn(physicalId, payload),
    onSuccess: (_, { physicalId }) => {
      success('Updated', successMessage)
      qc.invalidateQueries({ queryKey: PHYSICAL_KEYS.byId(physicalId) })
    },
    onError: (err) => error('Action Failed', errorMessage(err, failureFallback)),
    onSettled: () => invalidateAllLists(qc),
  })
}

// ── Artist actions ────────────────────────────────────────────────────────────

export function useArtistConfirmItem() {
  const qc = useQueryClient()
  const { success, error } = useToast()
  return useMutation({
    mutationFn: (physicalId: string) => physicalOrderService.artistConfirm(physicalId),
    onSuccess: (_, physicalId) => {
      success('Order Confirmed', 'You have confirmed fulfillment for this order.')
      qc.invalidateQueries({ queryKey: PHYSICAL_KEYS.byId(physicalId) })
    },
    onError: (err) => error('Confirmation Failed', errorMessage(err, 'Could not confirm this order.')),
    onSettled: () => invalidateAllLists(qc),
  })
}

export function useRequestRefund() {
  return usePhysicalMutation<RefundRequestInput>(
    (id, payload) => physicalOrderService.requestRefund(id, payload),
    'Refund request submitted for admin review.',
  )
}

// ── Shared buyer/artist/admin ─────────────────────────────────────────────────

export function useCancelPhysicalItem() {
  return usePhysicalMutation<CancelItemInput>(
    (id, payload) => physicalOrderService.cancelItem(id, payload),
    'Order item cancelled.',
  )
}

export function useDownloadInvoice() {
  const { error } = useToast()
  return useMutation({
    mutationFn: (physicalId: string) => physicalOrderService.getInvoice(physicalId),
    onSuccess: (res) => {
      if (typeof window !== 'undefined') window.open(res.data.invoice_url, '_blank')
    },
    onError: (err) => {
      const message =
        err instanceof HttpError && err.statusCode === 404
          ? 'No invoice is available for this order yet.'
          : errorMessage(err, 'Could not fetch invoice.')
      error('Invoice Unavailable', message)
    },
  })
}

export function useDownloadReceipt() {
  const { error } = useToast()
  return useMutation({
    mutationFn: (physicalId: string) => physicalOrderService.getReceipt(physicalId),
    onSuccess: (res) => {
      if (typeof window !== 'undefined') window.open(res.data.receipt_url, '_blank')
    },
    onError: (err) => {
      const message =
        err instanceof HttpError && err.statusCode === 404
          ? 'No receipt is available for this order yet.'
          : errorMessage(err, 'Could not fetch receipt.')
      error('Receipt Unavailable', message)
    },
  })
}

// ── Admin: shipping address ───────────────────────────────────────────────────

export function useUpdateShippingAddress() {
  const qc = useQueryClient()
  const { success, error } = useToast()
  return useMutation({
    mutationFn: ({ orderId, payload }: { orderId: string; payload: UpdateShippingAddressInput }) =>
      physicalOrderService.updateShippingAddress(orderId, payload),
    onSuccess: (_, { orderId }) => {
      success('Address Updated', 'Shipping address has been updated.')
      qc.invalidateQueries({ queryKey: PHYSICAL_KEYS.byId(orderId) })
    },
    onError: (err) => error('Update Failed', errorMessage(err, 'Could not update shipping address.')),
    onSettled: () => invalidateAllLists(qc),
  })
}

// ── Admin: refunds ────────────────────────────────────────────────────────────

export function useProcessRefund() {
  const qc = useQueryClient()
  const { success, error } = useToast()
  return useMutation({
    mutationFn: ({ requestId, payload }: { requestId: string; payload: ProcessRefundInput }) =>
      physicalOrderService.processRefund(requestId, payload),
    onSuccess: () => success('Refund Processed', 'The refund decision has been recorded.'),
    onError: (err) => error('Action Failed', errorMessage(err, 'Could not process refund request.')),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: PHYSICAL_KEYS.refundRequests() })
      invalidateAllLists(qc)
    },
  })
}

// ── Admin: fulfillment pipeline ───────────────────────────────────────────────

export function useActivatePickup() {
  return usePhysicalMutation<ActivatePickupInput>(
    (id, payload) => physicalOrderService.activatePickup(id, payload),
    'Pickup activated and courier assigned.',
  )
}

export function useUpdateCourierInfo() {
  return usePhysicalMutation<UpdateCourierInfoInput>(
    (id, payload) => physicalOrderService.updateCourierInfo(id, payload),
    'Courier information updated.',
  )
}

export function useMarkPickedUp() {
  return usePhysicalMutation<NotesInput>(
    (id, payload) => physicalOrderService.markPickedUp(id, payload),
    'Marked as picked up.',
  )
}

export function useMarkInTransit() {
  return usePhysicalMutation<TransitUpdateInput>(
    (id, payload) => physicalOrderService.markInTransit(id, payload),
    'Marked as in transit.',
  )
}

export function useMarkOutForDelivery() {
  return usePhysicalMutation<NotesInput>(
    (id, payload) => physicalOrderService.markOutForDelivery(id, payload),
    'Marked as out for delivery.',
  )
}

export function useMarkDelivered() {
  return usePhysicalMutation<NotesInput>(
    (id, payload) => physicalOrderService.markDelivered(id, payload),
    'Order marked as delivered.',
  )
}

export function useMarkDeliveryFailed() {
  return usePhysicalMutation<NotesInput>(
    (id, payload) => physicalOrderService.markDeliveryFailed(id, payload),
    'Delivery marked as failed.',
  )
}

export function useMarkDelayed() {
  return usePhysicalMutation<NotesInput>(
    (id, payload) => physicalOrderService.markDelayed(id, payload),
    'Delivery marked as delayed.',
  )
}

export function useReportPickupFailure() {
  return usePhysicalMutation<PickupFailureInput>(
    (id, payload) => physicalOrderService.reportPickupFailure(id, payload),
    'Pickup failure recorded.',
  )
}

export function useAddDeliveryProof() {
  return usePhysicalMutation<DeliveryProofInput>(
    (id, payload) => physicalOrderService.addDeliveryProof(id, payload),
    'Delivery proof uploaded.',
  )
}