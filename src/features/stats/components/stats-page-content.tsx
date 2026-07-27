'use client'

import { StatsSummaryCards } from './stats-summary-cards'
import { MiniStatCard } from './mini-stat-card'
import { FeaturedArtworkCard } from './featured-artwork-card'
import { EarningsOverviewCard } from './earnings-overview-card'

export function StatsPageContent() {
  return (
    <div className="flex flex-1 flex-col gap-y-4 rounded-2xl p-4" style={{ backgroundColor: '#F5FAFA' }}>
      <StatsSummaryCards />

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
        <MiniStatCard metric="CR" label="CR" defaultPeriod="WEEK" />
        <MiniStatCard metric="AOV" label="AOV" defaultPeriod="MONTH" />
        <FeaturedArtworkCard />
      </div>

      <EarningsOverviewCard />
    </div>
  )
}
