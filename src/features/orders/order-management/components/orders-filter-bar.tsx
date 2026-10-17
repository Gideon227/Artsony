'use client'

import * as React from 'react'
import { SlidersVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Dropdown, type DropdownOption } from '@/components/ui/dropdown'
import { DateRangePicker } from '@/components/ui/date-picker'
import { SearchInput } from '@/components/ui/search-input'
import { FORMAT_OPTIONS, PRICE_OPTIONS, SORT_OPTIONS, STATUS_FILTER_OPTIONS } from '../constants'
import type {
  FormatFilter,
  OrderFilters,
  PriceFilter,
  SortOrder,
  StatusFilter,
  UpdateOptions,
} from '../lib/filters'

const SEARCH_DEBOUNCE_MS = 300

type Props = {
  filters: OrderFilters
  heading: string
  total: number | undefined
  showMore: boolean
  onToggleMore: () => void
  onChange: (patch: Partial<OrderFilters>, options?: UpdateOptions) => void
}

function findOption(options: DropdownOption[], id: string): DropdownOption | undefined {
  return options.find((option) => option.id === id)
}

function toggled<T extends string>(current: T | 'ALL', next: T): T | 'ALL' {
  return current === next ? 'ALL' : next
}

export function OrdersFilterBar({ filters, heading, total, showMore, onToggleMore, onChange }: Props) {
  const [searchInput, setSearchInput] = React.useState(filters.search)
  const committedSearch = React.useRef(filters.search)
  const onChangeRef = React.useRef(onChange)

  React.useEffect(() => {
    onChangeRef.current = onChange
  })

  React.useEffect(() => {
    if (filters.search !== committedSearch.current) {
      committedSearch.current = filters.search
      setSearchInput(filters.search)
    }
  }, [filters.search])

  const commitSearch = React.useCallback((value: string) => {
    const next = value.trim()
    if (next === committedSearch.current) return
    committedSearch.current = next
    onChangeRef.current({ search: next }, { replace: true })
  }, [])

  React.useEffect(() => {
    const timer = setTimeout(() => commitSearch(searchInput), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [searchInput, commitSearch])

  return (
    <div className="flex flex-col gap-6 rounded-[32px] bg-white p-4 md:gap-14">
      <div className="flex items-center gap-4">
        <h2 className="font-raleway text-h6 font-semibold leading-8 tracking-wide text-gray-500 md:text-h5">{heading}</h2>
        {total !== undefined && (
          <span
            aria-label={`${total} orders`}
            className="flex h-8 min-w-8 items-center justify-center rounded-[8px] bg-primary-500 px-2 font-poppins text-body-s font-medium leading-none text-white"
          >
            {total}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4">
          <div className="w-full md:min-w-[240px] md:flex-1">
            <SearchInput
              value={searchInput}
              onChange={setSearchInput}
              onSearch={commitSearch}
              leftIconPath="/home/magnifier.svg"
              placeholder="Search by Order ID, Customer, Artwork name"
              aria-label="Search orders"
              maxLength={100}
            />
          </div>

          <div className="min-w-0 flex-1 md:w-[216px] md:flex-none">
            <Dropdown
              className="w-full"
              options={SORT_OPTIONS}
              value={findOption(SORT_OPTIONS, filters.sort)}
              onChange={(option) => onChange({ sort: option.id as SortOrder })}
              placeholder="Sort"
              arrow="triangle"
              indicator="radio"
            />
          </div>

          <button
            type="button"
            onClick={onToggleMore}
            aria-expanded={showMore}
            aria-controls="orders-more-filters"
            className={cn(
              'flex h-12 min-w-0 flex-1 cursor-pointer items-center justify-between gap-3 rounded-full border px-6 md:w-[176px] md:flex-none',
              'font-poppins text-body-s font-medium tracking-wide transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
              showMore
                ? 'border-gray-50 bg-primary-50 text-primary-500 ring-2 ring-primary-500 ring-offset-2'
                : 'border-gray-50 bg-white text-gray-400 hover:bg-secondary-50',
            )}
          >
            <span className="truncate">More Filters</span>
            <SlidersVertical className="h-5 w-5 shrink-0 text-primary-500" aria-hidden="true" />
          </button>
        </div>

        {showMore && (
          <div id="orders-more-filters" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_1.43fr_1fr_1fr]">
            <Dropdown
              className="w-full"
              options={STATUS_FILTER_OPTIONS}
              value={filters.status === 'ALL' ? undefined : findOption(STATUS_FILTER_OPTIONS, filters.status)}
              onChange={(option) =>
                onChange({ status: toggled<Exclude<StatusFilter, 'ALL'>>(filters.status, option.id as Exclude<StatusFilter, 'ALL'>) })
              }
              placeholder="Status"
              arrow="triangle"
              indicator="radio"
            />

            <DateRangePicker
              value={{ from: filters.dateFrom, to: filters.dateTo }}
              onChange={({ from, to }) => onChange({ dateFrom: from, dateTo: to })}
              placeholder="Date: from - to"
            />

            <Dropdown
              className="w-full"
              options={FORMAT_OPTIONS}
              value={filters.format === 'ALL' ? undefined : findOption(FORMAT_OPTIONS, filters.format)}
              onChange={(option) =>
                onChange({ format: toggled<Exclude<FormatFilter, 'ALL'>>(filters.format, option.id as Exclude<FormatFilter, 'ALL'>) })
              }
              placeholder="Artwork type"
              arrow="triangle"
              indicator="radio"
            />

            <Dropdown
              className="w-full"
              options={PRICE_OPTIONS}
              value={filters.price === 'ALL' ? undefined : findOption(PRICE_OPTIONS, filters.price)}
              onChange={(option) =>
                onChange({ price: toggled<Exclude<PriceFilter, 'ALL'>>(filters.price, option.id as Exclude<PriceFilter, 'ALL'>) })
              }
              placeholder="Price Range"
              arrow="triangle"
              indicator="radio"
            />
          </div>
        )}
      </div>
    </div>
  )
}
