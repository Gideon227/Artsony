'use client'

import { StatsSummaryCards } from './stats-summary-cards'
import { MiniStatCard } from './mini-stat-card'
import { FeaturedArtworkCard } from './featured-artwork-card'
import { EarningsOverviewCard } from './earnings-overview-card'

export function StatsPageContent() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-y-4 overflow-y-auto rounded-2xl p-4" style={{ backgroundColor: '#F5FAFA' }}>
      <div className="shrink-0">
        <StatsSummaryCards />
      </div>

      <div className="flex min-h-[240px] flex-1 flex-col gap-y-4 overflow-y-auto">
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
          <MiniStatCard metric="CR" label="CR" defaultPeriod="WEEK" />
          <MiniStatCard metric="AOV" label="AOV" defaultPeriod="MONTH" />
          <FeaturedArtworkCard />
        </div>

        <EarningsOverviewCard />
      </div>
    </div>
  )
}
