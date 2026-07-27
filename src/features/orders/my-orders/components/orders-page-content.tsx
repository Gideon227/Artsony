'use client'

import { useCallback, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { LeftSideBar } from './left-sidebar'
import { LiveOrderDetails } from './live-order-details'
import { OrderDetails } from './order-details'
import { EmptyDetailState } from './empty-detail-state'
import { useBuyerPhysicalOrders, usePhysicalOrderDetail } from '@/hooks/use-physical-order'
import type { BuyerOrderView, OrderItemPhysicalWithArtwork } from '@/types/physical-order'

const VALID_VIEWS: BuyerOrderView[] = ['live', 'delivered', 'cancelled']

export function OrdersPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const rawView = searchParams.get('view')
  const view: BuyerOrderView = VALID_VIEWS.includes(rawView as BuyerOrderView) ? (rawView as BuyerOrderView) : 'live'
  const physicalId = searchParams.get('physicalId') ?? undefined

  const { data: listData } = useBuyerPhysicalOrders(view)
  const orders = listData?.data as OrderItemPhysicalWithArtwork[] | undefined

  const updateParams = useCallback(
    (next: { view?: BuyerOrderView; physicalId?: string | null }) => {
      const params = new URLSearchParams(searchParams.toString())
      if (next.view) params.set('view', next.view)
      if (next.physicalId === null) params.delete('physicalId')
      else if (next.physicalId) params.set('physicalId', next.physicalId)
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  useEffect(() => {
    if (!physicalId && orders && orders.length > 0) {
      updateParams({ physicalId: orders[0]?.id })
    }
  }, [physicalId, orders, updateParams])

  const handleViewChange = (nextView: BuyerOrderView) => {
    updateParams({ view: nextView, physicalId: null })
  }

  const detailQuery = usePhysicalOrderDetail(physicalId)

  return (
    <div className="flex gap-x-4 min-h-screen w-full">
      <LeftSideBar view={view} selectedId={physicalId} onViewChange={handleViewChange} onSelect={(id) => updateParams({ physicalId: id })} />

      <div className="flex-1 min-h-0">
        {!physicalId && <EmptyDetailState />}
        {physicalId && view === 'live' && (
          <LiveOrderDetails query={detailQuery} />
        )}
        {physicalId && (view === 'delivered' || view === 'cancelled') && (
          <OrderDetails query={detailQuery} status={view === 'delivered' ? 'completed' : 'canceled'} />
        )}
      </div>
    </div>
  )
}