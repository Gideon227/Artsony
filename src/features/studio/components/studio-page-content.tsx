'use client'

import * as React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { StudioLeftSidebar, type StudioSection } from './left-sidebar'
import { WalletPageContent } from '@/features/wallet/components/wallet-page-content'
import { StatsPageContent } from '@/features/stats/components/stats-page-content'
import { ScorePageContent } from '@/features/score/components/score-page-content'

function isStudioSection(value: string | null): value is StudioSection {
  return value === 'wallet' || value === 'stats' || value === 'score'
}

function ComingSoonPanel({ title }: { title: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-gray-50 bg-white py-24 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-500">
        <Sparkles className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <p className="font-poppins text-body-m font-semibold text-heading">{title} is on its way</p>
      <p className="max-w-sm text-body-s text-body">This section is being designed and will land here soon.</p>
    </div>
  )
}

export default function StudioPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const sectionParam = searchParams.get('section')
  const activeSection: StudioSection = isStudioSection(sectionParam) ? sectionParam : 'wallet'

  const handleChangeSection = (section: StudioSection) => {
    const params = new URLSearchParams(searchParams.toString())
    if (section === 'wallet') {
      params.delete('section')
    } else {
      params.set('section', section)
    }
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false })
  }

  return (
    <div className='grid grid-cols-4 gap-4 flex-1'>
      <div className='col-span-1'>
        <StudioLeftSidebar activeSection={activeSection} onChangeSection={handleChangeSection} />
      </div>

      <div style={{ gridColumn: 'span 3 / span 3' }} className='col-span-3'>
        {activeSection === 'wallet' && <WalletPageContent />}
        {activeSection === 'stats' && <StatsPageContent />}
        {activeSection === 'score' && <ScorePageContent />}
      </div>
    </div>
  )
}
