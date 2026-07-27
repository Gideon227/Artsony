import type { ArtworkFormat } from './artwork'

// ── Core enums ──────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'FULFILLED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED'

export type TransactionStatus = 'PENDING' | 'CONFIRMING' | 'CONFIRMED' | 'FAILED' | 'EXPIRED'

export type WalletNetwork = 'TRON' | 'ETHEREUM' | 'BSC'

export type WalletLedgerEntryType = 'CREDIT' | 'DEBIT'

// ── Cart ──────────────────────────────────────────────────────────────────────

export type CartVariantSnapshot = {
  variant_id: string
  variant_type: string
  variant_name: string
  option_id: string
  option_label: string
  price_modifier: number
}

export type CartItem = {
  id: string
  user_id: string
  artwork_id: string
  quantity: number
  price_at_add: number
  currency_at_add: string
  variant_snapshot: CartVariantSnapshot | null
  added_at: string
}

export type CartItemWithArtwork = CartItem & {
  artwork: {
    id: string
    title: string
    slug: string
    thumbnail_url: string | null
    artwork_format: ArtworkFormat
    listing_type: 'MARKETPLACE' | 'PORTFOLIO'
    status: string
    moderation_status: string
    price: number | null
    currency: string
    max_purchase_quantity: number | null
    has_variants: boolean
    seller_id: string
    seller_name: string
    seller_avatar_url: string | null
  }
  is_price_changed: boolean
  is_unavailable: boolean
  is_stock_insufficient: boolean
}

export type Cart = {
  items: CartItemWithArtwork[]
  item_count: number
  subtotal: number
  currency: string
  has_stale_items: boolean
}

export type AddToCartInput = {
  artwork_id: string
  quantity: number
  variant_option_id?: string
}

export type UpdateCartItemInput = {
  quantity: number
}

// ── Order ─────────────────────────────────────────────────────────────────────

export type OrderVariantSnapshot = {
  variant_id: string
  variant_type: string
  variant_name: string
  option_id: string
  option_label: string
  price_modifier: number
  sku: string | null
}

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

export type OrderItem = {
  id: string
  order_id: string
  artwork_id: string
  seller_id: string
  artwork_title: string
  artwork_slug: string
  artwork_thumbnail_url: string | null
  artwork_format: ArtworkFormat
  unit_price: number
  currency: string
  quantity: number
  line_total: number
  variant_snapshot: OrderVariantSnapshot | null
  created_at: string
}

export type Order = {
  id: string
  buyer_id: string
  status: OrderStatus
  subtotal: number
  currency: string
  shipping_address: ShippingAddressSnapshot | null
  idempotency_key: string
  notes: string | null
  items: OrderItem[]
  created_at: string
  updated_at: string
}

export type OrderSummary = Omit<Order, 'items'> & {
  item_count: number
  preview_thumbnail: string | null
}

// ── Checkout ──────────────────────────────────────────────────────────────────

export type CheckoutInput = {
  cart_item_ids: string[]
  shipping_address?: ShippingAddressSnapshot
  idempotency_key: string
  notes?: string
}

export type CheckoutResult = {
  order: Order
  payment_instructions: PaymentInstructions
}

// ── Saved shipping address ────────────────────────────────────────────────────

