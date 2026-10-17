'use client'

import * as React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ErrorState } from '@/components/feedback/states'
import { Navbar } from '@/components/layout/navbar'
import { Skeleton } from '@/components/ui/skeleton'
import { useSellerSales, useSellerSalesCounts } from '@/hooks/queries/use-seller-sales'
import { selectHasSellerAccount, selectIsHydrated, useAuthStore } from '@/store'
import type { SellerSaleLine } from '@/types/seller-sales'
import { ORDER_MANAGEMENT_HREF, STATUS_TABS } from '../constants'
import {
  DEFAULT_FILTERS,
  hasActiveFilters,
  hasSecondaryFilters,
  type OrderFilters,
  type UpdateOptions,
} from '../lib/filters'
import { toApiParams } from '../lib/to-api-params'
import { parseFilters, serializeFilters } from '../lib/url-filters'
import { OrdersEmptyState } from './orders-empty-state'
import { OrdersFilterBar } from './orders-filter-bar'
import { OrdersSidebar } from './orders-sidebar'
import { OrdersTable, OrdersTableSkeleton } from './orders-table'
import { SellerGate } from './seller-gate'

function Layout({ sidebar, children }: { sidebar: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto grid max-w-[1440px] gap-4 px-4 py-6 md:px-8 lg:grid-cols-4">
        <div className="lg:sticky lg:top-24 lg:self-start">{sidebar}</div>
        {children}
      </main>
    </div>
  )
}

export function OrderManagementSkeleton() {
  return (
    <Layout sidebar={<Skeleton className="h-[120px] rounded-[32px] lg:h-[479px]" />}>
      <div className="flex flex-col gap-4 rounded-[32px] bg-secondary-50 p-4 lg:col-span-3">
        <Skeleton className="h-[200px] rounded-[32px]" />
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
  const apiParams = React.useMemo(() => toApiParams(filters), [filters])

  const canQuery = isHydrated && hasSellerAccount
  const list = useSellerSales(apiParams, canQuery)
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
      onSelect={(status) => updateFilters({ status })}
      onBack={handleBack}
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

  const rows = list.data?.data ?? []
  const activeTab = STATUS_TABS.find((tab) => tab.id === filters.status)
  const heading = hasActiveFilters(filters) ? 'Search Result' : (activeTab?.label ?? 'All Orders')

  let body: React.ReactNode
  if (list.isPending) {
    body = <OrdersTableSkeleton />
  } else if (list.isError && !list.data) {
    body = (
      <div className="rounded-[32px] border border-gray-50 bg-white">
        <ErrorState
          title="We couldn't load your orders"
          description="Check your connection and try again."
          onRetry={() => void list.refetch()}
        />
      </div>
    )
  } else if (rows.length === 0) {
    body = hasActiveFilters(filters)
      ? <OrdersEmptyState kind="filtered" onClear={() => updateFilters({ ...DEFAULT_FILTERS, sort: filters.sort })} />
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
      <section aria-label="Orders" className="flex min-w-0 flex-col gap-6 rounded-[32px] bg-secondary-50 p-4 lg:col-span-3 lg:gap-12">
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
