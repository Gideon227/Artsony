import type { SellerSalesFormat, SellerStatus } from '@/types/seller-sales'

export const ORDER_PAGE_SIZE = 7

export type StatusFilter = SellerStatus | 'ALL'
export type FormatFilter = SellerSalesFormat | 'ALL'
export type SortOrder = 'asc' | 'desc'
export type SortField = 'date' | 'value'

export type PriceRangeId =
  | 'UNDER_50'
  | 'R_50_200'
  | 'R_200_500'
  | 'R_500_1000'
  | 'R_1000_5000'
  | 'ABOVE_5000'
export type PriceFilter = PriceRangeId | 'ALL'

export type PriceRange = { id: PriceRangeId; label: string; min?: number; max?: number }

// Lower bound inclusive, upper bound exclusive, so adjacent ranges never overlap.
export const PRICE_RANGES: readonly PriceRange[] = [
  { id: 'UNDER_50', label: 'Under $50', max: 50 },
  { id: 'R_50_200', label: '$50 – $200', min: 50, max: 200 },
  { id: 'R_200_500', label: '$200 – $500', min: 200, max: 500 },
  { id: 'R_500_1000', label: '$500 – $1,000', min: 500, max: 1000 },
  { id: 'R_1000_5000', label: '$1,000 – $5,000', min: 1000, max: 5000 },
  { id: 'ABOVE_5000', label: 'Above $5,000', min: 5000 },
]

export type OrderFilters = {
  status: StatusFilter
  format: FormatFilter
  price: PriceFilter
  dateFrom: Date | null
  dateTo: Date | null
  search: string
  sort: SortOrder
  sortBy: SortField
  page: number
}

export type UpdateOptions = { replace?: boolean }

export const DEFAULT_FILTERS: OrderFilters = {
  status: 'ALL',
  format: 'ALL',
  price: 'ALL',
  dateFrom: null,
  dateTo: null,
  search: '',
  sort: 'desc',
  sortBy: 'date',
  page: 1,
}

export function hasSecondaryFilters(filters: OrderFilters): boolean {
  return (
    filters.status !== 'ALL' ||
    filters.format !== 'ALL' ||
    filters.price !== 'ALL' ||
    filters.dateFrom !== null ||
    filters.dateTo !== null
  )
}

export function hasActiveFilters(filters: OrderFilters): boolean {
  return hasSecondaryFilters(filters) || filters.search.trim().length > 0
}
