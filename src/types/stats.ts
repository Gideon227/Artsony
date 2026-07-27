import type { TrendDirection, WalletPeriod } from './wallet'

export type StatsMetricFormat = 'CURRENCY' | 'COUNT'

export type StatsMetric = {
  value: number
  format: StatsMetricFormat
  change_percent: number
  direction: TrendDirection
}

export type StatsSummary = {
  period: WalletPeriod
  total_earnings: StatsMetric
  total_sales: StatsMetric
  artwork_views: StatsMetric
  artwork_likes: StatsMetric
}

export type MiniStatPeriod = 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR'

export type MiniStatSeriesPoint = {
  label: string
  value: number
}

export type MiniStatCard = {
  date_range_label: string
  value: number
  format: StatsMetricFormat
  change_percent: number
  direction: TrendDirection
  trend_label: string
  series: MiniStatSeriesPoint[]
}

export type ArtworkRankSort = 'EARNINGS' | 'SALES' | 'VIEWS'

export type FeaturedArtwork = {
  id: string
  rank: number
  title: string
  image_url: string
  total_earnings: number
  total_sales: number
  change_percent: number
  direction: TrendDirection
}

export type EarningsOverviewRange = 'MONTHLY' | 'YEARLY'

export type EarningsOverviewPoint = {
  label: string
  value: number
}
