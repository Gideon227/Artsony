import type { BuyerOrderView } from '@/types/physical-order'

export { EMPTY_COPY, REFUND_PRESENTATION } from '../constant'

// The mobile design lists the tabs as Live / Delivered / Canceled. The desktop
// order (Delivered / Live / Canceled) lives in ../constant and is untouched.
export const MOBILE_ORDER_TABS: { value: BuyerOrderView; label: string }[] = [
  { value: 'live', label: 'Live' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Canceled' },
]

// Where "Artsony's policy" in the cancel confirmation points. Swap for the
// real refund-policy page when one exists.
export const REFUND_POLICY_HREF = '/help'
