'use client'

import { useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import { MobileActionsMenu } from './actions-menu'
import { MobileCancelOrderFlow } from './cancel-order-flow'
import {
  DetailSection,
  FieldGrid,
  MetaLine,
  MobileDetailScreen,
  OrderSummaryHeader,
  PillField,
  PlainField,
  VerticalTimeline,
} from './detail-parts'
import { formatCurrency, formatDate, formatOrderNumber, getOrderTotal, supportMailto, timeAgo } from '../utils'
import { openDocumentAfter } from '../open-document'
import type { OrderActionsMenuItem } from '../ui/order-actions-menu'
import { useDownloadInvoice } from '@/hooks/use-physical-order'
import { BUYER_ARTIST_CANCELLABLE_STATES } from '@/types/order'
import type { PhysicalOrderDetailView } from '@/types/physical-order'
import Image from 'next/image'

interface Props {
  data: PhysicalOrderDetailView
  onClose: () => void
  onRefresh: () => void
  isRefreshing: boolean
}

export function MobileLiveDetail({ data, onClose, onRefresh, isRefreshing }: Props) {
  const [cancelOpen, setCancelOpen] = useState(false)
  const downloadInvoice = useDownloadInvoice()

  const { physical, order_item, order_number, delivery_address } = data
  const orderNumber = formatOrderNumber(order_number, physical.order_id)
  const total = getOrderTotal(order_item?.unit_price, order_item?.quantity, physical.shipping_cost)
  const canCancel = BUYER_ARTIST_CANCELLABLE_STATES.has(physical.timeline_status)
  const variant = order_item?.variant_snapshot
    ? `${order_item.variant_snapshot.variant_type}: ${order_item.variant_snapshot.option_label}`
    : '—'
  const deliveryAddress = delivery_address
    ? `${delivery_address.address_line_1}, ${delivery_address.city} ${delivery_address.postal_code}, ${delivery_address.country_code}`
    : '—'

  const menuItems: OrderActionsMenuItem[] = [
    ...(canCancel ? [{ id: 'cancel', label: 'Cancel Order', onSelect: () => setCancelOpen(true) }] : []),
    {
      id: 'invoice',
      label: 'Download Invoice',
      isPending: downloadInvoice.isPending,
      onSelect: () =>
        void openDocumentAfter(() => downloadInvoice.mutateAsync(physical.id).then((doc) => doc.invoice_url)),
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
      <OrderSummaryHeader>
        <MetaLine label="Artwork Type:" value={order_item?.artwork_format === 'DIGITAL' ? 'Digital' : 'Physical'} />
        <MetaLine label="Order ID:" value={orderNumber} />
        <MetaLine label="Status:" value="Live" valueClassName="text-info-500" />
      </OrderSummaryHeader>

      <div className="flex items-start justify-between gap-3">
        <PlainField label="Pickup Address:" value={physical.pickup_address ?? '—'} className="flex-1" />
        <span aria-hidden="true" className="mt-6 flex w-14 shrink-0 items-center">
          <span className="h-2 w-2 shrink-0 rounded-full bg-primary-500" />
          <span className="mx-1 flex-1 border-t-2 border-dashed border-primary-500" />
          <span className="h-2 w-2 shrink-0 rotate-45 bg-primary-500" />
        </span>
        <PlainField label="Delivery Address:" value={deliveryAddress} className="flex-1" />
      </div>

      <DetailSection
        title="Shipment Tracking"
        aside={
          <span className="rounded-lg border border-primary-500 px-3 py-1 font-poppins text-body-xs font-medium tracking-wide text-primary-500">
            Live
          </span>
        }
      >
        <PillField
          label="Est. Time of Delivery"
          value={formatDate(physical.estimated_delivery_date)}
          valueClassName="text-primary-500"
          align="center"
        />

        <VerticalTimeline status={physical.timeline_status} />

        <PillField label="Courier" value={physical.courier_name ?? '—'} align="center" />
        <PillField label="Service Type" value={physical.courier_service_type ?? '—'} align="center" />
        {physical.tracking_id && <PillField label="Tracking ID" value={physical.tracking_id} align="center" />}

        <div className="flex min-w-0 flex-col gap-2">
          <span className="font-poppins text-body-xs tracking-wide text-gray-200">Last Updated</span>
          <span className="flex min-h-12 items-center justify-between gap-2 rounded-[24px] border border-gray-50 py-1 pl-4 pr-1.5 font-poppins text-body-s tracking-wide text-body">
            <span className="flex-1 text-center">{timeAgo(physical.updated_at)}</span>
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Refresh status"
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary-500 text-white transition-colors active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRefreshing ? (
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              ) : (
                <RefreshCw size={16} aria-hidden="true" />
              )}
            </button>
          </span>
        </div>
      </DetailSection>

      <DetailSection title="Package Details">
        <div className="flex gap-4">
          <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl bg-gray-50">
            {order_item?.artwork_thumbnail_url ? (
              <Image src={order_item.artwork_thumbnail_url} alt={order_item.artwork_title} fill sizes="128px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-poppins text-body-xxs text-gray-200">No image</div>
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <PlainField label="Price" value={formatCurrency(order_item?.unit_price)} />
            <PlainField label="Total" value={formatCurrency(total)} valueClassName="text-primary-500" />
          </div>
        </div>
        <FieldGrid>
          <PlainField label="Artwork Type" value={order_item?.artwork_format === 'DIGITAL' ? 'Digital' : 'Physical'} />
          <PlainField label="Quantity" value={String(order_item?.quantity ?? 1)} />
          <PlainField label="Variant" value={variant} />
          <PlainField label="Shipping Cost" value={formatCurrency(physical.shipping_cost)} />
          <PlainField label="Purchase Date" value={formatDate(order_item?.created_at)} />
        </FieldGrid>
      </DetailSection>

      {canCancel && <MobileCancelOrderFlow physicalId={physical.id} open={cancelOpen} onOpenChange={setCancelOpen} />}
    </MobileDetailScreen>
  )
}
