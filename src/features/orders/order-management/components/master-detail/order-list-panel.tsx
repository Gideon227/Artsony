'use client'

import * as React from 'react'
import { Loader2, Search } from 'lucide-react'
import { EmptyState, ErrorState } from '@/components/feedback/states'
import { OrderSortMenu } from '@/features/orders/my-orders/ui/order-sort-menu'
import type { OrderSort } from '@/features/orders/my-orders/constant'
import type { SellerSaleLine } from '@/types/seller-sales'
import { describeOrdersLoadError } from '@/lib/orders/errors'
import { OrderCard, OrderCardSkeleton } from './order-card'

type Props = {
  rows: SellerSaleLine[]
  search: string
  onSearchChange: (value: string) => void
  sort: OrderSort
  onSortChange: (value: OrderSort) => void
  selectedId: string | null
  onSelect: (orderItemId: string) => void
  onMessage: (buyerId: string) => void
  isMessaging: boolean
  isPending: boolean
  isError: boolean
  error: unknown
  isRefreshError: boolean
  onRetry: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
  emptyLabel: string
}

const SEARCH_DEBOUNCE_MS = 350

export function OrderListPanel({
  rows,
  search,
  onSearchChange,
  sort,
  onSortChange,
  selectedId,
  onSelect,
  onMessage,
  isMessaging,
  isPending,
  isError,
  error,
  isRefreshError,
  onRetry,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  emptyLabel,
}: Props) {
  const [draft, setDraft] = React.useState(search)
  const sentinelRef = React.useRef<HTMLLIElement>(null)
  const lastEmitted = React.useRef(search.trim())

  React.useEffect(() => {
    if (search.trim() === lastEmitted.current) return
    lastEmitted.current = search.trim()
    setDraft(search)
  }, [search])

  React.useEffect(() => {
    const next = draft.trim()
    if (next === lastEmitted.current) return
    const timer = window.setTimeout(() => {
      lastEmitted.current = next
      onSearchChange(next)
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [draft, onSearchChange])

  React.useEffect(() => {
    const node = sentinelRef.current
    if (!node || !hasNextPage || isFetchingNextPage || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore()
      },
      { rootMargin: '240px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, onLoadMore, rows.length])

  let body: React.ReactNode
  if (isPending) {
    body = Array.from({ length: 4 }, (_, index) => <OrderCardSkeleton key={index} />)
  } else if (isError && rows.length === 0) {
    const loadError = describeOrdersLoadError(error)
    body = (
      <li>
        <ErrorState
          title={loadError.title}
          description={loadError.description}
          {...(loadError.retryable ? { onRetry } : {})}
        />
      </li>
    )
  } else if (rows.length === 0) {
    body = (
      <li>
        <EmptyState
          title={search.trim() ? 'No orders match your search' : `No ${emptyLabel} yet`}
          description={search.trim() ? 'Try a different order ID, customer or artwork name.' : undefined}
          action={search.trim() ? { label: 'Clear search', onClick: () => onSearchChange('') } : undefined}
        />
      </li>
    )
  } else {
    body = (
      <>
        {rows.map((line) => (
          <OrderCard
            key={line.order_item_id}
            line={line}
            selected={line.order_item_id === selectedId}
            onSelect={onSelect}
            onMessage={onMessage}
            isMessaging={isMessaging}
          />
        ))}
        {hasNextPage && (
          <li ref={sentinelRef} className="flex justify-center py-2">
            {isFetchingNextPage ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary-500" aria-label="Loading more orders" />
            ) : (
              <button
                type="button"
                onClick={onLoadMore}
                className="cursor-pointer font-poppins text-body-s font-medium text-primary-500 hover:underline"
              >
                Load more
              </button>
            )}
          </li>
        )}
      </>
    )
  }

  return (
    <section aria-label="Orders list" className="flex min-h-0 min-w-0 flex-col gap-4">
      <div className="flex items-center gap-3">
        <label className="relative flex h-12 min-w-0 flex-1 items-center rounded-full border border-gray-50 bg-white">
          <Search className="pointer-events-none absolute left-4 h-5 w-5 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={100}
            placeholder="Search Order"
            aria-label="Search orders"
            className="h-full w-full rounded-full bg-transparent pl-12 pr-4 font-poppins text-body-s tracking-wide text-gray-500 outline-none placeholder:text-gray-300 focus-visible:ring-2 focus-visible:ring-primary-500"
          />
        </label>
        <OrderSortMenu value={sort} onChange={onSortChange} />
      </div>

      {isRefreshError && rows.length > 0 && (
        <div role="alert" className="flex items-center justify-between rounded-[16px] bg-error-50 px-4 py-2 font-poppins text-body-xs text-error-500">
          <span>Couldn&apos;t refresh your orders.</span>
          <button type="button" onClick={onRetry} className="cursor-pointer font-medium underline">
            Retry
          </button>
        </div>
      )}

      <ul className="flex min-h-0 flex-col gap-4 overflow-y-auto pr-1 lg:max-h-[calc(100vh-190px)]">{body}</ul>
    </section>
  )
}
