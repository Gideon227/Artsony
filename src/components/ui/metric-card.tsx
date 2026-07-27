import * as React from 'react'
import { ArrowDown, ArrowUp, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatUsd } from '@/lib/wallet/format'
import type { TrendDirection } from '@/types/wallet'

export type MetricTrend = {
  change_percent: number
  direction: TrendDirection
}

export function TrendIndicator({ trend, label }: { trend: MetricTrend; label?: string }) {
  const isUp = trend.direction === 'UP'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-body-xs font-medium',
        isUp ? 'text-success-600' : 'text-error-600'
      )}
    >
      {isUp ? <ArrowUp className="h-3.5 w-3.5" strokeWidth={2} /> : <ArrowDown className="h-3.5 w-3.5" strokeWidth={2} />}
      {trend.change_percent}% {label ?? (isUp ? 'Up' : 'Down')}
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
  showHelp?: boolean
}

function formatMetricValue(value: number, format: 'currency' | 'count'): string {
  if (format === 'count') return new Intl.NumberFormat('en-US').format(value)
  return formatUsd(value)
}

export function MetricCard({ label, value, format = 'currency', trend, icon, iconBg, valueClassName, showHelp }: MetricCardProps) {
  return (
    <div className="flex-1 rounded-2xl border border-gray-50 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-body-s font-medium text-body">{label}</span>
        <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', iconBg)}>{icon}</span>
      </div>

      <p className={cn('mt-4 font-raleway text-h4 font-semibold text-heading', valueClassName)}>
        {format === 'currency' && <span className="mr-1 font-normal text-body-m text-text-alt-grey">$</span>}
        {formatMetricValue(value, format)}
      </p>

      <div className="mt-3 flex items-center gap-2">
        <TrendIndicator trend={trend} />
        {showHelp && (
          <button type="button" aria-label={`About ${label.toLowerCase()}`} className="text-info-500">
            <HelpCircle className="h-4 w-4" strokeWidth={1.75} />
          </button>
        )}
      </div>
    </div>
  )
}
