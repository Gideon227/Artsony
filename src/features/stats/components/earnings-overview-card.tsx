'use client'

import * as React from 'react'
import { HelpCircle } from 'lucide-react'
import { Dropdown, type DropdownOption } from '@/components/ui/dropdown'
import { AreaChart } from '@/components/ui/charts'
import { useEarningsOverview } from '@/hooks/queries/use-stats'
import type { EarningsOverviewRange } from '@/types/stats'

const RANGE_OPTIONS: DropdownOption[] = [
  { id: 'MONTHLY', label: 'Monthly' },
  { id: 'YEARLY', label: 'Yearly' },
]

function formatYAxis(value: number): string {
  if (value === 0) return '$ 0'
  return `$ ${Math.round(value / 1000)}k`
}

function ChartSkeleton() {
  return <div className="mt-4 h-[260px] w-full animate-pulse rounded-2xl bg-gray-50" />
}

export function EarningsOverviewCard() {
  const [range, setRange] = React.useState<EarningsOverviewRange>('YEARLY')
  const { data, isLoading } = useEarningsOverview(range)

  return (
    <div className="rounded-2xl border border-gray-50 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-body-s font-medium text-body">
          Earnings Overview
          <button type="button" aria-label="About earnings overview" className="text-info-500">
            <HelpCircle className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </span>

        <Dropdown
          options={RANGE_OPTIONS}
          value={RANGE_OPTIONS.find((opt) => opt.id === range)}
          onChange={(option) => setRange(option.id as EarningsOverviewRange)}
          className="w-36"
        />
      </div>

      {isLoading || !data ? <ChartSkeleton /> : <AreaChart data={data} formatY={formatYAxis} className="mt-4" />}
    </div>
  )
}
