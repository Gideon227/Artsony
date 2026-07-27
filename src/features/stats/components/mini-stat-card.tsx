'use client'

import * as React from 'react'
import { HelpCircle } from 'lucide-react'
import { Dropdown, type DropdownOption } from '@/components/ui/dropdown'
import { MiniBarChart } from '@/components/ui/charts'
import { TrendIndicator } from '@/components/ui/metric-card'
import { useMiniStat } from '@/hooks/queries/use-stats'
import { formatUsd } from '@/lib/wallet/format'
import type { MiniStatPeriod } from '@/types/stats'

const PERIOD_OPTIONS: DropdownOption[] = [
  { id: 'TODAY', label: 'Today' },
  { id: 'WEEK', label: 'Week' },
  { id: 'MONTH', label: 'Monthly' },
  { id: 'YEAR', label: 'Yearly' },
]

export type MiniStatCardProps = {
  metric: 'CR' | 'AOV'
  label: string
  defaultPeriod?: MiniStatPeriod
}

function MiniStatSkeleton() {
  return (
    <div className="flex-1 rounded-2xl border border-gray-50 bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="h-4 w-16 animate-pulse rounded bg-gray-50" />
        <div className="h-9 w-24 animate-pulse rounded-full bg-gray-50" />
      </div>
      <div className="mt-6 h-3 w-28 animate-pulse rounded bg-gray-50" />
      <div className="mt-3 h-9 w-20 animate-pulse rounded bg-gray-50" />
      <div className="mt-4 flex h-16 items-end gap-1.5">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex-1 animate-pulse rounded-md bg-gray-50" style={{ height: `${30 + (i % 3) * 20}%` }} />
        ))}
      </div>
    </div>
  )
}

export function MiniStatCard({ metric, label, defaultPeriod = 'WEEK' }: MiniStatCardProps) {
  const [period, setPeriod] = React.useState<MiniStatPeriod>(defaultPeriod)
  const { data, isLoading } = useMiniStat(metric, period)

  if (isLoading || !data) return <MiniStatSkeleton />

  return (
    <div className="flex-1 rounded-2xl border border-gray-50 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-body-s font-medium text-body">
          {label}
          <button type="button" aria-label={`About ${label}`} className="text-info-500">
            <HelpCircle className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </span>

        <Dropdown
          options={PERIOD_OPTIONS}
          value={PERIOD_OPTIONS.find((opt) => opt.id === period)}
          onChange={(option) => setPeriod(option.id as MiniStatPeriod)}
          className="w-32"
        />
      </div>

      <p className="mt-6 text-body-s text-body">{data.date_range_label}</p>

      <p className="mt-1 font-raleway text-h3 font-medium text-heading">
        {data.format === 'CURRENCY' ? (
          <>
            <span className="mr-1 font-normal text-body-m text-text-alt-grey">$</span>
            {formatUsd(data.value)}
          </>
        ) : (
          `${data.value}%`
        )}
      </p>

      <div className="mt-2">
        <TrendIndicator trend={data} label={data.trend_label} />
      </div>

      <div className="mt-4">
        <MiniBarChart data={data.series} />
      </div>
    </div>
  )
}
