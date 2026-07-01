import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types'
import type {
  PhysicalOrderFilters,
  PaginatedPhysicalOrdersResponse,
  OrderItemPhysical,
  PhysicalOrderDetailView,
  ActivatePickupInput,
  UpdateCourierInfoInput,
  NotesInput,
  TransitUpdateInput,
  PickupFailureInput,
  CancelItemInput,
  RefundRequestInput,
  RefundRequest,
  ProcessRefundInput,
  DeliveryProofInput,
  DeliveryProof,
  UpdateShippingAddressInput,
} from '@/types/physical-order'

const BASE = '/api/physical-orders'

export const physicalOrderService = {
  getBuyerItems: (filters: PhysicalOrderFilters = {}): Promise<PaginatedPhysicalOrdersResponse> =>
    apiClient.get<PaginatedPhysicalOrdersResponse>(`${BASE}/buyer`, { params: filters as any }),

  getArtistItems: (filters: PhysicalOrderFilters = {}): Promise<PaginatedPhysicalOrdersResponse> =>
    apiClient.get<PaginatedPhysicalOrdersResponse>(`${BASE}/artist`, { params: filters as any }),

  getAdminItems: (filters: PhysicalOrderFilters = {}): Promise<PaginatedPhysicalOrdersResponse> =>
    apiClient.get<PaginatedPhysicalOrdersResponse>(`${BASE}/admin`, { params: filters as any }),

  getAdminRefundRequests: (): Promise<ApiResponse<RefundRequest[]>> =>
    apiClient.get<ApiResponse<RefundRequest[]>>(`${BASE}/refund-requests`),

  getOrderView: (physicalId: string): Promise<ApiResponse<PhysicalOrderDetailView>> =>
    apiClient.get<ApiResponse<PhysicalOrderDetailView>>(`${BASE}/${physicalId}`),

  getInvoice: (physicalId: string): Promise<ApiResponse<{ invoice_url: string; version: number }>> =>
    apiClient.get(`${BASE}/${physicalId}/invoice`),

  getReceipt: (physicalId: string): Promise<ApiResponse<{ receipt_url: string }>> =>
    apiClient.get(`${BASE}/${physicalId}/receipt`),

  artistConfirm: (physicalId: string): Promise<ApiResponse<OrderItemPhysical>> =>
    apiClient.post(`${BASE}/${physicalId}/confirm`),

  requestRefund: (physicalId: string, payload: RefundRequestInput): Promise<ApiResponse<RefundRequest>> =>
    apiClient.post(`${BASE}/${physicalId}/refund-request`, payload),

  cancelItem: (physicalId: string, payload: CancelItemInput): Promise<ApiResponse<OrderItemPhysical>> =>
    apiClient.post(`${BASE}/${physicalId}/cancel`, payload),

  updateShippingAddress: (
    orderId: string,
    payload: UpdateShippingAddressInput,
  ): Promise<ApiResponse<OrderItemPhysical>> =>
    apiClient.patch(`${BASE}/${orderId}/shipping-address`, payload),

  processRefund: (requestId: string, payload: ProcessRefundInput): Promise<ApiResponse<RefundRequest>> =>
    apiClient.post(`${BASE}/refund-requests/${requestId}/process`, payload),

  activatePickup: (physicalId: string, payload: ActivatePickupInput): Promise<ApiResponse<OrderItemPhysical>> =>
    apiClient.post(`${BASE}/${physicalId}/activate-pickup`, payload),

  updateCourierInfo: (physicalId: string, payload: UpdateCourierInfoInput): Promise<ApiResponse<OrderItemPhysical>> =>
    apiClient.patch(`${BASE}/${physicalId}/courier`, payload),

  markPickedUp: (physicalId: string, payload: NotesInput = {}): Promise<ApiResponse<OrderItemPhysical>> =>
    apiClient.post(`${BASE}/${physicalId}/picked-up`, payload),

  markInTransit: (physicalId: string, payload: TransitUpdateInput = {}): Promise<ApiResponse<OrderItemPhysical>> =>
    apiClient.post(`${BASE}/${physicalId}/in-transit`, payload),

  markOutForDelivery: (physicalId: string, payload: NotesInput = {}): Promise<ApiResponse<OrderItemPhysical>> =>
    apiClient.post(`${BASE}/${physicalId}/out-for-delivery`, payload),

  markDelivered: (physicalId: string, payload: NotesInput = {}): Promise<ApiResponse<OrderItemPhysical>> =>
    apiClient.post(`${BASE}/${physicalId}/delivered`, payload),

  markDeliveryFailed: (physicalId: string, payload: NotesInput = {}): Promise<ApiResponse<OrderItemPhysical>> =>
    apiClient.post(`${BASE}/${physicalId}/delivery-failed`, payload),

  markDelayed: (physicalId: string, payload: NotesInput = {}): Promise<ApiResponse<OrderItemPhysical>> =>
    apiClient.post(`${BASE}/${physicalId}/delayed`, payload),

  reportPickupFailure: (physicalId: string, payload: PickupFailureInput): Promise<ApiResponse<OrderItemPhysical>> =>
    apiClient.post(`${BASE}/${physicalId}/pickup-failure`, payload),

  addDeliveryProof: (physicalId: string, payload: DeliveryProofInput): Promise<ApiResponse<DeliveryProof>> =>
    apiClient.post(`${BASE}/${physicalId}/delivery-proof`, payload),
}