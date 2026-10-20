import type { SellerSaleDetail } from '@/types/seller-sales'
import { PACKAGING_GUIDELINES_HREF } from '../constants'

export type MenuActionId = 'shipping-label' | 'packaging-proof' | 'invoice' | 'cancel' | 'guidelines' | 'support'

export type MenuAction = { id: MenuActionId; label: string; disabled: boolean }

const SUPPORT: MenuAction = { id: 'support', label: 'Contact Support', disabled: false }

// Shipping label and packaging proof are produced by the activation flow, so
// they are only enabled once an order has gone through it.
export function getMenuActions(detail: SellerSaleDetail): MenuAction[] {
  const isPhysical = detail.artwork_format === 'PHYSICAL'
  const canInvoice = detail.physical_id !== null
  const label: MenuAction = { id: 'shipping-label', label: 'View Shipping Label', disabled: !detail.label_available }
  const proof: MenuAction = { id: 'packaging-proof', label: 'View Packaging Proof', disabled: detail.packaging_proofs.length === 0 }

  switch (detail.seller_status) {
    case 'PENDING':
      return [
        { id: 'guidelines', label: 'Packaging Guidelines', disabled: PACKAGING_GUIDELINES_HREF === null },
        { id: 'cancel', label: 'Cancel Order', disabled: false },
        SUPPORT,
      ]
    case 'LIVE':
      return [
        label,
        proof,
        { id: 'invoice', label: 'Download Invoice / Receipt', disabled: !canInvoice },
        SUPPORT,
      ]
    case 'COMPLETED':
      return [
        ...(isPhysical ? [label, proof] : []),
        { id: 'invoice', label: 'Download Invoice', disabled: !canInvoice },
        SUPPORT,
      ]
    case 'CANCELLED':
      return [{ id: 'invoice', label: 'Download Invoice', disabled: !canInvoice }, SUPPORT]
  }
}
