import type { Order } from '@/types/order'
import { ArtworkFormat } from '@/types'
import { getOrderStatusGroup, type OrderStatusGroup } from './status'
import { formatOrderCode, getBuyerDisplayName } from './format'

export type PriceRangeId = 'ALL' | 'UNDER_50' | '50_200' | '200_500' | '500_1000' | '1000_5000' | 'ABOVE_5000'

export type PriceRangeDef = {
  id: PriceRangeId
  label: string
  min?: number
  max?: number
}

export const PRICE_RANGES: PriceRangeDef[] = [
  { id: 'ALL', label: 'All Prices' },
  { id: 'UNDER_50', label: 'Under $50', max: 50 },
  { id: '50_200', label: '$50 – $200', min: 50, max: 200 },
  { id: '200_500', label: '$200 – $500', min: 200, max: 500 },
  { id: '500_1000', label: '$500 – $1,000', min: 500, max: 1000 },
  { id: '1000_5000', label: '$1,000 – $5,000', min: 1000, max: 5000 },
  { id: 'ABOVE_5000', label: 'Above $5,000', min: 5000 },
]

export type ArtworkFormatFilter = 'ALL' | ArtworkFormat

export type OrdersPageFilters = {
  statusGroup: OrderStatusGroup | 'ALL'
  artworkFormat: ArtworkFormatFilter
  priceRange: PriceRangeId
  dateFrom: Date | null
  dateTo: Date | null
  search: string
  sortOrder: 'asc' | 'desc'
  page: number
  pageSize: number
}

export const DEFAULT_ORDERS_FILTERS: OrdersPageFilters = {
  statusGroup: 'ALL',
  artworkFormat: 'ALL',
  priceRange: 'ALL',
  dateFrom: null,
  dateTo: null,
  search: '',
  sortOrder: 'desc',
  page: 1,
  pageSize: 8,
}

export function hasActiveFilters(filters: OrdersPageFilters): boolean {
  return (
    filters.statusGroup !== 'ALL' ||
    filters.artworkFormat !== 'ALL' ||
    filters.priceRange !== 'ALL' ||
    filters.dateFrom !== null ||
    filters.dateTo !== null ||
    filters.search.trim() !== ''
  )
}

function matchesSearch(order: Order, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  if (formatOrderCode(order.id).toLowerCase().includes(q)) return true
  if (getBuyerDisplayName(order).toLowerCase().includes(q)) return true
  return order.items.some((item) => item.artwork_title.toLowerCase().includes(q))
}

function matchesPriceRange(order: Order, rangeId: PriceRangeId): boolean {
  if (rangeId === 'ALL') return true
  const range = PRICE_RANGES.find((r) => r.id === rangeId)
  if (!range) return true
  if (range.min !== undefined && order.subtotal < range.min) return false
  if (range.max !== undefined && order.subtotal >= range.max) return false
  return true
}

function matchesDateRange(order: Order, from: Date | null, to: Date | null): boolean {
  if (!from && !to) return true
  const created = new Date(order.created_at).getTime()
  if (from && created < from.getTime()) return false
  if (to) {
    const endOfDay = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999)
    if (created > endOfDay.getTime()) return false
  }
  return true
}

/**
 * Client-side filter/sort/paginate pipeline. OrderFilters (the API contract) only
 * supports status/page/limit/sort_order today, so status-group, format, price range,
 * date range and search are applied here against an already-fetched page of orders.
 * `applyOrderFilters` is the single seam to remove once the backend supports these
 * filters natively — swap the caller to pass them to orderService.getSellerOrders
 * instead and delete everything below the sort step.
 */
export function applyOrderFilters(
  orders: Order[],
  filters: OrdersPageFilters
): { data: Order[]; total: number; totalPages: number } {
  const filtered = orders.filter((order) => {
    if (filters.statusGroup !== 'ALL' && getOrderStatusGroup(order.status) !== filters.statusGroup) return false
    if (filters.artworkFormat !== 'ALL' && !order.items.some((item) => item.artwork_format === filters.artworkFormat)) return false
    if (!matchesPriceRange(order, filters.priceRange)) return false
    if (!matchesDateRange(order, filters.dateFrom, filters.dateTo)) return false
    if (!matchesSearch(order, filters.search)) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    return filters.sortOrder === 'asc' ? diff : -diff
  })

  const total = sorted.length
  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize))
  const safePage = Math.min(filters.page, totalPages)
  const start = (safePage - 1) * filters.pageSize
  const data = sorted.slice(start, start + filters.pageSize)

  return { data, total, totalPages }
}