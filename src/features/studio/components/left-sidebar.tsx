'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/store'
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

function ProfileSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-x-4 px-4 pt-6 lg:hidden" aria-hidden="true">
      <div className="h-24 w-24 shrink-0 rounded-full bg-gray-50" />
      <div className="flex flex-1 flex-col gap-y-2">
        <div className="h-5 w-32 rounded bg-gray-50" />
        <div className="h-4 w-24 rounded bg-gray-50" />
      </div>
    </div>
  )
}

// Below `lg` this is the Studio menu screen (header, profile, section list);
// from `lg` up it is the bordered sidebar.
export function StudioLeftSidebar({ activeSection, onChangeSection, className, backHref = '/home' }: StudioLeftSidebarProps) {
  const { user } = useAuthStore()

  const memberSinceYear = (() => {
    if (!user?.created_at) return null
    const date = new Date(user.created_at)
    return Number.isNaN(date.getTime()) ? null : date.getFullYear()
  })()

  return (
    <nav
      aria-label="Artsony Studio"
      className={cn('flex flex-col lg:gap-y-8 lg:rounded-2xl lg:border lg:border-gray-50 lg:px-4 lg:pt-8 lg:pb-4', className)}
    >
      <div className="flex items-center gap-x-4 border-b border-gray-50 px-4 py-4 lg:border-b-0 lg:p-0">
        <Link
          href={backHref}
          aria-label="Back"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-50 transition-colors hover:bg-neutral-50 lg:h-8 lg:w-8"
        >
          <ArrowLeft size={16} color="#525965" />
        </Link>
        <h2 className="font-raleway text-h6 font-semibold leading-8 tracking-wide text-body">Artsony Studio</h2>
      </div>

      {!user ? (
        <ProfileSkeleton />
      ) : (
        <div className="mx-4 flex items-center gap-x-4 border-b border-gray-50 pt-6 pb-4 lg:hidden">
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
            <Image src="/home/profile-ring.svg" alt="" width={96} height={96} className="object-contain" priority />
            <div className="absolute overflow-hidden rounded-full" style={{ width: 74, height: 74 }}>
              <Image
                src={user.avatarUrl || '/images/image-avatar.svg'}
                alt={`${user.username}'s profile picture`}
                width={74}
                height={74}
                className="h-full w-full border border-gray-50 object-cover"
              />
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <p className="truncate font-poppins text-h6 font-medium leading-8 tracking-wide text-[#02272F]">{user.username}</p>
            {memberSinceYear && (
              <p className="font-poppins text-body-xs leading-6 tracking-wide text-primary-500">member since {memberSinceYear}</p>
            )}
          </div>
        </div>
      )}

      <ul className="flex flex-col gap-y-4 px-4 pt-6 lg:border-t lg:border-gray-50 lg:px-0 lg:pt-4">
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
                  'flex h-14 w-full cursor-pointer items-center gap-4 rounded-m px-4 text-left font-poppins text-body-s transition-colors lg:h-auto lg:py-6',
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
