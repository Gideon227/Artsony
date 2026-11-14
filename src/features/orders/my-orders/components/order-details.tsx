'use client'

import { useState } from 'react'
import { OrderActionsMenu, type OrderActionsMenuItem } from '../ui/order-actions-menu'
import { PackagingProofLightbox } from './packaging-proof-lightbox'
import { useDownloadReceipt } from '@/hooks/use-physical-order'
import { useReviewEligibility } from '@/hooks/use-review'
import { RequestReviewModal } from './request-review-modal'
import { ShareArtworkModal } from '@/features/orders/my-orders/components/share-artwork-modal'
import type { UseQueryResult } from '@tanstack/react-query'
import type { CommerceApiSuccess } from '@/types/order'
import { PhysicalOrderDetailView } from '@/types/physical-order'
import { DetailSkeleton } from './detail-skeleton'
import { DetailErrorState } from './detail-error-state'
import { OrderDetailsView, type DetailField, type DetailLine } from './order-details-view'
import { REFUND_PRESENTATION } from '../constant'
import { courierServiceLabel } from '@/features/orders/order-management/lib/detail'
import {
  formatArtworkType,
  formatDateTime,
  formatDeliveryAddress,
  formatOrderNumber,
  formatSpacedCurrency,
  formatVariant,
  getCancellationEvent,
  getCancellationReason,
  getOrderTotal,
  supportMailto,
} from '../utils'
import { openDocumentAfter } from '@/features/orders/my-orders/open-document'

interface Props {
  query: UseQueryResult<CommerceApiSuccess<PhysicalOrderDetailView>, unknown>
  status: 'completed' | 'canceled'
}

