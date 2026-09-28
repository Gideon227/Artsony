'use client'

import { Dropdown, DropdownOption } from '@/components/ui/dropdown'
import { FEED_TABS } from '@/features/home/types'
import type { FeedSort } from '@/features/home/types'

type DiscoverResultsHeaderProps = {
  activeLabel: string
  total?: number
  sort: FeedSort | 'all'
  onSortChange: (sort: FeedSort | 'all') => void
}

export function DiscoverResultsHeader({
  activeLabel,
  total,
  sort,
  onSortChange,
}: DiscoverResultsHeaderProps) {
  const FEED_TAB_OPTIONS: DropdownOption[] = FEED_TABS.map((t) => ({ id: t.value, label: t.label }))

  // sort === 'all' is the unfiltered default — leave the trigger unselected
  // so it falls back to the "All" placeholder, matching the reference.
  const activeOption = sort === 'all' ? undefined : FEED_TAB_OPTIONS.find((o) => o.id === sort)

  return (
    <div className="flex items-center justify-between px-4 py-6 md:px-8 gap-x-4">
      <h2 className="font-raleway text-h5 font-semibold text-body shrink-0">
        {activeLabel}
        {typeof total === 'number' && (
          <span className="ml-2 text-primary-500">({total.toLocaleString()})</span>
        )}
      </h2>

      <div className="flex items-center gap-x-3 max-md:hidden">
          <Dropdown
            options={FEED_TAB_OPTIONS}
            value={activeOption}
            onChange={(opt) => onSortChange(opt.id as FeedSort | 'all')}
            indicator="highlight"
            placeholder="All"
            className='w-[332px]'
          />
      </div>
    </div>
  )
}
