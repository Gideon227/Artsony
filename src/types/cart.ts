import type { ArtworkFormat } from './artwork'

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