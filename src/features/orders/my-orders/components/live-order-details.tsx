'use client'

import { useState } from 'react'
import Image from 'next/image'
import { MoreHorizontal, RefreshCw, ChevronsRight } from 'lucide-react'
import type { UseQueryResult } from '@tanstack/react-query'
import type { CommerceApiSuccess } from '@/types/order'
import type { PhysicalOrderDetailView } from '@/types/physical-order'
import { ShipmentTimeline } from './shipment-timeline'
import { DetailSkeleton } from './detail-skeleton'
import { DetailErrorState } from './detail-error-state'
import { formatCurrency, formatDate, timeAgo } from '../utils'
import { OrderActionsMenu, OrderActionsMenuItem } from '../ui/order-actions-menu'
import { CancelOrderFlow } from './cancel-order/cancel-order-flow'
import { useDownloadInvoice } from '@/hooks/use-physical-order'
import { BUYER_ARTIST_CANCELLABLE_STATES } from '@/types/order'


interface Props {
  query: UseQueryResult<CommerceApiSuccess<PhysicalOrderDetailView>, unknown>
}

export function LiveOrderDetails({ query }: Props) {
    const { data, isLoading, isError, error, refetch, isFetching } = query
    const [cancelOpen, setCancelOpen] = useState(false)

    if (isLoading) return <DetailSkeleton />
    if (isError || !data) return <DetailErrorState error={error} onRetry={refetch} />

    const { physical, order_item, delivery_address } = data.data
    const total = (order_item?.unit_price ?? 0) * (order_item?.quantity ?? 1) + (physical.shipping_cost ?? 0)

    const downloadInvoice = useDownloadInvoice()
    const canCancel = BUYER_ARTIST_CANCELLABLE_STATES.has(physical.timeline_status)

    const menuItems: OrderActionsMenuItem[] = [
        ...(canCancel
            ? [{ id: 'cancel', label: 'Cancel Order', onSelect: () => setCancelOpen(true) }]
            : []),
        {
            id: 'support',
            label: 'Contact Support',
            onSelect: () =>
            window.open(`mailto:support@artsony.com?subject=${encodeURIComponent(`Order ${physical.order_id}`)}`),
        },
        {
            id: 'invoice',
            label: 'Download Invoice',
            isPending: downloadInvoice.isPending,
            onSelect: () =>
            downloadInvoice.mutate(physical.id, {
                onSuccess: (data) => window.open(data.invoice_url, '_blank', 'noopener,noreferrer'),
            }),
        },
    ]

    return (
        <div className="border-2 border-gray-50 rounded-xl flex flex-col bg-white">
            <div className="p-4 border-b border-gray-50 flex flex-col gap-y-14">
                <div className="flex flex-col gap-y-6 w-full">
                    <div className="flex justify-between items-center w-full">
                        <h5 className="font-raleway font-semibold text-h5 text-body leading-8 tracking-wide">Shipment Tracking</h5>
                        <OrderActionsMenu items={menuItems} />
                    </div>

                    <div className="flex flex-col gap-y-10">
                        <div className="flex justify-between items-center">
                            <div className="flex gap-x-4 items-center">
                                <span className="border border-gray-50 rounded-[20px] p-3">
                                <Image src="/icons/box.svg" width={38} height={38} alt="" />
                                </span>
                                <div>
                                <p className="py-1 font-poppins text-gray-200 text-body-xs tracking-wide">
                                    Order ID: <span className="text-info-500">{physical.order_id.slice(0, 12).toUpperCase()}</span>
                                </p>
                                <p className="py-1 font-poppins text-gray-200 text-body-xs tracking-wide">
                                    Tracking ID: <span className="text-info-500">{physical.tracking_id ?? 'Not assigned yet'}</span>
                                </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-y-2">
                                <p className="font-poppins text-body-xxs text-gray-200 tracking-wide">Timeline</p>
                                <div className="border border-gray-50 rounded-xl px-4 py-2 gap-x-2 flex items-center">
                                <span className="w-3 h-3 rounded-full bg-error-500 shrink-0" />
                                <p className="font-poppins text-body-xs text-body leading-4 tracking-wide">
                                    {physical.pickup_address ? `Departed ${physical.pickup_address.split(',')[0]} Facility` : 'Awaiting departure'}{' '}
                                    {formatDate(physical.picked_up_at)}
                                </p>
                                <ChevronsRight size={18} className="text-gray-200 shrink-0" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-x-6 w-full">
                            <div className="flex flex-col flex-1 gap-y-1">
                                <p className="font-poppins text-body-s text-gray-200 tracking-wide">Pickup Address:</p>
                                <p className="font-poppins text-body-s text-body tracking-wide">{physical.pickup_address ?? '—'}</p>
                            </div>
                        <div className="h-[2px] flex-1 max-w-[104px] bg-gray-50 shrink-0" />
                            <div className="flex flex-col flex-1 gap-y-1">
                                <p className="font-poppins text-body-s text-gray-200 tracking-wide">Delivery Address:</p>
                                <p className="font-poppins text-body-s text-body tracking-wide">
                                {delivery_address ? `${delivery_address.address_line_1}, ${delivery_address.city} ${delivery_address.postal_code}, ${delivery_address.country_code}` : '—'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-y-6">
                    <div className="w-full grid grid-cols-4 gap-x-2">
                        {[
                        { label: 'Courier', value: physical.courier_name ?? '—' },
                        { label: 'Service Type', value: physical.courier_service_type ?? '—' },
                        { label: 'Est. Time of Delivery', value: formatDate(physical.estimated_delivery_date) },
                        { label: 'Last Updated', value: timeAgo(physical.updated_at), refresh: true },
                        ].map((item) => (
                        <div className="flex flex-col gap-y-2" key={item.label}>
                            <p className="font-poppins text-body-xxs text-gray-200 tracking-wide">{item.label}</p>
                            <div className="border border-gray-50 rounded-xl py-2 px-4 flex justify-between items-center">
                            <p className="font-poppins text-body-xs text-body text-center">{item.value}</p>
                            {item.refresh && (
                                <button
                                type="button"
                                onClick={() => refetch()}
                                disabled={isFetching}
                                aria-label="Refresh status"
                                className="disabled:opacity-40"
                                >
                                <RefreshCw size={14} className={isFetching ? 'animate-spin text-body' : 'text-body'} />
                                </button>
                            )}
                            </div>
                        </div>
                        ))}
                    </div>

                    <ShipmentTimeline status={physical.timeline_status} />

                    <div className="border-t border-gray-50 p-4 gap-y-6 flex flex-col">
                        <h5 className="font-raleway font-semibold text-h5 text-body tracking-wide leading-8">Package Details</h5>
                        <div className="w-full flex gap-x-6">
                        <div className="relative w-[114px] h-[114px] rounded-xl overflow-hidden bg-gray-50 shrink-0">
                            {order_item?.artwork_thumbnail_url ? (
                            <Image src={order_item.artwork_thumbnail_url} alt={order_item.artwork_title} fill sizes="114px" className="object-cover" />
                            ) : (
                            <div className="w-full h-full flex items-center justify-center font-poppins text-body-xxs text-gray-200">No image</div>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                            <Field label="Artwork Name" value={order_item?.artwork_title ?? 'Unavailable'} />
                            <Field label="Artwork Cost" value={formatCurrency(order_item?.unit_price)} />
                            <Field label="Quantity" value={String(order_item?.quantity ?? 1)} />
                            <Field label="Artwork Type" value={order_item?.artwork_format ?? '—'} />
                            <Field label="Shipping Cost" value={formatCurrency(physical.shipping_cost)} />
                            <Field label="Purchase Date" value={formatDate(order_item?.created_at)} />
                            <Field
                            label="Variant"
                            value={order_item?.variant_snapshot ? `${order_item.variant_snapshot.variant_type}: ${order_item.variant_snapshot.option_label}` : '—'}
                            />
                            <Field label="Total" value={formatCurrency(total)} valueClassName="text-error-500" />
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        {canCancel && (
            <CancelOrderFlow physicalId={physical.id} open={cancelOpen} onOpenChange={setCancelOpen} />
        )}
        </div>
    )
}

function Field({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="flex flex-col gap-y-1">
      <p className="font-poppins text-body-xxs text-gray-200 tracking-wide">{label}</p>
      <p className={`font-poppins text-body-xs tracking-wide ${valueClassName ?? 'text-body'}`}>{value}</p>
    </div>
  )
}