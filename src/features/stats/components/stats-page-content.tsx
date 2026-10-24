'use client'

import { StatsSummaryCards } from './stats-summary-cards'
import { MiniStatCard } from './mini-stat-card'
import { FeaturedArtworkCard } from './featured-artwork-card'
import { EarningsOverviewCard } from './earnings-overview-card'
import { StudioMobileHeader } from '@/features/studio/components/studio-mobile-header'

// Desktop: summary cards, then CR / AOV / featured artworks, then earnings.
// Mobile: CR and AOV lead, then the summary cards. `contents` flattens the
// wrappers into one column so `order` can interleave them without changing
// the desktop DOM or its scroll regions.
export function StatsPageContent() {
  return (
    <div className="flex min-h-0 flex-col lg:h-full max-lg:w-full max-lg:overflow-hidden max-lg:pb-26">
      <StudioMobileHeader title="Stats & Sight" />

      <div className="flex flex-col gap-y-4 bg-white p-4 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:rounded-2xl lg:bg-[#F5FAFA]">
        <div className="order-2 shrink-0 lg:order-none">
          <StatsSummaryCards />
        </div>

        <div className="contents lg:flex lg:min-h-[240px] lg:flex-1 lg:flex-col lg:gap-y-4 lg:overflow-y-auto">
          <div className="contents lg:grid lg:grid-cols-3 lg:items-start lg:gap-4">
            <div className="order-1 lg:order-none">
              <MiniStatCard metric="CR" label="CR" defaultPeriod="WEEK" />
            </div>
            <div className="order-1 lg:order-none">
              <MiniStatCard metric="AOV" label="AOV" defaultPeriod="MONTH" />
            </div>
            <div className="order-3 lg:order-none">
              <FeaturedArtworkCard />
            </div>
          </div>

          <div className="order-4 lg:order-none">
            <EarningsOverviewCard />
          </div>
        </div>
      </div>
    </div>
  )
}
