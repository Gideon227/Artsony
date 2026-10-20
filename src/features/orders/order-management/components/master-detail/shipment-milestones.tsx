import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MILESTONES } from '../../lib/detail'
import { IllustrationSlot } from '../illustration-slot'

type Props = { activeIndex: number }

function Marker({ state }: { state: 'done' | 'active' | 'upcoming' }) {
  return (
    <span
      className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 bg-white',
        state === 'done' && 'border-primary-500 bg-primary-500 text-white',
        state === 'active' && 'border-primary-500',
        state === 'upcoming' && 'border-gray-100',
      )}
    >
      {state === 'done' && <Check className="h-4 w-4" aria-hidden="true" />}
    </span>
  )
}

function stateOf(index: number, activeIndex: number) {
  return index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'upcoming'
}

export function ShipmentMilestones({ activeIndex }: Props) {
  return (
    <>
      <ol aria-label="Shipment progress" className="hidden gap-4 overflow-x-auto pb-4 md:flex">
        {MILESTONES.map((milestone, index) => {
          const state = stateOf(index, activeIndex)
          return (
            <li
              key={milestone.id}
              aria-current={state === 'active' ? 'step' : undefined}
              className="flex min-w-[200px] flex-1 flex-col items-center gap-3 text-center"
            >
              <div className={cn('w-full rounded-[16px] border-2 p-1', state === 'active' ? 'border-primary-500' : 'border-transparent')}>
                <IllustrationSlot src={null} alt={milestone.title} className="h-[110px] rounded-[12px]" />
              </div>
              <p className="font-poppins text-body-s font-semibold tracking-wide text-gray-500">{milestone.title}</p>
              <p className="max-w-[200px] font-poppins text-body-xxs leading-4 tracking-wide text-gray-300">{milestone.description}</p>
              <div className="flex w-full items-center">
                <span className={cn('h-[2px] flex-1', index === 0 ? 'bg-transparent' : index <= activeIndex ? 'bg-primary-500' : 'border-t-2 border-dashed border-gray-100')} />
                <Marker state={state} />
                <span className={cn('h-[2px] flex-1', index === MILESTONES.length - 1 ? 'bg-transparent' : index < activeIndex ? 'bg-primary-500' : 'border-t-2 border-dashed border-gray-100')} />
              </div>
            </li>
          )
        })}
      </ol>

      <ol aria-label="Shipment progress" className="flex flex-col rounded-[24px] border border-gray-50 p-4 md:hidden">
        {MILESTONES.map((milestone, index) => {
          const state = stateOf(index, activeIndex)
          return (
            <li key={milestone.id} aria-current={state === 'active' ? 'step' : undefined} className="flex gap-4">
              <div className="flex flex-col items-center">
                <Marker state={state} />
                {index < MILESTONES.length - 1 && (
                  <span className={cn('my-1 w-[2px] flex-1', index < activeIndex ? 'bg-primary-500' : 'bg-gray-50')} />
                )}
              </div>
              <div className={cn('flex flex-col gap-1', index < MILESTONES.length - 1 && 'pb-6')}>
                <p className="font-poppins text-body-s font-medium tracking-wide text-gray-500">{milestone.title}</p>
                <p className="font-poppins text-body-xs tracking-wide text-gray-300">{milestone.description}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </>
  )
}
