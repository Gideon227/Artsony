'use client'

import type { UseQueryResult } from '@tanstack/react-query'
import { MobileCancelledDetail } from './cancelled-detail'
import { MobileDeliveredDetail } from './delivered-detail'
import { MobileDetailScreen, MobileDetailSkeleton } from './detail-parts'
import { MobileLiveDetail } from './live-detail'
import { DetailErrorState } from '../components/detail-error-state'
import type { CommerceApiSuccess } from '@/types/order'
import type { PhysicalOrderDetailView } from '@/types/physical-order'

interface Props {
  query: UseQueryResult<CommerceApiSuccess<PhysicalOrderDetailView>, unknown>
  onClose: () => void
}

// Picks the screen from the order's real delivery status.
export function MobileOrderDetail({ query, onClose }: Props) {
  const { data, isLoading, isError, error, refetch, isFetching } = query

  if (isLoading) {
    return (
      <MobileDetailScreen title="Order details" onClose={onClose}>
        <MobileDetailSkeleton />
      </MobileDetailScreen>
    )
  }

  if (isError || !data) {
    return (
      <MobileDetailScreen title="Order details" onClose={onClose}>
        <DetailErrorState error={error} onRetry={() => void refetch()} />
      </MobileDetailScreen>
    )
  }

  const detail = data.data
  switch (detail.physical.delivery_status) {
    case 'LIVE':
      return <MobileLiveDetail data={detail} onClose={onClose} onRefresh={() => void refetch()} isRefreshing={isFetching} />
    case 'DELIVERED':
      return <MobileDeliveredDetail data={detail} onClose={onClose} />
    case 'CANCELLED':
      return <MobileCancelledDetail data={detail} onClose={onClose} />
  }
}
