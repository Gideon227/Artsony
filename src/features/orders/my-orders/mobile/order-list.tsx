'use client'

import { useEffect, useRef } from 'react'
import { ArrowLeft, ListFilter, Loader2, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components'
import { useIntersectionObserver } from '@/hooks'
import { describeOrdersLoadError } from '@/lib/orders/errors'
import { SortByMenu } from '@/features/orders/order-management/components/sort-by-menu'
import { MobileOrderCard } from './order-card'
import { EMPTY_COPY, MOBILE_ORDER_TABS } from './constants'
import type { OrderSort } from '../constant'
import type { BuyerOrderView, OrderItemPhysicalListEntry } from '@/types/physical-order'
import { cn } from '@/lib/utils'

interface Props {
  view: BuyerOrderView
  orders: OrderItemPhysicalListEntry[]
  isLoading: boolean
  isError: boolean
  error: unknown
  hasNextPage: boolean
  isFetchingNextPage: boolean
  search: string
  sort: OrderSort
  onViewChange: (view: BuyerOrderView) => void
  onSearchChange: (value: string) => void
  onSortChange: (value: OrderSort) => void
  onSelect: (physicalId: string) => void
  onLoadMore: () => void
  onRetry: () => void
}

// Module-level so the observer isn't torn down and rebuilt on every render.
const SENTINEL_OPTIONS: IntersectionObserverInit = { rootMargin: '240px' }

export function MobileOrderList({
  view,
  orders,
  isLoading,
  isError,
  error,
  hasNextPage,
  isFetchingNextPage,
  search,
  sort,
  onViewChange,
  onSearchChange,
  onSortChange,
  onSelect,
  onLoadMore,
  onRetry,
}: Props) {
  const router = useRouter()
  const sentinelRef = useRef<HTMLDivElement>(null)
  const sentinelVisible = useIntersectionObserver(sentinelRef, SENTINEL_OPTIONS)
  const hasOrders = orders.length > 0
  const loadError = isError ? describeOrdersLoadError(error) : null

  useEffect(() => {
    if (sentinelVisible && hasNextPage && !isFetchingNextPage && !isError) onLoadMore()
  }, [sentinelVisible, hasNextPage, isFetchingNextPage, isError, onLoadMore])

  return (
    <section aria-label="My orders" className="flex min-h-screen w-full min-w-0 flex-col bg-white">
      <header className="flex items-center gap-3 border-b border-gray-50 px-4 py-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-50 active:scale-95"
        >
          <ArrowLeft color="#525965" size={20} />
        </button>
        <h1 className="font-raleway text-h6 font-semibold tracking-wide text-body">My Orders</h1>
      </header>

      {/* Bottom padding keeps the last card clear of the floating nav pill. */}
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 pb-32 pt-4">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <Input
              leftIcon="/home/magnifier.svg"
              placeholder="Search Order"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search orders"
            />
          </div>
          <SortByMenu value={sort} onChange={onSortChange}>
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-50">
              <ListFilter size={18} className="text-body" aria-hidden="true" />
            </span>
          </SortByMenu>
        </div>

        <div className="flex items-center gap-2" role="group" aria-label="Order status">
          {MOBILE_ORDER_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => onViewChange(tab.value)}
              aria-pressed={view === tab.value}
              className={cn(
                'h-12 flex-1 cursor-pointer rounded-full border font-poppins text-body-s tracking-wide transition-colors',
                view === tab.value ? 'border-primary-500 bg-primary-500 text-white' : 'border-gray-50 text-body',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[260px] animate-pulse rounded-[20px] bg-gray-50" />
            ))}

          {loadError && !isLoading && !hasOrders && (
            <div role="alert" className="flex flex-col items-center gap-y-2 py-12 text-center">
              <p className="font-poppins text-body-s font-medium text-heading">{loadError.title}</p>
              <p className="font-poppins text-body-s text-body">{loadError.description}</p>
              {loadError.retryable && (
                <button type="button" onClick={onRetry} className="font-poppins text-body-s text-info-500 underline">
                  Try again
                </button>
              )}
            </div>
          )}

          {!isLoading && !isError && !hasOrders && (
            <div className="flex flex-col items-center gap-y-2 py-12 text-center">
              <Search size={32} className="text-gray-200" />
              <p className="font-poppins text-body-s text-body">
                {search.trim() ? 'No orders match your search.' : EMPTY_COPY[view]}
              </p>
            </div>
          )}

          {!isLoading &&
            hasOrders &&
            orders.map((order) => <MobileOrderCard key={order.id} order={order} onSelect={onSelect} />)}

          {isFetchingNextPage && (
            <div className="flex justify-center py-3" role="status" aria-label="Loading more orders">
              <Loader2 size={20} className="animate-spin text-gray-200" />
            </div>
          )}

          {isError && hasOrders && (
            <div className="flex flex-col items-center gap-y-2 py-3 text-center">
              <p className="font-poppins text-body-xs text-body">Could not load more orders.</p>
              <button type="button" onClick={onLoadMore} className="font-poppins text-body-xs text-info-500 underline">
                Try again
              </button>
            </div>
          )}

          <div ref={sentinelRef} aria-hidden className="h-px shrink-0" />
        </div>
      </div>
    </section>
  )
}
