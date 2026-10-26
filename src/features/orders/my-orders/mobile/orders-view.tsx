'use client'

import type { UseQueryResult } from '@tanstack/react-query'
import { MobileOrderList } from './order-list'
import { MobileOrderDetail } from './order-detail'
import type { OrderSort } from '../constant'
import type { CommerceApiSuccess } from '@/types/order'
import type { BuyerOrderView, OrderItemPhysicalListEntry, PhysicalOrderDetailView } from '@/types/physical-order'

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
  physicalId: string | undefined
  detailQuery: UseQueryResult<CommerceApiSuccess<PhysicalOrderDetailView>, unknown>
  onViewChange: (view: BuyerOrderView) => void
  onSearchChange: (value: string) => void
  onSortChange: (value: OrderSort) => void
  onSelect: (physicalId: string) => void
  onCloseDetail: () => void
  onLoadMore: () => void
  onRetry: () => void
}

// Phone / tablet layout: the order list is its own screen and an opened order
// is a full-screen layer on top of it. Which one shows is driven by the
// `physicalId` URL param, so the browser back button closes an order.
export function MobileOrdersView({ physicalId, detailQuery, onCloseDetail, ...listProps }: Props) {
  return (
    <>
      <MobileOrderList {...listProps} />
      {physicalId && <MobileOrderDetail query={detailQuery} onClose={onCloseDetail} />}
    </>
  )
}
