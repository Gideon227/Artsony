import { getTimelineProgress } from '../constant'
import { BusIcon } from '../ui/bus-icon'
import { CheckGlyph, CrossGlyph } from '../ui/track-glyphs'
import type { DeliveryStatus, TimelineStatus } from '@/types/order'
// clsx (not cn/twMerge): twMerge treats the custom `text-body-*` size tokens as colours
// and would drop them next to a `text-<color>` class.
import { clsx } from 'clsx'

interface Props {
  deliveryStatus: DeliveryStatus
  timelineStatus: TimelineStatus
  /** Keep the courier marker at the very start of the line (trip not started). */
  atStart?: boolean
}

const TONE: Record<DeliveryStatus, { line: string; dot: string; filled: string }> = {
  LIVE: { line: 'bg-info-500', dot: 'bg-info-500', filled: 'bg-info-500' },
  CANCELLED: { line: 'bg-error-500', dot: 'bg-error-500', filled: 'bg-error-500' },
  DELIVERED: { line: 'bg-successful-500', dot: 'bg-successful-500', filled: 'bg-successful-500' },
}

// Keeps a sliver of solid line and of dashes visible at both ends of the trip.
const MIN_PROGRESS = 0.05
const MAX_PROGRESS = 0.95

/** Ringed node: gray ring, 12px dot. */
function RingNode({ dotClassName }: { dotClassName: string }) {
  return (
    <span className="relative flex size-6 shrink-0 rounded-full border-[1.5px] border-gray-50">
      <span className={clsx('absolute inset-0 m-auto size-3 rounded-full', dotClassName)} />
    </span>
  )
}

/** Filled end node (delivered / canceled): 20px disc with a white glyph. */
function FilledNode({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className="flex size-[21px] shrink-0 items-center justify-center">
      <span className={clsx('flex size-5 items-center justify-center rounded-full', className)}>{children}</span>
    </span>
  )
}

export function OrderProgressTrack({ deliveryStatus, timelineStatus, atStart = false }: Props) {
  const tone = TONE[deliveryStatus]
  const isLive = deliveryStatus === 'LIVE'
  const progress = !isLive ? 1 : atStart ? 0 : Math.min(Math.max(getTimelineProgress(timelineStatus), MIN_PROGRESS), MAX_PROGRESS)

  return (
    <div
      className="flex h-6 w-full items-center gap-1 px-px pb-px"
      role="progressbar"
      aria-label="Order progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
    >
      <RingNode dotClassName={tone.dot} />

      {isLive ? (
        <>
          {/* Travelled distance: solid line up to the courier marker. */}
          <span className={clsx('h-0.5 basis-0', tone.line)} style={{ flexGrow: progress }} />
          {/* Marker sits 2px from each line end (the row gap is 4px). */}
          <BusIcon className="-mx-0.5 shrink-0 text-info-500" />
          {/* Remaining distance: dashed. */}
          <span
            className="h-0.5 basis-0 bg-[repeating-linear-gradient(to_right,var(--color-gray-50)_0,var(--color-gray-50)_8px,transparent_8px,transparent_12px)]"
            style={{ flexGrow: 1 - progress }}
          />
          <RingNode dotClassName="bg-gray-400" />
        </>
      ) : (
        <>
          <span className={clsx('h-0.5 flex-1', tone.line)} />
          <FilledNode className={tone.filled}>
            {deliveryStatus === 'DELIVERED' ? <CheckGlyph /> : <CrossGlyph />}
          </FilledNode>
        </>
      )}
    </div>
  )
}
