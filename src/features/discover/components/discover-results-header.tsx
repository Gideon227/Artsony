'use client'

import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components'
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

  const activeOption = FEED_TAB_OPTIONS.find((o) => o.id === sort) ?? FEED_TAB_OPTIONS[0]

  
  return (
    <div className="flex items-center justify-between px-4 py-6 md:px-8">
      <h2 className="font-raleway text-[20px] font-semibold text-neutral-700">
        {activeLabel}
        {typeof total === 'number' && (
          <span className="ml-2 font-normal text-neutral-400">({total.toLocaleString()})</span>
        )}
      </h2>

      <div style={{ width: 332 }} className="max-sm:w-full max-md:hidden">
        <Dropdown
          options={FEED_TAB_OPTIONS}
          value={activeOption}
          onChange={(opt) => onSortChange(opt.id as FeedSort | 'all')}
          indicator="highlight"
          placeholder="For you"
        />
      </div>

      {/* <Select value={sort} onValueChange={(v) => onSortChange(v as FeedSort | 'all')}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          {FEED_TABS.map((tab) => (
            <SelectItem key={tab.value} value={tab.value}>
              {tab.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select> */}
    </div>
  )
}
