'use client'

import * as React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useSellerOrders } from '@/hooks/queries/use-seller-orders'
import { OrdersSidebarNav } from '@/features/orders/all-orders/components/orders-sidebar-nav'
import { OrdersFilterBar } from '@/features/orders/all-orders/components/orders-filter-bar'
import { OrdersTable } from '@/features/orders/all-orders/components/orders-table'
import { Pagination } from '@/components/ui/pagination'
import { applyOrderFilters, hasActiveFilters, type OrdersPageFilters } from '@/lib/orders/filters'
import { filtersFromSearchParams, filtersToSearchParams } from '@/lib/orders/url-filters'
import { getOrderStatusGroup, type OrderStatusGroup } from '@/lib/orders/status'
import type { Order } from '@/types/order'
import { Navbar } from '@/components/layout/navbar'

function getStatusCounts(orders: Order[]): Record<OrderStatusGroup | 'ALL', number> {
  const counts = { ALL: orders.length, LIVE: 0, PENDING: 0, COMPLETED: 0, CANCELLED: 0 } as Record<OrderStatusGroup | 'ALL', number>
  orders.forEach((order) => {
    counts[getOrderStatusGroup(order.status)] += 1
  })
  return counts
}

function OrderManagementContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filters = React.useMemo(() => filtersFromSearchParams(searchParams), [searchParams])

  const updateFilters = React.useCallback(
    (updater: (prev: OrdersPageFilters) => OrdersPageFilters) => {
      const next = updater(filters)
      const params = filtersToSearchParams(next)
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [filters, pathname, router]
  )

  const { data: orders = [], isLoading, isError, refetch } = useSellerOrders(filters.sortOrder)

  const { data: pageData, total, totalPages } = React.useMemo(() => applyOrderFilters(orders, filters), [orders, filters])
  const statusCounts = React.useMemo(() => getStatusCounts(orders), [orders])

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white w-full">
      {/* Fixed top Navbar */}
      <Navbar />

      {/* Main Container taking up remaining height */}
      <div className="flex-1 grid grid-cols-4 gap-4 py-6 px-8 bg-white w-full min-h-0 overflow-hidden">
        
        {/* Left Sidebar - Independent scroll if content overflows */}
        <div className="col-span-1 h-full overflow-y-auto min-h-0">
          <OrdersSidebarNav
            activeGroup={filters.statusGroup}
            onChangeGroup={(statusGroup) => updateFilters((prev) => ({ ...prev, statusGroup, page: 1 }))}
            counts={statusCounts}
          />
        </div>

        {/* Right Main Content Panel - Scrollable container for table and controls */}
        <div
          style={{ backgroundColor: '#F5FAFA' }}
          className="col-span-3 h-full overflow-y-auto min-h-0 rounded-2xl p-6 flex flex-col gap-y-6"
        >
          <OrdersFilterBar
            filters={filters}
            onFiltersChange={updateFilters}
            resultCount={total}
            isFiltered={hasActiveFilters(filters)}
          />

          <div className="flex-1">
            <OrdersTable
              orders={pageData}
              isLoading={isLoading}
              isError={isError}
              onRetry={() => refetch()}
              getDetailHref={(order) => `/orders/${order.id}`}
            />
          </div>

          {!isLoading && !isError && pageData.length > 0 && (
            <Pagination
              page={filters.page}
              totalPages={totalPages}
              onPageChange={(page) => updateFilters((prev) => ({ ...prev, page }))}
              className="mt-auto pt-4"
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default function OrderManagementPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-white" />}>
      <OrderManagementContent />
    </React.Suspense>
  )
}