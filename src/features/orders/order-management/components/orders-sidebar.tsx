'use client'

import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SellerSalesCounts } from '@/types/seller-sales'
import { STATUS_TABS } from '../constants'
import { formatCount } from '../lib/format'
import type { StatusFilter } from '../lib/filters'

type Props = {
  active: StatusFilter
  counts: SellerSalesCounts | undefined
  disabled: boolean
  onSelect: (tab: StatusFilter) => void
  onBack: () => void
  className?: string
}

export function OrdersSidebar({ active, counts, disabled, onSelect, onBack, className }: Props) {
  return (
    <nav
      aria-label="Order management"
      className={cn('flex flex-col gap-4 rounded-[32px] bg-secondary-50 p-4 lg:gap-0 lg:px-4 lg:pb-4 lg:pt-8', className)}
    >
      <div className="flex items-center gap-4 lg:pb-8">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-50 text-gray-400 transition-colors hover:bg-white active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <h1 className="font-raleway text-h6 font-medium leading-8 tracking-wide text-gray-400">Order Management</h1>
      </div>

      <hr className="hidden border-gray-50 lg:block" />

      <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 py-1 scrollbar-hide lg:mx-0 lg:flex-col lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0 lg:pt-4">
        {STATUS_TABS.map((tab) => {
          const isActive = !disabled && active === tab.id
          const showBadge = disabled ? tab.id === 'ALL' : isActive
          const count = disabled ? 0 : counts?.[tab.id]

          return (
            <li key={tab.id} className="shrink-0 lg:shrink">
              <button
                type="button"
                disabled={disabled}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onSelect(tab.id)}
                className={cn(
                  'flex h-12 w-full cursor-pointer items-center gap-3 rounded-[16px] px-4 font-poppins text-body-s font-medium tracking-wide lg:h-14 lg:gap-4',
                  'whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
                  isActive
                    ? 'bg-primary-50 text-primary-500 ring-2 ring-primary-500 ring-offset-2'
                    : disabled
                      ? 'cursor-not-allowed bg-gray-50 text-gray-400'
                      : 'text-gray-400 hover:bg-white/70',
                )}
              >
                <Image src={tab.icon} width={24} height={24} alt="" aria-hidden="true" className={cn(disabled && 'opacity-60')} />
                <span className="flex-1 truncate text-left">{tab.label}</span>
                {showBadge && count !== undefined && (
                  <span
                    className={cn(
                      'flex h-6 min-w-6 items-center justify-center rounded-[8px] px-1.5 text-body-xs font-semibold leading-none text-white',
                      disabled ? 'bg-gray-400' : 'bg-primary-500',
                    )}
                  >
                    {formatCount(count)}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
