import * as React from 'react'
import { Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatUsd } from '@/lib/wallet/format'
import { formatTrendPercent, TREND_TEXT_CLASS } from '@/lib/studio/trend'
import type { StudioHelp } from '@/lib/studio/help-copy'
import { DynamicTooltip } from '@/components/ui/dynamic-tooltip'
import type { TrendDirection } from '@/types/wallet'

export type MetricTrend = {
  change_percent: number
  direction: TrendDirection
}

const TREND_ICON = { UP: TrendingUp, DOWN: TrendingDown, FLAT: Minus } as const
const TREND_FALLBACK_LABEL = { UP: 'Up', DOWN: 'Down', FLAT: 'No change' } as const

// Arrow and percentage carry the trend colour; the label stays neutral.
export function TrendIndicator({ trend, label, className }: { trend: MetricTrend; label?: string; className?: string }) {
  const Icon = TREND_ICON[trend.direction]
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className={cn('inline-flex items-center gap-2 font-poppins text-body-xs font-medium', TREND_TEXT_CLASS[trend.direction])}>
        <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
        {formatTrendPercent(trend.change_percent)}
      </span>
      <span className="font-poppins text-body-s text-body">{label ?? TREND_FALLBACK_LABEL[trend.direction]}</span>
    </span>
  )
}

export function MetricCardSkeleton() {
  return (
    <div className="flex-1 rounded-2xl border border-gray-50 bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 animate-pulse rounded bg-gray-50" />
        <div className="h-9 w-9 animate-pulse rounded-full bg-gray-50" />
      </div>
      <div className="mt-6 h-7 w-32 animate-pulse rounded bg-gray-50" />
      <div className="mt-4 h-3 w-20 animate-pulse rounded bg-gray-50" />
    </div>
  )
}

export function MetricCardGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
}

export type MetricCardProps = {
  label: string
  value: number
  format?: 'currency' | 'count'
  trend: MetricTrend
  icon: React.ReactNode
  iconBg: string
  valueClassName?: string
  help?: StudioHelp
}

function formatMetricValue(value: number, format: 'currency' | 'count'): string {
  if (format === 'count') return new Intl.NumberFormat('en-US').format(value)
  return formatUsd(value)
}

export function MetricCard({ label, value, format = 'currency', trend, icon, iconBg, valueClassName, help }: MetricCardProps) {
  return (
    <div className="flex flex-1 flex-col gap-y-2 rounded-xl border border-gray-50 bg-white p-4 lg:block lg:rounded-2xl lg:p-5">
      <div className="flex items-center justify-between">
        <span className="text-body-s font-medium text-body">{label}</span>
        <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full lg:h-9 lg:w-9', iconBg)}>{icon}</span>
      </div>

      <p className={cn('font-raleway text-h4 font-semibold leading-10 text-heading lg:mt-4', valueClassName)}>
        <span className="mr-1 font-raleway font-medium text-h4 text-heading">
          ${formatMetricValue(value, format)}
        </span>
      </p>

      <div className="flex items-center justify-between gap-2 lg:mt-3 lg:justify-start">
        <TrendIndicator trend={trend} />
        {help && <DynamicTooltip title={help.title} content={help.content} iconSize={20} className="w-[212px]" />}
      </div>
    </div>
  )
}
