import type { DropdownOption } from '@/components/ui/dropdown'
import type { SellerStatus } from '@/types/seller-sales'
import { PRICE_RANGES, type StatusFilter } from './lib/filters'

export const ORDER_MANAGEMENT_HREF = '/order-management'
export const SELLER_REGISTRATION_HREF = '/seller-registration'

export type StatusTab = { id: StatusFilter; label: string; icon: string }

export const STATUS_TABS: readonly StatusTab[] = [
  { id: 'ALL', label: 'All Orders', icon: '/home/box-black.svg' },
  { id: 'LIVE', label: 'Live Orders', icon: '/icons/bus.svg' },
  { id: 'PENDING', label: 'Pending Orders', icon: '/icons/hourglass.svg' },
  { id: 'COMPLETED', label: 'Completed Orders', icon: '/home/delivery.svg' },
  { id: 'CANCELLED', label: 'Canceled Orders', icon: '/icons/notification-cancel.svg' },
]

export const STATUS_LABELS: Record<SellerStatus, string> = {
  LIVE: 'Live',
  PENDING: 'Pending',
  COMPLETED: 'Delivered',
  CANCELLED: 'Canceled',
}

export const STATUS_FILTER_OPTIONS: DropdownOption[] = [
  { id: 'LIVE', label: STATUS_LABELS.LIVE },
  { id: 'COMPLETED', label: STATUS_LABELS.COMPLETED },
  { id: 'PENDING', label: STATUS_LABELS.PENDING },
  { id: 'CANCELLED', label: STATUS_LABELS.CANCELLED },
]

export const FORMAT_OPTIONS: DropdownOption[] = [
  { id: 'PHYSICAL', label: 'Physical' },
  { id: 'DIGITAL', label: 'Digital' },
]

export const PRICE_OPTIONS: DropdownOption[] = PRICE_RANGES.map(({ id, label }) => ({ id, label }))

export const SORT_OPTIONS: DropdownOption[] = [
  { id: 'desc', label: 'New to Old' },
  { id: 'asc', label: 'Old to New' },
]

export const ORDER_ILLUSTRATIONS: Record<'seller' | 'empty', string | null> = {
  seller: null,
  empty: null,
}

export const MASTER_DETAIL_PAGE_SIZE = 10

// Destinations for the packaging guidance links on the pending screen. They stay
// null until the guideline and shipping-policy pages exist, and render as plain
// text rather than a dead link.
export const PACKAGING_GUIDELINES_HREF: string | null = null
export const SHIPPING_POLICY_HREF: string | null = null

export const CANCEL_REASONS = [
  'Item damaged or unavailable',
  'Wrong listing information',
  'Unable to ship within 24 hours',
  'Buyer requested cancellation',
  'Other',
] as const

export const CANCEL_REASON_OTHER = 'Other'

export const REQUIRED_PACKAGING_PHOTOS = 3
export const PACKAGING_ACCEPTED_TYPES = ['image/jpeg', 'image/png'] as const
export const PACKAGING_MAX_BYTES = 50 * 1024 * 1024

// Must match SELLER_COURIERS and SELLER_SERVICE_TYPES on the backend.
export const COURIER_OPTIONS = ['Fedex'] as const
export const SERVICE_TYPE_OPTIONS = [
  { value: 'STANDARD', label: 'Standard (3-5) Days' },
  { value: 'EXPRESS', label: 'Express' },
  { value: 'OVERNIGHT', label: 'Overnight' },
  { value: 'ECONOMY', label: 'Economy' },
] as const
