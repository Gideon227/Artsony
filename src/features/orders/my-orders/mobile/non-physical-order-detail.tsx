'use client'

import { MobileDetailScreen } from './detail-parts'
import { NonPhysicalOrderDetailsContent } from '../components/non-physical-order-details'
import type { OrderItemPhysicalListEntry } from '@/types/physical-order'

export function MobileNonPhysicalOrderDetail({ order, onClose }: { order: OrderItemPhysicalListEntry; onClose: () => void }) {
  return (
    <MobileDetailScreen title="Order details" onClose={onClose}>
      <NonPhysicalOrderDetailsContent order={order} />
    </MobileDetailScreen>
  )
}
