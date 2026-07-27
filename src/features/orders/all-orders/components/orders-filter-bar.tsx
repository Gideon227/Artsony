'use client'

import * as React from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Dropdown } from '@/components/ui/dropdown' // 🌟 Replaced FilterSelect with Dropdown
import { DateRangePicker } from '@/components/ui/date-picker'
import { PRICE_RANGES, hasActiveFilters, type OrdersPageFilters } from '@/lib/orders/filters'
import { STATUS_GROUP_META, STATUS_GROUP_VALUES } from '@/lib/orders/status'
import { Input } from '@/components'

// 🌟 Changed 'value' to 'id' to match your DropdownOption interface
const SORT_OPTIONS = [
  { id: 'desc' as const, label: 'New to Old' },
  { id: 'asc' as const, label: 'Old to New' },
]

const STATUS_OPTIONS = [
  { id: 'ALL' as const, label: 'All Statuses' },
  ...STATUS_GROUP_VALUES.map((g) => ({ id: g, label: STATUS_GROUP_META[g].badgeLabel })),
]

const FORMAT_OPTIONS = [
  { id: 'ALL' as const, label: 'All Types' },
  { id: 'PHYSICAL' as const, label: 'Physical' },
  { id: 'DIGITAL' as const, label: 'Digital' },
]

const PRICE_OPTIONS = PRICE_RANGES.map((r) => ({ id: r.id, label: r.label }))

export type OrdersFilterBarProps = {
  filters: OrdersPageFilters
  onFiltersChange: (updater: (prev: OrdersPageFilters) => OrdersPageFilters) => void
  resultCount: number
  isFiltered: boolean
}

function OrdersFilterBar({ filters, onFiltersChange, resultCount, isFiltered }: OrdersFilterBarProps) {
    const [searchInput, setSearchInput] = React.useState(filters.search)
    const [showMoreFilters, setShowMoreFilters] = React.useState(false)

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            onFiltersChange((prev) => ({ ...prev, search: searchInput, page: 1 }))
        }, 300)
        return () => clearTimeout(timeout)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchInput])

    const activeFiltersInPanel = filters.statusGroup !== 'ALL' || filters.artworkFormat !== 'ALL' || filters.priceRange !== 'ALL' || filters.dateFrom !== null

    return (
        <div className='bg-white p-4 flex flex-col gap-y-14 rounded-xl'>
            <div className="flex items-center gap-x-4">
                <h2 className="font-raleway text-h5 font-semibold text-body tracking-wide">
                    {isFiltered ? 'Search Result' : 'Search'}
                </h2>
                {isFiltered && (
                    <span style={{ borderRadius: 8 }} className="flex h-8 w-8 items-center justify-center rounded-s bg-primary-500 p-2 text-body-s font-semibold text-white">
                        {resultCount}
                    </span>
                )}
            </div>

            <div className='flex flex-col gap-y-4'>
                <div className="flex flex-col gap-4 md:flex-row">
                    <Input 
                        type="text"
                        value={searchInput}
                        leftIcon='/home/magnifier.svg'
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search by Order ID, Customer, Artwork name"
                        aria-label="Search orders"
                        className='flex-1 h-12'
                    />

                    {/* Sort Dropdown */}
                    <Dropdown
                        options={SORT_OPTIONS}
                        value={SORT_OPTIONS.find((opt) => opt.id === filters.sortOrder)}
                        onChange={(option) => onFiltersChange((prev) => ({ ...prev, sortOrder: option.id as typeof prev.sortOrder, page: 1 }))}
                        className="w-54 h-12"
                    />
                    
                    <button
                        type="button"
                        onClick={() => setShowMoreFilters((v) => !v)}
                        aria-expanded={showMoreFilters}
                        className={cn(
                            'flex h-12 w-42 cursor-pointer shrink-0 items-center justify-center gap-2 rounded-full border px-6 text-body-s font-medium transition-colors',
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
                        {/* 🌟 Status Dropdown */}
                        <Dropdown
                            options={STATUS_OPTIONS}
                            value={STATUS_OPTIONS.find((opt) => opt.id === filters.statusGroup)}
                            onChange={(option) => onFiltersChange((prev) => ({ ...prev, statusGroup: option.id as typeof prev.statusGroup, page: 1 }))}
                            placeholder="Status"
                        />
                        
                        <DateRangePicker
                            value={{ from: filters.dateFrom, to: filters.dateTo }}
                            onChange={(range) => onFiltersChange((prev) => ({ ...prev, dateFrom: range.from, dateTo: range.to, page: 1 }))}
                        />

                        {/* 🌟 Format Dropdown */}
                        <Dropdown
                            options={FORMAT_OPTIONS}
                            value={FORMAT_OPTIONS.find((opt) => opt.id === filters.artworkFormat)}
                            onChange={(option) => onFiltersChange((prev) => ({ ...prev, artworkFormat: option.id as typeof prev.artworkFormat, page: 1 }))}
                            placeholder="Artwork type"
                        />

                        {/* 🌟 Price Dropdown */}
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

export { OrdersFilterBar }