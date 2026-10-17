'use client'

import * as React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useMediaQuery } from '@/hooks'
import { cn } from '@/lib/utils'
import { StudioLeftSidebar, type StudioSection } from './left-sidebar'
import { WalletPageContent } from '@/features/wallet/components/wallet-page-content'
import { StatsPageContent } from '@/features/stats/components/stats-page-content'
import { ScorePageContent } from '@/features/score/components/score-page-content'

const DESKTOP_QUERY = '(min-width: 1024px)'

function isStudioSection(value: string | null): value is StudioSection {
  return value === 'wallet' || value === 'stats' || value === 'score'
}

export default function StudioPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isDesktop = useMediaQuery(DESKTOP_QUERY)

  const sectionParam = searchParams.get('section')
  const hasSection = isStudioSection(sectionParam)
  const activeSection: StudioSection = isStudioSection(sectionParam) ? sectionParam : 'wallet'

  // Desktop shows the sidebar and a section side by side (no param = Wallet).
  // Below `lg` the menu and a section are separate screens, so a section must
  // be named in the URL to leave the menu — which also keeps Back working.
  // Section content is only mounted when visible, so the mobile menu screen
  // doesn't fetch wallet data it isn't showing.
  const showSection = hasSection || isDesktop

  const handleChangeSection = (section: StudioSection) => {
    // Each section owns its own query params (wallet period/filters/page), so a
    // section switch starts clean instead of leaking another section's state.
    const params = new URLSearchParams()
    if (section !== 'wallet' || !isDesktop) params.set('section', section)
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false })
  }

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col lg:grid lg:h-full lg:grid-cols-4 lg:gap-4">
      <div className={cn('min-h-0 lg:col-span-1', hasSection && 'max-lg:hidden')}>
        <StudioLeftSidebar activeSection={activeSection} onChangeSection={handleChangeSection} />
      </div>

      <div className={cn('min-h-0 lg:col-span-3', !hasSection && 'max-lg:hidden')}>
        {showSection && activeSection === 'wallet' && <WalletPageContent />}
        {showSection && activeSection === 'stats' && <StatsPageContent />}
        {showSection && activeSection === 'score' && <ScorePageContent />}
      </div>
    </div>
  )
}
