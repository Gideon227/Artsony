import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Notification } from '@/types'


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type ThumbnailableAsset = {
  media_type: string
  thumbnail_url: string | null
  optimized_url: string | null
  original_url: string | null
}

/**
 * Picks a URL that's actually safe to render as a static <img>/background-image
 * from an artwork's primary asset.
 *
 * `optimized_url`/`original_url` are only a valid stand-in for a thumbnail
 * when the asset itself is an IMAGE. For VIDEO/THREE_D/EXTERNAL_LINK assets
 * those fields point at a video file, a 3D model, or an external resource —
 * none of which a browser can paint as an image. Falling back to them anyway
 * is what caused some featured/video artworks to render as a blank black
 * tile in the hero and grid sections (a CSS background-image or <img> just
 * silently fails to paint a non-image URL). Use this helper anywhere an
 * artwork's assets array is turned into a display image, instead of
 * re-deriving the fallback chain inline.
 */
export function getDisplayThumbnail(
  assets: ThumbnailableAsset[] | null | undefined,
  fallback = '/placeholder.png',
): string {
  const primary = assets?.[0]
  if (!primary) return fallback

  if (primary.media_type !== 'IMAGE') {
    return primary.thumbnail_url ?? fallback
  }

  return primary.thumbnail_url ?? primary.optimized_url ?? primary.original_url ?? fallback
}

/**
 * Source for painting an asset in a viewer. IMAGE and VIDEO assets render
 * their own file; every other type (PDF, 3D model, external link) can only be
 * shown through its generated thumbnail, and has none when it was never made.
 */
export function getAssetDisplaySrc(
  asset: ThumbnailableAsset | null | undefined,
): string | null {
  if (!asset) return null
  if (asset.media_type === 'IMAGE' || asset.media_type === 'VIDEO') {
    return asset.optimized_url ?? asset.original_url ?? null
  }
  return asset.thumbnail_url ?? null
}

export function formatPrice(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return `${str.slice(0, maxLength).trimEnd()}…`
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function isServer(): boolean {
  return typeof window === 'undefined'
}

export function noop(): void {}

export function assertUnreachable(x: never): never {
  throw new Error(`Unexpected value: ${String(x)}`)
}

// ─── Label copy per notification type ─────────────────────────────────────────

export const NOTIFICATION_LABELS: Record<Notification['type'], string> = {
  like: 'liked your artwork',
  comment: 'commented on your artwork',
  reply: 'replied to your comment',
  follow: 'started following you',
  sale: 'purchased your artwork',
  message: 'New Message',
  order_update: 'updated your order',
  system: 'Artsony',
  broadcast: 'Artsony',
  mention: 'mentioned you',
  review: 'left a review',
}

// ─── Icon SVG paths for each type (used in NotificationIcon component) ────────

export type NotificationIconType = Notification['type']

// ─── Group label shown above each time-bucket ─────────────────────────────────

export type NotificationGroup = {
  label: string
  items: Notification[]
}

/**
 * Bucket notifications into Today / This Week / Earlier.
 * Returns groups in display order with non-empty buckets only.
 */
export function groupNotifications(notifications: Notification[]): NotificationGroup[] {
  const now   = Date.now()
  const DAY   = 86_400_000
  const WEEK  = 7 * DAY

  const today: Notification[]    = []
  const week: Notification[]     = []
  const earlier: Notification[]  = []

  for (const n of notifications) {
    const age = now - new Date(n.created_at).getTime()
    if (age < DAY)       today.push(n)
    else if (age < WEEK) week.push(n)
    else                 earlier.push(n)
  }

  const groups: NotificationGroup[] = []
  if (today.length)   groups.push({ label: 'Today',     items: today })
  if (week.length)    groups.push({ label: 'This Week',  items: week })
  if (earlier.length) groups.push({ label: 'Earlier',   items: earlier })

  return groups
}

/** Human-friendly relative time — matches the design's "2h ago", "3d ago" etc. */
export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m    = Math.floor(diff / 60_000)
  const h    = Math.floor(diff / 3_600_000)
  const d    = Math.floor(diff / 86_400_000)
  const w    = Math.floor(diff / 604_800_000)

  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  if (d < 7)  return `${d}d ago`
  return `${w}w ago`
}

export function formatOrdinalDate(dateString: string): string {
  const date = new Date(dateString)
  const day = date.getDate()
  const suffix = (d: number) => {
    if (d > 3 && d < 21) return 'th'
    switch (d % 10) {
      case 1: return 'st'
      case 2: return 'nd'
      case 3: return 'rd'
      default: return 'th'
    }
  }
  const month = date.toLocaleDateString('en-US', { month: 'long' })
  return `${day}${suffix(day)} ${month}, ${date.getFullYear()}`
}