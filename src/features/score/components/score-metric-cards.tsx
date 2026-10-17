'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TrendIndicator } from '@/components/ui/metric-card'
import { DynamicTooltip } from '@/components/ui/dynamic-tooltip'
import { useScoreMetrics } from '@/hooks/queries/use-score'
import { RATING_TIER_META } from '@/lib/score/format'
import { SCORE_METRIC_HELP } from '@/lib/studio/help-copy'
import type { ScoreMetric } from '@/types/score'
import { StudioCardError } from '@/features/studio/components/studio-card-error'

function ScoreCardSkeleton() {
  return (
    <div className="flex-1 rounded-xl border border-gray-50 bg-white p-5 lg:rounded-2xl">
      <div className="h-4 w-32 animate-pulse rounded bg-gray-50" />
      <div className="mt-6 h-9 w-24 animate-pulse rounded bg-gray-50" />
      <div className="mt-4 h-3 w-20 animate-pulse rounded bg-gray-50" />
    </div>
  )
}

function ScoreCard({ metric }: { metric: ScoreMetric }) {
  const hasValue = metric.value !== null
  const ratingClassName = metric.tier ? RATING_TIER_META[metric.tier].textClassName : 'text-body'
  const help = SCORE_METRIC_HELP[metric.key]

  return (
    <div className="flex flex-1 flex-col gap-y-3 rounded-xl border border-gray-50 bg-white p-4 lg:h-56 lg:justify-between lg:gap-y-0 lg:rounded-2xl lg:pb-6">
      <div className="flex items-center gap-2">
        <p className="flex items-center font-poppins text-body-s font-medium text-heading">{metric.label}</p>
        <DynamicTooltip title={help.title} content={help.content} iconSize={20} className="w-[212px]" />
      </div>

      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 font-raleway text-h3 font-medium leading-12 text-heading lg:text-[64px] lg:leading-[72px]">
          {hasValue ? metric.value : '—'}
          {hasValue &&
            (metric.format === 'RATING_5' ? (
              <Star className="h-7 w-7 fill-[#FFC400] text-[#FFC400] lg:h-6 lg:w-6" strokeWidth={0} />
            ) : (
              '%'
            ))}
        </p>

        <p className={cn('font-poppins text-[20px]', ratingClassName)}>{metric.rating_label}</p>
      </div>

      <div className="min-h-6">
        {metric.trend && <TrendIndicator trend={metric.trend} label={metric.trend.label} />}
      </div>
    </div>
  )
}

export function ScoreMetricCards() {
  const { data: metrics, isLoading, isError, error, refetch, isRefetching } = useScoreMetrics()

  if (isError && !metrics) {
    return <StudioCardError error={error} onRetry={() => void refetch()} isRetrying={isRefetching} />
  }

  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <ScoreCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {metrics.map((metric) => (
        <ScoreCard key={metric.key} metric={metric} />
      ))}
    </div>
  )
}
