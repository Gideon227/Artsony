'use client'

import { useEffect, useRef } from 'react'
import { Loader2, Search } from 'lucide-react'
import { Input } from '@/components'
import { useIntersectionObserver } from '@/hooks'
import { OrderCard } from './order-card'
import { OrderSortMenu } from '@/features/orders/my-orders/ui/order-sort-menu'
import type { OrderSort } from '../constant'
import type { BuyerOrderView, OrderItemPhysicalListEntry } from '@/types/physical-order'
import { HttpError } from '@/lib/api-client'

interface Props {
  view: BuyerOrderView
  orders: OrderItemPhysicalListEntry[]
  isLoading: boolean
  isError: boolean
  error: unknown
  hasNextPage: boolean
  isFetchingNextPage: boolean
  selectedId: string | undefined
  search: string
  sort: OrderSort
  onSearchChange: (value: string) => void
  onSortChange: (value: OrderSort) => void
  onSelect: (physicalId: string) => void
  onLoadMore: () => void
  onRetry: () => void
}

const EMPTY_COPY: Record<BuyerOrderView, string> = {
  all: 'No orders yet.',
  delivered: 'No delivered orders yet.',
  live: 'No live orders right now.',
  cancelled: 'No canceled orders.',
}

const SENTINEL_OPTIONS: IntersectionObserverInit = { rootMargin: '240px' }

export function OrderList({
  view,
  orders,
  isLoading,
  isError,
  error,
  hasNextPage,
  isFetchingNextPage,
  selectedId,
  search,
  sort,
  onSearchChange,
  onSortChange,
  onSelect,
  onLoadMore,
  onRetry,
}: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const sentinelVisible = useIntersectionObserver(sentinelRef, SENTINEL_OPTIONS)
  const hasOrders = orders.length > 0

  useEffect(() => {
    if (sentinelVisible && hasNextPage && !isFetchingNextPage && !isError) onLoadMore()
  }, [sentinelVisible, hasNextPage, isFetchingNextPage, isError, onLoadMore])

  return (
    <div className="flex flex-col gap-y-4 flex-1 min-h-0">
      <div className="flex gap-x-2 items-center w-full">
        <Input
          leftIcon="/home/magnifier.svg"
          placeholder="Search Order"
          className="flex-1"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search orders"
        />
        <OrderSortMenu value={sort} onChange={onSortChange} />
      </div>

      <div className="flex flex-col gap-y-3 overflow-y-auto flex-1 min-h-0">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[220px] rounded-xl bg-gray-50 animate-pulse" />
          ))}

        {isError && !isLoading && !hasOrders && (
          <div className="flex flex-col items-center gap-y-3 py-12 text-center">
            <p className="font-poppins text-body-s text-body">
              {error instanceof HttpError ? error.message : 'Could not load your orders.'}
            </p>
            <button type="button" onClick={onRetry} className="text-info-500 font-poppins text-body-s underline">
              Try again
            </button>
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
          orders.map((order) => (
            <OrderCard key={order.id} order={order} selected={order.id === selectedId} onSelect={onSelect} />
          ))}

        {isFetchingNextPage && (
          <div className="flex justify-center py-3" role="status" aria-label="Loading more orders">
            <Loader2 size={20} className="animate-spin text-gray-200" />
          </div>
        )}

        {isError && hasOrders && (
          <div className="flex flex-col items-center gap-y-2 py-3 text-center">
            <p className="font-poppins text-body-xs text-body">Could not load more orders.</p>
            <button type="button" onClick={onLoadMore} className="text-info-500 font-poppins text-body-xs underline">
              Try again
            </button>
          </div>
        )}

        <div ref={sentinelRef} aria-hidden className="h-px shrink-0" />
      </div>
    </div>
  )
}
