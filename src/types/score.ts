import type { RatingTier } from '@/lib/score/format'
import type { TrendDirection } from './wallet'

export type ScoreOverview = {
  value: number
  max: number
  label: string
  tier: RatingTier
  description: string
  banner_image_url: string
}

export type ScoreMetricFormat = 'RATING_5' | 'PERCENT'

export type ScoreMetricKey = 'buyer_satisfaction' | 'order_reliability' | 'engagement_rating'

export type ScoreMetricTrend = {
  change_percent: number
  direction: TrendDirection
  label: string
}

export type ScoreMetric = {
  key: ScoreMetricKey
  label: string
  // null while there is nothing to measure yet (no reviews, no physical
  // orders, no views) — the card shows a dash instead of an invented number.
  value: number | null
  format: ScoreMetricFormat
  tier: RatingTier | null
  rating_label: string
  trend: ScoreMetricTrend | null
}

export type Score = {
  overview: ScoreOverview
  metrics: ScoreMetric[]
}

export type BuyerFeedbackSort = 'NEWEST' | 'OLDEST' | 'HIGHEST_RATING' | 'LOWEST_RATING'

export type BuyerFeedback = {
  id: string
  reviewer_name: string
  avatar_url: string | null
  comment: string
  rating: number
  created_at: string
}
