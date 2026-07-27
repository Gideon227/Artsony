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
// TODO(backend): no /api/studio/stats endpoint exists yet. Mirrors
// services/wallet.service.ts's approach — simulated latency so the Stats &
// Sight cards are fully interactive today. Replace with a real apiClient
// call (GET /api/studio/stats?period=) once the backend lands; the return
// shape below is the proposed contract.
//
//   getSummary          -> GET /api/studio/stats/summary?period=
//   getMiniStat         -> GET /api/studio/stats/mini?metric=cr|aov&period=
//   getFeaturedArtworks -> GET /api/studio/stats/top-artworks?sort=
//   getEarningsOverview -> GET /api/studio/stats/earnings-overview?range=

const NETWORK_DELAY_MS = 500

function delay<T>(value: T, ms = NETWORK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

const DATE_RANGE_LABEL: Record<MiniStatPeriod, string> = {
  TODAY: 'Thu November 7',
  WEEK: 'November 3-9',
  MONTH: 'November 2025',
  YEAR: '2025',
}

const TREND_LABEL: Record<MiniStatPeriod, string> = {
  TODAY: 'Today',
  WEEK: 'This Week',
  MONTH: 'This Month',
  YEAR: 'This Year',
}

function buildWeekSeries(seed: number): MiniStatCard['series'] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days.map((label, i) => ({
    label,
    value: Math.round(20 + ((seed + i * 37) % 60)),
  }))
}

export const statsService = {
  getSummary: (_period: WalletPeriod = 'WEEK'): Promise<StatsSummary> =>
    delay({
      period: _period,
      total_earnings: { value: 155240.05, format: 'CURRENCY', change_percent: 5, direction: 'UP' },
      total_sales: { value: 342, format: 'COUNT', change_percent: 8, direction: 'UP' },
      artwork_views: { value: 18420, format: 'COUNT', change_percent: 3, direction: 'DOWN' },
      artwork_likes: { value: 2765, format: 'COUNT', change_percent: 11, direction: 'UP' },
    }),

  getMiniStat: (metric: 'CR' | 'AOV', period: MiniStatPeriod): Promise<MiniStatCard> =>
    delay({
      date_range_label: DATE_RANGE_LABEL[period],
      value: metric === 'CR' ? 40 : 30.5,
      format: metric === 'CR' ? 'COUNT' : 'CURRENCY',
      change_percent: 5,
      direction: 'UP',
      trend_label: TREND_LABEL[period],
      series: buildWeekSeries(metric === 'CR' ? 11 : 23),
    }),

  getFeaturedArtworks: (_sort: ArtworkRankSort = 'EARNINGS'): Promise<FeaturedArtwork[]> =>
    delay([
      {
        id: 'art_1',
        rank: 1,
        title: 'Placeholder',
        image_url: '/images/placeholder-art.jpg',
        total_earnings: 8533.2,
        total_sales: 45,
        change_percent: 5,
        direction: 'UP',
      },
      {
        id: 'art_2',
        rank: 2,
        title: 'Placeholder',
        image_url: '/images/placeholder-art.jpg',
        total_earnings: 6210.5,
        total_sales: 31,
        change_percent: 2,
        direction: 'DOWN',
      },
      {
        id: 'art_3',
        rank: 3,
        title: 'Placeholder',
        image_url: '/images/placeholder-art.jpg',
        total_earnings: 4980,
        total_sales: 27,
        change_percent: 9,
        direction: 'UP',
      },
    ]),

  getEarningsOverview: (_range: EarningsOverviewRange = 'YEARLY'): Promise<EarningsOverviewPoint[]> =>
    delay(
      ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((label, i) => ({
        label,
        value: Math.round(1500 + Math.sin(i * 1.3) * 1800 + ((i * 733) % 900) + 2200),
      }))
    ),
}
