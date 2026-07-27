const feedbackDateFmt = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
const feedbackTimeFmt = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

/** Design shows dd.mm.yyyy - hh:mm AM/PM (e.g. "15.08.2024 - 09:45 AM"). */
export function formatFeedbackTimestamp(isoDate: string): string {
  const date = new Date(isoDate)
  return `${feedbackDateFmt.format(date).replace(/\//g, '.')} - ${feedbackTimeFmt.format(date)}`
}

export type RatingTier = 'EXCELLENT' | 'AVERAGE' | 'POOR'

export const RATING_TIER_META: Record<RatingTier, { label: string; textClassName: string }> = {
  EXCELLENT: { label: 'Excellent', textClassName: 'text-successful-500' },
  AVERAGE: { label: 'Average', textClassName: 'text-warning-600' },
  POOR: { label: 'Poor', textClassName: 'text-error-600' },
}

/**
 * Buckets a 0-100 score into a rating tier. Thresholds are a reasonable
 * starting point (matches "72% -> Average" and "85% -> Excellent" from the
 * design) — tune once real distribution data is available.
 */
export function getRatingTier(percent: number): RatingTier {
  if (percent >= 85) return 'EXCELLENT'
  if (percent >= 60) return 'AVERAGE'
  return 'POOR'
}

export function starRatingToPercent(rating: number, maxStars = 5): number {
  return (rating / maxStars) * 100
}
