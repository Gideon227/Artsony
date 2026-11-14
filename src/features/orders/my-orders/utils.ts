import type { OrderTimelineEvent } from '@/types/order'
import type { OrderItemPhysicalListEntry } from '@/types/physical-order'

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

/** "$ 1,384.34" — the spaced money format used in the order detail panels. */
export function formatSpacedCurrency(amount: number | null | undefined): string {
  if (amount == null) return '—'
  return `$ ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/** "October 13, 2025 1:25pm" — long date followed by a lowercase 12-hour time. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  const day = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const time = date
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    .replace(/\s*(AM|PM)$/i, (_, meridiem: string) => meridiem.toLowerCase())
  return `${day} ${time}`
}

/** "Physical" / "Digital" */
export function formatArtworkType(format: string | null | undefined): string {
  if (!format) return '—'
  return format === 'DIGITAL' ? 'Digital' : 'Physical'
}

/** One-line shipping address: street, city, postal code, state, country. */
export function formatDeliveryAddress(
  address:
    | {
        address_line_1: string
        address_line_2: string | null
        city: string
        state: string
        postal_code: string
        country_code: string
      }
    | null
    | undefined,
): string {
  if (!address) return '—'
  const street = [address.address_line_1, address.address_line_2].filter(Boolean).join(' ')
  return [street, address.city, address.postal_code, address.state, address.country_code].filter(Boolean).join(', ')
}

/** "Size: XL" */
export function formatVariant(
  variant: { variant_name: string; variant_type: string; option_label: string } | null | undefined,
): string {
  if (!variant) return '—'
  return `${variant.variant_name || variant.variant_type}: ${variant.option_label}`
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

// ── Non-physical list entries ─────────────────────────────────────────────────
// My Orders also lists digital purchases and orders whose payment isn't
// confirmed yet. Those have no order_item_physical row, so they can't open the
// physical detail view.

/**
 * True when a real order_item_physical row exists. Only these entries have a
 * physical-order detail view, so this decides detail routing / auto-open.
 */
export function isPhysicalEntry(order: OrderItemPhysicalListEntry): boolean {
  return (order.source ?? 'physical') === 'physical'
}

/**
 * Which card a list entry uses depends only on the artwork's format: a physical
 * artwork always gets the regular order card, a digital one (a download) gets
 * the non-physical card. Payment / order status never changes this.
 */
export function isPhysicalArtwork(order: OrderItemPhysicalListEntry): boolean {
  return order.order_item?.artwork_format !== 'DIGITAL'
}

export type NonPhysicalOrderInfo = {
  label: string
  hint: string
  tone: 'info' | 'success' | 'error'
  href: string | null
}

export function describeNonPhysicalOrder(order: OrderItemPhysicalListEntry): NonPhysicalOrderInfo {
  const status = order.order_status ?? null
  const payment = order.payment_status ?? null

  if (status === 'REFUNDED') {
    return { label: 'Refunded', hint: 'This order was refunded.', tone: 'error', href: null }
  }
  if (status === 'CANCELLED') {
    const hint =
      payment === 'EXPIRED' ? 'The payment window expired before payment was confirmed.' :
      payment === 'FAILED'  ? 'We could not verify your payment.' :
      'This order was canceled.'
    return { label: 'Canceled', hint, tone: 'error', href: null }
  }
  if (status === 'PENDING_PAYMENT') {
    if (payment === 'CONFIRMING') {
      return { label: 'Verifying payment', hint: 'We are checking your transaction on-chain. This can take a few minutes.', tone: 'info', href: null }
    }
    if (payment === 'FAILED') {
      return { label: 'Payment failed', hint: 'We could not verify your transaction. Contact support if you already paid.', tone: 'error', href: null }
    }
    if (payment === 'EXPIRED') {
      return { label: 'Payment expired', hint: 'The payment window expired before payment was confirmed.', tone: 'error', href: null }
    }
    return { label: 'Awaiting payment', hint: 'Your order is placed but payment has not been submitted yet.', tone: 'info', href: null }
  }
  if (order.source === 'digital') {
    return { label: 'Ready to download', hint: 'Open your downloads to get your files.', tone: 'success', href: '/my-orders/downloads' }
  }
  return { label: 'Payment confirmed', hint: 'Your order is being set up and will show full tracking shortly.', tone: 'info', href: null }
}
