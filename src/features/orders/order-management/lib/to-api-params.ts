import type { SellerSalesParams } from '@/types/seller-sales'
import { ORDER_PAGE_SIZE, PRICE_RANGES, type OrderFilters } from './filters'

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
}

export function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
}

export function toApiParams(filters: OrderFilters): SellerSalesParams {
  const range = PRICE_RANGES.find((candidate) => candidate.id === filters.price)
  const search = filters.search.trim()

  return {
    ...(filters.status !== 'ALL' && { status: filters.status }),
    ...(filters.format !== 'ALL' && { format: filters.format }),
    ...(range?.min !== undefined && { price_min: range.min }),
    ...(range?.max !== undefined && { price_max: range.max }),
    ...(filters.dateFrom && { date_from: startOfDay(filters.dateFrom).toISOString() }),
    ...(filters.dateTo && { date_to: endOfDay(filters.dateTo).toISOString() }),
    ...(search && { q: search }),
    sort_order: filters.sort,
    page: filters.page,
    limit: ORDER_PAGE_SIZE,
  }
}
