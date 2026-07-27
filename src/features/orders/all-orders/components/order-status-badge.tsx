import type { OrderStatus } from '@/types/order'
import { Badge } from '@/components/ui/badge'
import { getOrderStatusGroup, STATUS_GROUP_META } from '@/lib/orders/status'

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const group = getOrderStatusGroup(status)
  const meta = STATUS_GROUP_META[group]
  return <Badge variant={meta.badgeVariant}>{meta.badgeLabel}</Badge>
}