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
  buyer_name: string
  seller_status: SellerStatus
  timeline_status: string | null
  delivery_status: string | null
  purchased_at: string
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
  sort_order: 'asc' | 'desc'
  page: number
  limit: number
}

export type SellerSalesResponse = CommercePaginatedResponse<SellerSaleLine>
export type SellerSalesCountsResponse = CommerceApiSuccess<SellerSalesCounts>
