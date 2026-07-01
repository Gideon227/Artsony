// ── Enums (mirrors backend commerce.types.ts — kept in sync manually) ────────

export type TimelineStatus =
  | 'ORDER_RECEIVED'
  | 'ORDER_RECEIVED_ACTIVE'
  | 'AWAITING_CONFIRMATION'
  | 'AWAITING_CONFIRMATION_ACTIVE'
  | 'ORDER_FAILED_TO_CONFIRM'
  | 'AWAITING_PICKUP'
  | 'AWAITING_PICKUP_ACTIVE'
  | 'PICKUP_FAILED'
  | 'COURIER_REJECTED_PICKUP'
  | 'PICKED_UP'
  | 'PICKED_UP_ACTIVE'
  | 'IN_TRANSIT'
  | 'IN_TRANSIT_ACTIVE'
  | 'DELAYED_DELIVERY'
  | 'OUT_FOR_DELIVERY'
  | 'OUT_FOR_DELIVERY_ACTIVE'
  | 'DELIVERED'
  | 'DELIVERY_FAILED'

export type DeliveryStatus = 'LIVE' | 'DELIVERED' | 'CANCELLED'
export type RefundStatus = 'NONE' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PARTIAL'
export type CourierServiceType = 'STANDARD' | 'EXPRESS' | 'OVERNIGHT' | 'ECONOMY'

export type BuyerOrderView = 'all' | 'live' | 'delivered' | 'cancelled'
export type ArtistOrderView = 'all' | 'live' | 'pending' | 'completed' | 'cancelled'

export const CANCELLABLE_TIMELINE_STATUSES = new Set<TimelineStatus>([
  'ORDER_RECEIVED',
  'ORDER_RECEIVED_ACTIVE',
  'AWAITING_CONFIRMATION',
  'AWAITING_CONFIRMATION_ACTIVE',
])

// ── Domain types ───────────────────────────────────────────────────────────────

export type ShippingAddressSnapshot = {
  full_name: string
  phone: string
  address_line_1: string
  address_line_2: string | null
  city: string
  state: string
  postal_code: string
  country_code: string
}

export type OrderItemPhysical = {
  id: string
  order_item_id: string
  order_id: string
  timeline_status: TimelineStatus
  delivery_status: DeliveryStatus
  shipping_cost: number | null
  courier_name: string | null
  courier_service_type: CourierServiceType | null
  tracking_id: string | null
  estimated_delivery_date: string | null
  pickup_address: string | null
  refund_status: RefundStatus
  refund_amount: number | null
  refund_initiated_at: string | null
  refund_completed_at: string | null
  refund_notes: string | null
  confirmed_at: string | null
  picked_up_at: string | null
  in_transit_at: string | null
  delivered_at: string | null
  created_at: string
  updated_at: string
}

export type OrderTimelineEvent = {
  id: string
  order_item_physical_id: string
  order_id: string
  order_item_id: string
  timeline_status: TimelineStatus
  is_pending: boolean
  actor_id: string | null
  actor_role: 'buyer' | 'artist' | 'admin' | 'system' | 'courier'
  notes: string | null
  metadata: Record<string, unknown>
  occurred_at: string
}

export type DeliveryProof = {
  id: string
  order_item_physical_id: string
  order_id: string
  cloudinary_public_id: string
  secure_url: string
  mime_type: string
  file_size_bytes: number
  uploaded_by: string
  uploader_role: 'admin' | 'courier'
  uploaded_at: string
}

export type RefundRequest = {
  id: string
  order_item_physical_id: string
  order_id: string
  requested_by: string
  reason: string
  status: 'PENDING_ADMIN' | 'APPROVED' | 'REJECTED'
  admin_notes: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

export type OrderInvoice = {
  id: string
  order_id: string
  version: number
  pdf_cloudinary_public_id: string
  pdf_url: string
  generated_at: string
  generated_by: string
  trigger: 'order_created' | 'refund_processed' | 'admin_request'
}

export type OrderReceipt = {
  id: string
  order_id: string
  pdf_cloudinary_public_id: string
  pdf_url: string
  amount_paid: number
  currency: string
  payment_method: string
  transaction_reference: string | null
  generated_at: string
  generated_by: string
}

// ── List / detail response shapes ─────────────────────────────────────────────

export type PhysicalOrderFilters = {
  delivery_status?: DeliveryStatus
  timeline_status?: TimelineStatus
  timeline_status_in?: TimelineStatus[]
  refund_status?: RefundStatus
  courier_name?: string
  tracking_id?: string
  date_from?: string
  date_to?: string
  order_number?: string
  artist_id?: string
  buyer_id?: string
  sort_order?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// Bare rows only — findByBuyerWithItems/findBySellerWithItems/findAllAdminList
// do not join artwork/buyer/seller data. See open backend gap.
export type PaginatedPhysicalOrdersResponse = {
  success: boolean
  data: OrderItemPhysical[]
  total: number
  page: number
  limit: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export type PhysicalOrderDetailView = {
  physical: OrderItemPhysical
  timeline: OrderTimelineEvent[]
  delivery_proofs: DeliveryProof[]
  invoice: OrderInvoice | null
  receipt: OrderReceipt | null
  refund_requests: RefundRequest[]
  delivery_address: ShippingAddressSnapshot | null
  buyer: { id: string; username: string; avatar_url: string | null } | null
  seller: { id: string; username: string; avatar_url: string | null } | null
}

// ── DTOs ──────────────────────────────────────────────────────────────────────

export type ActivatePickupInput = {
  courier_name: string
  courier_service_type: CourierServiceType
  shipping_cost: number
  pickup_address: string
  estimated_delivery_date?: string
}
export type UpdateCourierInfoInput = Partial<ActivatePickupInput> & { tracking_id?: string }
export type NotesInput = { notes?: string }
export type TransitUpdateInput = { tracking_id?: string; notes?: string }
export type PickupFailureInput = { reason: 'PICKUP_FAILED' | 'COURIER_REJECTED_PICKUP'; notes: string }
export type CancelItemInput = { reason: string }
export type RefundRequestInput = { reason: string }
export type ProcessRefundInput = {
  decision: 'APPROVED' | 'REJECTED'
  admin_notes?: string
  item_cost?: number
  order_number?: string
}
export type ProcessRefundResult = { request: RefundRequest; physical: OrderItemPhysical }
export type DeliveryProofInput = { cloudinary_public_id: string; secure_url: string; mime_type: string; file_size_bytes: number }
export type UpdateShippingAddressInput = ShippingAddressSnapshot