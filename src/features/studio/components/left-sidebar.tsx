'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export type StudioSection = 'wallet' | 'stats' | 'score'

type NavItem = {
  id: StudioSection
  label: string
  icon: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'wallet', label: 'Wallet', icon: '/icons/wallet.svg' },
  { id: 'stats', label: 'Stats & Sight', icon: '/icons/chart.svg' },
  { id: 'score', label: 'Artsony Score', icon: '/icons/medal-star.svg' },
]

export type StudioLeftSidebarProps = {
  activeSection: StudioSection
  onChangeSection: (section: StudioSection) => void
  className?: string
  backHref?: string
}

export function StudioLeftSidebar({ activeSection, onChangeSection, className, backHref = '/home' }: StudioLeftSidebarProps) {
  return (
    <nav
      aria-label="Artsony Studio"
      className={cn('pt-8 pb-4 px-4 rounded-2xl flex flex-col gap-y-8 border border-gray-50', className)}    
    >
      <div className="flex items-center gap-x-4">
        <Link
          href={backHref}
          aria-label="Back"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-50 transition-colors hover:bg-neutral-50"
        >
          <ArrowLeft size={16} />
        </Link>
        <h2 className="font-raleway text-h6 font-semibold leading-8 text-body">Artsony Studio</h2>
      </div>

      <ul className="flex flex-col gap-y-4 border-t border-gray-50 pt-4">
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === activeSection
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onChangeSection(item.id)}
                aria-current={isActive ? 'page' : undefined}
                style={{ borderRadius: 16 }}
                className={cn(
                  'flex w-full items-center cursor-pointer gap-4 rounded-m px-4 py-6 text-left font-poppins text-body-s transition-colors',
                  isActive
                    ? 'border border-gray-50 bg-primary-50 text-primary-500 ring-2 ring-offset-2 ring-primary-500'
                    : 'text-body hover:bg-neutral-50'
                )}
              >
                <Image src={item.icon} width={24} height={24} alt="" aria-hidden="true" />
                <span className="flex-1 truncate">{item.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
