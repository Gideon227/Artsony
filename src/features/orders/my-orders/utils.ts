import type { OrderTimelineEvent } from '@/types/order'

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '—'
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDate(iso: string | null | undefined, withTime = false): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  })
}

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return '—'
  const diffMs = Date.now() - new Date(iso).getTime()
  const hrs = Math.floor(diffMs / 3_600_000)
  if (hrs < 1) return 'Just now'
  if (hrs < 24) return `${hrs}hr${hrs > 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

export const SUPPORT_EMAIL = 'support@artsony.io'

export function supportMailto(subject: string): string {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`
}

export function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}.${month}.${date.getFullYear()}`
}

export function getOrderTotal(
  unitPrice: number | null | undefined,
  quantity: number | null | undefined,
  shippingCost: number | null | undefined,
): number {
  return (unitPrice ?? 0) * (quantity ?? 1) + (shippingCost ?? 0)
}

export function formatOrderNumber(orderNumber: string | null | undefined, orderId: string): string {
  return orderNumber ?? orderId.slice(0, 8).toUpperCase()
}

const CANCELLATION_STATUSES: ReadonlySet<string> = new Set(['ORDER_FAILED_TO_CONFIRM', 'DELIVERY_FAILED'])

export function getCancellationEvent(timeline: OrderTimelineEvent[]): OrderTimelineEvent | undefined {
  return timeline
    .filter((event) => CANCELLATION_STATUSES.has(event.timeline_status))
    .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())[0]
}

export function getCancellationReason(event: OrderTimelineEvent | undefined): string | null {
  if (!event) return null
  const reason = event.metadata['reason']
  if (typeof reason === 'string' && reason.trim()) return reason
  return event.notes
}

export function formatActorRole(role: string | null | undefined): string {
  if (!role) return '—'
  return role.charAt(0).toUpperCase() + role.slice(1)
}
