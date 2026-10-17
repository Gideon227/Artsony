export type StudioHelp = { title: string; content: string }

// Copy for the "?" dialogs, taken verbatim from the mobile Figma.
export const STUDIO_HELP = {
  availableBalance: {
    title: 'Available Balance',
    content: 'Funds that are available for you to withdraw or use immediately from your Artsony Wallet.',
  },
  pendingBalance: {
    title: 'Pending Balance',
    content:
      'Funds from recent transactions that are still being processed or awaiting clearance before they become available for withdrawal.',
  },
  averageOrderValue: {
    title: 'Average Order Value',
    content: 'The average amount spent per order during the selected period.',
  },
  conversionRate: {
    title: 'Conversion Rate',
    content:
      'The percentage of artwork views that resulted in a purchase. It shows how effectively your listings turn interest into sales.',
  },
  artworkViews: {
    title: 'Artwork Views',
    content: 'The total number of times your artwork listings have been viewed during the selected period.',
  },
  totalSales: {
    title: 'Total Sales',
    content: 'The total number of artworks sold through your Artsony shop during the selected period.',
  },
  engagementRating: {
    title: 'Engagement Rating',
    content:
      'Measures how buyers and the Artsony community interact with your artwork, including views, likes, comments, and other meaningful engagement.',
  },
  orderReliability: {
    title: 'Order Reliability',
    content:
      'Measures how consistently you fulfill orders as expected, including timely processing, accurate fulfillment, and successful delivery.',
  },
  buyerSatisfaction: {
    title: 'Buyer Satisfaction Rate',
    content:
      'Measures how satisfied buyers are with their purchases, based on ratings and feedback received after completed orders.',
  },
} satisfies Record<string, StudioHelp>

export const ARTSONY_SCORE_HELP = {
  title: 'Artsony Score',
  intro:
    'Your Artsony Score is a 10-point measure of your overall performance on Artsony, based on factors such as buyer satisfaction, order reliability, and artwork engagement. A higher score reflects stronger performance and buyer trust.',
  guideLead: 'Learn more about your Artsony Score at',
  guideLabel: 'Creator Guide',
} as const

// Same destination the footer already uses for "Creator Guidelines".
export const CREATOR_GUIDE_HREF = '/creator-guideline'

// Metric key (score cards) → help copy.
export const SCORE_METRIC_HELP = {
  buyer_satisfaction: STUDIO_HELP.buyerSatisfaction,
  order_reliability: STUDIO_HELP.orderReliability,
  engagement_rating: STUDIO_HELP.engagementRating,
} as const
