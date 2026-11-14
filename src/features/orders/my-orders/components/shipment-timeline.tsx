import { Check } from 'lucide-react'
import { TIMELINE_MILESTONES, TIMELINE_SEQUENCE } from '../constant'
import type { TimelineStatus } from '@/types/order'
import { cn } from '@/lib/utils'
import Image from 'next/image'

export function ShipmentTimeline({ status }: { status: TimelineStatus }) {
  const activeIndex = Math.max(
    TIMELINE_MILESTONES.findIndex((m) => m.statuses.includes(status)),
    0,
  )

  return (
    <div className="flex flex-col gap-y-6 overflow-x-auto pb-4">
      <div className="flex gap-x-4 pb-1">
        {TIMELINE_MILESTONES.map((milestone, i) => (
          <div key={milestone.title} className="flex flex-col items-center gap-y-3 min-w-[180px]">
            <div
              className={cn(
                'w-full rounded-xl border-2 flex items-center justify-center',
                i === activeIndex ? 'border-error-500' : 'border-transparent',
              )}
            >
              <Image src={i < activeIndex ? milestone.activeIcon : milestone.icon } width={162} height={104} alt='order timeline' />
            </div>
            <p className="font-poppins font-semibold text-body-s text-body text-center">{milestone.title}</p>
            <p className="font-poppins text-body-xxs text-gray-200 text-center leading-4">{milestone.description}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center w-full">
        {TIMELINE_MILESTONES.map((_, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <span
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 m-1',
                i < activeIndex && 'bg-error-500 border-gray-100 ring ring-offset-2 ring-error-500',
                i === activeIndex && 'border-gray-100 ring ring-offset-2 ring-error-500  bg-white',
                i > activeIndex && 'border-gray-100 bg-white',
              )}
            >
              {i < activeIndex && <Check size={14} className="text-white" />}
            </span>
            {i < TIMELINE_MILESTONES.length - 1 && (
              <span className={cn('border-2 border-dashed flex-1', i < activeIndex ? 'border-error-500' : 'border-gray-100')} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}