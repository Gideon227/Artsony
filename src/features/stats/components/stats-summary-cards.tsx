'use client'

import * as React from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { walletPeriodFromSearchParams } from '@/lib/wallet/url-filters'
import { useStatsSummary } from '@/hooks/queries/use-stats'
import { MetricCard, MetricCardGrid, MetricCardSkeleton } from '@/components/ui/metric-card'
import type { StatsSummary } from '@/types/stats'
import { StudioCardError } from '@/features/studio/components/studio-card-error'
import { STUDIO_HELP, type StudioHelp } from '@/lib/studio/help-copy'

type CardConfig = {
  key: keyof Omit<StatsSummary, 'period'>
  label: string
  icon: string
  iconBg: string
  valueClassName?: string
  help?: StudioHelp
}

const CARDS: CardConfig[] = [
  { key: 'total_earnings', label: 'Total Earnings', icon: '/wallet/money-wad-yellow.svg', iconBg: 'bg-primary-100', valueClassName: 'text-primary-500' },
  { key: 'total_sales', label: 'Total Sales', icon: '/icons/shopping-bag.svg', iconBg: 'bg-primary-100', help: STUDIO_HELP.totalSales },
  { key: 'artwork_views', label: 'Artwork Views', icon: '/icons/eye-red.svg', iconBg: 'bg-primary-100', help: STUDIO_HELP.artworkViews },
  { key: 'artwork_likes', label: 'Artwork Likes', icon: '/icons/heart-red.svg', iconBg: 'bg-primary-50' },
]

export function StatsSummaryCards() {
  const searchParams = useSearchParams()
  const period = React.useMemo(() => walletPeriodFromSearchParams(searchParams), [searchParams])
  const { data: summary, isLoading, isError, error, refetch, isRefetching } = useStatsSummary(period)

  if (isError && !summary) {
    return <StudioCardError error={error} onRetry={() => void refetch()} isRetrying={isRefetching} />
  }

  if (isLoading || !summary) {
    return (
      <MetricCardGrid>
        {CARDS.map((c) => (
          <MetricCardSkeleton key={c.key} />
        ))}
      </MetricCardGrid>
    )
  }

  return (
    <MetricCardGrid>
      {CARDS.map((card) => {
        const metric = summary[card.key]
        return (
          <MetricCard
            key={card.key}
            label={card.label}
            value={metric.value}
            format={metric.format === 'CURRENCY' ? 'currency' : 'count'}
            trend={metric}
            icon={<Image src={card.icon} width={20} height={20} alt="" aria-hidden="true" />}
            iconBg={card.iconBg}
            valueClassName={card.valueClassName}
            help={card.help}
          />
        )
      })}
    </MetricCardGrid>
  )
}
