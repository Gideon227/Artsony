import { apiClient } from '@/lib/api-client'
import type {
  CheckoutInput,
  CheckoutResult,
  ConfirmPaymentInput,
  Order,
  OrderFilters,
  OrderStatus,
  PaymentInstructions,
  CommerceApiSuccess,
  CommercePaginatedResponse,
} from '@/types/order'

export const orderService = {
  checkout: (payload: CheckoutInput): Promise<CheckoutResult> =>
    apiClient.post<CheckoutResult>('/api/orders/checkout', payload),

  getBuyerOrders: (filters: OrderFilters = {}) =>
    apiClient.get<CommercePaginatedResponse<Order>>('/api/orders', { params: filters }),

  getSellerOrders: (filters: OrderFilters = {}) =>
    apiClient.get<CommercePaginatedResponse<Order>>('/api/orders/sales', { params: filters }),

  getById: (id: string) => apiClient.get<CommerceApiSuccess<Order>>(`/api/orders/${id}`),

  confirmPayment: (
    id: string,
    payload: ConfirmPaymentInput,
  ): Promise<{ order: Order; payment_instructions: PaymentInstructions }> =>
    apiClient.post(`/api/orders/${id}/confirm-payment`, payload),

  cancelOrder: (id: string) =>
    apiClient.post<CommerceApiSuccess<Order>>(`/api/orders/${id}/cancel`),

  updateStatus: (id: string, status: OrderStatus) =>
    apiClient.patch<CommerceApiSuccess<Order>>(`/api/orders/${id}/status`, { status }),
}