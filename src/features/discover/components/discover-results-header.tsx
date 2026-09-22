'use client'

import { Dropdown, DropdownOption } from '@/components/ui/dropdown'
import { LocationCascadeFilter, type LocationFilterValue } from '@/components/filters/location-cascade-filter'
import { FEED_TABS } from '@/features/home/types'
import type { FeedSort } from '@/features/home/types'

type DiscoverResultsHeaderProps = {
  activeLabel: string
  total?: number
  sort: FeedSort | 'all'
  onSortChange: (sort: FeedSort | 'all') => void
  location: LocationFilterValue
  onLocationChange: (value: LocationFilterValue) => void
}

export function DiscoverResultsHeader({
  activeLabel,
  total,
  sort,
  onSortChange,
  location,
  onLocationChange,
}: DiscoverResultsHeaderProps) {
  const FEED_TAB_OPTIONS: DropdownOption[] = FEED_TABS.map((t) => ({ id: t.value, label: t.label }))

  // sort === 'all' is the unfiltered default — leave the trigger unselected
  // so it falls back to the "All" placeholder, matching the reference.
  const activeOption = sort === 'all' ? undefined : FEED_TAB_OPTIONS.find((o) => o.id === sort)

  return (
    <div className="max-w-[1440px] mx-auto flex items-center justify-between px-4 py-6 md:px-8 gap-x-4">
      <h2 className="font-raleway text-[20px] font-semibold text-neutral-700 shrink-0">
        {activeLabel}
        {typeof total === 'number' && (
          <span className="ml-2 font-normal text-primary-500">({total.toLocaleString()})</span>
        )}
      </h2>

      <div className="flex items-center gap-x-3 max-md:hidden">
        <LocationCascadeFilter value={location} onChange={onLocationChange} />

        <div style={{ width: 220 }}>
          <Dropdown
            options={FEED_TAB_OPTIONS}
            value={activeOption}
            onChange={(opt) => onSortChange(opt.id as FeedSort | 'all')}
            indicator="highlight"
            placeholder="All"
          />
        </div>
      </div>
    </div>
  )
}
