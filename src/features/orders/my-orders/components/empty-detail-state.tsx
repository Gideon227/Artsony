import { PackageSearch } from 'lucide-react'
import { OrdersEmptyState } from './orders-empty-state'
import { EMPTY_COPY } from '../constant'
import type { BuyerOrderView } from '@/types/physical-order'

interface Props {
  view: BuyerOrderView
  /** A search is active, so "no orders" means "no matches". */
  searching: boolean
  /** The list has entries (e.g. digital ones) but none can be opened here. */
  hasEntries: boolean
}

// Second sentence of the "No Orders Yet" copy: the first one ("You haven't purchased
// any artwork yet") would be wrong when the buyer simply has nothing in this tab.
const TAB_EMPTY_DESCRIPTION =
  'Visit the Artsony Store to discover original artwork from creators around the world and find something that speaks to you.'

/**
 * Right-hand side of the orders page when there is no order to show:
 * the same empty-orders design used when the buyer has no orders at all.
 */
export function EmptyDetailState({ view, searching, hasEntries }: Props) {
  if (hasEntries) {
    return (
      <div className="flex min-h-[400px] flex-1 flex-col items-center justify-center gap-y-3 rounded-xl border-2 border-gray-50 bg-white text-center">
        <PackageSearch size={40} className="text-gray-200" />
        <p className="font-poppins text-body-s text-body">Select an order to view its details</p>
      </div>
    )
  }

  return (
    <OrdersEmptyState
      embedded
      title={searching ? 'No orders match your search.' : EMPTY_COPY[view]}
      description={TAB_EMPTY_DESCRIPTION}
    />
  )
}
