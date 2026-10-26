import type { BuyerOrderView, RefundStatus } from '@/types/physical-order'

// The mobile design lists the tabs as Live / Delivered / Canceled. The desktop
// order (Delivered / Live / Canceled) lives in ../constant and is untouched.
export const MOBILE_ORDER_TABS: { value: BuyerOrderView; label: string }[] = [
  { value: 'live', label: 'Live' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Canceled' },
]

export const EMPTY_COPY: Record<BuyerOrderView, string> = {
  all: 'No orders yet.',
  delivered: 'No delivered orders yet.',
  live: 'No live orders right now.',
  cancelled: 'No canceled orders.',
}

// Where "Artsony's policy" in the cancel confirmation points. Swap for the
// real refund-policy page when one exists.
export const REFUND_POLICY_HREF = '/help'

export const REFUND_PRESENTATION: Record<RefundStatus, { label: string; tone: string }> = {
  NONE: { label: 'Not started', tone: 'text-body' },
  PENDING: { label: 'Pending', tone: 'text-warning-500' },
  PROCESSING: { label: 'In Progress', tone: 'text-info-500' },
  COMPLETED: { label: 'Completed', tone: 'text-successful-500' },
  PARTIAL: { label: 'Partially refunded', tone: 'text-info-500' },
  FAILED: { label: 'Failed', tone: 'text-error-500' },
}
