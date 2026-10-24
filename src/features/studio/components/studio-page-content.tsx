'use client'

import * as React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useMediaQuery } from '@/hooks'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { selectHasSellerAccount, selectIsHydrated, useAuthStore } from '@/store'
import { StudioLeftSidebar, type StudioSection } from './left-sidebar'
import { StudioGate, type StudioGateVariant } from './studio-gate'
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

  const isHydrated = useAuthStore(selectIsHydrated)
  const isSignedIn = useAuthStore((s) => s.user !== null)
  const hasSellerAccount = useAuthStore(selectHasSellerAccount)

  // null = allowed in (seller), or still loading the session
  const gate: StudioGateVariant | null = !isHydrated ? null : !isSignedIn ? 'guest' : !hasSellerAccount ? 'non-seller' : null
  const isGated = gate !== null

  const sectionParam = searchParams.get('section')
  const hasSection = isStudioSection(sectionParam)
  const activeSection: StudioSection = isStudioSection(sectionParam) ? sectionParam : 'wallet'

  const showSection = hasSection || isDesktop

  const handleChangeSection = (section: StudioSection) => {
    const params = new URLSearchParams()
    if (section !== 'wallet' || !isDesktop) params.set('section', section)
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false })
  }

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col lg:flex-row lg:h-full lg:w-full lg:gap-4">
      {/* On mobile the sidebar is the menu screen; hide it only while a real section is open */}
      <div className={cn('min-h-0 lg:w-1/4', hasSection && !isGated && 'max-lg:hidden')}>
        <StudioLeftSidebar activeSection={activeSection} onChangeSection={handleChangeSection} disabled={isGated} />
      </div>

      {/* The gate is always visible (it replaces the section list on mobile too) */}
      <div className={cn('min-h-0 flex-1 lg:w-3/4', !hasSection && !isGated && 'max-lg:hidden')}>
        {!isHydrated ? (
          <Skeleton className="h-[320px] rounded-2xl lg:h-full" />
        ) : gate ? (
          <div className="lg:h-full lg:p-0">
            <StudioGate variant={gate} />
          </div>
        ) : (
          <>
            {showSection && activeSection === 'wallet' && <WalletPageContent />}
            {showSection && activeSection === 'stats' && <StatsPageContent />}
            {showSection && activeSection === 'score' && <ScorePageContent />}
          </>
        )}
      </div>
    </div>
  )
}