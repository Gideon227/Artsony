'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { LeftSideBar } from './left-sidebar'
import { LiveOrderDetails } from './live-order-details'
import { OrderDetails } from './order-details'
import { EmptyDetailState } from './empty-detail-state'
import { DetailSkeleton } from './detail-skeleton'
import { OrdersEmptyState } from './orders-empty-state'
import { NonPhysicalOrderDetails } from './non-physical-order-details'
import { MobileOrdersView } from '@/features/orders/my-orders/mobile/orders-view'
import { useLayoutMode } from '@/features/orders/my-orders/mobile/use-layout-mode'
import {
  useBuyerPhysicalOrders,
  useBuyerPhysicalOrdersInfinite,
  usePhysicalOrderDetail,
} from '@/hooks/use-physical-order'
import { useDebounce } from '@/hooks'
import { ORDER_SORT_OPTIONS, ORDER_SORT_QUERY, VIEW_FOR_STATUS, type OrderSort } from '../constant'
import { isPhysicalArtwork } from '../utils'
import type { BuyerOrderView, DeliveryStatus } from '@/types/physical-order'

const VALID_VIEWS: BuyerOrderView[] = ['live', 'delivered', 'cancelled']
const DEFAULT_VIEW: BuyerOrderView = 'live'
const DEFAULT_SORT: OrderSort = 'newest'
const STATUS_FOR_VIEW: Record<BuyerOrderView, DeliveryStatus> = {
  all: 'LIVE',
  live: 'LIVE',
  delivered: 'DELIVERED',
  cancelled: 'CANCELLED',
}

function parseView(raw: string | null): BuyerOrderView {
  return VALID_VIEWS.includes(raw as BuyerOrderView) ? (raw as BuyerOrderView) : DEFAULT_VIEW
}

function parseSort(raw: string | null): OrderSort {
  return ORDER_SORT_OPTIONS.some((option) => option.value === raw) ? (raw as OrderSort) : DEFAULT_SORT
}

export function OrdersPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const layout = useLayoutMode()

  const view = parseView(searchParams.get('view'))
  const sort = parseSort(searchParams.get('sort'))
  const physicalId = searchParams.get('physicalId') ?? undefined

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search.trim(), 350)

  const filters = useMemo(
    () => ({ ...ORDER_SORT_QUERY[sort], ...(debouncedSearch ? { search: debouncedSearch } : {}) }),
    [sort, debouncedSearch],
  )

  const listQuery = useBuyerPhysicalOrdersInfinite(view, filters)
  const orders = useMemo(() => listQuery.data?.pages.flatMap((page) => page.data) ?? [], [listQuery.data])
  // Only a digital purchase (a download) uses the non-physical panel. Every physical
  // artwork opens the physical detail, whatever its payment state: when no physical
  // row exists yet the backend answers with a provisional view for the same id.
  const nonPhysicalOrder = useMemo(() => {
    const selected = orders.find((o) => o.id === physicalId)
    return selected && !isPhysicalArtwork(selected) ? selected : undefined
  }, [orders, physicalId])
  const detailQuery = usePhysicalOrderDetail(nonPhysicalOrder ? undefined : physicalId)
  const anyOrders = useBuyerPhysicalOrders('all', { limit: 1 })

  const updateParams = useCallback(
    (next: { view?: BuyerOrderView; sort?: OrderSort; physicalId?: string | null }, mode: 'push' | 'replace' = 'push') => {
      const params = new URLSearchParams(searchParams.toString())
      if (next.view) params.set('view', next.view)
      if (next.sort) params.set('sort', next.sort)
      if (next.physicalId === null) params.delete('physicalId')
      else if (next.physicalId) params.set('physicalId', next.physicalId)
      router[mode](`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  // Any physical artwork may be auto-opened, including ones still awaiting payment.
  const firstOrderId = orders.find(isPhysicalArtwork)?.id
  // Desktop shows the first order beside the list. On mobile the list is its
  // own screen, so nothing is opened until the user taps an order.
  useEffect(() => {
    if (layout === 'desktop' && !physicalId && firstOrderId) updateParams({ physicalId: firstOrderId }, 'replace')
  }, [layout, physicalId, firstOrderId, updateParams])

  const detailStatus = detailQuery.data?.data.physical.delivery_status
  useEffect(() => {
    if (physicalId && detailStatus && VIEW_FOR_STATUS[detailStatus] !== view) {
      updateParams({ view: VIEW_FOR_STATUS[detailStatus] }, 'replace')
    }
  }, [physicalId, detailStatus, view, updateParams])

  const { fetchNextPage, refetch } = listQuery
  const handleLoadMore = useCallback(() => void fetchNextPage(), [fetchNextPage])
  const handleRetry = useCallback(() => void refetch(), [refetch])

  if (anyOrders.data?.total === 0) return <OrdersEmptyState />

  // `null` only while hydrating server HTML; avoids flashing the wrong layout.
  if (layout === null) return null

  if (layout === 'mobile') {
    return (
      <MobileOrdersView
        view={view}
        orders={orders}
        isLoading={listQuery.isLoading}
        isError={listQuery.isError}
        error={listQuery.error}
        hasNextPage={listQuery.hasNextPage}
        isFetchingNextPage={listQuery.isFetchingNextPage}
        search={search}
        sort={sort}
        physicalId={physicalId}
        nonPhysicalOrder={nonPhysicalOrder}
        detailQuery={detailQuery}
        onViewChange={(nextView) => updateParams({ view: nextView, physicalId: null })}
        onSearchChange={setSearch}
        onSortChange={(nextSort) => updateParams({ sort: nextSort }, 'replace')}
        onSelect={(id) => updateParams({ physicalId: id })}
        onCloseDetail={() => updateParams({ physicalId: null }, 'replace')}
        onLoadMore={handleLoadMore}
        onRetry={handleRetry}
      />
    )
  }

  const layoutStatus = detailStatus ?? STATUS_FOR_VIEW[view]

  return (
    <div className="flex gap-x-4 min-h-screen w-full">
      <LeftSideBar
        view={view}
        orders={orders}
        isLoading={listQuery.isLoading}
        isError={listQuery.isError}
        error={listQuery.error}
        hasNextPage={listQuery.hasNextPage}
        isFetchingNextPage={listQuery.isFetchingNextPage}
        selectedId={physicalId}
        search={search}
        sort={sort}
        onViewChange={(nextView) => updateParams({ view: nextView, physicalId: null })}
        onSearchChange={setSearch}
        onSortChange={(nextSort) => updateParams({ sort: nextSort }, 'replace')}
        onSelect={(id) => updateParams({ physicalId: id })}
        onLoadMore={handleLoadMore}
        onRetry={handleRetry}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Nothing open: wait for the list / auto-open, then fall back to the empty-orders design. */}
        {!physicalId &&
          (listQuery.isLoading || firstOrderId ? (
            <DetailSkeleton />
          ) : (
            <EmptyDetailState view={view} searching={debouncedSearch !== ''} hasEntries={orders.length > 0} />
          ))}
        {nonPhysicalOrder && <NonPhysicalOrderDetails order={nonPhysicalOrder} />}
        {!nonPhysicalOrder && physicalId && layoutStatus === 'LIVE' && <LiveOrderDetails query={detailQuery} />}
        {!nonPhysicalOrder && physicalId && layoutStatus !== 'LIVE' && (
          <OrderDetails query={detailQuery} status={layoutStatus === 'DELIVERED' ? 'completed' : 'canceled'} />
        )}
      </div>
    </div>
  )
}
