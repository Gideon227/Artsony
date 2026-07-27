import { DEFAULT_WALLET_FILTERS, type PriceRangeId, type WalletActivityFilters } from './filters'
import { WALLET_STATUS_VALUES, WALLET_TYPE_VALUES } from './status'
import type { WalletActivityStatus, WalletActivityType, WalletPeriod } from '@/types/wallet'

const STATUS_SET = new Set<WalletActivityStatus>(WALLET_STATUS_VALUES)
const TYPE_SET = new Set<WalletActivityType>(WALLET_TYPE_VALUES)
const PRICE_IDS = new Set<PriceRangeId>(['ALL', 'UNDER_500', '500_1000', '1000_5000', 'ABOVE_5000'])
const PERIOD_SET = new Set<WalletPeriod>(['TODAY', 'WEEK', 'MONTH', 'YEAR', 'ALL_TIME'])

export function walletFiltersFromSearchParams(params: URLSearchParams): WalletActivityFilters {
  const statusParam = params.get('status')
  const typeParam = params.get('type')
  const priceParam = params.get('price') as PriceRangeId | null
  const dateFrom = params.get('from')
  const dateTo = params.get('to')

  return {
    ...DEFAULT_WALLET_FILTERS,
    status: statusParam && STATUS_SET.has(statusParam as WalletActivityStatus) ? (statusParam as WalletActivityStatus) : 'ALL',
    type: typeParam && TYPE_SET.has(typeParam as WalletActivityType) ? (typeParam as WalletActivityType) : 'ALL',
    priceRange: priceParam && PRICE_IDS.has(priceParam) ? priceParam : 'ALL',
    dateFrom: dateFrom ? new Date(dateFrom) : null,
    dateTo: dateTo ? new Date(dateTo) : null,
    search: params.get('q') ?? '',
    sortOrder: params.get('sort') === 'asc' ? 'asc' : 'desc',
    page: Number(params.get('page') ?? 1) || 1,
  }
}

export function walletFiltersToSearchParams(filters: WalletActivityFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.status !== 'ALL') params.set('status', filters.status)
  if (filters.type !== 'ALL') params.set('type', filters.type)
  if (filters.priceRange !== 'ALL') params.set('price', filters.priceRange)
  if (filters.dateFrom) params.set('from', filters.dateFrom.toISOString().slice(0, 10))
  if (filters.dateTo) params.set('to', filters.dateTo.toISOString().slice(0, 10))
  if (filters.search.trim()) params.set('q', filters.search.trim())
  if (filters.sortOrder !== 'desc') params.set('sort', filters.sortOrder)
  if (filters.page !== 1) params.set('page', String(filters.page))
  return params
}

export function walletPeriodFromSearchParams(params: URLSearchParams): WalletPeriod {
  const period = params.get('period') as WalletPeriod | null
  return period && PERIOD_SET.has(period) ? period : 'WEEK'
}
