import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { orderService } from '@/services/order.service'
import { useOrderStore } from '@/store/order.store'
import { useToast } from '@/components/ui/toaster'
import { STALE_TIMES } from '@/constants'
import type { CheckoutInput, ConfirmPaymentInput, OrderFilters, OrderStatus } from '@/types/order'
import { HttpError } from '@/lib/api-client'

const ORDER_KEYS = {
  all: ['orders'] as const,
  lists: () => [...ORDER_KEYS.all, 'list'] as const,
  buyer: (f: OrderFilters) => [...ORDER_KEYS.lists(), 'buyer', f] as const,
  seller: (f: OrderFilters) => [...ORDER_KEYS.lists(), 'seller', f] as const,
  detail: () => [...ORDER_KEYS.all, 'detail'] as const,
  byId: (id: string) => [...ORDER_KEYS.detail(), id] as const,
}

// ── Queries ──────────────────────────────────────────────────────────────────

export function useOrder(id: string) {
  return useQuery({
    queryKey: ORDER_KEYS.byId(id),
    queryFn: () => orderService.getById(id).then((r) => r.data),
    staleTime: STALE_TIMES.fast,
    enabled: Boolean(id),
  })
}

export function useBuyerOrders(filters: OrderFilters = {}) {
  return useQuery({
    queryKey: ORDER_KEYS.buyer(filters),
    queryFn: () => orderService.getBuyerOrders(filters),
    staleTime: STALE_TIMES.fast,
  })
}

// ── Mutations ────────────────────────────────────────────────────────────────

export function useCheckout() {
  const qc = useQueryClient()
  const router = useRouter()
  const { setActiveCheckout, setCheckoutStep } = useOrderStore.getState()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (payload: CheckoutInput) => orderService.checkout(payload),
    onSuccess: (result) => {
      // Invalidate the cart explicitly so it empties
      qc.invalidateQueries({ queryKey: ['cart'] })
      
      setActiveCheckout(result)
      setCheckoutStep('PAYMENT')

      success('Order Initiated', 'Please complete your payment.')
      router.push(`/checkout/payment?orderId=${result.order.id}`)
    },
    onError: (err) => {
      const message = err instanceof HttpError ? err.message : 'Could not lock items for checkout.'
      error('Checkout Failed', message)
    },
  })
}

export function useConfirmPayment(orderId: string) {
  const qc = useQueryClient()
  const { clearCheckoutSession } = useOrderStore.getState()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (payload: ConfirmPaymentInput) => orderService.confirmPayment(orderId, payload),
    onSuccess: () => {
      clearCheckoutSession()
      success('Payment Submitted', 'Your transaction hash is being monitored on-chain.')
    },
    onError: (err) => {
      // Don't clear session on error, let them try submitting the hash again
      const message = err instanceof HttpError ? err.message : 'Failed to submit transaction details.'
      error('Submission Error', message)
    },
    onSettled: () => {
      // Always refetch the specific order to get the latest status (e.g., CONFIRMING)
      qc.invalidateQueries({ queryKey: ORDER_KEYS.byId(orderId) })
      qc.invalidateQueries({ queryKey: ORDER_KEYS.lists() })
    }
  })
}