'use client'

import { useState } from 'react'
import { MobileActionsMenu } from './actions-menu'
import { REFUND_PRESENTATION } from './constants'
import {
  ArtworkImage,
  DateRow,
  DetailSection,
  FieldGrid,
  MetaLine,
  MobileDetailScreen,
  OrderSummaryHeader,
  PillField,
} from './detail-parts'
import {
  formatCurrency,
  formatDate,
  formatOrderNumber,
  getCancellationEvent,
  getCancellationReason,
  getOrderTotal,
  supportMailto,
} from '../utils'
import { openDocumentAfter } from '../open-document'
import { PackagingProofLightbox } from '../components/packaging-proof-lightbox'
import type { OrderActionsMenuItem } from '../ui/order-actions-menu'
import { useDownloadReceipt } from '@/hooks/use-physical-order'
import type { PhysicalOrderDetailView } from '@/types/physical-order'

interface Props {
  data: PhysicalOrderDetailView
  onClose: () => void
}

export function MobileCancelledDetail({ data, onClose }: Props) {
  const [proofOpen, setProofOpen] = useState(false)
  const downloadReceipt = useDownloadReceipt()

  const { physical, order_item, order_number, refund_requests, delivery_proofs, timeline } = data
  const orderNumber = formatOrderNumber(order_number, physical.order_id)
  const total = getOrderTotal(order_item?.unit_price, order_item?.quantity, physical.shipping_cost)
  const latestRefund = refund_requests[refund_requests.length - 1]
  const cancellationEvent = getCancellationEvent(timeline)
  const reason = getCancellationReason(cancellationEvent) ?? latestRefund?.reason ?? null
  const refund = REFUND_PRESENTATION[physical.refund_status] ?? { label: physical.refund_status, tone: 'text-body' }
  const variant = order_item?.variant_snapshot
    ? `${order_item.variant_snapshot.variant_type}: ${order_item.variant_snapshot.option_label}`
    : '—'

  const menuItems: OrderActionsMenuItem[] = [
    {
      id: 'receipt',
      label: 'Download Receipt',
      isPending: downloadReceipt.isPending,
      onSelect: () =>
        void openDocumentAfter(() => downloadReceipt.mutateAsync(physical.id).then((doc) => doc.receipt_url)),
    },
    {
      id: 'proof',
      label: 'View Packaging Proof',
      disabled: delivery_proofs.length === 0,
      onSelect: () => setProofOpen(true),
    },
    {
      id: 'support',
      label: 'Contact Support',
      onSelect: () => window.location.assign(supportMailto(`Order ${orderNumber}`)),
    },
  ]

  return (
    <MobileDetailScreen
      title={order_item?.artwork_title ?? 'Order details'}
      actions={<MobileActionsMenu items={menuItems} />}
      onClose={onClose}
    >
      <OrderSummaryHeader
        dates={
          <>
            <DateRow label="Purchase Date:" value={formatDate(order_item?.created_at, true)} />
            <DateRow
              label="Canceled Date:"
              value={formatDate(cancellationEvent?.occurred_at ?? physical.updated_at, true)}
            />
            <DateRow
              label="Refund Date:"
              value={physical.refund_completed_at ? formatDate(physical.refund_completed_at, true) : 'In Progress'}
              valueClassName={physical.refund_completed_at ? undefined : 'text-info-500'}
            />
          </>
        }
      >
        <MetaLine label="Artwork Type:" value={order_item?.artwork_format === 'DIGITAL' ? 'Digital' : 'Physical'} />
        <MetaLine label="Order ID:" value={orderNumber} />
        <MetaLine label="Status:" value="Cancelled" valueClassName="text-error-500" />
      </OrderSummaryHeader>

      <DetailSection title="Artwork Details">
        <ArtworkImage src={order_item?.artwork_thumbnail_url} alt={order_item?.artwork_title ?? 'Artwork'} />
        <FieldGrid>
          <PillField label="Quantity" value={String(order_item?.quantity ?? 1)} />
          <PillField label="Shipping Cost" value={formatCurrency(physical.shipping_cost)} />
          <PillField label="Variant" value={variant} />
          <PillField label="Total Cost" value={formatCurrency(total)} />
          <PillField label="Artwork Cost" value={formatCurrency(order_item?.unit_price)} />
        </FieldGrid>
      </DetailSection>

      <DetailSection title="Shipping Details">
        <PillField label="Courier" value={physical.courier_name ?? '—'} />
        <PillField label="Tracking ID:" value={physical.tracking_id ?? '—'} />
        <PillField label="Service Type" value={physical.courier_service_type ?? 'Not Activated'} />
        <PillField label="Pickup Address:" value={physical.pickup_address ?? '—'} />
      </DetailSection>

      <DetailSection title="Cancellation Details">
        <PillField label="Reason" value={reason ?? '—'} />
        <PillField label="Refund Status" value={refund.label} valueClassName={refund.tone} />
        <PillField label="Refund Amount" value={formatCurrency(physical.refund_amount)} />
      </DetailSection>

      <PackagingProofLightbox proofs={delivery_proofs} startIndex={0} open={proofOpen} onClose={() => setProofOpen(false)} />
    </MobileDetailScreen>
  )
}