export type ShippingAddress = {
  id: string
  user_id: string
  label: string | null
  full_name: string
  phone: string
  address_line_1: string
  address_line_2: string | null
  city: string
  state: string
  postal_code: string
  country_code: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export type CreateShippingAddressInput = Omit<
  ShippingAddress,
  'id' | 'user_id' | 'created_at' | 'updated_at'
>

// ── Digital delivery ───────────────────────────────────────────────────────────

export type DigitalDeliveryToken = {
  id: string
  order_item_id: string
  artwork_id: string
  buyer_id: string
  token_hash: string
  expires_at: string
  download_count: number
  max_downloads: number
  last_downloaded_at: string | null
  created_at: string
}

// ── Payment / transaction ──────────────────────────────────────────────────────

export type Transaction = {
  id: string
  order_id: string
  status: TransactionStatus
  amount: number
  currency: string
  network: WalletNetwork
  recipient_wallet_address: string
  sender_wallet_address: string | null
  tx_hash: string | null
  confirmation_block: number | null
  retry_count: number
  last_retry_at: string | null
  expires_at: string
  confirmed_at: string | null
  created_at: string
  updated_at: string
}

export type PaymentInstructions = {
  transaction_id: string
  recipient_wallet_address: string
  amount: number
  currency: string
  network: WalletNetwork
  expires_at: string
}

export type ConfirmPaymentInput = {
  tx_hash: string
  sender_wallet_address: string
  network: WalletNetwork
}

// ── Wallet ledger ──────────────────────────────────────────────────────────────

export type WalletLedgerEntry = {
  id: string
  user_id: string
  transaction_id: string | null
  order_id: string | null
  type: WalletLedgerEntryType
  amount: number
  balance_after: number
  description: string
  created_at: string
}

// ── Pagination ──────────────────────────────────────────────────────────────────

export type PaginatedResult<T> = {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export type OrderFilters = {
  status?: OrderStatus
  page?: number
  limit?: number
  sort_order?: 'asc' | 'desc'
}

// ── State machines (mirrors backend — used for client-side gating, e.g. disabling
// a "Cancel" button before making the call rather than round-tripping a 4xx) ────

export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ['PAYMENT_CONFIRMED', 'CANCELLED'],
  PAYMENT_CONFIRMED: ['PROCESSING', 'FULFILLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['COMPLETED'],
  FULFILLED: ['COMPLETED'],
  COMPLETED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
}

export const TRANSACTION_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  PENDING: ['CONFIRMING', 'EXPIRED', 'FAILED'],
  CONFIRMING: ['CONFIRMED', 'FAILED', 'EXPIRED'],
  CONFIRMED: [],
  FAILED: [],
  EXPIRED: [],
}

// ── Physical order pipeline ────────────────────────────────────────────────────

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

export const PLATFORM_SERVICE_FEE_RATE = 0.14

export const PHYSICAL_TRANSITIONS: Record<TimelineStatus, TimelineStatus[]> = {
  ORDER_RECEIVED: ['ORDER_RECEIVED_ACTIVE'],
  ORDER_RECEIVED_ACTIVE: ['AWAITING_CONFIRMATION'],
  AWAITING_CONFIRMATION: ['AWAITING_CONFIRMATION_ACTIVE', 'ORDER_FAILED_TO_CONFIRM'],
  AWAITING_CONFIRMATION_ACTIVE: ['AWAITING_PICKUP', 'ORDER_FAILED_TO_CONFIRM'],
  ORDER_FAILED_TO_CONFIRM: [],
  AWAITING_PICKUP: ['AWAITING_PICKUP_ACTIVE', 'PICKUP_FAILED', 'COURIER_REJECTED_PICKUP'],
  AWAITING_PICKUP_ACTIVE: ['PICKED_UP', 'PICKUP_FAILED', 'COURIER_REJECTED_PICKUP'],
  PICKUP_FAILED: ['AWAITING_PICKUP'],
  COURIER_REJECTED_PICKUP: ['AWAITING_PICKUP'],
  PICKED_UP: ['PICKED_UP_ACTIVE'],
  PICKED_UP_ACTIVE: ['IN_TRANSIT'],
  IN_TRANSIT: ['IN_TRANSIT_ACTIVE'],
  IN_TRANSIT_ACTIVE: ['OUT_FOR_DELIVERY', 'DELAYED_DELIVERY', 'DELIVERY_FAILED'],
  DELAYED_DELIVERY: ['OUT_FOR_DELIVERY', 'DELIVERY_FAILED'],
  OUT_FOR_DELIVERY: ['OUT_FOR_DELIVERY_ACTIVE'],
  OUT_FOR_DELIVERY_ACTIVE: ['DELIVERED', 'DELIVERY_FAILED'],
  DELIVERED: [],
  DELIVERY_FAILED: [],
}

export const BUYER_ARTIST_CANCELLABLE_STATES = new Set<TimelineStatus>([
  'ORDER_RECEIVED',
  'ORDER_RECEIVED_ACTIVE',
  'AWAITING_CONFIRMATION',
  'AWAITING_CONFIRMATION_ACTIVE',
])

export const ARTIST_PENDING_STATUSES: TimelineStatus[] = [
  'ORDER_RECEIVED',
  'ORDER_RECEIVED_ACTIVE',
  'AWAITING_CONFIRMATION',
  'AWAITING_CONFIRMATION_ACTIVE',
]

// ── Filters / view presets ─────────────────────────────────────────────────────

export type PhysicalOrderFilters = {
  delivery_status?: DeliveryStatus
  timeline_status?: TimelineStatus
  timeline_status_in?: TimelineStatus[]
  refund_status?: RefundStatus
  courier_name?: string
  tracking_id?: string
  page?: number
  limit?: number
  sort_order?: 'asc' | 'desc'
  date_from?: string
  date_to?: string
  order_number?: string
  artist_id?: string
  buyer_id?: string
}

export type BuyerOrderView = 'all' | 'live' | 'delivered' | 'cancelled'
export type ArtistOrderView = 'all' | 'live' | 'pending' | 'completed' | 'cancelled'

/**
 * Mirrors backend commerce.types.ts for parity, but no endpoint currently
 * returns this shape — findByBuyerWithItems/findBySellerWithItems/findAllAdminList
 * all return raw OrderItemPhysical[] with no joins. Use PhysicalOrderDetailView
 * for the actual GET /:physicalId response.
 */
export type PhysicalOrderView = Order & {
  order_number: string
  physical_items: (OrderItem & {
    physical: OrderItemPhysical | null
    timeline: OrderTimelineEvent[]
    delivery_proofs: DeliveryProof[]
  })[]
  invoice: OrderInvoice | null
  receipt: OrderReceipt | null
  refund_requests: RefundRequest[]
  buyer: OrderPartyProfile | null
  seller: OrderPartyProfile | null
}

export type OrderPartyProfile = {
  id: string
  username: string
  avatar_url: string | null
}

/** Actual shape returned by GET /api/physical-orders/:physicalId */
export type PhysicalOrderDetailView = {
  physical: OrderItemPhysical
  order_item: OrderItem
  timeline: OrderTimelineEvent[]
  delivery_proofs: DeliveryProof[]
  invoice: OrderInvoice | null
  receipt: OrderReceipt | null
  refund_requests: RefundRequest[]
  delivery_address: ShippingAddressSnapshot | null
  buyer: OrderPartyProfile | null
  seller: OrderPartyProfile | null
}

// ── Response envelopes ─────────────────────────────────────────────────────────
// This backend wraps every success response as { success: true, ... } — distinct
// from the generic ApiResponse<T> in @/types/index.ts, which has no success flag.

export type CommerceApiSuccess<T> = {
  success: true
  data: T
}

export type CommercePaginatedResponse<T> = {
  success: true
} & PaginatedResult<T>