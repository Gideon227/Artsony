'use client'

import { HelpCircle, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TrendIndicator } from '@/components/ui/metric-card'
import { useScoreMetrics } from '@/hooks/queries/use-score'
import { getRatingTier, RATING_TIER_META, starRatingToPercent } from '@/lib/score/format'
import type { ScoreMetric } from '@/types/score'
import Image from 'next/image'

function ScoreCardSkeleton() {
  return (
    <div className="flex-1 rounded-2xl border border-gray-50 bg-white p-5">
      <div className="h-4 w-32 animate-pulse rounded bg-gray-50" />
      <div className="mt-6 h-9 w-24 animate-pulse rounded bg-gray-50" />
      <div className="mt-4 h-3 w-20 animate-pulse rounded bg-gray-50" />
    </div>
  )
}

function ScoreCard({ metric }: { metric: ScoreMetric }) {
  const percent = metric.format === 'RATING_5' ? starRatingToPercent(metric.value) : metric.value
  const tier = getRatingTier(percent)
  const tierMeta = RATING_TIER_META[tier]

  return (
    <div className="flex-1 rounded-2xl border border-gray-50 bg-white px-4 pt-4  flex flex-col justify-between h-full" style={{ height: 224, paddingBottom: 24 }}>
      <div className='flex items-center gap-2'>
        <p className="flex items-center text-body-s font-poppins font-medium text-heading">
          {metric.label}
        </p>

        <button type="button" aria-label={`About ${metric.label.toLowerCase()}`} className="text-info-500">
          <Image src='/icons/question-circle.svg' width={20} height={20} alt='question icon' />             
        </button>
      </div>

      <div className="flex items-center justify-between">
        <h1 style={{ fontSize: 64 }} className="flex items-center gap-2 font-raleway text-h1 leading-[72px] font-medium text-heading">
          {metric.value}
          {metric.format === 'RATING_5' ? (
            <Star className="h-6 w-6 fill-[#FFC400] text-[#FFC400]" strokeWidth={0} />
          ) : (
            '%'
          )}
        </h1>

        <p className={cn('font-poppins text-[20px]', tierMeta.textClassName)}>{metric.rating_label}</p>
      </div>

      <div className="">
        <TrendIndicator trend={metric} label={metric.trend_label} />
      </div>
    </div>
  )
}

export function ScoreMetricCards() {
  const { data: metrics, isLoading } = useScoreMetrics()

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
