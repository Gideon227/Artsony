'use client'

import * as React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ErrorState } from '@/components/feedback/states'
import { cn } from '@/lib/utils'
import { describeOrdersLoadError } from '@/lib/orders/errors'
import { Navbar } from '@/components/layout/navbar'
import { Skeleton } from '@/components/ui/skeleton'
import { useSellerSales, useSellerSalesCounts } from '@/hooks/queries/use-seller-sales'
import { selectHasSellerAccount, selectIsHydrated, useAuthStore } from '@/store'
import type { SellerSaleLine, SellerStatus } from '@/types/seller-sales'
import { ORDER_SORT_QUERY, type OrderSort } from '@/features/orders/my-orders/constant'
import { ORDER_MANAGEMENT_HREF, STATUS_TABS } from '../constants'
import {
  DEFAULT_FILTERS,
  hasActiveFilters,
  hasSecondaryFilters,
  type OrderFilters,
  type StatusFilter,
  type UpdateOptions,
} from '../lib/filters'
import { toApiParams } from '../lib/to-api-params'
import { parseFilters, serializeFilters } from '../lib/url-filters'
import { OrdersMasterDetail } from './master-detail/orders-master-detail'
import { OrdersEmptyState } from './orders-empty-state'
import { OrdersFilterBar } from './orders-filter-bar'
import { OrdersSidebar } from './orders-sidebar'
import { OrdersTable, OrdersTableSkeleton } from './orders-table'
import { SellerGate } from './seller-gate'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function parseOrderParam(value: string | null): string | null {
  return value && UUID.test(value) ? value : null
}

function Layout({
  sidebar,
  children,
  hideSidebarOnMobile = false,
}: {
  sidebar: React.ReactNode
  children: React.ReactNode
  hideSidebarOnMobile?: boolean
}) {
  return (
    <div className="min-h-screen bg-white max-lg:pb-24 scrollbar-hide">
      <Navbar />
      <main className="grid grid-cols-1 gap-4 px-4 py-6 lg:px-8 lg:grid-cols-4 scrollbar-hide">
        <div className={cn('min-w-0 lg:sticky lg:top-24 lg:self-start', hideSidebarOnMobile && 'hidden lg:block')}>
          {sidebar}
        </div>
        {children}
      </main>
    </div>
  )
}

export function OrderManagementSkeleton() {
  return (
    <Layout sidebar={<Skeleton className="h-[120px] rounded-2xl lg:h-[479px]" />}>
      <div className="flex flex-col gap-4 rounded-2xl bg-secondary-50 p-4 lg:col-span-3">
        <Skeleton className="h-[200px] rounded-2xl" />
        <OrdersTableSkeleton />
      </div>
    </Layout>
  )
}

function getRowHref(row: SellerSaleLine): string {
  const params = new URLSearchParams({ status: row.seller_status, order: row.order_item_id })
  return `${ORDER_MANAGEMENT_HREF}?${params.toString()}`
}

