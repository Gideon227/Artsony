'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import type { SellerSaleDetail } from '@/types/seller-sales'
import { cancelledByLabel, courierServiceLabel, formatDimensions, formatLongDateTime } from '../../lib/detail'
import { formatMoney } from '../../lib/format'
import { ArtworkThumb } from './artwork-thumb'
import { DetailHeader, DetailSection, DetailShell, InlineMeta, OrderCube, ReadOnlyField } from './detail-parts'

type Props = { detail: SellerSaleDetail; actions: React.ReactNode; onClose: () => void }

const REFUND_LABELS: Record<string, { label: string; tone: string }> = {
  NONE: { label: 'Not started', tone: 'text-gray-500' },
  PENDING: { label: 'Pending', tone: 'text-warning-500' },
  PROCESSING: { label: 'In Progress', tone: 'text-info-500' },
  COMPLETED: { label: 'Completed', tone: 'text-successful-500' },
  PARTIAL: { label: 'Partially refunded', tone: 'text-info-500' },
  FAILED: { label: 'Failed', tone: 'text-error-500' },
}

export function refundPresentation(status: string | null) {
  return REFUND_LABELS[status ?? 'NONE'] ?? { label: status ?? '—', tone: 'text-gray-500' }
}

export function CancelledDetail({ detail, actions, onClose }: Props) {
  const isPhysical = detail.artwork_format === 'PHYSICAL'
  const cancellation = detail.cancellation
  const refund = refundPresentation(cancellation?.refund_status ?? null)

  return (
    <DetailShell>
      <DetailHeader title="Canceled Order Info" mobileTitle={detail.artwork_title} actions={actions} onClose={onClose} />

      <div className="flex flex-col gap-6 px-4 pb-8 lg:flex-row lg:items-start lg:justify-between lg:px-6">
        <div className="flex items-center gap-4">
          <OrderCube />
          <div className="flex flex-col gap-2">
            <InlineMeta label="Artwork Type:" value={isPhysical ? 'Physical' : 'Digital'} />
            <InlineMeta label="Order ID:" value={detail.order_code} />
            <InlineMeta label="Status:" value="Cancelled" valueClassName="text-error-500" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <InlineMeta label="Purchase Date:" value={formatLongDateTime(detail.purchased_at)} />
          <InlineMeta label="Canceled Date:" value={formatLongDateTime(cancellation?.cancelled_at)} />
          <InlineMeta label="Refund Date:" value={refund.label} valueClassName={refund.tone} />
        </div>
      </div>

      <DetailSection title="Artwork Details">
        <div className="flex flex-col gap-6 sm:flex-row">
          <ArtworkThumb src={detail.artwork_thumbnail_url} alt={detail.artwork_title} sizes="(min-width: 640px) 320px, 100vw" className="aspect-square w-full rounded-[24px] sm:h-80 sm:w-80" />
          <div className="grid flex-1 grid-cols-2 content-start gap-4">
            <ReadOnlyField label="Artwork Name" value={detail.artwork_title} />
            <ReadOnlyField label="Variant" value={detail.variant_label ?? '—'} />
            <ReadOnlyField label="Quantity" value={detail.quantity} />
            {isPhysical && <ReadOnlyField label="Weight" value="—" />}
            <ReadOnlyField label="Net Earning" value={formatMoney(detail.net_earning, detail.currency)} />
            {isPhysical && <ReadOnlyField label="Dimensions (lxbxh)" value={formatDimensions(detail.dimensions)} />}
          </div>
        </div>
      </DetailSection>

      <DetailSection title="Refund Details">
        <div className="grid gap-4 lg:grid-cols-2 lg:gap-x-6">
          {isPhysical && (
            <div className="flex flex-col gap-4">
              <ReadOnlyField label="Courier" value={detail.courier_name ?? '—'} />
              <ReadOnlyField label="Tracking ID:" value={detail.tracking_id ?? '—'} />
              <ReadOnlyField label="Service Type" value={detail.courier_name ? courierServiceLabel(detail.courier_service_type) : 'Not Activated'} />
              <ReadOnlyField label="Pickup Address:" value={detail.pickup_address ?? '—'} />
            </div>
          )}
          <div className={cn('flex flex-col gap-4', !isPhysical && 'lg:col-span-2')}>
            <ReadOnlyField label="Canceled By" value={cancelledByLabel(cancellation?.cancelled_by ?? null)} />
            <ReadOnlyField label="Reason" value={cancellation?.reason ?? '—'} />
            <ReadOnlyField label="Refund Status" value={refund.label} valueClassName={refund.tone} />
            <ReadOnlyField
              label="Refund Amount"
              value={cancellation?.refund_amount != null ? formatMoney(cancellation.refund_amount, detail.currency) : '—'}
            />
          </div>
        </div>
      </DetailSection>
    </DetailShell>
  )
}
