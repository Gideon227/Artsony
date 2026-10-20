import type { SellerSaleDetail } from '@/types/seller-sales'

export type MilestoneId = 'AWAITING_PICKUP' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED'

export type Milestone = { id: MilestoneId; title: string; description: string; statuses: readonly string[] }

export const MILESTONES: readonly Milestone[] = [
  {
    id: 'AWAITING_PICKUP',
    title: 'Awaiting Pickup',
    description: 'Your Shipment will be picked up by the courier soon',
    statuses: ['AWAITING_PICKUP', 'AWAITING_PICKUP_ACTIVE', 'PICKUP_FAILED', 'COURIER_REJECTED_PICKUP'],
  },
  {
    id: 'PICKED_UP',
    title: 'Picked Up',
    description: 'Your Shipment has being picked up and is on its way',
    statuses: ['PICKED_UP', 'PICKED_UP_ACTIVE'],
  },
  {
    id: 'IN_TRANSIT',
    title: 'In Transit',
    description: 'Your Shipment is being processed by the couriers',
    statuses: ['IN_TRANSIT', 'IN_TRANSIT_ACTIVE', 'DELAYED_DELIVERY'],
  },
  {
    id: 'OUT_FOR_DELIVERY',
    title: 'Out for Delivery',
    description: 'Your Shipment is on its way to its final destination',
    statuses: ['OUT_FOR_DELIVERY', 'OUT_FOR_DELIVERY_ACTIVE'],
  },
  {
    id: 'DELIVERED',
    title: 'Delivered',
    description: 'Your Shipment has been delivered at its destination',
    statuses: ['DELIVERED'],
  },
]

export function getMilestoneIndex(timelineStatus: string | null): number {
  const index = MILESTONES.findIndex((milestone) => timelineStatus !== null && milestone.statuses.includes(timelineStatus))
  return index === -1 ? 0 : index
}

export function getProgress(timelineStatus: string | null): number {
  return getMilestoneIndex(timelineStatus) / (MILESTONES.length - 1)
}

export type CountdownParts = { days: number; hours: number; minutes: number; seconds: number; expired: boolean }

export function splitCountdown(deadlineIso: string | null, now: number): CountdownParts {
  const deadline = deadlineIso ? new Date(deadlineIso).getTime() : Number.NaN
  if (!Number.isFinite(deadline)) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  const remaining = Math.max(0, Math.floor((deadline - now) / 1000))
  return {
    days: Math.floor(remaining / 86_400),
    hours: Math.floor((remaining % 86_400) / 3_600),
    minutes: Math.floor((remaining % 3_600) / 60),
    seconds: remaining % 60,
    expired: remaining === 0,
  }
}

export function hoursRemaining(deadlineIso: string | null, now: number): number {
  const deadline = deadlineIso ? new Date(deadlineIso).getTime() : Number.NaN
  if (!Number.isFinite(deadline)) return 0
  return Math.max(0, Math.ceil((deadline - now) / 3_600_000))
}

export function formatDimensions(dimensions: SellerSaleDetail['dimensions']): string {
  if (!dimensions) return '—'
  return `${dimensions.length} x ${dimensions.width} x ${dimensions.height} ${dimensions.unit}`
}

export function formatFileSize(bytes: number | null): string {
  if (bytes === null || !Number.isFinite(bytes) || bytes < 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value >= 100 ? Math.round(value) : Number(value.toFixed(1))} ${units[unit]}`
}

export function fileExtension(mimeType: string): string {
  const subtype = mimeType.split('/')[1]?.split(';')[0]?.trim()
  if (!subtype) return 'FILE'
  return (subtype === 'jpeg' ? 'jpg' : subtype.replace(/^x-/, '')).toUpperCase()
}

export function countryName(code: string | null | undefined): string | null {
  if (!code) return null
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code.toUpperCase()) ?? code
  } catch {
    return code
  }
}

export function formatLocation(location: SellerSaleDetail['delivery_location']): string {
  if (!location) return '—'
  const parts = [location.city, countryName(location.country_code)].filter((part): part is string => Boolean(part))
  return parts.length > 0 ? parts.join(', ') : '—'
}

const SERVICE_LABELS: Record<string, string> = {
  STANDARD: 'Standard (3-5) Days',
  EXPRESS: 'Express',
  OVERNIGHT: 'Overnight',
  ECONOMY: 'Economy',
}

export function courierServiceLabel(serviceType: string | null): string {
  return serviceType ? (SERVICE_LABELS[serviceType] ?? serviceType) : '—'
}

export function cancelledByLabel(actor: string | null): string {
  switch (actor) {
    case 'artist':
      return 'You'
    case 'buyer':
      return 'Buyer'
    case 'admin':
      return 'Artsony'
    case 'system':
      return 'System'
    default:
      return '—'
  }
}

export function formatEventTimestamp(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const time = date
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    .replace(' ', '')
    .toLowerCase()
  return `${day}/${month}/${String(date.getFullYear()).slice(2)}. ${time}`
}

export function formatLongDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  const day = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(' ', '').toLowerCase()
  return `${day} ${time}`
}

export function pad2(value: number): string {
  return String(value).padStart(2, '0')
}
