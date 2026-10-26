'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Download, Loader2 } from 'lucide-react'
import { MobileActionsMenu } from './actions-menu'
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
import { formatCurrency, formatDate, formatOrderNumber, getOrderTotal, supportMailto } from '../utils'
import { openDocumentAfter } from '../open-document'
import { PackagingProofLightbox } from '../components/packaging-proof-lightbox'
import { RequestReviewModal } from '../components/request-review-modal'
import { ShareArtworkModal } from '../components/share-artwork-modal'
import type { OrderActionsMenuItem } from '../ui/order-actions-menu'
import { useDownloadReceipt } from '@/hooks/use-physical-order'
import { useReviewEligibility } from '@/hooks/use-review'
import { useDownloadArtwork } from '@/hooks/use-delivery'
import type { PhysicalOrderDetailView } from '@/types/physical-order'

interface Props {
  data: PhysicalOrderDetailView
  onClose: () => void
}

export function MobileDeliveredDetail({ data, onClose }: Props) {
  const [proofOpen, setProofOpen] = useState(false)
  const [proofStartIndex, setProofStartIndex] = useState(0)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const downloadReceipt = useDownloadReceipt()
  const downloadArtwork = useDownloadArtwork()

  const { physical, order_item, order_number, delivery_address, delivery_proofs } = data
  const eligibility = useReviewEligibility(order_item?.id, true)
  const orderNumber = formatOrderNumber(order_number, physical.order_id)
  const total = getOrderTotal(order_item?.unit_price, order_item?.quantity, physical.shipping_cost)
  const isDigital = order_item?.artwork_format === 'DIGITAL'
  const alreadyReviewed = eligibility.data?.eligible === false && eligibility.data.reason === 'Already reviewed'
  const variant = order_item?.variant_snapshot
    ? `${order_item.variant_snapshot.variant_type}: ${order_item.variant_snapshot.option_label}`
    : '—'
  const deliveryAddress = delivery_address
    ? `${delivery_address.address_line_1}, ${delivery_address.city}, ${delivery_address.postal_code}, ${delivery_address.country_code}`
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
      id: 'review',
      label: alreadyReviewed ? 'Review Submitted' : 'Leave a Review',
      disabled: eligibility.data?.eligible === false,
      onSelect: () => setReviewOpen(true),
    },
    { id: 'share', label: 'Share Artwork', disabled: !order_item, onSelect: () => setShareOpen(true) },
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
            {!isDigital && (
              <>
                <DateRow label="Pickup Date:" value={formatDate(physical.picked_up_at, true)} />
                <DateRow label="Delivery Date:" value={formatDate(physical.delivered_at, true)} />
              </>
            )}
          </>
        }
      >
        <MetaLine label="Artwork Type:" value={isDigital ? 'Digital' : 'Physical'} />
        <MetaLine label="Order ID:" value={orderNumber} />
        <MetaLine label="Status:" value="Delivered" valueClassName="text-successful-500" />
      </OrderSummaryHeader>

      <DetailSection title="Artwork Details">
        <ArtworkImage src={order_item?.artwork_thumbnail_url} alt={order_item?.artwork_title ?? 'Artwork'} />
        <FieldGrid>
          <PillField label="Quantity" value={String(order_item?.quantity ?? 1)} />
          <PillField label="Variant" value={variant} />
          <PillField label="Artwork Cost" value={formatCurrency(order_item?.unit_price)} />
          {!isDigital && <PillField label="Shipping Cost" value={formatCurrency(physical.shipping_cost)} />}
          <PillField label="Total Cost" value={formatCurrency(total)} />
        </FieldGrid>
      </DetailSection>

      {isDigital ? (
        // Only the download itself is wired up. The file list and sizes in the
        // design need an endpoint that returns a digital order's files.
        <DetailSection
          title="Files"
          aside={
            <button
              type="button"
              onClick={() => order_item && downloadArtwork.mutate(order_item.id)}
              disabled={!order_item || downloadArtwork.isPending}
              className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-primary-500 px-6 font-poppins text-body-s font-medium tracking-wide text-white transition-colors active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Download Files
              {downloadArtwork.isPending ? (
                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              ) : (
                <Download size={18} aria-hidden="true" />
              )}
            </button>
          }
        >
          <span className="sr-only">Download the files for this order</span>
        </DetailSection>
      ) : (
        <>
          <DetailSection title="Shipping Details">
            <PillField label="Courier" value={physical.courier_name ?? '—'} />
            <PillField label="Tracking ID:" value={physical.tracking_id ?? '—'} />
            <PillField label="Service Type" value={physical.courier_service_type ?? '—'} />
            <PillField label="Pickup Address:" value={physical.pickup_address ?? '—'} />
            <PillField label="Delivery Address:" value={deliveryAddress} />
          </DetailSection>

          <DetailSection title="Delivery Gallery">
            {delivery_proofs.length === 0 ? (
              <p className="font-poppins text-body-xs text-gray-200">No delivery photos yet.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {delivery_proofs.slice(0, 3).map((proof, index) => (
                  <button
                    key={proof.id}
                    type="button"
                    onClick={() => {
                      setProofStartIndex(index)
                      setProofOpen(true)
                    }}
                    aria-label="View delivery photo"
                    className="relative aspect-square cursor-pointer overflow-hidden rounded-2xl border border-gray-50 bg-gray-50 active:opacity-80"
                  >
                    <Image src={proof.secure_url} alt="Delivery proof" fill sizes="(min-width: 768px) 224px, 33vw" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </DetailSection>
        </>
      )}

      <PackagingProofLightbox
        proofs={delivery_proofs}
        startIndex={proofStartIndex}
        open={proofOpen}
        onClose={() => setProofOpen(false)}
      />

      {order_item && (
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
    </MobileDetailScreen>
  )
}
