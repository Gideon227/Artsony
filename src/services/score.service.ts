import { apiClient } from '@/lib/api-client'
import type { BuyerFeedback, BuyerFeedbackSort, ScoreMetric, ScoreOverview } from '@/types/score'
import { getRatingTier, RATING_TIER_META } from '@/lib/score/format'

// Wired to the real backend. Endpoints:
//   GET /api/analytics/score    -> composite Artsony Score + sub-scores
//   GET /api/analytics/reviews  -> buyer reviews for this artist (reuses the
//                                   review module — see review.types.ts)

type BackendScoreComponent = { score: number }

type BackendArtsonyScoreBreakdown = {
  score: number
  buyer_satisfaction: BackendScoreComponent & { average_rating: number | null; review_count: number }
  engagement: BackendScoreComponent & { total_views: number; total_likes: number; engagement_rate: number }
  order_reliability: BackendScoreComponent & {
    delivered_items: number
    total_physical_items: number
  }
}

type BackendReview = {
  id: string
  buyer_name: string
  comment: string | null
  rating: number
  created_at: string
}

const TIER_DESCRIPTION: Record<ReturnType<typeof getRatingTier>, string> = {
  EXCELLENT:
    "You're performing exceptionally well — your artworks are selling, buyers are satisfied, and your delivery track record is strong. Keep it up to stay highly visible across Artsony.",
  AVERAGE:
    "You're doing solidly, with room to grow. Focus on buyer satisfaction and order reliability to move into the top tier of Artsony sellers.",
  POOR:
    'Your score needs attention. Review recent buyer feedback and delivery performance below — small, consistent improvements here go a long way.',
}

export const scoreService = {
  getOverview: async (): Promise<ScoreOverview> => {
    const { data } = await apiClient.get<{ success: true; data: BackendArtsonyScoreBreakdown }>(
      '/api/analytics/score',
    )

    const tier = getRatingTier(data.score)

    return {
      value: data.score,
      max: 100,
      label: RATING_TIER_META[tier].label,
      description: TIER_DESCRIPTION[tier],
      banner_image_url: '/images/chickens.png',
    }
  },

  getMetrics: async (): Promise<ScoreMetric[]> => {
    const { data } = await apiClient.get<{ success: true; data: BackendArtsonyScoreBreakdown }>(
      '/api/analytics/score',
    )

    // The backend's score breakdown is a point-in-time computation — it
    // doesn't carry a period-over-period trend the way analytics/overview
    // does, so change_percent/direction/trend_label are neutral defaults
    // rather than fabricated figures.
    const buyerSatisfactionTier = getRatingTier(data.buyer_satisfaction.score)
    const reliabilityTier = getRatingTier(data.order_reliability.score)
    const engagementTier = getRatingTier(data.engagement.score)

    return [
      {
        key: 'buyer_satisfaction',
        label: 'Buyer Satisfaction Rate',
        value: data.buyer_satisfaction.average_rating ?? 0,
        format: 'RATING_5',
        rating_label: RATING_TIER_META[buyerSatisfactionTier].label,
        change_percent: 0,
        direction: 'UP',
        trend_label: 'Current',
      },
      {
        key: 'order_reliability',
        label: 'Order Reliability',
        value: Math.round(data.order_reliability.score),
        format: 'PERCENT',
        rating_label: RATING_TIER_META[reliabilityTier].label,
        change_percent: 0,
        direction: 'UP',
        trend_label: 'Current',
      },
      {
        key: 'engagement_rating',
        label: 'Engagement Rating',
        value: Math.round(data.engagement.score),
        format: 'PERCENT',
        rating_label: RATING_TIER_META[engagementTier].label,
        change_percent: 0,
        direction: 'UP',
        trend_label: 'Current',
      },
    ]
  },

  getBuyerFeedback: async (
    sort: BuyerFeedbackSort = 'NEWEST',
    from?: Date | null,
    to?: Date | null,
  ): Promise<BuyerFeedback[]> => {
    const sortMap: Record<BuyerFeedbackSort, string> = {
      NEWEST: 'newest',
      OLDEST: 'oldest',
      HIGHEST_RATING: 'highest',
      LOWEST_RATING: 'lowest',
    }

    const params = new URLSearchParams({ sort: sortMap[sort], limit: '100' })
    const { data } = await apiClient.get<{ success: true; data: BackendReview[] }>(
      `/api/analytics/reviews?${params.toString()}`,
    )

    // date_from/date_to aren't supported by this endpoint — filtered
    // client-side on the fetched page, same as the previous mock. Correct
    // for the review volumes an early-stage marketplace will have; would
    // need a real backend date filter to stay correct past ~100 reviews.
    let items = data
    if (from || to) {
      items = items.filter((r) => {
        const created = new Date(r.created_at).getTime()
        if (from && created < from.getTime()) return false
        if (to) {
          const endOfDay = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999)
          if (created > endOfDay.getTime()) return false
        }
        return true
      })
    }

    return items.map((r) => ({
      id: r.id,
      reviewer_name: r.buyer_name,
      // Buyer avatars aren't joined into this endpoint's response.
      avatar_url: '/images/placeholder-art.jpg',
      comment: r.comment ?? '',
      rating: r.rating,
      created_at: r.created_at,
    }))
  },
}
