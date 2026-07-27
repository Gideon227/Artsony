'use client'

import { ScoreHeroBanner } from './score-hero-banner'
import { ScoreMetricCards } from './score-metric-cards'
import { BuyerFeedbackList } from './buyer-feedback-list'

export function ScorePageContent() {
  return (
    <div className="flex flex-1 flex-col gap-y-4 rounded-2xl p-4 w-full" style={{ backgroundColor: '#F5FAFA' }}>
      <ScoreHeroBanner />
      <ScoreMetricCards />
      <BuyerFeedbackList />
    </div>
  )
}
