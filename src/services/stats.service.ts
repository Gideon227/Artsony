import { apiClient } from '@/lib/api-client'
import type {
  ArtworkRankSort,
  EarningsOverviewPoint,
  EarningsOverviewRange,
  FeaturedArtwork,
  MiniStatCard,
  MiniStatPeriod,
  StatsSummary,
} from '@/types/stats'
import { WalletPeriod } from '@/types/wallet'

// Wired to the real backend. Endpoints:
//   GET /api/analytics/overview?period=          -> summary cards
//   GET /api/analytics/earnings/daily?year=       -> mini-stat sparklines + earnings overview chart
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
  views: number
  likes: number
}

function toDirection(direction: 'up' | 'down' | 'flat'): 'UP' | 'DOWN' {
  return direction === 'down' ? 'DOWN' : 'UP'
}

const PERIOD_MAP: Record<WalletPeriod, string> = {
  TODAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
  ALL_TIME: 'year', // backend has no "all time" window — see wallet.service.ts
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const statsService = {
  getSummary: async (period: WalletPeriod = 'WEEK'): Promise<StatsSummary> => {
    const { data } = await apiClient.get<{ success: true; data: BackendAnalyticsOverview }>(
      `/api/analytics/overview?period=${PERIOD_MAP[period]}`,
    )

    return {
      period,
      total_earnings: {
        value: data.total_earnings.current,
        format: 'CURRENCY',
        change_percent: data.total_earnings.change_percent,
        direction: toDirection(data.total_earnings.direction),
      },
      total_sales: {
        value: data.total_sales.current,
        format: 'COUNT',
        change_percent: data.total_sales.change_percent,
        direction: toDirection(data.total_sales.direction),
      },
      artwork_views: {
        value: data.total_views.current,
        format: 'COUNT',
        change_percent: data.total_views.change_percent,
        direction: toDirection(data.total_views.direction),
      },
      artwork_likes: {
        value: data.total_likes.current,
        format: 'COUNT',
        change_percent: data.total_likes.change_percent,
        direction: toDirection(data.total_likes.direction),
      },
    }
  },

  // CR (conversion rate) and AOV (average order value) have no dedicated
  // backend endpoint — both are legitimately derivable from the same
  // overview numbers used above (CR = sales/views, AOV = earnings/sales),
  // so they're computed here rather than needing a new backend metric.
  // The sparkline series is the one honest approximation: the backend
  // doesn't track daily views (so a true daily CR series isn't possible),
  // so both cards' series use daily sales_count from
  // GET /api/analytics/earnings/daily as an activity-shape proxy rather
  // than fabricating per-day CR/AOV numbers.
  getMiniStat: async (metric: 'CR' | 'AOV', period: MiniStatPeriod): Promise<MiniStatCard> => {
    const walletPeriod: WalletPeriod = period
    const [overviewRes, dailyRes] = await Promise.all([
      apiClient.get<{ success: true; data: BackendAnalyticsOverview }>(
        `/api/analytics/overview?period=${PERIOD_MAP[walletPeriod]}`,
      ),
      apiClient.get<{ success: true; data: BackendDailyEarningsPoint[] }>(
        `/api/analytics/earnings/daily?year=${new Date().getFullYear()}`,
      ),
    ])

    const { total_sales, total_views, total_earnings } = overviewRes.data
    const value =
      metric === 'CR'
        ? total_views.current > 0 ? (total_sales.current / total_views.current) * 100 : 0
        : total_sales.current > 0 ? total_earnings.current / total_sales.current : 0

    const trend = metric === 'CR' ? total_sales : total_earnings

    const last7 = dailyRes.data.slice(-7)
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

    return {
      date_range_label: new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date()),
      value: Math.round(value * 100) / 100,
      format: metric === 'CR' ? 'COUNT' : 'CURRENCY',
      change_percent: trend.change_percent,
      direction: toDirection(trend.direction),
      trend_label:
        period === 'TODAY' ? 'Today' : period === 'WEEK' ? 'This Week' : period === 'MONTH' ? 'This Month' : 'This Year',
      series: last7.map((point, i) => ({
        label: dayLabels[i] ?? point.day,
        value: point.sales_count,
      })),
    }
  },

  getFeaturedArtworks: async (sort: ArtworkRankSort = 'EARNINGS'): Promise<FeaturedArtwork[]> => {
    // VIEWS has no direct backend metric — 'engagement' (views + likes
    // combined) is the closest available sort.
    const metric = sort === 'EARNINGS' ? 'earnings' : sort === 'SALES' ? 'sales' : 'engagement'

    const { data } = await apiClient.get<{ success: true; data: BackendTopArtwork[] }>(
      `/api/analytics/top-artworks?period=month&metric=${metric}&limit=10`,
    )

    return data.map((item, i) => {
      const primary = metric === 'earnings' ? item.earnings : metric === 'sales' ? item.sales : item.engagement
      return {
        id: item.artwork_id,
        rank: i + 1,
        title: item.artwork_title,
        image_url: item.thumbnail_url ?? '/images/placeholder-art.jpg',
        total_earnings: item.earnings.current,
        total_sales: item.sales.current,
        change_percent: primary.change_percent,
        direction: toDirection(primary.direction),
      }
    })
  },

  getEarningsOverview: async (range: EarningsOverviewRange = 'YEARLY'): Promise<EarningsOverviewPoint[]> => {
    const year = new Date().getFullYear()
    const { data } = await apiClient.get<{ success: true; data: BackendDailyEarningsPoint[] }>(
      `/api/analytics/earnings/daily?year=${year}`,
    )

    if (range === 'MONTHLY') {
      const currentMonth = new Date().getMonth()
      return data
        .filter((p) => new Date(p.day).getMonth() === currentMonth)
        .map((p) => ({ label: String(new Date(p.day).getDate()), value: p.amount }))
    }

    // YEARLY: aggregate the year's daily points into 12 monthly totals.
    const totals = new Array(12).fill(0) as number[]
    for (const point of data) {
      const monthIndex = new Date(point.day).getMonth()
      totals[monthIndex] = (totals[monthIndex] ?? 0) + point.amount
    }
    return MONTH_LABELS.map((label, i) => ({ label, value: Math.round((totals[i] ?? 0) * 100) / 100 }))
  },
}
