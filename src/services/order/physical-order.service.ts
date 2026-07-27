import { apiClient } from '@/lib/api-client'
import type {
  OrderItemPhysical,
  RefundRequest,
  DeliveryProof,
  PhysicalOrderFilters,
  PhysicalOrderDetailView,
  BuyerOrderView,
  ArtistOrderView,
  CourierServiceType,
  ShippingAddressSnapshot,
  Order,
  CommerceApiSuccess,
  CommercePaginatedResponse,
} from '@/types/order'
import { OrderItemPhysicalWithArtwork } from '@/types/physical-order'

export type PhysicalOrderQueryParams = Omit<PhysicalOrderFilters, 'timeline_status_in'>

export type ActivatePickupInput = {
  courier_name: string
  courier_service_type: CourierServiceType
  shipping_cost: number
  pickup_address: string
  estimated_delivery_date?: string
}

export type UpdateCourierInfoInput = Partial<{
  courier_name: string
  courier_service_type: CourierServiceType
  tracking_id: string
  shipping_cost: number
  estimated_delivery_date: string
  pickup_address: string
}>

export type InTransitInput = {
  tracking_id?: string
  notes?: string
}

export type PickupFailureInput = {
  reason: 'PICKUP_FAILED' | 'COURIER_REJECTED_PICKUP'
  notes: string
}

export type ProcessRefundInput = {
  decision: 'APPROVED' | 'REJECTED'
  admin_notes?: string
  /** Required by the backend only when decision === 'APPROVED'. */
  item_cost?: number
  order_number?: string
}

export type AddDeliveryProofInput = {
  cloudinary_public_id: string
  secure_url: string
  mime_type: string
  file_size_bytes: number
}

export const physicalOrderService = {
  getBuyerOrders: (view: BuyerOrderView, filters: PhysicalOrderQueryParams = {}) =>
    apiClient.get<CommercePaginatedResponse<OrderItemPhysicalWithArtwork>>('/api/physical-orders/buyer', {
      params: { view, ...filters },
    }),

  getArtistOrders: (view: ArtistOrderView, filters: PhysicalOrderQueryParams = {}) =>
    apiClient.get<CommercePaginatedResponse<OrderItemPhysicalWithArtwork>>('/api/physical-orders/artist', {
      params: { view, ...filters },
    }),

  getAdminOrders: (filters: PhysicalOrderQueryParams = {}) =>
    apiClient.get<CommercePaginatedResponse<OrderItemPhysicalWithArtwork>>('/api/physical-orders/admin', {
      params: filters,
    }),

  getPendingRefundRequests: () =>
    apiClient.get<CommerceApiSuccess<RefundRequest[]>>('/api/physical-orders/refund-requests'),

  getOrderView: (physicalId: string) =>
    apiClient.get<CommerceApiSuccess<PhysicalOrderDetailView>>(`/api/physical-orders/${physicalId}`),

  artistConfirm: (physicalId: string) =>
    apiClient.post<CommerceApiSuccess<OrderItemPhysical>>(`/api/physical-orders/${physicalId}/confirm`),

  cancelItem: (physicalId: string, reason: string) =>
    apiClient.post<CommerceApiSuccess<OrderItemPhysical>>(`/api/physical-orders/${physicalId}/cancel`, {
      reason,
    }),

  requestRefund: (physicalId: string, reason: string) =>
    apiClient.post<CommerceApiSuccess<RefundRequest>>(
      `/api/physical-orders/${physicalId}/refund-request`,
      { reason },
    ),

  getInvoice: (physicalId: string) =>
    apiClient.get<CommerceApiSuccess<{ invoice_url: string; version: number }>>(
      `/api/physical-orders/${physicalId}/invoice`,
    ),

  getReceipt: (physicalId: string) =>
    apiClient.get<CommerceApiSuccess<{ receipt_url: string }>>(
      `/api/physical-orders/${physicalId}/receipt`,
    ),

  // ── Admin ────────────────────────────────────────────────────────────────

  updateShippingAddress: (orderId: string, address: ShippingAddressSnapshot) =>
    apiClient.patch<CommerceApiSuccess<Order>>(
      `/api/physical-orders/${orderId}/shipping-address`,
      address,
    ),

  processRefund: (requestId: string, payload: ProcessRefundInput) =>
    apiClient.post<CommerceApiSuccess<{ request: RefundRequest; physical: OrderItemPhysical }>>(
      `/api/physical-orders/refund-requests/${requestId}/process`,
      payload,
    ),

  activatePickup: (physicalId: string, payload: ActivatePickupInput) =>
    apiClient.post<CommerceApiSuccess<OrderItemPhysical>>(
      `/api/physical-orders/${physicalId}/activate-pickup`,
      payload,
    ),

  updateCourierInfo: (physicalId: string, payload: UpdateCourierInfoInput) =>
    apiClient.patch<CommerceApiSuccess<OrderItemPhysical>>(
      `/api/physical-orders/${physicalId}/courier`,
      payload,
    ),

  /** Backend ignores any request body on this route — do not add a notes field. */
  markPickedUp: (physicalId: string) =>
    apiClient.post<CommerceApiSuccess<OrderItemPhysical>>(`/api/physical-orders/${physicalId}/picked-up`),

  markInTransit: (physicalId: string, payload: InTransitInput = {}) =>
    apiClient.post<CommerceApiSuccess<OrderItemPhysical>>(
      `/api/physical-orders/${physicalId}/in-transit`,
      payload,
    ),

  /** Backend ignores any request body on this route — do not add a notes field. */
  markOutForDelivery: (physicalId: string) =>
    apiClient.post<CommerceApiSuccess<OrderItemPhysical>>(
      `/api/physical-orders/${physicalId}/out-for-delivery`,
    ),

  /** Backend ignores any request body on this route — do not add a notes field. */
  markDelivered: (physicalId: string) =>
    apiClient.post<CommerceApiSuccess<OrderItemPhysical>>(`/api/physical-orders/${physicalId}/delivered`),

  markDeliveryFailed: (physicalId: string, notes?: string) =>
    apiClient.post<CommerceApiSuccess<OrderItemPhysical>>(
      `/api/physical-orders/${physicalId}/delivery-failed`,
      notes ? { notes } : undefined,
    ),

  markDelayed: (physicalId: string, notes?: string) =>
    apiClient.post<CommerceApiSuccess<OrderItemPhysical>>(
      `/api/physical-orders/${physicalId}/delayed`,
      notes ? { notes } : undefined,
    ),

  reportPickupFailure: (physicalId: string, payload: PickupFailureInput) =>
    apiClient.post<CommerceApiSuccess<OrderItemPhysical>>(
      `/api/physical-orders/${physicalId}/pickup-failure`,
      payload,
    ),

  addDeliveryProof: (physicalId: string, payload: AddDeliveryProofInput) =>
    apiClient.post<CommerceApiSuccess<DeliveryProof>>(
      `/api/physical-orders/${physicalId}/delivery-proof`,
      payload,
    ),
}