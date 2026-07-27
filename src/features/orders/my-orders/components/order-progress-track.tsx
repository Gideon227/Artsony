import { Check, Truck, X } from 'lucide-react'
import { getTimelineProgress } from '../constant'
import type { DeliveryStatus, TimelineStatus } from '@/types/order'
import { cn } from '@/lib/utils'

interface Props {
  deliveryStatus: DeliveryStatus
  timelineStatus: TimelineStatus
}

const TRACK_COLOR: Record<DeliveryStatus, string> = {
  LIVE: 'bg-info-500',
  CANCELLED: 'bg-error-500',
  DELIVERED: 'bg-successful-500',
}

const DOT_COLOR: Record<DeliveryStatus, string> = {
  LIVE: 'bg-info-500',
  CANCELLED: 'bg-error-500',
  DELIVERED: 'bg-successful-500',
}

export function OrderProgressTrack({ deliveryStatus, timelineStatus }: Props) {
  const progress = deliveryStatus === 'LIVE' ? getTimelineProgress(timelineStatus) : 1
  const percent = `${Math.max(progress, 0.04) * 100}%`

  return (
    <div className="relative flex items-center h-6 w-full" role="progressbar" aria-valuenow={Math.round(progress * 100)}>
      <div className="absolute inset-y-0 left-0 right-0 my-auto h-[2px] bg-gray-50 rounded-full" />
      <div
        className={cn('absolute left-0 my-auto h-[2px] rounded-full transition-all', TRACK_COLOR[deliveryStatus])}
        style={{ width: percent }}
      />
      <span className={cn('absolute left-0 w-2.5 h-2.5 rounded-full', DOT_COLOR[deliveryStatus])} />

      {deliveryStatus === 'LIVE' && (
        <span
          className="absolute -translate-x-1/2 w-6 h-6 rounded-full bg-info-500 flex items-center justify-center"
          style={{ left: percent }}
        >
          <Truck size={14} className="text-white" />
        </span>
      )}
      {deliveryStatus === 'DELIVERED' && (
        <span className="absolute right-0 w-5 h-5 rounded-full bg-successful-500 flex items-center justify-center">
          <Check size={12} className="text-white" />
        </span>
      )}
      {deliveryStatus === 'CANCELLED' && (
        <span className="absolute right-0 w-5 h-5 rounded-full bg-error-500 flex items-center justify-center">
          <X size={12} className="text-white" />
        </span>
      )}
    </div>
  )
}