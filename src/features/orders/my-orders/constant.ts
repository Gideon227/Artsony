import { createElement } from 'react'
import { PackageCheck, ClipboardCheck, Clock, Truck, MapPin, Home } from 'lucide-react'
import type { BuyerOrderView, DeliveryStatus, TimelineStatus } from '@/types/order'

export const ORDER_TABS: { value: BuyerOrderView; label: string }[] = [
  { value: 'delivered', label: 'Delivered' },
  { value: 'live', label: 'Live' },
  { value: 'cancelled', label: 'Canceled' },
]

export const STATUS_PILL: Record<DeliveryStatus, { bg: string; text: string; label: string }> = {
  LIVE: { bg: 'bg-info-50', text: 'text-info-500', label: 'Live' },
  CANCELLED: { bg: 'bg-error-50', text: 'text-error-500', label: 'Canceled' },
  DELIVERED: { bg: 'bg-successful-50', text: 'text-successful-500', label: 'Delivered' },
}

export const TIMELINE_SEQUENCE: TimelineStatus[] = [
  'ORDER_RECEIVED',
  'ORDER_RECEIVED_ACTIVE',
  'AWAITING_CONFIRMATION',
  'AWAITING_CONFIRMATION_ACTIVE',
  'AWAITING_PICKUP',
  'AWAITING_PICKUP_ACTIVE',
  'PICKED_UP',
  'PICKED_UP_ACTIVE',
  'IN_TRANSIT',
  'IN_TRANSIT_ACTIVE',
  'OUT_FOR_DELIVERY',
  'OUT_FOR_DELIVERY_ACTIVE',
  'DELIVERED',
]

const FAILURE_FALLBACK: Partial<Record<TimelineStatus, TimelineStatus>> = {
  ORDER_FAILED_TO_CONFIRM: 'AWAITING_CONFIRMATION',
  PICKUP_FAILED: 'AWAITING_PICKUP',
  COURIER_REJECTED_PICKUP: 'AWAITING_PICKUP',
  DELAYED_DELIVERY: 'IN_TRANSIT_ACTIVE',
  DELIVERY_FAILED: 'OUT_FOR_DELIVERY_ACTIVE',
}

export function getTimelineProgress(status: TimelineStatus): number {
  const resolved = FAILURE_FALLBACK[status] ?? status
  const index = TIMELINE_SEQUENCE.indexOf(resolved)
  if (index === -1) return 0
  return index / (TIMELINE_SEQUENCE.length - 1)
}

interface TimelineMilestone {
  statuses: TimelineStatus[]
  title: string
  description: string
  Icon: typeof PackageCheck
}

export const TIMELINE_MILESTONES: TimelineMilestone[] = [
  {
    statuses: ['ORDER_RECEIVED', 'ORDER_RECEIVED_ACTIVE'],
    title: 'Order Received',
    description: 'Your order has been received and is being prepared',
    Icon: PackageCheck,
  },
  {
    statuses: ['AWAITING_CONFIRMATION', 'AWAITING_CONFIRMATION_ACTIVE', 'ORDER_FAILED_TO_CONFIRM'],
    title: 'Awaiting Activation',
    description: 'Your order is being prepared and will be activated soon',
    Icon: ClipboardCheck,
  },
  {
    statuses: ['AWAITING_PICKUP', 'AWAITING_PICKUP_ACTIVE', 'PICKUP_FAILED', 'COURIER_REJECTED_PICKUP'],
    title: 'Awaiting Pickup',
    description: 'Your order will be picked up by the courier soon',
    Icon: Clock,
  },
  {
    statuses: ['PICKED_UP', 'PICKED_UP_ACTIVE'],
    title: 'Picked Up',
    description: 'Your order has been picked up and is on its way',
    Icon: Truck,
  },
  {
    statuses: ['IN_TRANSIT', 'IN_TRANSIT_ACTIVE', 'DELAYED_DELIVERY'],
    title: 'In Transit',
    description: 'Your order is on the way to its destination',
    Icon: Truck,
  },
  {
    statuses: ['OUT_FOR_DELIVERY', 'OUT_FOR_DELIVERY_ACTIVE', 'DELIVERY_FAILED'],
    title: 'Out for Delivery',
    description: 'Your order is out for delivery and arriving soon',
    Icon: MapPin,
  },
  {
    statuses: ['DELIVERED'],
    title: 'Delivered',
    description: 'Your order has been delivered successfully',
    Icon: Home,
  },
]