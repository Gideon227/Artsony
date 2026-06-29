import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types'
import type {
  CheckoutInput,
  CheckoutResult,
  ConfirmPaymentInput,
  Order,
  OrderFilters,
  PaginatedOrdersResponse,
  OrderStatus,
  PaymentInstructions,
} from '@/types/order'

export const orderService = {
  // ── Checkout ───────────────────────────────────────────────────────────────
  checkout: (payload: CheckoutInput): Promise<CheckoutResult> =>
    apiClient.post<CheckoutResult>('/api/orders/checkout', payload),

  // ── Reads ──────────────────────────────────────────────────────────────────
  getBuyerOrders: (filters: OrderFilters = {}): Promise<PaginatedOrdersResponse> =>
    apiClient.get<PaginatedOrdersResponse>('/api/orders', { params: filters as any }),

  getSellerOrders: (filters: OrderFilters = {}): Promise<PaginatedOrdersResponse> =>
    apiClient.get<PaginatedOrdersResponse>('/api/orders/sales', { params: filters as any }),

  getById: (id: string): Promise<ApiResponse<Order>> =>
    apiClient.get<ApiResponse<Order>>(`/api/orders/${id}`),

  // ── State Actions ──────────────────────────────────────────────────────────
  confirmPayment: (
    id: string,
    payload: ConfirmPaymentInput,
  ): Promise<{ order: Order; payment_instructions: PaymentInstructions }> =>
    apiClient.post(`/api/orders/${id}/confirm-payment`, payload),

  cancelOrder: (id: string): Promise<ApiResponse<Order>> =>
    apiClient.post<ApiResponse<Order>>(`/api/orders/${id}/cancel`),

  updateStatus: (id: string, status: OrderStatus): Promise<ApiResponse<Order>> =>
    apiClient.patch<ApiResponse<Order>>(`/api/orders/${id}/status`, { status }),
}