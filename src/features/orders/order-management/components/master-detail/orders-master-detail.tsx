'use client'

import * as React from 'react'
import { ORDER_SORT_QUERY, type OrderSort } from '@/features/orders/my-orders/constant'
import { useMessageArtist } from '@/features/orders/my-orders/use-message-artist'
import { useSellerSalesInfinite } from '@/hooks/queries/use-seller-sales'
import type { SellerSaleLine, SellerSalesParams, SellerStatus } from '@/types/seller-sales'
import { MASTER_DETAIL_PAGE_SIZE, STATUS_TABS } from '../../constants'
import { useIsDesktop } from '../../hooks/use-is-desktop'
import type { OrderFilters } from '../../lib/filters'
import { OrderDetailPanel } from './order-detail-panel'
import { OrderListPanel } from './order-list-panel'

type SelectOptions = { replace?: boolean }

type Props = {
  filters: OrderFilters
  status: SellerStatus
  orderParam: string | null
  onSelect: (orderItemId: string | null, options?: SelectOptions) => void
  onSearchChange: (search: string) => void
  onCancelled: (orderItemId: string) => void
  onActivated: (orderItemId: string) => void
}

export function OrdersMasterDetail({ filters, status, orderParam, onSelect, onSearchChange, onCancelled, onActivated }: Props) {
  const isDesktop = useIsDesktop()
  const [sort, setSort] = React.useState<OrderSort>('newest')
  const message = useMessageArtist()

  const params = React.useMemo<Omit<SellerSalesParams, 'page'>>(() => {
    const search = filters.search.trim()
    return {
      status,
      ...(search && { q: search }),
      ...ORDER_SORT_QUERY[sort],
      limit: MASTER_DETAIL_PAGE_SIZE,
    }
  }, [status, filters.search, sort])

  const list = useSellerSalesInfinite(params, true)
  const rows = React.useMemo<SellerSaleLine[]>(() => list.data?.pages.flatMap((page) => page.data) ?? [], [list.data])

  const selectedId = orderParam ?? (isDesktop ? (rows[0]?.order_item_id ?? null) : null)
  const emptyLabel = (STATUS_TABS.find((tab) => tab.id === status)?.label ?? 'orders').toLowerCase()

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = list
  const loadMore = React.useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const showList = isDesktop || orderParam === null
  const showDetail = isDesktop || orderParam !== null

  return (
    <div className="grid min-w-0 gap-4 lg:rounded-2xl lg:bg-secondary-50 lg:p-4 lg:col-span-3 lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)]">
      {showList && (
        <OrderListPanel
          rows={rows}
          search={filters.search}
          onSearchChange={onSearchChange}
          sort={sort}
          onSortChange={setSort}
          selectedId={selectedId}
          onSelect={(id) => onSelect(id, { replace: isDesktop })}
          onMessage={(buyerId) => message.mutate(buyerId)}
          isMessaging={message.isPending}
          isPending={list.isPending}
          isError={list.isError}
          error={list.error}
          isRefreshError={list.isRefetchError}
          onRetry={() => void list.refetch()}
          hasNextPage={Boolean(hasNextPage)}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={loadMore}
          emptyLabel={emptyLabel}
        />
      )}

      {showDetail && selectedId && (
        <div className="min-w-0 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto lg:scrollbar-hide">
          <OrderDetailPanel
            key={selectedId}
            orderItemId={selectedId}
            onClose={() => onSelect(null, { replace: true })}
            onCancelled={onCancelled}
            onActivated={onActivated}
          />
        </div>
      )}
    </div>
  )
}
