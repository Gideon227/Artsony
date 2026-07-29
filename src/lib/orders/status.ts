import type { OrderStatus } from '@/types/order'
import type { BadgeVariant } from '@/components/ui/badge'

export type OrderStatusGroup = 'LIVE' | 'PENDING' | 'COMPLETED' | 'CANCELLED'

export const STATUS_GROUP_ORDER_STATUSES: Record<OrderStatusGroup, OrderStatus[]> = {
  PENDING: ['PENDING_PAYMENT', 'PAYMENT_CONFIRMED'],
  LIVE: ['PROCESSING', 'SHIPPED'],
  COMPLETED: ['FULFILLED', 'COMPLETED'],
  CANCELLED: ['CANCELLED', 'REFUNDED'],
}

const STATUS_TO_GROUP: Record<OrderStatus, OrderStatusGroup> = Object.entries(
  STATUS_GROUP_ORDER_STATUSES
).reduce((acc, [group, statuses]) => {
  statuses.forEach((status) => {
    acc[status] = group as OrderStatusGroup
  })
  return acc
}, {} as Record<OrderStatus, OrderStatusGroup>)

export function getOrderStatusGroup(status: OrderStatus): OrderStatusGroup {
  return STATUS_TO_GROUP[status] ?? 'PENDING'
}

export type StatusGroupMeta = {
  /** Label used in the "Order Management" sidebar nav */
  sidebarLabel: string
  badgeLabel: string
  badgeVariant: BadgeVariant
}

export const STATUS_GROUP_META: Record<OrderStatusGroup, StatusGroupMeta> = {
  LIVE: { sidebarLabel: 'Live Orders', badgeLabel: 'Live', badgeVariant: 'info' },
  PENDING: { sidebarLabel: 'Pending Orders', badgeLabel: 'Pending', badgeVariant: 'warning' },
  COMPLETED: { sidebarLabel: 'Completed Orders', badgeLabel: 'Delivered', badgeVariant: 'success' },
  CANCELLED: { sidebarLabel: 'Canceled Orders', badgeLabel: 'Canceled', badgeVariant: 'error' },
}

export const STATUS_GROUP_VALUES: OrderStatusGroup[] = ['LIVE', 'PENDING', 'COMPLETED', 'CANCELLED']