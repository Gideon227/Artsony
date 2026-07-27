import { DEFAULT_ORDERS_FILTERS, type OrdersPageFilters, type PriceRangeId } from './filters'
import { STATUS_GROUP_VALUES, type OrderStatusGroup } from './status'

const STATUS_GROUPS = new Set<OrderStatusGroup>(STATUS_GROUP_VALUES)
const PRICE_IDS = new Set<PriceRangeId>(['ALL', 'UNDER_50', '50_200', '200_500', '500_1000', '1000_5000', 'ABOVE_5000'])

export function filtersFromSearchParams(params: URLSearchParams): OrdersPageFilters {
  const statusParam = params.get('status')
  const priceParam = params.get('price') as PriceRangeId | null
  const formatParam = params.get('format')
  const dateFrom = params.get('from')
  const dateTo = params.get('to')

  return {
    ...DEFAULT_ORDERS_FILTERS,
    statusGroup: statusParam && STATUS_GROUPS.has(statusParam as OrderStatusGroup) ? (statusParam as OrderStatusGroup) : 'ALL',
    artworkFormat: formatParam === 'PHYSICAL' || formatParam === 'DIGITAL' ? formatParam : 'ALL',
    priceRange: priceParam && PRICE_IDS.has(priceParam) ? priceParam : 'ALL',
    dateFrom: dateFrom ? new Date(dateFrom) : null,
    dateTo: dateTo ? new Date(dateTo) : null,
    search: params.get('q') ?? '',
    sortOrder: params.get('sort') === 'asc' ? 'asc' : 'desc',
    page: Number(params.get('page') ?? 1) || 1,
  }
}

export function filtersToSearchParams(filters: OrdersPageFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.statusGroup !== 'ALL') params.set('status', filters.statusGroup)
  if (filters.artworkFormat !== 'ALL') params.set('format', filters.artworkFormat)
  if (filters.priceRange !== 'ALL') params.set('price', filters.priceRange)
  if (filters.dateFrom) params.set('from', filters.dateFrom.toISOString().slice(0, 10))
  if (filters.dateTo) params.set('to', filters.dateTo.toISOString().slice(0, 10))
  if (filters.search.trim()) params.set('q', filters.search.trim())
  if (filters.sortOrder !== 'desc') params.set('sort', filters.sortOrder)
  if (filters.page !== 1) params.set('page', String(filters.page))
  return params
}