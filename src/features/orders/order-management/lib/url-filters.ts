import {
  DEFAULT_FILTERS,
  PRICE_RANGES,
  type FormatFilter,
  type OrderFilters,
  type PriceFilter,
  type SortOrder,
  type StatusFilter,
} from './filters'

const STATUSES: readonly StatusFilter[] = ['ALL', 'LIVE', 'PENDING', 'COMPLETED', 'CANCELLED']
const FORMATS: readonly FormatFilter[] = ['ALL', 'PHYSICAL', 'DIGITAL']
const SORTS: readonly SortOrder[] = ['asc', 'desc']
const MAX_PAGE = 100_000
const MAX_SEARCH_LENGTH = 100
const DATE_KEY = /^(\d{4})-(\d{2})-(\d{2})$/

type ParamReader = { get(name: string): string | null }

function pick<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return value !== null && (allowed as readonly string[]).includes(value) ? (value as T) : fallback
}

export function toDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function fromDateKey(key: string | null): Date | null {
  const match = key ? DATE_KEY.exec(key) : null
  if (!match) return null
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])]
  const date = new Date(year, month - 1, day)
  const isReal = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
  return isReal ? date : null
}

export function parseFilters(params: ParamReader): OrderFilters {
  const priceIds = ['ALL', ...PRICE_RANGES.map((range) => range.id)] as readonly PriceFilter[]
  const rawPage = Number.parseInt(params.get('page') ?? '', 10)
  const from = fromDateKey(params.get('from'))
  const to = fromDateKey(params.get('to'))
  const inverted = from !== null && to !== null && from.getTime() > to.getTime()

  return {
    status: pick(params.get('status'), STATUSES, DEFAULT_FILTERS.status),
    format: pick(params.get('format'), FORMATS, DEFAULT_FILTERS.format),
    price: pick(params.get('price'), priceIds, DEFAULT_FILTERS.price),
    dateFrom: inverted ? to : from,
    dateTo: inverted ? from : to,
    search: (params.get('q') ?? '').slice(0, MAX_SEARCH_LENGTH),
    sort: pick(params.get('sort'), SORTS, DEFAULT_FILTERS.sort),
    page: Number.isFinite(rawPage) && rawPage >= 1 ? Math.min(rawPage, MAX_PAGE) : DEFAULT_FILTERS.page,
  }
}

export function serializeFilters(filters: OrderFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.status !== DEFAULT_FILTERS.status) params.set('status', filters.status)
  if (filters.format !== DEFAULT_FILTERS.format) params.set('format', filters.format)
  if (filters.price !== DEFAULT_FILTERS.price) params.set('price', filters.price)
  if (filters.dateFrom) params.set('from', toDateKey(filters.dateFrom))
  if (filters.dateTo) params.set('to', toDateKey(filters.dateTo))
  const search = filters.search.trim()
  if (search) params.set('q', search)
  if (filters.sort !== DEFAULT_FILTERS.sort) params.set('sort', filters.sort)
  if (filters.page > 1) params.set('page', String(filters.page))
  return params
}