export function OrderManagementPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryString = searchParams.toString()

  const isHydrated = useAuthStore(selectIsHydrated)
  const hasSellerAccount = useAuthStore(selectHasSellerAccount)

  const filters = React.useMemo(() => parseFilters(new URLSearchParams(queryString)), [queryString])
  const orderParam = React.useMemo(() => parseOrderParam(new URLSearchParams(queryString).get('order')), [queryString])
  const isMasterDetail = filters.status !== 'ALL'
  const apiParams = React.useMemo(() => toApiParams(filters), [filters])

  const canQuery = isHydrated && hasSellerAccount
  const list = useSellerSales(apiParams, canQuery && !isMasterDetail)
  const counts = useSellerSalesCounts(canQuery)

  const [showMore, setShowMore] = React.useState(() => hasSecondaryFilters(filters))

  const updateFilters = React.useCallback(
    (patch: Partial<OrderFilters>, options: UpdateOptions = {}) => {
      const next: OrderFilters = { ...filters, ...patch }
      if (patch.page === undefined) next.page = 1
      const query = serializeFilters(next).toString()
      const href = query ? `${pathname}?${query}` : pathname
      if (options.replace) router.replace(href, { scroll: false })
      else router.push(href, { scroll: false })
    },
    [filters, pathname, router],
  )

  const totalPages = list.data?.total_pages ?? 0

  React.useEffect(() => {
    if (!list.data || list.isPlaceholderData || filters.page <= 1) return
    if (filters.page > Math.max(totalPages, 1)) {
      updateFilters({ page: Math.max(totalPages, 1) }, { replace: true })
    }
  }, [list.data, list.isPlaceholderData, filters.page, totalPages, updateFilters])

  const navigate = React.useCallback(
    (params: URLSearchParams, options: UpdateOptions = {}) => {
      const query = params.toString()
      const href = query ? `${pathname}?${query}` : pathname
      if (options.replace) router.replace(href, { scroll: false })
      else router.push(href, { scroll: false })
    },
    [pathname, router],
  )

  const selectOrder = React.useCallback(
    (orderItemId: string | null, options: UpdateOptions = {}) => {
      const params = serializeFilters(filters)
      if (orderItemId) params.set('order', orderItemId)
      navigate(params, options)
    },
    [filters, navigate],
  )

  const selectStatus = React.useCallback(
    (status: StatusFilter) => {
      updateFilters(
        status === 'ALL'
          ? { status }
          : { status, format: 'ALL', price: 'ALL', dateFrom: null, dateTo: null },
      )
    },
    [updateFilters],
  )

  const showOrderIn = React.useCallback(
    (status: StatusFilter, orderItemId: string) => {
      const params = serializeFilters({ ...DEFAULT_FILTERS, status })
      params.set('order', orderItemId)
      navigate(params, { replace: true })
    },
    [navigate],
  )

  // The sort menu offers four combined options; the URL stores them as sortBy + sort.
  const sortValue = (Object.keys(ORDER_SORT_QUERY) as OrderSort[]).find(
    (key) => ORDER_SORT_QUERY[key].sort_by === filters.sortBy && ORDER_SORT_QUERY[key].sort_order === filters.sort,
  ) ?? 'newest'

  const handleSortChange = React.useCallback(
    (next: OrderSort) => {
      const { sort_by, sort_order } = ORDER_SORT_QUERY[next]
      updateFilters({ sortBy: sort_by, sort: sort_order }, { replace: true })
    },
    [updateFilters],
  )

  const handleBack = React.useCallback(() => {
    if (window.history.length > 1) router.back()
    else router.push('/')
  }, [router])

  if (!isHydrated) return <OrderManagementSkeleton />

  const countsData = counts.data?.data
  const isEmptyAccount = hasSellerAccount && counts.isSuccess && countsData?.ALL === 0
  const sidebarDisabled = !hasSellerAccount || isEmptyAccount

  const sidebar = (
    <OrdersSidebar
      active={filters.status}
      counts={countsData}
      disabled={sidebarDisabled}
      onSelect={selectStatus}
      onBack={handleBack}
      sort={sortValue}
      onSortChange={handleSortChange}
    />
  )

  if (!hasSellerAccount) {
    return <Layout sidebar={sidebar}><SellerGate /></Layout>
  }

  if (isEmptyAccount) {
    return (
      <Layout sidebar={sidebar}>
        <div className="flex rounded-[32px] bg-secondary-50 p-4 lg:col-span-3">
          <OrdersEmptyState kind="none" />
        </div>
      </Layout>
    )
  }

  if (isMasterDetail) {
    return (
      <Layout sidebar={sidebar} hideSidebarOnMobile={orderParam !== null}>
        <OrdersMasterDetail
          filters={filters}
          sort={sortValue}
          onSortChange={handleSortChange}
          status={filters.status as SellerStatus}
          orderParam={orderParam}
          onSelect={selectOrder}
          onSearchChange={(search) => updateFilters({ search }, { replace: true })}
          onCancelled={(orderItemId) => showOrderIn('CANCELLED', orderItemId)}
          onActivated={(orderItemId) => showOrderIn('LIVE', orderItemId)}
        />
      </Layout>
    )
  }

  const rows = list.data?.data ?? []
  const activeTab = STATUS_TABS.find((tab) => tab.id === filters.status)
  const heading = hasActiveFilters(filters) ? 'Search Result' : (activeTab?.label ?? 'All Orders')

  let body: React.ReactNode
  if (list.isPending) {
    body = <OrdersTableSkeleton />
  } else if (list.isError && !list.data) {
    const loadError = describeOrdersLoadError(list.error)
    body = (
      <div className="rounded-[32px] border border-gray-50 bg-white">
        <ErrorState
          title={loadError.title}
          description={loadError.description}
          {...(loadError.retryable ? { onRetry: () => void list.refetch() } : {})}
        />
      </div>
    )
  } else if (rows.length === 0) {
    body = hasActiveFilters(filters)
      ? <OrdersEmptyState kind="filtered" onClear={() => updateFilters({ ...DEFAULT_FILTERS, sort: filters.sort, sortBy: filters.sortBy })} />
      : <OrdersEmptyState kind="group" groupLabel={activeTab?.label ?? 'orders'} />
  } else {
    body = (
      <OrdersTable
        rows={rows}
        isFetching={list.isFetching}
        isRefreshError={list.isError}
        onRetry={() => void list.refetch()}
        page={filters.page}
        totalPages={totalPages}
        onPageChange={(page) => updateFilters({ page })}
        getRowHref={getRowHref}
      />
    )
  }

  return (
    <Layout sidebar={sidebar}>
      <section aria-label="Orders" className="flex min-w-0 flex-col gap-12 rounded-2xl bg-secondary-50 p-4 lg:col-span-3 lg:gap-12">
        <OrdersFilterBar
          filters={filters}
          heading={heading}
          total={list.data?.total}
          showMore={showMore}
          onToggleMore={() => setShowMore((open) => !open)}
          onChange={updateFilters}
        />
        {body}
      </section>
    </Layout>
  )
}
