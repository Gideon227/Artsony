'use client'

import { ScoreHeroBanner } from './score-hero-banner'
import { ScoreMetricCards } from './score-metric-cards'
import { BuyerFeedbackList } from './buyer-feedback-list'
import { StudioMobileHeader } from '@/features/studio/components/studio-mobile-header'

export function ScorePageContent() {
  return (
    <div className="flex min-h-0 w-full flex-col lg:h-full max-lg:w-full max-lg:overflow-hidden max-lg:pb-80">
      <StudioMobileHeader title="Artsony Score" />

      <div className="flex flex-col gap-y-4 bg-white p-4 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:rounded-2xl lg:bg-[#F5FAFA]">
        <div className="flex shrink-0 flex-col gap-y-6 lg:gap-y-4">
          <ScoreHeroBanner />
          <ScoreMetricCards />
        </div>

        <div className="flex flex-col lg:min-h-[240px] lg:flex-1 lg:overflow-y-auto">
          <BuyerFeedbackList />
        </div>
      </div>
    </div>
  )
}
