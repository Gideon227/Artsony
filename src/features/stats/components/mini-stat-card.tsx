'use client'

import * as React from 'react'
import { useMediaQuery } from '@/hooks'
import { Dropdown, type DropdownOption } from '@/components/ui/dropdown'
import { DynamicTooltip } from '@/components/ui/dynamic-tooltip'
import { MiniBarChart } from '@/components/ui/charts'
import { STUDIO_HELP } from '@/lib/studio/help-copy'
import { TrendIndicator } from '@/components/ui/metric-card'
import { useMiniStat } from '@/hooks/queries/use-stats'
import { formatUsd } from '@/lib/wallet/format'
import type { MiniStatPeriod } from '@/types/stats'
import { StudioCardError } from '@/features/studio/components/studio-card-error'

const PERIOD_OPTIONS: DropdownOption[] = [
  { id: 'TODAY', label: 'Today' },
  { id: 'WEEK', label: 'Week' },
  { id: 'MONTH', label: 'Monthly' },
  { id: 'YEAR', label: 'Yearly' },
]

const HELP = { CR: STUDIO_HELP.conversionRate, AOV: STUDIO_HELP.averageOrderValue } as const

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
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const { data, isLoading, isError, error, refetch, isRefetching } = useMiniStat(metric, period)

  if (isError && !data) {
    return <StudioCardError error={error} onRetry={() => void refetch()} isRetrying={isRefetching} />
  }

  if (isLoading || !data) return <MiniStatSkeleton />

  return (
    <div className="flex-1 rounded-xl border border-gray-50 bg-white p-4 lg:rounded-2xl lg:p-5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-body-s font-medium text-body">
          {label}
          <DynamicTooltip title={HELP[metric].title} content={HELP[metric].content} iconSize={20} className="w-[212px]" />
        </span>

        <Dropdown
          options={PERIOD_OPTIONS}
          value={PERIOD_OPTIONS.find((opt) => opt.id === period)}
          onChange={(option) => setPeriod(option.id as MiniStatPeriod)}
          arrow={isDesktop ? 'chevron' : 'triangle'}
          className="w-auto lg:w-32"
          // triggerClassName="max-lg:h-8 max-lg:border-transparent max-lg:bg-secondary-100 max-lg:px-4"
        />
      </div>

      <p className="mt-7 text-center text-body-s text-body lg:mt-6 lg:text-left">{data.date_range_label}</p>

      <p className="mt-1 text-center font-raleway text-h3 font-medium text-heading lg:text-left">
        {data.format === 'CURRENCY' ? (
          <>
            <span className="mr-1 font-normal text-body-m text-text-alt-grey">$</span>
            {formatUsd(data.value)}
          </>
        ) : (
          `${data.value}%`
        )}
      </p>

      <div className="mt-2 flex justify-center lg:block">
        <TrendIndicator trend={data} label={data.trend_label} />
      </div>

      <div className="mt-8 px-3 lg:mt-4 lg:px-0">
        <MiniBarChart data={data.series} className="h-12 gap-1 lg:h-16 lg:gap-1.5" />
      </div>
    </div>
  )
}
