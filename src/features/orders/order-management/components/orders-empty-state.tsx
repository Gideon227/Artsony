import { Button } from '@/components/ui/button'
import { ORDER_ILLUSTRATIONS } from '../constants'
import { IllustrationSlot } from './illustration-slot'

type Props =
  | { kind: 'none' }
  | { kind: 'group'; groupLabel: string }
  | { kind: 'filtered'; onClear: () => void }

export function OrdersEmptyState(props: Props) {
  if (props.kind === 'none') {
    return (
      <section
        aria-labelledby="orders-empty-title"
        className="flex min-h-[560px] flex-1 flex-col items-center justify-center gap-8 rounded-[32px] border border-gray-50 bg-white px-6 py-12 text-center lg:min-h-[calc(100vh-232px)]"
      >
        <IllustrationSlot src={ORDER_ILLUSTRATIONS.empty} alt="No orders illustration" className="aspect-[5/4] max-w-[470px]" />
        <div className="flex max-w-[540px] flex-col gap-4">
          <h2 id="orders-empty-title" className="font-raleway text-h6 font-semibold tracking-wide text-gray-500">
            No Orders Yet
          </h2>
          <p className="font-poppins text-body-s leading-6 tracking-wide text-gray-400">
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
