import type { TrendDirection } from './wallet'

export type ScoreOverview = {
  value: number
  max: number
  label: string
  description: string
  banner_image_url: string
}

export type ScoreMetricFormat = 'RATING_5' | 'PERCENT'

export type ScoreMetricKey = 'buyer_satisfaction' | 'order_reliability' | 'engagement_rating'

export type ScoreMetric = {
  key: ScoreMetricKey
  label: string
  value: number
  format: ScoreMetricFormat
  rating_label: string
  change_percent: number
  direction: TrendDirection
  trend_label: string
}

export type BuyerFeedbackSort = 'NEWEST' | 'OLDEST' | 'HIGHEST_RATING' | 'LOWEST_RATING'

export type BuyerFeedback = {
  id: string
  reviewer_name: string
  avatar_url: string
  comment: string
  rating: number
  created_at: string
}
