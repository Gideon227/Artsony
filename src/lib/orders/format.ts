import type { Order, OrderItem } from '@/types/order'

/**
 * Order.id is a UUID; the design shows a short human-readable code (AR-XXXXXXXX).
 * This is cosmetic only — never use the formatted code for lookups, use order.id.
 */
export function formatOrderCode(orderId: string): string {
  return `AR-${orderId.replace(/-/g, '').slice(0, 8).toUpperCase()}`
}

/**
 * Order has no embedded buyer profile (only buyer_id). shipping_address.full_name
 * is the best available display name for physical orders; digital-only orders
 * fall back to a shortened buyer id until the API exposes a buyer profile join.
 */
export function getBuyerDisplayName(order: Order): string {
  if (order.shipping_address?.full_name) return order.shipping_address.full_name
  return `Buyer #${order.buyer_id.slice(0, 8)}`
}

export function getPrimaryItem(order: Order): OrderItem | null {
  return order.items[0] ?? null
}

export function getArtworkTitleDisplay(order: Order): string {
  const primary = getPrimaryItem(order)
  if (!primary) return '—'
  if (order.items.length === 1) return primary.artwork_title
  return `${primary.artwork_title} +${order.items.length - 1} more`
}

export function getArtworkFormatDisplay(order: Order): string {
  const formats = new Set(order.items.map((item) => item.artwork_format))
  if (formats.size === 0) return '—'
  if (formats.size > 1) return 'Mixed'
  return formats.has('DIGITAL') ? 'Digital' : 'Physical'
}

export function getTotalQuantity(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.quantity, 0)
}

const dateTimeFmt = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})
const timeFmt = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

export function formatOrderDate(isoDate: string): string {
  const date = new Date(isoDate)
  return `${dateTimeFmt.format(date)} - ${timeFmt.format(date)}`
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}