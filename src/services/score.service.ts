import type { BuyerFeedback, BuyerFeedbackSort, ScoreMetric, ScoreOverview } from '@/types/score'

// TODO(backend): no /api/studio/score endpoint exists yet. Same convention
// as wallet.service.ts / stats.service.ts — simulated latency so this page
// is fully interactive today.
//
//   getOverview      -> GET /api/studio/score/overview
//   getMetrics       -> GET /api/studio/score/metrics
//   getBuyerFeedback -> GET /api/studio/score/feedback?sort=&from=&to=

const NETWORK_DELAY_MS = 500

function delay<T>(value: T, ms = NETWORK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

const REVIEWERS = [
  { name: 'Monica Reyes', comment: 'The colors in this piece are vibrant and truly brighten my living room. However, the frame arrived slightly damaged.', rating: 3.0 },
  { name: 'Jared Thompson', comment: 'Absolutely stunning artwork! It exceeded my expectations and has become a conversation starter among my guests.', rating: 5.0 },
  { name: 'Sophie Kim', comment: 'The art is beautiful but took longer than expected to arrive. Packaging was secure though, no damage.', rating: 4.0 },
  { name: "Liam O'Connor", comment: 'I was disappointed as the print quality was not as sharp as shown online.', rating: 2.0 },
  { name: 'Emily Zhang', comment: 'A breathtaking piece that adds elegance to my office. Worth every penny!', rating: 5.0 },
  { name: 'Noah Bennett', comment: 'Great communication from the artist and the piece was even better in person.', rating: 4.5 },
  { name: 'Ava Martinez', comment: 'Shipping took a while but the artist kept me updated throughout.', rating: 3.5 },
]

const DAY_MS = 24 * 60 * 60 * 1000

function seedFeedback(): BuyerFeedback[] {
  return REVIEWERS.map((r, i) => ({
    id: `fb_${i}`,
    reviewer_name: r.name,
    avatar_url: '/images/placeholder-art.jpg',
    comment: r.comment,
    rating: r.rating,
    created_at: new Date(Date.now() - (i + 1) * 18 * DAY_MS).toISOString(),
  }))
}

const feedbackStore = seedFeedback()

function sortFeedback(items: BuyerFeedback[], sort: BuyerFeedbackSort): BuyerFeedback[] {
  const sorted = [...items]
  switch (sort) {
    case 'OLDEST':
      return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    case 'HIGHEST_RATING':
      return sorted.sort((a, b) => b.rating - a.rating)
    case 'LOWEST_RATING':
      return sorted.sort((a, b) => a.rating - b.rating)
    case 'NEWEST':
    default:
      return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }
}

export const scoreService = {
  getOverview: (): Promise<ScoreOverview> =>
    delay({
      value: 9.2,
      max: 10,
      label: 'Excellent',
      description:
        "You're performing exceptionally well — your artworks are selling, customers are satisfied, and your delivery performance is top-tier. Maintaining this level keeps your visibility high across Artsony and builds strong trust with new buyers. Keep doing what you're doing — this is the sweet spot for top creators.",
      banner_image_url: '/images/chickens.png',
    }),

  getMetrics: (): Promise<ScoreMetric[]> =>
    delay([
      {
        key: 'buyer_satisfaction',
        label: 'Buyer Satisfaction Rate',
        value: 4.5,
        format: 'RATING_5',
        rating_label: 'Excellent',
        change_percent: 5,
        direction: 'UP',
        trend_label: 'This Month',
      },
      {
        key: 'order_reliability',
        label: 'Order Reliability',
        value: 72,
        format: 'PERCENT',
        rating_label: 'Average',
        change_percent: 5,
        direction: 'UP',
        trend_label: 'This Month',
      },
      {
        key: 'engagement_rating',
        label: 'Engagement Rating',
        value: 85,
        format: 'PERCENT',
        rating_label: 'Excellent',
        change_percent: 5,
        direction: 'UP',
        trend_label: 'This Month',
      },
    ]),

  getBuyerFeedback: (sort: BuyerFeedbackSort = 'NEWEST', from?: Date | null, to?: Date | null): Promise<BuyerFeedback[]> => {
    let items = feedbackStore
    if (from || to) {
      items = items.filter((f) => {
        const created = new Date(f.created_at).getTime()
        if (from && created < from.getTime()) return false
        if (to) {
          const endOfDay = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999)
          if (created > endOfDay.getTime()) return false
        }
        return true
      })
    }
    return delay(sortFeedback(items, sort))
  },
}
