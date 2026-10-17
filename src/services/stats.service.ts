import { apiClient } from '@/lib/api-client'
import {
  buildMiniSeries,
  changeBetween,
  dateRangeLabel,
  metricValue,
  monthlyEarningsPoints,
  ratioOf,
  seriesRange,
  utcToday,
  yearlyEarningsPoints,
  type DailySeriesPoint,
  type MiniStatMetric,
} from '@/lib/studio/series'
import type {
  ArtworkRankSort,
  EarningsOverviewPoint,
  EarningsOverviewRange,
  FeaturedArtwork,
  MiniStatCard,
  MiniStatPeriod,
  StatsMetric,
  StatsSummary,
} from '@/types/stats'
import type { TrendDirection, WalletPeriod } from '@/types/wallet'

// Wired to the real backend. Endpoints:
//   GET /api/analytics/overview?period=             -> summary cards, CR/AOV headline + trend
//   GET /api/analytics/daily-series?from=&to=       -> CR/AOV mini bar charts (per-day sales, earnings, views)
//   GET /api/analytics/earnings/daily?year=         -> earnings overview chart
//   GET /api/analytics/top-artworks?period=&metric= -> featured artworks

type BackendMetricTrend = {
  current: number
  previous: number
  change_percent: number
  direction: 'up' | 'down' | 'flat'
}

type BackendAnalyticsOverview = {
  total_earnings: BackendMetricTrend
  total_sales: BackendMetricTrend
  total_views: BackendMetricTrend
  total_likes: BackendMetricTrend
}

type BackendDailyEarningsPoint = { day: string; amount: number; sales_count: number }

type BackendTopArtwork = {
  artwork_id: string
  artwork_title: string
  thumbnail_url: string | null
  earnings: BackendMetricTrend
  sales: BackendMetricTrend
  engagement: BackendMetricTrend
  views_trend: BackendMetricTrend
  views: number
  likes: number
}

const DIRECTION_MAP: Record<BackendMetricTrend['direction'], TrendDirection> = {
  up: 'UP',
  down: 'DOWN',
  flat: 'FLAT',
}

const PERIOD_MAP: Record<WalletPeriod, string> = {
  TODAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
  ALL_TIME: 'all',
}

const TREND_LABEL: Record<MiniStatPeriod, string> = {
  TODAY: 'Today',
  WEEK: 'This Week',
  MONTH: 'This Month',
  YEAR: 'This Year',
}

const PLACEHOLDER_IMAGE = '/images/placeholder-art.jpg'

function toStatsMetric(trend: BackendMetricTrend, format: StatsMetric['format']): StatsMetric {
  return {
    value: trend.current,
    format,
    change_percent: trend.change_percent,
    direction: DIRECTION_MAP[trend.direction],
  }
}

export const statsService = {
  getSummary: async (period: WalletPeriod = 'WEEK'): Promise<StatsSummary> => {
    const { data } = await apiClient.get<{ success: true; data: BackendAnalyticsOverview }>(
      `/api/analytics/overview?period=${PERIOD_MAP[period]}`,
    )

    return {
      period,
      total_earnings: toStatsMetric(data.total_earnings, 'CURRENCY'),
      total_sales: toStatsMetric(data.total_sales, 'COUNT'),
      artwork_views: toStatsMetric(data.total_views, 'COUNT'),
      artwork_likes: toStatsMetric(data.total_likes, 'COUNT'),
    }
  },

  // CR (sales ÷ views) and AOV (earnings ÷ sales) are derived from the same
  // overview windows as every other figure, so they always agree with the
  // summary cards. Their trend compares the ratio itself against the previous
  // window's ratio. The bars come from real per-day sales, earnings and views.
  getMiniStat: async (metric: MiniStatMetric, period: MiniStatPeriod): Promise<MiniStatCard> => {
    const today = utcToday()
    const { from, to } = seriesRange(period, today)

    const [overviewRes, seriesRes] = await Promise.all([
      apiClient.get<{ success: true; data: BackendAnalyticsOverview }>(
        `/api/analytics/overview?period=${PERIOD_MAP[period]}`,
      ),
      apiClient.get<{ success: true; data: DailySeriesPoint[] }>(
        `/api/analytics/daily-series?from=${from}&to=${to}`,
      ),
    ])

    const { total_sales, total_views, total_earnings } = overviewRes.data

    const current = metricValue(metric, {
      amount: total_earnings.current,
      sales: total_sales.current,
      views: total_views.current,
    })
    const previous =
      metric === 'CR'
        ? ratioOf(total_sales.previous, total_views.previous, 100)
        : ratioOf(total_earnings.previous, total_sales.previous)

    const { change_percent, direction } = changeBetween(current, previous)

    return {
      date_range_label: dateRangeLabel(period, today),
      value: current,
      format: metric === 'CR' ? 'COUNT' : 'CURRENCY',
      change_percent,
      direction,
      trend_label: TREND_LABEL[period],
      series: buildMiniSeries(seriesRes.data, metric, period),
    }
  },

  getFeaturedArtworks: async (sort: ArtworkRankSort = 'EARNINGS'): Promise<FeaturedArtwork[]> => {
    const metric = sort === 'EARNINGS' ? 'earnings' : sort === 'SALES' ? 'sales' : 'views'

    const { data } = await apiClient.get<{ success: true; data: BackendTopArtwork[] }>(
      `/api/analytics/top-artworks?period=month&metric=${metric}&limit=10`,
    )

    return data.map((item, i) => {
      const primary = metric === 'earnings' ? item.earnings : metric === 'sales' ? item.sales : item.views_trend
      return {
        id: item.artwork_id,
        rank: i + 1,
        title: item.artwork_title,
        image_url: item.thumbnail_url ?? PLACEHOLDER_IMAGE,
        total_earnings: item.earnings.current,
        total_sales: item.sales.current,
        total_views: item.views,
        change_percent: primary.change_percent,
        direction: DIRECTION_MAP[primary.direction],
      }
    })
  },

  getEarningsOverview: async (range: EarningsOverviewRange = 'YEARLY'): Promise<EarningsOverviewPoint[]> => {
    const today = utcToday()
    const { data } = await apiClient.get<{ success: true; data: BackendDailyEarningsPoint[] }>(
      `/api/analytics/earnings/daily?year=${today.slice(0, 4)}`,
    )

    return range === 'MONTHLY' ? monthlyEarningsPoints(data, today) : yearlyEarningsPoints(data, today)
  },
}
