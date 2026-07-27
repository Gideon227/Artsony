'use client'

import * as React from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components'
import { Dropdown } from '@/components/ui/dropdown'
import { DateRangePicker } from '@/components/ui/date-picker'
import { PRICE_RANGES, hasActiveWalletFilters, type WalletActivityFilters } from '@/lib/wallet/filters'
import { WALLET_STATUS_META, WALLET_STATUS_VALUES, WALLET_TYPE_META, WALLET_TYPE_VALUES } from '@/lib/wallet/status'

const SORT_OPTIONS = [
  { id: 'desc' as const, label: 'New to Old' },
  { id: 'asc' as const, label: 'Old to New' },
]

const STATUS_OPTIONS = [
  { id: 'ALL' as const, label: 'Status' },
  ...WALLET_STATUS_VALUES.map((s) => ({ id: s, label: WALLET_STATUS_META[s].label })),
]

const TYPE_OPTIONS = [
  { id: 'ALL' as const, label: 'Type' },
  ...WALLET_TYPE_VALUES.map((t) => ({ id: t, label: WALLET_TYPE_META[t].label })),
]

const PRICE_OPTIONS = PRICE_RANGES.map((r) => ({ id: r.id, label: r.label }))

export type WalletFilterBarProps = {
  filters: WalletActivityFilters
  onFiltersChange: (updater: (prev: WalletActivityFilters) => WalletActivityFilters) => void
  resultCount: number
  isFiltered: boolean
}

export function WalletFilterBar({ filters, onFiltersChange, resultCount, isFiltered }: WalletFilterBarProps) {
  const [searchInput, setSearchInput] = React.useState(filters.search)
  const [showMoreFilters, setShowMoreFilters] = React.useState(false)

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onFiltersChange((prev) => ({ ...prev, search: searchInput, page: 1 }))
    }, 300)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  const activeFiltersInPanel =
    filters.status !== 'ALL' || filters.type !== 'ALL' || filters.priceRange !== 'ALL' || filters.dateFrom !== null

  return (
    <div className="flex flex-col gap-y-8 rounded-xl bg-white p-4">
      <div className="flex items-center gap-x-4">
        <h2 className="font-raleway text-h5 font-semibold tracking-wide text-body">
          {isFiltered ? 'Search Result' : 'Search'}
        </h2>
        {isFiltered && (
          <span
            style={{ borderRadius: 8 }}
            className="flex h-8 w-8 items-center justify-center rounded-s bg-primary-500 p-2 text-body-s font-semibold text-white"
          >
            {resultCount}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-y-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <Input
            type="text"
            value={searchInput}
            leftIcon="/home/magnifier.svg"
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by Transaction ID, Customer, Description"
            aria-label="Search wallet activity"
            className="h-12 flex-1"
          />

          <Dropdown
            options={SORT_OPTIONS}
            value={SORT_OPTIONS.find((opt) => opt.id === filters.sortOrder)}
            onChange={(option) => onFiltersChange((prev) => ({ ...prev, sortOrder: option.id as typeof prev.sortOrder, page: 1 }))}
            className="h-12 w-54"
          />

          <button
            type="button"
            onClick={() => setShowMoreFilters((v) => !v)}
            aria-expanded={showMoreFilters}
            className={cn(
              'flex h-12 w-42 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border px-6 text-body-s font-medium transition-colors',
              showMoreFilters || activeFiltersInPanel
                ? 'border-gray-50 text-primary-500 ring-2 ring-offset-2 ring-primary-500'
                : 'border-neutral-200 text-heading hover:border-neutral-300'
            )}
          >
            More Filters
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {showMoreFilters && (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Dropdown
              options={STATUS_OPTIONS}
              value={STATUS_OPTIONS.find((opt) => opt.id === filters.status)}
              onChange={(option) => onFiltersChange((prev) => ({ ...prev, status: option.id as typeof prev.status, page: 1 }))}
              placeholder="Status"
            />

            <DateRangePicker
              value={{ from: filters.dateFrom, to: filters.dateTo }}
              onChange={(range) => onFiltersChange((prev) => ({ ...prev, dateFrom: range.from, dateTo: range.to, page: 1 }))}
            />

            <Dropdown
              options={TYPE_OPTIONS}
              value={TYPE_OPTIONS.find((opt) => opt.id === filters.type)}
              onChange={(option) => onFiltersChange((prev) => ({ ...prev, type: option.id as typeof prev.type, page: 1 }))}
              placeholder="Type"
            />

            <Dropdown
              options={PRICE_OPTIONS}
              value={PRICE_OPTIONS.find((opt) => opt.id === filters.priceRange)}
              onChange={(option) => onFiltersChange((prev) => ({ ...prev, priceRange: option.id as typeof prev.priceRange, page: 1 }))}
              placeholder="Price Range"
            />
          </div>
        )}
      </div>
    </div>
  )
}
