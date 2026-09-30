'use client'

import { ScoreHeroBanner } from './score-hero-banner'
import { ScoreMetricCards } from './score-metric-cards'
import { BuyerFeedbackList } from './buyer-feedback-list'

export function ScorePageContent() {
  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-y-4 overflow-y-auto rounded-2xl p-4" style={{ backgroundColor: '#F5FAFA' }}>
      <div className="flex shrink-0 flex-col gap-y-4">
        <ScoreHeroBanner />
        <ScoreMetricCards />
      </div>

      <div className="flex min-h-[240px] flex-1 flex-col overflow-y-auto">
        <BuyerFeedbackList />
      </div>
    </div>
  )
}
