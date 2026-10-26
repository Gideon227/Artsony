import { Bus, Check, X } from 'lucide-react'
import { getTimelineProgress } from '../constant'
import type { DeliveryStatus, TimelineStatus } from '@/types/physical-order'
import { cn } from '@/lib/utils'

interface Props {
  deliveryStatus: DeliveryStatus
  timelineStatus: TimelineStatus
}

const TONE: Record<DeliveryStatus, { line: string; dot: string }> = {
  LIVE: { line: 'bg-info-500', dot: 'bg-info-500' },
  DELIVERED: { line: 'bg-successful-500', dot: 'bg-successful-500' },
  CANCELLED: { line: 'bg-error-500', dot: 'bg-error-500' },
}

// End caps are rings with a centre dot, as in the card design.
function RingDot({ className }: { className: string }) {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-gray-50 bg-white">
      <span className={cn('h-2.5 w-2.5 rounded-full', className)} />
    </span>
  )
}

export function MobileProgressTrack({ deliveryStatus, timelineStatus }: Props) {
  const tone = TONE[deliveryStatus]
  const isLive = deliveryStatus === 'LIVE'
  // Keep the bus clear of both end caps.
  const percent = Math.min(Math.max(getTimelineProgress(timelineStatus), 0.08), 0.92) * 100

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={isLive ? Math.round(percent) : 100}
      className="flex h-6 w-full items-center gap-1"
    >
      <RingDot className={tone.dot} />

      <div className="relative h-6 flex-1">
        {isLive ? (
          <>
            <span
              className={cn('absolute left-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full', tone.line)}
              style={{ width: `${percent}%` }}
            />
            <span
              className="absolute right-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-gray-100"
              style={{ width: `${100 - percent}%` }}
            />
            <span
              className="absolute top-1/2 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-info-500 text-white"
              style={{ left: `${percent}%` }}
            >
              <Bus size={14} aria-hidden="true" />
            </span>
          </>
        ) : (
          <span className={cn('absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full', tone.line)} />
        )}
      </div>

      {isLive && <RingDot className="bg-gray-400" />}
      {deliveryStatus === 'DELIVERED' && (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-successful-500 text-white">
          <Check size={12} strokeWidth={3} aria-hidden="true" />
        </span>
      )}
      {deliveryStatus === 'CANCELLED' && (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-error-500 text-white">
          <X size={12} strokeWidth={3} aria-hidden="true" />
        </span>
      )}
    </div>
  )
}