export function OrderDetails({ query, status }: Props) {
  const { data, isLoading, isError, error, refetch } = query
  const [proofOpen, setProofOpen] = useState(false)
  const [proofStartIndex, setProofStartIndex] = useState(0)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const downloadReceipt = useDownloadReceipt()
  const orderItemId = data?.data.order_item?.id
  const eligibility = useReviewEligibility(orderItemId, status === 'completed')

  if (isLoading) return <DetailSkeleton />
  if (isError || !data) return <DetailErrorState error={error} onRetry={refetch} />

  const { physical, order_item, order_number, delivery_address, refund_requests, delivery_proofs, timeline } = data.data
  const orderNumber = formatOrderNumber(order_number, physical.order_id)
  const total = getOrderTotal(order_item?.unit_price, order_item?.quantity, physical.shipping_cost)
  const latestRefund = refund_requests[refund_requests.length - 1]
  const cancellationEvent = getCancellationEvent(timeline)
  const cancellationReason = getCancellationReason(cancellationEvent) ?? latestRefund?.reason ?? null
  const alreadyReviewed = eligibility.data?.eligible === false && eligibility.data.reason === 'Already reviewed'
  const refund = REFUND_PRESENTATION[physical.refund_status] ?? { label: physical.refund_status, tone: 'text-body' }

  // A receipt needs a real physical row (a provisional order was never paid).
  const receiptItems: OrderActionsMenuItem[] = data.data.is_provisional
    ? []
    : [
        {
          id: 'receipt',
          label: 'Download Receipt',
          isPending: downloadReceipt.isPending,
          onSelect: () =>
            void openDocumentAfter(() => downloadReceipt.mutateAsync(physical.id).then((doc) => doc.receipt_url)),
        },
      ]

  const contactSupportItem: OrderActionsMenuItem = {
    id: 'support',
    label: 'Contact Support',
    onSelect: () => window.location.assign(supportMailto(`Order ${orderNumber}`)),
  }

  const openProof = (index: number) => {
    setProofStartIndex(index)
    setProofOpen(true)
  }

  const menuItems: OrderActionsMenuItem[] =
    status === 'canceled'
      ? [
          ...receiptItems,
          {
            id: 'proof',
            label: 'View Packaging Proof',
            disabled: delivery_proofs.length === 0,
            onSelect: () => openProof(0),
          },
          contactSupportItem,
        ]
      : [
          ...receiptItems,
          {
            id: 'review',
            label: alreadyReviewed ? 'Review Submitted' : 'Leave a Review',
            disabled: eligibility.data?.eligible === false,
            onSelect: () => setReviewOpen(true),
          },
          { id: 'share', label: 'Share Artwork', disabled: !order_item, onSelect: () => setShareOpen(true) },
          contactSupportItem,
        ]

  const isCanceled = status === 'canceled'

  const summary: DetailLine[] = [
    { label: 'Artwork Type:', value: formatArtworkType(order_item?.artwork_format) },
    { label: 'Order ID:', value: orderNumber },
    isCanceled
      ? { label: 'Status:', value: 'Cancelled', tone: 'text-error-500' }
      : { label: 'Status:', value: 'Delivered', tone: 'text-successful-500' },
  ]

  // Until the refund has been paid out, the date slot shows the refund's state ("In Progress").
  const refundDate: DetailLine = physical.refund_completed_at
    ? { label: 'Refund Date:', value: formatDateTime(physical.refund_completed_at) }
    : { label: 'Refund Date:', value: refund.label, tone: refund.tone }

  const dates: DetailLine[] = isCanceled
    ? [
        { label: 'Purchase Date:', value: formatDateTime(order_item?.created_at) },
        // Label copied as drawn in the design (no colon).
        { label: 'Canceled Date', value: formatDateTime(cancellationEvent?.occurred_at ?? physical.updated_at) },
        refundDate,
      ]
    : [
        { label: 'Purchase Date:', value: formatDateTime(order_item?.created_at) },
        { label: 'Pickup Date:', value: formatDateTime(physical.picked_up_at) },
        { label: 'Delivery Date:', value: formatDateTime(physical.delivered_at) },
      ]

  const artworkFields: DetailField[] = [
    { label: 'Artwork Name', value: order_item?.artwork_title ?? 'Unavailable' },
    { label: 'Artwork Cost', value: formatSpacedCurrency(order_item?.unit_price) },
    { label: 'Quantity', value: String(order_item?.quantity ?? 1) },
    // Shipping cost is written without the space in the design ("$15.02").
    { label: 'Shipping Cost', value: formatSpacedCurrency(physical.shipping_cost).replace('$ ', '$') },
    { label: 'Variant', value: formatVariant(order_item?.variant_snapshot) },
    { label: 'Total Cost', value: formatSpacedCurrency(total) },
  ]

  const courier = physical.courier_name ?? '—'
  const tracking = physical.tracking_id ?? '—'

  return (
    <OrderDetailsView
      variant={isCanceled ? 'canceled' : 'completed'}
      title={isCanceled ? 'Canceled Order Info' : 'Delivery Information'}
      menu={<OrderActionsMenu items={menuItems} />}
      summary={summary}
      dates={dates}
      artwork={{ imageUrl: order_item?.artwork_thumbnail_url ?? null, title: order_item?.artwork_title ?? '' }}
      artworkFields={artworkFields}
      sectionTitle={isCanceled ? 'Refund Details' : 'Shipping Details'}
      fields={
        isCanceled
          ? [
              { label: 'Courier', value: courier },
              { label: 'Tracking ID:', value: tracking },
              {
                label: 'Service Type',
                value: physical.courier_service_type ? courierServiceLabel(physical.courier_service_type) : 'Not Activated',
              },
              { label: 'Pickup Address:', value: physical.pickup_address ?? '—' },
            ]
          : [
              { label: 'Courier', value: courier },
              { label: 'Tracking ID:', value: tracking },
              { label: 'Service Type', value: courierServiceLabel(physical.courier_service_type) },
              { label: 'Delivery Address:', value: formatDeliveryAddress(delivery_address) },
            ]
      }
      fieldsRight={
        isCanceled
          ? [
              { label: 'Reason', value: cancellationReason ?? '—' },
              // The design draws this one label in the body colour instead of the light gray.
              { label: 'Refund Status', value: refund.label, tone: refund.tone, labelTone: 'text-body' },
              { label: 'Refund Amount', value: formatSpacedCurrency(physical.refund_amount) },
            ]
          : undefined
      }
      proofs={delivery_proofs.map((proof) => ({ id: proof.id, url: proof.secure_url }))}
      onOpenProof={openProof}
    >
      <PackagingProofLightbox
        proofs={delivery_proofs}
        startIndex={proofStartIndex}
        open={proofOpen}
        onClose={() => setProofOpen(false)}
      />

      {!isCanceled && order_item && (
        <>
          <RequestReviewModal
            open={reviewOpen}
            onClose={() => setReviewOpen(false)}
            orderItemId={order_item.id}
            artworkTitle={order_item.artwork_title}
          />
          <ShareArtworkModal
            open={shareOpen}
            onClose={() => setShareOpen(false)}
            artworkSlug={order_item.artwork_slug}
            artworkTitle={order_item.artwork_title}
          />
        </>
      )}
    </OrderDetailsView>
  )
}
