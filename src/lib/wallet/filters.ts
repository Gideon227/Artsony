import type { WalletActivity, WalletActivityStatus, WalletActivityType } from '@/types/wallet'

export type PriceRangeId = 'ALL' | 'UNDER_500' | '500_1000' | '1000_5000' | 'ABOVE_5000'

export type PriceRangeDef = {
  id: PriceRangeId
  label: string
  min?: number
  max?: number
}

export const PRICE_RANGES: PriceRangeDef[] = [
  { id: 'ALL', label: 'All Prices' },
  { id: 'UNDER_500', label: 'Under $500', max: 500 },
  { id: '500_1000', label: '$500 – $1,000', min: 500, max: 1000 },
  { id: '1000_5000', label: '$1,000 – $5,000', min: 1000, max: 5000 },
  { id: 'ABOVE_5000', label: 'Above $5,000', min: 5000 },
]

export type WalletActivityFilters = {
  status: WalletActivityStatus | 'ALL'
  type: WalletActivityType | 'ALL'
  priceRange: PriceRangeId
  dateFrom: Date | null
  dateTo: Date | null
  search: string
  sortOrder: 'asc' | 'desc'
  page: number
  pageSize: number
}

export const DEFAULT_WALLET_FILTERS: WalletActivityFilters = {
  status: 'ALL',
  type: 'ALL',
  priceRange: 'ALL',
  dateFrom: null,
  dateTo: null,
  search: '',
  sortOrder: 'desc',
  page: 1,
  pageSize: 5,
}

export function hasActiveWalletFilters(filters: WalletActivityFilters): boolean {
  return (
    filters.status !== 'ALL' ||
    filters.type !== 'ALL' ||
    filters.priceRange !== 'ALL' ||
    filters.dateFrom !== null ||
    filters.dateTo !== null ||
    filters.search.trim() !== ''
  )
}

function matchesSearch(activity: WalletActivity, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    activity.transaction_id.toLowerCase().includes(q) ||
    activity.description.toLowerCase().includes(q) ||
    (activity.wallet_address?.toLowerCase().includes(q) ?? false)
  )
}

function matchesPriceRange(activity: WalletActivity, rangeId: PriceRangeId): boolean {
  if (rangeId === 'ALL') return true
  const range = PRICE_RANGES.find((r) => r.id === rangeId)
  if (!range) return true
  const amount = Math.abs(activity.amount)
  if (range.min !== undefined && amount < range.min) return false
  if (range.max !== undefined && amount >= range.max) return false
  return true
}

function matchesDateRange(activity: WalletActivity, from: Date | null, to: Date | null): boolean {
  if (!from && !to) return true
  const created = new Date(activity.created_at).getTime()
  if (from && created < from.getTime()) return false
  if (to) {
    const endOfDay = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999)
    if (created > endOfDay.getTime()) return false
  }
  return true
}

/**
 * Client-side filter/sort/paginate pipeline over an already-fetched page of
 * activity — mirrors lib/orders/filters.ts. No wallet-activity backend
 * endpoint exists yet (see services/wallet.service.ts), so this is the seam
 * to remove once the API supports these filters server-side.
 */
export function applyWalletFilters(
  activity: WalletActivity[],
  filters: WalletActivityFilters
): { data: WalletActivity[]; total: number; totalPages: number } {
  const filtered = activity.filter((item) => {
    if (filters.status !== 'ALL' && item.status !== filters.status) return false
    if (filters.type !== 'ALL' && item.type !== filters.type) return false
    if (!matchesPriceRange(item, filters.priceRange)) return false
    if (!matchesDateRange(item, filters.dateFrom, filters.dateTo)) return false
    if (!matchesSearch(item, filters.search)) return false
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
