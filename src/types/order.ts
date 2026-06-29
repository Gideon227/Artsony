import type { ArtworkFormat } from './artwork'

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMING'
  | 'PAYMENT_CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'FULFILLED'

export type TransactionStatus = 'PENDING' | 'CONFIRMING' | 'CONFIRMED' | 'FAILED' | 'EXPIRED'

export type OrderVariantSnapshot = {
  variant_id: string
  variant_type: string
  variant_name: string
  option_id: string
  option_label: string
  price_modifier: number
  sku: string | null
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
  currency: string // e.g., 'USDT'
  quantity: number
  line_total: number
  variant_snapshot: OrderVariantSnapshot | null
  created_at: string
}

export type PaymentInstructions = {
  transaction_id: string
  recipient_wallet_address: string
  amount: number
  currency: string
  network: string // e.g., 'TRC20', 'ERC20'
  expires_at: string
  status: TransactionStatus
}

export type Order = {
  id: string
  buyer_id: string
  status: OrderStatus
  subtotal: number
  currency: string
  shipping_address: string | null
  idempotency_key: string
  notes: string | null
  items: OrderItem[]
  created_at: string
  updated_at: string
}

// ── DTOs ──────────────────────────────────────────────────────────────────────

export type CheckoutInput = {
  cart_item_ids: string[]
  shipping_address?: string
  notes?: string
  idempotency_key: string // Critical to prevent double-charging on network retries
}

export type CheckoutResult = {
  order: Order
  payment_instructions: PaymentInstructions
}

export type ConfirmPaymentInput = {
  tx_hash: string
  sender_wallet_address: string
}

export type OrderFilters = {
  page?: number
  limit?: number
  status?: OrderStatus
}

export type PaginatedOrdersResponse = {
  success: boolean
  data: Order[]
  total: number
  page: number
  limit: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}