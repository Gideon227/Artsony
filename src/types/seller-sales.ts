import type { CommerceApiSuccess, CommercePaginatedResponse } from '@/types/order'

export type SellerStatus = 'LIVE' | 'PENDING' | 'COMPLETED' | 'CANCELLED'
export type SellerSalesFormat = 'PHYSICAL' | 'DIGITAL'

export type SellerSaleLine = {
  order_item_id: string
  order_id: string
  physical_id: string | null
  order_code: string
  legacy_code: string
  artwork_id: string
  artwork_title: string
  artwork_thumbnail_url: string | null
  artwork_format: SellerSalesFormat
  quantity: number
  unit_price: number
  line_total: number
  currency: string
  buyer_id: string
  buyer_name: string
  buyer_avatar_url: string | null
  seller_status: SellerStatus
  timeline_status: string | null
  delivery_status: string | null
  purchased_at: string
  courier_name: string | null
  estimated_delivery_date: string | null
  delivered_at: string | null
  cancelled_at: string | null
  cancelled_by: string | null
  refund_status: string | null
  refund_amount: number | null
}

export type SellerSalesCounts = Record<SellerStatus, number> & { ALL: number }

export type SellerSalesParams = {
  status?: SellerStatus
  format?: SellerSalesFormat
  price_min?: number
  price_max?: number
  date_from?: string
  date_to?: string
  q?: string
  sort_by?: 'date' | 'value'
  sort_order: 'asc' | 'desc'
  page: number
  limit: number
}

export type SellerSalesResponse = CommercePaginatedResponse<SellerSaleLine>
export type SellerSalesCountsResponse = CommerceApiSuccess<SellerSalesCounts>

export type SellerSaleTimelineEvent = {
  status: string
  actor_role: string
  notes: string | null
  occurred_at: string
}

export type SellerSaleProof = { id: string; url: string; uploaded_at: string }

export type SellerSaleFile = {
  id: string
  name: string
  mime_type: string
  media_type: string
  file_size_bytes: number
}

export type SellerSaleCancellation = {
  cancelled_by: string | null
  reason: string | null
  cancelled_at: string | null
  refund_status: string | null
  refund_amount: number | null
}

export type SellerSaleDetail = SellerSaleLine & {
  net_earning: number
  variant_label: string | null
  license_type: string | null
  dimensions: { length: number; width: number; height: number; unit: 'cm' | 'in' } | null
  tracking_id: string | null
  courier_service_type: string | null
  pickup_address: string | null
  pickup_address_saved: boolean
  delivery_location: { city: string | null; state: string | null; country_code: string | null } | null
  picked_up_at: string | null
  last_updated_at: string | null
  confirmation_deadline: string | null
  latest_event: SellerSaleTimelineEvent | null
  timeline: SellerSaleTimelineEvent[]
  delivery_proofs: SellerSaleProof[]
  packaging_proofs: SellerSaleProof[]
  label_available: boolean
  files: SellerSaleFile[]
  total_file_size_bytes: number | null
  cancellation: SellerSaleCancellation | null
}

export type SellerSaleDetailResponse = CommerceApiSuccess<SellerSaleDetail>

export type CourierServiceType = 'STANDARD' | 'EXPRESS' | 'OVERNIGHT' | 'ECONOMY'

export type SaveShippingInput = {
  courier_name: string
  courier_service_type: CourierServiceType
  pickup_address: string
}

export type ActivationSessionStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED' | 'SUPERSEDED'

export type ActivationSessionResult =
  | { status: 'COMPLETED' }
  | { status: 'PENDING'; session_id: string; upload_url: string; expires_at: string }

export type ActivationSessionState = {
  session_id: string
  status: ActivationSessionStatus
  failure_reason: string | null
  expires_at: string
}

export type ActivationUploadContext = {
  artwork_title: string
  order_code: string
  required_photos: number
  expires_at: string
}

export type ActivationUploadSignature = {
  upload_url: string
  fields: Record<string, string>
  public_id: string
  max_bytes: number
}
