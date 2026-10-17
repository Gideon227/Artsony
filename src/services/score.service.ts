import { apiClient } from '@/lib/api-client'
import type { BuyerFeedback, BuyerFeedbackSort, Score, ScoreMetricTrend } from '@/types/score'
import { getRatingTier, RATING_TIER_META, type RatingTier } from '@/lib/score/format'
import type { TrendDirection } from '@/types/wallet'

// Wired to the real backend. Endpoints:
//   GET /api/analytics/score    -> composite Artsony Score + sub-scores + trends
//   GET /api/analytics/reviews  -> buyer reviews for this artist (reuses the
//                                  review module — see review.types.ts)

type BackendTrend = { change_percent: number; direction: 'up' | 'down' | 'flat' } | null

type BackendArtsonyScoreBreakdown = {
  score: number
  buyer_satisfaction: {
    score: number
    average_rating: number | null
    review_count: number
    trend: BackendTrend
  }
  engagement: {
    score: number
    total_views: number
    total_likes: number
    engagement_rate: number
    trend: BackendTrend
  }
  order_reliability: {
    score: number
    delivered_items: number
    total_physical_items: number
  }
}

type BackendReview = {
  id: string
  buyer_name: string
  buyer_avatar_url: string | null
  comment: string | null
  rating: number
  created_at: string
}

const TIER_DESCRIPTION: Record<RatingTier, string> = {
  EXCELLENT:
    'You’re performing exceptionally well — your artworks are selling, customers are satisfied, and your delivery performance is top-tier. Maintaining this level keeps your visibility high across Artsony and builds strong trust with new buyers. Keep doing what you’re doing — this is the sweet spot for top creators.',
  AVERAGE:
    "You're doing solidly, with room to grow. Focus on buyer satisfaction and order reliability to move into the top tier of Artsony sellers.",
  POOR:
    'Your score needs attention. Review recent buyer feedback and delivery performance below — small, consistent improvements here go a long way.',
}

const DIRECTION_MAP: Record<'up' | 'down' | 'flat', TrendDirection> = { up: 'UP', down: 'DOWN', flat: 'FLAT' }

const BANNER_IMAGE = '/images/chickens.png'

function toTrend(trend: BackendTrend, label: string): ScoreMetricTrend | null {
  if (!trend) return null
  return { change_percent: trend.change_percent, direction: DIRECTION_MAP[trend.direction], label }
}

const round1 = (value: number): number => Math.round(value * 10) / 10

// The backend scores 0–100; the Artsony Score is presented on a 10-point scale.
const DISPLAY_MAX = 10

// The tier (label and colour) always comes from the backend's 0–100 sub-score,
// the same number the composite is built from, so a card can never show one
// tier's label in another tier's colour.
function toMetricStatus(
  score: number,
  hasData: boolean,
  emptyLabel: string,
): { tier: RatingTier | null; rating_label: string } {
  if (!hasData) return { tier: null, rating_label: emptyLabel }
  const tier = getRatingTier(score)
  return { tier, rating_label: RATING_TIER_META[tier].label }
}

export function mapScore(data: BackendArtsonyScoreBreakdown): Score {
  const tier = getRatingTier(data.score)

  const hasReviews = data.buyer_satisfaction.review_count > 0 && data.buyer_satisfaction.average_rating !== null
  const hasPhysicalOrders = data.order_reliability.total_physical_items > 0
  const hasViews = data.engagement.total_views > 0

  return {
    overview: {
      value: round1((data.score / 100) * DISPLAY_MAX),
      max: DISPLAY_MAX,
      label: RATING_TIER_META[tier].label,
      tier,
      description: TIER_DESCRIPTION[tier],
      banner_image_url: BANNER_IMAGE,
    },
    metrics: [
      {
        key: 'buyer_satisfaction',
        label: 'Buyer Satisfaction Rate',
        value: hasReviews ? round1(data.buyer_satisfaction.average_rating ?? 0) : null,
        format: 'RATING_5',
        ...toMetricStatus(data.buyer_satisfaction.score, hasReviews, 'No reviews yet'),
        trend: toTrend(data.buyer_satisfaction.trend, 'vs previous 30 days'),
      },
      {
        key: 'order_reliability',
        label: 'Order Reliability',
        value: hasPhysicalOrders ? Math.round(data.order_reliability.score) : null,
        format: 'PERCENT',
        ...toMetricStatus(data.order_reliability.score, hasPhysicalOrders, 'No orders yet'),
        trend: null,
      },
      {
        key: 'engagement_rating',
        label: 'Engagement Rating',
        value: hasViews ? Math.round(data.engagement.score) : null,
        format: 'PERCENT',
        ...toMetricStatus(data.engagement.score, hasViews, 'No views yet'),
        trend: toTrend(data.engagement.trend, 'vs previous 90 days'),
      },
    ],
  }
}

const SORT_MAP: Record<BuyerFeedbackSort, string> = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  HIGHEST_RATING: 'highest',
  LOWEST_RATING: 'lowest',
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
}

function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
}

export function buildFeedbackQuery(sort: BuyerFeedbackSort, from?: Date | null, to?: Date | null): string {
  const params = new URLSearchParams({ sort: SORT_MAP[sort], limit: '100' })
  if (from) params.set('date_from', startOfDay(from).toISOString())
  if (to) params.set('date_to', endOfDay(to).toISOString())
  return params.toString()
}

export const scoreService = {
  getScore: async (): Promise<Score> => {
    const { data } = await apiClient.get<{ success: true; data: BackendArtsonyScoreBreakdown }>(
      '/api/analytics/score',
    )
    return mapScore(data)
  },

  getBuyerFeedback: async (
    sort: BuyerFeedbackSort = 'NEWEST',
    from?: Date | null,
    to?: Date | null,
  ): Promise<BuyerFeedback[]> => {
    const { data } = await apiClient.get<{ success: true; data: BackendReview[] }>(
      `/api/analytics/reviews?${buildFeedbackQuery(sort, from, to)}`,
    )

    return data.map((r) => ({
      id: r.id,
      reviewer_name: r.buyer_name,
      avatar_url: r.buyer_avatar_url,
      comment: r.comment ?? '',
      rating: r.rating,
      created_at: r.created_at,
    }))
  },
}
