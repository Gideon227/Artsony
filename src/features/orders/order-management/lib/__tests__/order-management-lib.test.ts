import { DEFAULT_FILTERS, ORDER_PAGE_SIZE, hasActiveFilters, hasSecondaryFilters, type OrderFilters } from '../filters'
import { formatCount, formatMoney } from '../format'
import { getPageItems } from '../pagination'
import { endOfDay, startOfDay, toApiParams } from '../to-api-params'
import { fromDateKey, parseFilters, serializeFilters, toDateKey } from '../url-filters'

const fromQuery = (query: string) => parseFilters(new URLSearchParams(query))
const make = (patch: Partial<OrderFilters>): OrderFilters => ({ ...DEFAULT_FILTERS, ...patch })

describe('date keys', () => {
  it('round-trips local calendar days without shifting them', () => {
    for (const key of ['2025-09-17', '2025-01-01', '2024-02-29', '2025-12-31']) {
      expect(toDateKey(fromDateKey(key) as Date)).toBe(key)
    }
  })

  it('rejects impossible or malformed dates', () => {
    for (const key of ['2025-02-30', '2025-13-01', '2025-9-1', 'yesterday', '', null]) {
      expect(fromDateKey(key)).toBeNull()
    }
  })
})

describe('parseFilters', () => {
  it('returns defaults for an empty query', () => {
    expect(fromQuery('')).toEqual(DEFAULT_FILTERS)
  })

  it('parses every supported parameter', () => {
    const filters = fromQuery('status=LIVE&format=DIGITAL&price=R_50_200&from=2025-09-01&to=2025-09-30&q=salvador&sort=asc&page=3')
    expect(filters).toMatchObject({ status: 'LIVE', format: 'DIGITAL', price: 'R_50_200', search: 'salvador', sort: 'asc', page: 3 })
    expect(toDateKey(filters.dateFrom as Date)).toBe('2025-09-01')
    expect(toDateKey(filters.dateTo as Date)).toBe('2025-09-30')
  })

  it('falls back to defaults for unknown or tampered values', () => {
    const filters = fromQuery('status=HACKED&format=x&price=FREE&sort=up&page=-4&from=nope&to=2025-02-30')
    expect(filters).toEqual(DEFAULT_FILTERS)
  })

  it('treats a non-numeric or zero page as page 1 and caps absurd pages', () => {
    expect(fromQuery('page=abc').page).toBe(1)
    expect(fromQuery('page=0').page).toBe(1)
    expect(fromQuery('page=999999999').page).toBe(100000)
  })

  it('swaps an inverted date range', () => {
    const filters = fromQuery('from=2025-09-30&to=2025-09-01')
    expect(toDateKey(filters.dateFrom as Date)).toBe('2025-09-01')
    expect(toDateKey(filters.dateTo as Date)).toBe('2025-09-30')
  })

  it('truncates very long search terms', () => {
    expect(fromQuery(`q=${'a'.repeat(300)}`).search).toHaveLength(100)
  })
})

describe('serializeFilters', () => {
  it('omits defaults', () => {
    expect(serializeFilters(DEFAULT_FILTERS).toString()).toBe('')
  })

  it('round-trips a fully populated filter set', () => {
    const original = make({
      status: 'PENDING',
      format: 'PHYSICAL',
      price: 'ABOVE_5000',
      dateFrom: fromDateKey('2025-10-01'),
      dateTo: fromDateKey('2025-10-15'),
      search: 'crimson echoes',
      sort: 'asc',
      page: 2,
    })
    expect(fromQuery(serializeFilters(original).toString())).toEqual(original)
  })

  it('trims whitespace-only search out of the URL', () => {
    expect(serializeFilters(make({ search: '   ' })).toString()).toBe('')
  })
})

describe('toApiParams', () => {
  it('always sends sorting and pagination', () => {
    expect(toApiParams(DEFAULT_FILTERS)).toEqual({ sort_order: 'desc', page: 1, limit: ORDER_PAGE_SIZE })
  })

  it('maps price ranges to inclusive-min, exclusive-max bounds', () => {
    expect(toApiParams(make({ price: 'UNDER_50' }))).toMatchObject({ price_max: 50 })
    expect(toApiParams(make({ price: 'UNDER_50' }))).not.toHaveProperty('price_min')
    expect(toApiParams(make({ price: 'R_200_500' }))).toMatchObject({ price_min: 200, price_max: 500 })
    expect(toApiParams(make({ price: 'ABOVE_5000' }))).toMatchObject({ price_min: 5000 })
    expect(toApiParams(make({ price: 'ABOVE_5000' }))).not.toHaveProperty('price_max')
  })

  it('sends the whole selected local day as ISO bounds', () => {
    const day = fromDateKey('2025-09-17') as Date
    const params = toApiParams(make({ dateFrom: day, dateTo: day }))
    expect(new Date(params.date_from as string).getTime()).toBe(startOfDay(day).getTime())
    expect(new Date(params.date_to as string).getTime()).toBe(endOfDay(day).getTime())
    expect(new Date(params.date_to as string).getTime() - new Date(params.date_from as string).getTime()).toBe(86_399_999)
  })

  it('omits an unset end date and blank search', () => {
    const params = toApiParams(make({ dateFrom: fromDateKey('2025-09-17'), search: '  ' }))
    expect(params).toHaveProperty('date_from')
    expect(params).not.toHaveProperty('date_to')
    expect(params).not.toHaveProperty('q')
  })

  it('passes status, format and trimmed search through', () => {
    expect(toApiParams(make({ status: 'LIVE', format: 'DIGITAL', search: ' salt ' }))).toMatchObject({
      status: 'LIVE',
      format: 'DIGITAL',
      q: 'salt',
    })
  })
})

describe('filter predicates', () => {
  it('distinguishes secondary filters from search', () => {
    expect(hasSecondaryFilters(make({ search: 'x' }))).toBe(false)
    expect(hasActiveFilters(make({ search: 'x' }))).toBe(true)
    expect(hasSecondaryFilters(make({ price: 'UNDER_50' }))).toBe(true)
    expect(hasActiveFilters(DEFAULT_FILTERS)).toBe(false)
  })
})

describe('formatMoney', () => {
  it('formats USD and USDT with a spaced dollar sign and never throws', () => {
    expect(formatMoney(239.46, 'USDT')).toBe('$ 239.46')
    expect(formatMoney(9952.25, 'USD')).toBe('$ 9,952.25')
    expect(formatMoney(0, 'usdt')).toBe('$ 0.00')
  })

  it('falls back to the currency code for unknown currencies', () => {
    expect(formatMoney(10, 'NGN')).toBe('NGN 10.00')
  })
})

describe('formatCount', () => {
  it('zero-pads to two digits and caps at 99+', () => {
    expect(formatCount(0)).toBe('00')
    expect(formatCount(7)).toBe('07')
    expect(formatCount(12)).toBe('12')
    expect(formatCount(100)).toBe('99+')
    expect(formatCount(-3)).toBe('00')
  })
})

describe('getPageItems', () => {
  it('lists every page when there are seven or fewer', () => {
    expect(getPageItems(1, 1)).toEqual([1])
    expect(getPageItems(2, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('collapses distant pages around the current one', () => {
    expect(getPageItems(1, 20)).toEqual([1, 2, 3, 4, 5, 'ellipsis-end', 20])
    expect(getPageItems(10, 20)).toEqual([1, 'ellipsis-start', 9, 10, 11, 'ellipsis-end', 20])
    expect(getPageItems(20, 20)).toEqual([1, 'ellipsis-start', 16, 17, 18, 19, 20])
  })
})
