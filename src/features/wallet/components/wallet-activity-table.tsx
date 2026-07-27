'use client'

import { MoreHorizontal, RotateCcw, WalletCards } from 'lucide-react'
import type { WalletActivity } from '@/types/wallet'
import { WalletStatusBadge } from './wallet-status-badge'
import { WALLET_TYPE_META } from '@/lib/wallet/status'
import { formatWalletAmount, formatWalletTimestamp, getActivityDisplayDescription } from '@/lib/wallet/format'

const COLUMNS = ['Date Purchased', 'Transaction Type', 'Description', 'Amount (USDT)', 'Status', 'Transaction ID', 'Action']

export type WalletActivityTableProps = {
  activity: WalletActivity[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  onSelectActivity?: (activity: WalletActivity) => void
}

const GRID_COLS = '3fr 2fr 3fr 2.5fr 2fr 3fr 1fr'

export function WalletActivityTable({ activity, isLoading, isError, onRetry, onSelectActivity }: WalletActivityTableProps) {
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-gray-50 py-20 text-center">
        <p className="font-poppins text-body-m font-semibold text-heading">Couldn't load your wallet activity</p>
        <p className="max-w-sm text-body-s text-body">Check your connection and try again. If this keeps happening, refresh the page.</p>
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-body-s font-semibold text-white transition-colors hover:bg-primary-600"
        >
          <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
          Retry
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-y-2 overflow-hidden">
        <div style={{ gridTemplateColumns: "3.5fr 3.5fr 3.5fr 3.5fr 2.5fr 3.5fr 1fr" }} className="p-4 grid w-full gap-4 bg-white rounded-2xl border border-gray-50">
          {COLUMNS.map((col) => (
            <span key={col} className="text-nowrap text-start font-poppins text-body-xs tracking-wide text-body">
              {col}
            </span>
          ))}
        </div>

        <ul>
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex items-center gap-4 px-6 py-4">
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-gray-50" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/4 animate-pulse rounded bg-gray-50" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-gray-50" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (activity.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl py-20 text-center">
        <WalletCards className="h-10 w-10 text-text-alt-grey" strokeWidth={1.5} />
        <p className="font-poppins text-body-m font-semibold text-heading">No transactions match your filters</p>
        <p className="max-w-sm text-body-s text-body">Try adjusting or clearing your filters to see more results.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden w-full">
      <div className="hidden md:flex flex-col gap-2 w-full">
        
        <div className="w-full bg-white rounded-xl px-2">
          <div 
            style={{ gridTemplateColumns: "3.5fr 3.5fr 3.5fr 3.5fr 2.5fr 3.5fr 1fr" }} 
            className="grid gap-2 items-center w-full px-2 py-4"
          >
            {COLUMNS.map((col) => (
              <div key={col} className="font-poppins text-body-xs tracking-wide text-body truncate">
                {col}
              </div>
            ))}
          </div>
        </div>

        {/* 2. THE BODY (8px gap created by parent flex container, rounded, bg-white) */}
        <div className="w-full bg-white rounded-xl flex flex-col py-2 px-2">
          {activity.map((item, i) => (
            <div 
              key={item.id} 
              style={{ gridTemplateColumns: "3.5fr 3.5fr 3.5fr 3.5fr 2.5fr 3.5fr 1fr" }}
              className={`grid gap-2 items-center w-full px-2 py-3 transition-colors hover:bg-secondary-50/40 ${
                i === activity.length - 1 ? '' : 'border-b border-gray-50'
              }`}
            >
              <div className="text-body-xs font-poppins text-body truncate min-w-0">
                {formatWalletTimestamp(item.created_at)}
              </div>
              
              <div className="text-body-xs text-text-disabled font-poppins font-medium truncate min-w-0">
                {WALLET_TYPE_META[item.type].label}
              </div>
              
              <div className="text-body-xs font-poppins text-body truncate min-w-0 pr-4">
                {getActivityDisplayDescription(item)}
              </div>
              
              <div className="text-body-xs font-poppins text-body truncate min-w-0">
                {formatWalletAmount(item.amount, item.currency)}
              </div>
              
              <div className="min-w-0">
                <WalletStatusBadge status={item.status} />
              </div>
              
              <div className="text-body-xs font-poppins text-body truncate min-w-0">
                {item.transaction_id}
              </div>
              
              <div className="flex justify-end pr-2">
                <button
                  type="button"
                  aria-label={`View transaction ${item.transaction_id}`}
                  onClick={() => onSelectActivity?.(item)}
                  className="flex  cursor-pointer h-9 w-9 items-center justify-center text-white transition-colors hover:bg-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 shrink-0"
                >
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <mask id="path-1-inside-1_9034_555" fill="white">
                      <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z"/>
                    </mask>
                    <path d="M20 40V38C10.0589 38 2 29.9411 2 20H0H-2C-2 32.1503 7.84974 42 20 42V40ZM40 20H38C38 29.9411 29.9411 38 20 38V40V42C32.1503 42 42 32.1503 42 20H40ZM20 0V2C29.9411 2 38 10.0589 38 20H40H42C42 7.84974 32.1503 -2 20 -2V0ZM20 0V-2C7.84974 -2 -2 7.84974 -2 20H0H2C2 10.0589 10.0589 2 20 2V0Z" fill="#E6E8EB" mask="url(#path-1-inside-1_9034_555)"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M11.4645 28.5355C12.9289 30 15.286 30 20 30C24.714 30 27.0711 30 28.5355 28.5355C30 27.0711 30 24.714 30 20C30 15.286 30 12.9289 28.5355 11.4645C27.0711 10 24.714 10 20 10C15.286 10 12.9289 10 11.4645 11.4645C10 12.9289 10 15.286 10 20C10 24.714 10 27.0711 11.4645 28.5355ZM26.75 24C26.75 24.4142 26.4142 24.75 26 24.75H14C13.5858 24.75 13.25 24.4142 13.25 24C13.25 23.5858 13.5858 23.25 14 23.25H26C26.4142 23.25 26.75 23.5858 26.75 24ZM26 20.75C26.4142 20.75 26.75 20.4142 26.75 20C26.75 19.5858 26.4142 19.25 26 19.25H14C13.5858 19.25 13.25 19.5858 13.25 20C13.25 20.4142 13.5858 20.75 14 20.75H26ZM26.75 16C26.75 16.4142 26.4142 16.75 26 16.75H14C13.5858 16.75 13.25 16.4142 13.25 16C13.25 15.5858 13.5858 15.25 14 15.25H26C26.4142 15.25 26.75 15.5858 26.75 16Z" fill="#525965"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MOBILE VIEW (Unchanged) */}
      <ul className="divide-y divide-border md:hidden bg-white rounded-xl">
        {activity.map((item) => (
          <li key={item.id} className="flex flex-col gap-3 p-4">
            {/* ... mobile code ... */}
          </li>
        ))}
      </ul>
    </div>
  )
}
