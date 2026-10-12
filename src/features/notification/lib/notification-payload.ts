import type { Notification } from '@/types'

export const NOTIFICATION_EVENTS = [
  'order_received',
  'order_confirmed',
  'shipment_activated',
  'pickup_scheduled',
  'order_in_transit',
  'order_delivered',
  'delivery_issue',
  'refund',
  'buyer_refund',
  'funds_available',
  'withdrawal_requested',
  'withdrawal_completed',
  'withdrawal_failed',
  'artwork_approved',
  'artwork_rejected',
  'artwork_sold_out',
  'artwork_removed',
  'login_alert',
  'password_updated',
  'policy_update',
] as const

export type NotificationEvent = (typeof NOTIFICATION_EVENTS)[number]
export type NotificationAudience = 'buyer' | 'seller' | 'admin'

export type NotificationArtwork = {
  id: string
  slug: string
  title: string
  thumbnailUrl: string | null
}

export type NotificationPayload = {
  body: string | null
  event: NotificationEvent | null
  audience: NotificationAudience | null
  orderId: string | null
  physicalId: string | null
  artwork: NotificationArtwork | null
  amount: number | null
  currency: string
  preview: string | null
  policy: { name: string; href: string } | null
}

const EVENT_SET: ReadonlySet<string> = new Set(NOTIFICATION_EVENTS)

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const str = (v: unknown): string | null => (typeof v === 'string' && v.length > 0 ? v : null)

const num = (v: unknown): number | null => {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : Number.NaN
  return Number.isFinite(n) ? n : null
}

function parseEvent(v: unknown): NotificationEvent | null {
  return typeof v === 'string' && EVENT_SET.has(v) ? (v as NotificationEvent) : null
}

function parseAudience(v: unknown): NotificationAudience | null {
  return v === 'buyer' || v === 'seller' || v === 'admin' ? v : null
}

function parseArtwork(v: unknown): NotificationArtwork | null {
  if (!isRecord(v)) return null
  const id = str(v['id'])
  const title = str(v['title'])
  if (!id || !title) return null
  return { id, slug: str(v['slug']) ?? '', title, thumbnailUrl: str(v['thumbnail_url']) }
}

function parsePolicy(v: unknown): { name: string; href: string } | null {
  if (!isRecord(v)) return null
  const name = str(v['name'])
  const href = str(v['href'])
  return name && href ? { name, href } : null
}

export function parseNotificationPayload(notification: Notification): NotificationPayload {
  const data: Record<string, unknown> = isRecord(notification.data) ? notification.data : {}
  const isOrder = notification.entity_type === 'order'

  return {
    body: str(data['body']),
    event: parseEvent(data['event']),
    audience: parseAudience(data['audience']),
    orderId: str(data['order_id']) ?? (isOrder ? notification.entity_id : null),
    physicalId: str(data['physical_id']),
    artwork: parseArtwork(data['artwork']),
    amount: num(data['refund_amount']) ?? num(data['amount']),
    currency: str(data['currency']) ?? 'USDT',
    preview: str(data['preview']),
    policy: parsePolicy(data['policy']),
  }
}
