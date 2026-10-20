'use client'

import * as React from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import { formatShortDate, timeAgo } from '@/features/orders/my-orders/utils'
import type { SellerSaleDetail } from '@/types/seller-sales'
import {
  courierServiceLabel,
  formatDimensions,
  formatEventTimestamp,
  formatLocation,
  getMilestoneIndex,
} from '../../lib/detail'
import { formatMoney } from '../../lib/format'
import { ArtworkThumb } from './artwork-thumb'
import { DetailHeader, DetailSection, DetailShell, InlineMeta, OrderCube, PlainField, ReadOnlyField } from './detail-parts'
import { ShipmentMilestones } from './shipment-milestones'

type Props = {
  detail: SellerSaleDetail
  actions: React.ReactNode
  onClose: () => void
  onRefresh: () => void
  isRefreshing: boolean
}

function humanize(status: string): string {
  return status.toLowerCase().replace(/_/g, ' ').replace(/^\w/, (char) => char.toUpperCase())
}

export function LiveDetail({ detail, actions, onClose, onRefresh, isRefreshing }: Props) {
  const event = detail.latest_event
  const timeline = event ? `${event.notes ?? humanize(event.status)}  ${formatEventTimestamp(event.occurred_at)}` : '—'

  return (
    <DetailShell>
      <DetailHeader title="Shipment Tracking" mobileTitle={detail.artwork_title} actions={actions} onClose={onClose} />

      <div className="flex flex-col gap-6 px-4 pb-8 lg:gap-8 lg:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-4">
            <OrderCube />
            <div className="flex flex-col gap-2">
              <InlineMeta label="Order ID:" value={detail.order_code} valueClassName="text-info-500" />
              <InlineMeta label="Tracking ID:" value={detail.tracking_id ?? '—'} valueClassName="text-info-500" />
              <p className="font-poppins text-body-xs tracking-wide text-gray-300 lg:hidden">
                Status: <span className="text-info-500">Live</span>
              </p>
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-1.5 lg:w-[360px]">
            <span className="font-poppins text-body-xs tracking-wide text-gray-300">Timeline</span>
            <p className="min-h-12 rounded-[24px] border border-gray-50 px-4 py-3 font-poppins text-body-s tracking-wide text-gray-500">{timeline}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <PlainField label="Pickup Address:" value={<span className="whitespace-normal">{detail.pickup_address ?? '—'}</span>} />
          <span aria-hidden="true" className="hidden h-3 flex-1 items-center sm:flex">
            <span className="h-2 w-2 rounded-full bg-primary-500" />
            <span className="mx-1 flex-1 border-t-2 border-dashed border-primary-500" />
            <span className="h-2 w-2 rotate-45 bg-primary-500" />
          </span>
          <PlainField label="Delivery Address:" value={formatLocation(detail.delivery_location)} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ReadOnlyField label="Courier" value={detail.courier_name ?? '—'} />
          <ReadOnlyField label="Service Type" value={courierServiceLabel(detail.courier_service_type)} />
          <ReadOnlyField label="Est. Time of Delivery" value={formatShortDate(detail.estimated_delivery_date)} />
          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="font-poppins text-body-xs tracking-wide text-gray-300">Last Updated</span>
            <span className="flex min-h-12 items-center justify-between gap-2 rounded-[24px] border border-gray-50 px-4 py-2 font-poppins text-body-s tracking-wide text-gray-500">
              <span className="truncate">{timeAgo(detail.last_updated_at)}</span>
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                aria-label="Refresh tracking"
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary-500 text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95"
              >
                {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <RefreshCw className="h-4 w-4" aria-hidden="true" />}
              </button>
            </span>
          </div>
        </div>

        <ShipmentMilestones activeIndex={getMilestoneIndex(detail.timeline_status)} />
      </div>

      <DetailSection title="Package Details">
        <div className="flex flex-col gap-6 sm:flex-row">
          <ArtworkThumb src={detail.artwork_thumbnail_url} alt={detail.artwork_title} sizes="(min-width: 640px) 256px, 100vw" className="aspect-square w-full rounded-[24px] sm:h-64 sm:w-64" />
          <div className="grid flex-1 grid-cols-2 content-start gap-x-6 gap-y-5 lg:grid-cols-3">
            <PlainField label="Artwork Name" value={detail.artwork_title} />
            <PlainField label="Artwork Type" value="Physical" />
            <PlainField label="Quantity" value={detail.quantity} />
            <PlainField label="Price" value={formatMoney(detail.line_total, detail.currency)} />
            <PlainField label="Weight" value="—" />
            <PlainField label="Variant" value={detail.variant_label ?? '—'} />
            <PlainField label="Earning" value={formatMoney(detail.net_earning, detail.currency)} valueClassName="text-primary-500" />
            <PlainField label="Dimensions (lxbxh)" value={formatDimensions(detail.dimensions)} />
            <PlainField label="Purchase Date" value={formatShortDate(detail.purchased_at)} />
            <PlainField label="License Type" value={detail.license_type ?? '—'} className="lg:hidden" />
          </div>
        </div>
      </DetailSection>
    </DetailShell>
  )
}
