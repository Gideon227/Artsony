'use client'

import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SellerSalesCounts } from '@/types/seller-sales'
import { STATUS_TABS } from '../constants'
import { formatCount } from '../lib/format'
import type { StatusFilter } from '../lib/filters'
import { Input } from '@/components'
import type { OrderSort } from '@/features/orders/my-orders/constant'
import { SortByMenu } from '../components/sort-by-menu'

type Props = {
  active: StatusFilter
  counts: SellerSalesCounts | undefined
  disabled: boolean
  onSelect: (tab: StatusFilter) => void
  onBack: () => void
  sort: OrderSort
  onSortChange: (value: OrderSort) => void
  className?: string
}

export function OrdersSidebar({ active, counts, disabled, onSelect, onBack, sort, onSortChange, className }: Props) {
  const mobileStyle = 'max-lg:bg-white max-lg:pt-2'
  return (
    <nav
      aria-label="Order management"
      className={cn('flex flex-col gap-4 lg:rounded-2xl lg:bg-secondary-50 lg:p-4 lg:gap-0 lg:px-4 lg:pb-4 lg:pt-8', className, mobileStyle)}
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
        <h1 className="font-raleway text-h6 font-semibold lg:font-medium leading-8 tracking-wide text-gray-400">Order Management</h1>
      </div>

      <hr className="border-gray-50 max-lg:-mx-4 max-lg:w-[calc(100%+2rem)]" />

      <div className='hidden pt-6 max-lg:flex items-center gap-2 w-full'>
        <Input 
          leftIcon='/home/magnifier.svg'
          placeholder='Search Order'
          className='flex-1'
          onClick={() => {}}
        />

        <SortByMenu value={sort} onChange={onSortChange}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <mask id="path-1-inside-1_10370_82206" fill="white">
              <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z"/>
            </mask>
            <path d="M0 20M40 20M40 20M0 20M20 0M40 20M20 40M0 20M20 40V38C10.0589 38 2 29.9411 2 20H0H-2C-2 32.1503 7.84974 42 20 42V40ZM40 20H38C38 29.9411 29.9411 38 20 38V40V42C32.1503 42 42 32.1503 42 20H40ZM20 0V2C29.9411 2 38 10.0589 38 20H40H42C42 7.84974 32.1503 -2 20 -2V0ZM20 0V-2C7.84974 -2 -2 7.84974 -2 20H0H2C2 10.0589 10.0589 2 20 2V0Z" fill="#E6E8EB" mask="url(#path-1-inside-1_10370_82206)"/>
            <path d="M30.75 15C30.75 15.4142 30.4142 15.75 30 15.75L10 15.75C9.58579 15.75 9.25 15.4142 9.25 15C9.25 14.5858 9.58579 14.25 10 14.25L30 14.25C30.4142 14.25 30.75 14.5858 30.75 15Z" fillRule="evenodd" clipRule="evenodd" fill="#525965"/>
            <path d="M27.75 20C27.75 20.4142 27.4142 20.75 27 20.75L13 20.75C12.5858 20.75 12.25 20.4142 12.25 20C12.25 19.5858 12.5858 19.25 13 19.25H27C27.4142 19.25 27.75 19.5858 27.75 20Z" fillRule="evenodd" clipRule="evenodd" fill="#525965"/>
            <path d="M24.75 25C24.75 25.4142 24.4142 25.75 24 25.75H16C15.5858 25.75 15.25 25.4142 15.25 25C15.25 24.5858 15.5858 24.25 16 24.25H24C24.4142 24.25 24.75 24.5858 24.75 25Z" fillRule="evenodd" clipRule="evenodd" fill="#525965"/>
          </svg>
        </SortByMenu>
      </div>

      <ul className="flex overflow-x-auto max-lg:pb-4 gap-2 px-1 py-1 scrollbar-hide lg:mx-0 lg:flex-col lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0 lg:pt-4">
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
                  'flex h-12 w-full cursor-pointer items-center gap-4 rounded-m p-4 font-poppins text-body-s tracking-wide lg:h-14 lg:gap-4',
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
                      'flex h-6 w-6 items-center justify-center rounded-[8px] p-0.5 text-body-xs leading-none text-white',
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
