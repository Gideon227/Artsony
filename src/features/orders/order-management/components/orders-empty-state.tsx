import { Button } from '@/components/ui/button'
import { ORDER_ILLUSTRATIONS } from '../constants'
import { IllustrationSlot } from './illustration-slot'
import Image from 'next/image';

type Props =
  | { kind: 'none' }
  | { kind: 'group'; groupLabel: string }
  | { kind: 'filtered'; onClear: () => void }

export function OrdersEmptyState(props: Props) {
  if (props.kind === 'none') {
    return (
      <section
        aria-labelledby="orders-empty-title"
        className="flex relative min-h-[560px] flex-1 flex-col items-center justify-center gap-8 rounded-[32px] border border-gray-50 bg-white pt-12 pb-24 text-center lg:min-h-[calc(100vh-232px)]"
      >
        <div className='absolute top-10 md:rotate-90' style={{ right: '-60px' }}>
          <Image src='/upload/vector.svg' width={248} height={248} className='max-md:w-8 w-62 h-auto'  alt='vector element' />
        </div>
  
        <div className='absolute md:-rotate-90' style={{ left: '-60px', bottom: '-60px' }}>
          <Image src='/upload/vector.svg' width={248} height={248} className='max-md:w-30' alt='vector element' />
        </div>
  
        <Image src={ORDER_ILLUSTRATIONS.empty!} width={400} height={305} alt="Artists illustration" className="" />
              
        <div className="flex max-w-[698px] flex-col gap-4">
          <h2 id="orders-empty-title" className="font-poppins text-h6 font-semibold tracking-wide text-heading">
            No Orders Yet
          </h2>
          <p className="font-poppins text-body-s leading-6 tracking-wide text-body text-center">
            You haven&apos;t received any orders yet. Once buyers purchase your artwork, your orders will appear here so you
            can track and manage them from one place.
          </p>
        </div>
      </section>
    )
  }

  const isFiltered = props.kind === 'filtered'

  return (
    <section
      aria-live="polite"
      className="flex flex-col items-center gap-4 rounded-[32px] border border-gray-50 bg-white px-6 py-16 text-center"
    >
      <h2 className="font-raleway text-h6 font-semibold tracking-wide text-gray-500">
        {isFiltered ? 'No orders match your filters' : `No ${props.groupLabel.toLowerCase()} yet`}
      </h2>
      <p className="max-w-[420px] font-poppins text-body-s leading-6 tracking-wide text-gray-400">
        {isFiltered
          ? 'Try changing or clearing your search and filters.'
          : 'Orders will show up here as soon as they reach this stage.'}
      </p>
      {isFiltered && (
        <Button variant="outline" className="rounded-full px-6 font-poppins" onClick={props.onClear}>
          Clear filters
        </Button>
      )}
    </section>
  )
}
