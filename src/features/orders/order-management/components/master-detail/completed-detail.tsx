'use client'

import * as React from 'react'
import { FileText, Film, Image as ImageIcon, Music } from 'lucide-react'
import type { SellerSaleDetail, SellerSaleFile } from '@/types/seller-sales'
import { courierServiceLabel, fileExtension, formatDimensions, formatFileSize, formatLongDateTime } from '../../lib/detail'
import { formatMoney } from '../../lib/format'
import { ArtworkThumb } from './artwork-thumb'
import { DetailHeader, DetailSection, DetailShell, InlineMeta, OrderCube, ReadOnlyField } from './detail-parts'

type Props = {
  detail: SellerSaleDetail
  actions: React.ReactNode
  onClose: () => void
  onOpenProof: (index: number) => void
}

function FileIcon({ file }: { file: SellerSaleFile }) {
  const className = 'h-5 w-5 shrink-0 text-gray-400'
  if (file.media_type === 'VIDEO' || file.mime_type.startsWith('video/')) return <Film className={className} aria-hidden="true" />
  if (file.media_type === 'AUDIO' || file.mime_type.startsWith('audio/')) return <Music className={className} aria-hidden="true" />
  if (file.mime_type.startsWith('image/')) return <ImageIcon className={className} aria-hidden="true" />
  return <FileText className={className} aria-hidden="true" />
}

function DeliveryGallery({ detail, onOpenProof }: { detail: SellerSaleDetail; onOpenProof: (index: number) => void }) {
  const proofs = detail.delivery_proofs
  if (proofs.length === 0) return null
  const visible = proofs.slice(0, 3)
  const extra = proofs.length - visible.length

  return (
    <div className="flex flex-col gap-3">
      <span className="font-raleway text-h6 font-medium tracking-wide text-gray-500">Delivery Gallery</span>
      <ul className="flex items-center">
        {visible.map((proof, index) => (
          <li key={proof.id} className={index === 0 ? '' : '-ml-6'} style={{ zIndex: visible.length - index }}>
            <button
              type="button"
              onClick={() => onOpenProof(index)}
              aria-label={`View delivery photo ${index + 1} of ${proofs.length}`}
              className="relative block cursor-pointer rounded-[16px] border-2 border-white transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            >
              <ArtworkThumb src={proof.url} alt={`Delivery photo ${index + 1}`} sizes="96px" className="h-24 w-20 rounded-[14px]" />
              {extra > 0 && index === visible.length - 1 && (
                <span className="absolute inset-0 flex items-center justify-center rounded-[14px] bg-black/50 font-poppins text-body-s font-semibold text-white">
                  +{extra}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function CompletedDetail({ detail, actions, onClose, onOpenProof }: Props) {
  const isPhysical = detail.artwork_format === 'PHYSICAL'

  return (
    <DetailShell>
      <DetailHeader title="Delivery Information" mobileTitle={detail.artwork_title} actions={actions} onClose={onClose} />

      <div className="flex flex-col gap-6 px-4 pb-8 lg:flex-row lg:items-start lg:justify-between lg:px-6">
        <div className="flex items-center gap-4">
          <OrderCube />
          <div className="flex flex-col gap-2">
            <InlineMeta label="Artwork Type:" value={isPhysical ? 'Physical' : 'Digital'} />
            <InlineMeta label="Order ID:" value={detail.order_code} />
            <InlineMeta label="Status:" value="Delivered" valueClassName="text-successful-500" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <InlineMeta label="Purchase Date:" value={formatLongDateTime(detail.purchased_at)} />
          {isPhysical && <InlineMeta label="Pickup Date:" value={formatLongDateTime(detail.picked_up_at)} />}
          {isPhysical && <InlineMeta label="Delivery Date:" value={formatLongDateTime(detail.delivered_at)} />}
        </div>
      </div>

      <DetailSection title="Artwork Details">
        <div className="flex flex-col gap-6 sm:flex-row">
          <ArtworkThumb src={detail.artwork_thumbnail_url} alt={detail.artwork_title} sizes="(min-width: 640px) 320px, 100vw" className="aspect-square w-full rounded-[24px] sm:h-80 sm:w-80" />
          <div className="grid flex-1 grid-cols-2 content-start gap-4">
            <ReadOnlyField label="Artwork Name" value={detail.artwork_title} />
            <ReadOnlyField label="Variant" value={detail.variant_label ?? '—'} />
            <ReadOnlyField label="Quantity" value={detail.quantity} />
            {isPhysical ? (
              <ReadOnlyField label="Weight" value="—" />
            ) : (
              <ReadOnlyField label="File Size" value={formatFileSize(detail.total_file_size_bytes)} />
            )}
            <ReadOnlyField label="Net Earning" value={formatMoney(detail.net_earning, detail.currency)} />
            {isPhysical && <ReadOnlyField label="Dimensions (lxbxh)" value={formatDimensions(detail.dimensions)} />}
          </div>
        </div>
      </DetailSection>

      <DetailSection title="Shipping Details">
        {isPhysical ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <ReadOnlyField label="Courier" value={detail.courier_name ?? '—'} />
              <ReadOnlyField label="Tracking ID:" value={detail.tracking_id ?? '—'} />
              <ReadOnlyField label="Service Type" value={courierServiceLabel(detail.courier_service_type)} />
              <ReadOnlyField label="Pickup Address:" value={detail.pickup_address ?? '—'} />
            </div>
            <DeliveryGallery detail={detail} onOpenProof={onOpenProof} />
          </div>
        ) : detail.files.length === 0 ? (
          <p className="font-poppins text-body-s text-gray-300">No files are attached to this artwork.</p>
        ) : (
          <ul className="flex max-h-72 flex-col overflow-y-auto rounded-[24px] border border-gray-50 p-2">
            {detail.files.map((file) => (
              <li key={file.id} className="flex items-center gap-3 rounded-[16px] px-3 py-3">
                <FileIcon file={file} />
                <span className="min-w-0 flex-1 truncate font-poppins text-body-xs tracking-wide text-gray-500">{file.name}</span>
                <span className="shrink-0 font-poppins text-body-xxs tracking-wide text-gray-300">
                  {formatFileSize(file.file_size_bytes)} {fileExtension(file.mime_type)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </DetailSection>
    </DetailShell>
  )
}
