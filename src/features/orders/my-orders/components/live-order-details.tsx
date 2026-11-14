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
import { formatCurrency, formatDate, formatOrderNumber, getOrderTotal, supportMailto, timeAgo } from '../utils'
import { openDocumentAfter } from '@/features/orders/my-orders/open-document'
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
    const downloadInvoice = useDownloadInvoice()

    if (isLoading) return <DetailSkeleton />
    if (isError || !data) return <DetailErrorState error={error} onRetry={refetch} />

    const { physical, order_item, order_number, delivery_address } = data.data
    const orderNumber = formatOrderNumber(order_number, physical.order_id)
    const total = getOrderTotal(order_item?.unit_price, order_item?.quantity, physical.shipping_cost)
    // Cancel and invoice need a real physical row (not yet there while payment is unconfirmed).
    const hasPhysicalRow = !data.data.is_provisional
    const canCancel = hasPhysicalRow && BUYER_ARTIST_CANCELLABLE_STATES.has(physical.timeline_status)

    const menuItems: OrderActionsMenuItem[] = [
        ...(canCancel
            ? [{ id: 'cancel', label: 'Cancel Order', onSelect: () => setCancelOpen(true) }]
            : []),
        ...(hasPhysicalRow
            ? [{
                id: 'invoice',
                label: 'Download Invoice',
                isPending: downloadInvoice.isPending,
                onSelect: () =>
                    void openDocumentAfter(() => downloadInvoice.mutateAsync(physical.id).then((doc) => doc.invoice_url)),
            }]
            : []),
        {
            id: 'support',
            label: 'Contact Support',
            onSelect: () => window.location.assign(supportMailto(`Order ${orderNumber}`)),
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
                        <div className="flex justify-between items-center w-full">
                            <div className="flex gap-x-4 items-center">
                                <span className="border border-gray-50 rounded-xl p-3">
                                    <Image src="/home/box-black.svg" width={38} height={38} alt="" />
                                </span>
                                <div>
                                    <p className="py-1 font-poppins text-gray-200 text-body-xs tracking-wide">
                                        Order ID: <span className="text-info-500">{orderNumber}</span>
                                    </p>
                                    <p className="py-1 font-poppins text-gray-200 text-body-xs tracking-wide">
                                        Tracking ID: <span className="text-info-500">{physical.tracking_id ?? 'Not assigned yet'}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-y-2 w-1/2">
                                <p className="font-poppins text-body-xxs text-gray-200 tracking-wide">Timeline</p>
                                <div className="border border-gray-50 rounded-xl px-4 py-2 gap-x-2 flex items-center h-12">
                                    {/* <span className="w-3 h-3 rounded-full bg-error-500 shrink-0" /> */}
                                    <p className="font-poppins text-body-xs text-body leading-4 tracking-wide">
                                        {physical.pickup_address ? `Departed ${physical.pickup_address.split(',')[0]} Facility` : 'Awaiting departure'}{' '}
                                        {formatDate(physical.picked_up_at)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-x-6 w-full">
                            <div className="flex flex-col flex-1 gap-y-1">
                                <p className="font-poppins text-body-s text-gray-200 tracking-wide">Pickup Address:</p>
                                <p className="font-poppins text-body-s text-body tracking-wide">{physical.pickup_address ?? '—'}</p>
                            </div>
                            <svg width="116" height="12" viewBox="0 0 116 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.22226 6.77344C8.77455 6.77344 9.22226 6.32572 9.22226 5.77344C9.22226 5.22115 8.77455 4.77344 8.22226 4.77344L8.22226 5.77344L8.22226 6.77344ZM14 4.77344C13.4478 4.77344 13 5.22115 13 5.77344C13 6.32572 13.4478 6.77344 14 6.77344L14 5.77344L14 4.77344ZM19.7778 6.77344C20.3301 6.77344 20.7778 6.32572 20.7778 5.77344C20.7778 5.22115 20.3301 4.77344 19.7778 4.77344L19.7778 5.77344L19.7778 6.77344ZM25.5556 4.77344C25.0033 4.77344 24.5556 5.22115 24.5556 5.77344C24.5556 6.32572 25.0033 6.77344 25.5556 6.77344L25.5556 5.77344L25.5556 4.77344ZM31.3334 6.77344C31.8857 6.77344 32.3334 6.32572 32.3334 5.77344C32.3334 5.22115 31.8857 4.77344 31.3334 4.77344L31.3334 5.77344L31.3334 6.77344ZM37.1112 4.77343C36.5589 4.77343 36.1112 5.22115 36.1112 5.77343C36.1112 6.32572 36.5589 6.77343 37.1112 6.77343L37.1112 5.77343L37.1112 4.77343ZM42.8889 6.77343C43.4412 6.77343 43.8889 6.32572 43.8889 5.77343C43.8889 5.22115 43.4412 4.77343 42.8889 4.77343L42.8889 5.77343L42.8889 6.77343ZM48.6667 4.77343C48.1144 4.77343 47.6667 5.22115 47.6667 5.77343C47.6667 6.32572 48.1144 6.77343 48.6667 6.77343L48.6667 5.77343L48.6667 4.77343ZM54.4445 6.77343C54.9968 6.77343 55.4445 6.32572 55.4445 5.77343C55.4445 5.22115 54.9968 4.77343 54.4445 4.77343L54.4445 5.77343L54.4445 6.77343ZM60.2223 4.77343C59.67 4.77343 59.2223 5.22115 59.2223 5.77343C59.2223 6.32572 59.67 6.77343 60.2223 6.77343L60.2223 5.77343L60.2223 4.77343ZM66 6.77343C66.5523 6.77343 67 6.32572 67 5.77343C67 5.22115 66.5523 4.77343 66 4.77343L66 5.77343L66 6.77343ZM71.7778 4.77343C71.2255 4.77343 70.7778 5.22115 70.7778 5.77343C70.7778 6.32572 71.2255 6.77343 71.7778 6.77343L71.7778 5.77343L71.7778 4.77343ZM77.5556 6.77343C78.1079 6.77343 78.5556 6.32572 78.5556 5.77343C78.5556 5.22115 78.1079 4.77343 77.5556 4.77343L77.5556 5.77343L77.5556 6.77343ZM83.3334 4.77343C82.7811 4.77343 82.3334 5.22115 82.3334 5.77343C82.3334 6.32572 82.7811 6.77343 83.3334 6.77343L83.3334 5.77343L83.3334 4.77343ZM89.1112 6.77343C89.6634 6.77343 90.1112 6.32571 90.1112 5.77343C90.1112 5.22115 89.6634 4.77343 89.1112 4.77343L89.1112 5.77343L89.1112 6.77343ZM94.8889 4.77343C94.3367 4.77343 93.8889 5.22114 93.8889 5.77343C93.8889 6.32571 94.3367 6.77343 94.8889 6.77343L94.8889 5.77343L94.8889 4.77343ZM100.667 6.77343C101.219 6.77343 101.667 6.32571 101.667 5.77343C101.667 5.22114 101.219 4.77343 100.667 4.77343L100.667 5.77343L100.667 6.77343ZM106.444 4.77343C105.892 4.77343 105.444 5.22114 105.444 5.77343C105.444 6.32571 105.892 6.77343 106.444 6.77343L106.444 5.77343L106.444 4.77343ZM5.33337 5.77344L5.33337 6.77344L8.22226 6.77344L8.22226 5.77344L8.22226 4.77344L5.33337 4.77344L5.33337 5.77344ZM14 5.77344L14 6.77344L19.7778 6.77344L19.7778 5.77344L19.7778 4.77344L14 4.77344L14 5.77344ZM25.5556 5.77344L25.5556 6.77344L31.3334 6.77344L31.3334 5.77344L31.3334 4.77344L25.5556 4.77344L25.5556 5.77344ZM37.1112 5.77343L37.1112 6.77343L42.8889 6.77343L42.8889 5.77343L42.8889 4.77343L37.1112 4.77343L37.1112 5.77343ZM48.6667 5.77343L48.6667 6.77343L54.4445 6.77343L54.4445 5.77343L54.4445 4.77343L48.6667 4.77343L48.6667 5.77343ZM60.2223 5.77343L60.2223 6.77343L66 6.77343L66 5.77343L66 4.77343L60.2223 4.77343L60.2223 5.77343ZM71.7778 5.77343L71.7778 6.77343L77.5556 6.77343L77.5556 5.77343L77.5556 4.77343L71.7778 4.77343L71.7778 5.77343ZM83.3334 5.77343L83.3334 6.77343L89.1112 6.77343L89.1112 5.77343L89.1112 4.77343L83.3334 4.77343L83.3334 5.77343ZM94.8889 5.77343L94.8889 6.77343L100.667 6.77343L100.667 5.77343L100.667 4.77343L94.8889 4.77343L94.8889 5.77343ZM106.444 5.77343L106.444 6.77343L109.333 6.77343L109.333 5.77343L109.333 4.77343L106.444 4.77343L106.444 5.77343ZM4.05312e-05 5.77344C4.07887e-05 8.71896 2.38786 11.1068 5.33337 11.1068C8.27889 11.1068 10.6667 8.71896 10.6667 5.77344C10.6667 2.82792 8.27889 0.440104 5.33337 0.440104C2.38785 0.440104 4.02737e-05 2.82792 4.05312e-05 5.77344ZM115.107 5.77343L109.333 -7.44187e-05L103.56 5.77343L109.333 11.5469L115.107 5.77343Z" fill="#F25B38"/>
                            </svg>
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
                                className={`disabled:opacity-40 cursor-pointer ${isFetching && 'animate-spin'} `}
                                >
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10ZM3.46056 9.08333C3.83331 5.79988 6.62404 3.25 10.0096 3.25C12.148 3.25 14.0489 4.26793 15.2521 5.84246C15.5036 6.17158 15.4406 6.64227 15.1115 6.89376C14.7824 7.14526 14.3117 7.08233 14.0602 6.7532C13.1289 5.53445 11.6613 4.75 10.0096 4.75C7.45213 4.75 5.33639 6.63219 4.9733 9.08333H5.33652C5.63996 9.08333 5.9135 9.26618 6.02953 9.54656C6.14556 9.82694 6.0812 10.1496 5.86649 10.364L4.69823 11.5307C4.40542 11.8231 3.9311 11.8231 3.63829 11.5307L2.47003 10.364C2.25532 10.1496 2.19097 9.82694 2.30699 9.54656C2.42302 9.26618 2.69656 9.08333 3 9.08333H3.46056ZM16.3617 8.46931C16.0689 8.1769 15.5946 8.1769 15.3018 8.46931L14.1335 9.63597C13.9188 9.85039 13.8545 10.1731 13.9705 10.4534C14.0865 10.7338 14.3601 10.9167 14.6635 10.9167H15.0267C14.6636 13.3678 12.5479 15.25 9.99045 15.25C8.34645 15.25 6.88484 14.4729 5.9529 13.2638C5.70002 12.9358 5.22908 12.8748 4.90101 13.1277C4.57295 13.3806 4.512 13.8515 4.76487 14.1796C5.96886 15.7416 7.86205 16.75 9.99045 16.75C13.376 16.75 16.1667 14.2001 16.5395 10.9167H17C17.3035 10.9167 17.577 10.7338 17.693 10.4534C17.8091 10.1731 17.7447 9.85039 17.53 9.63597L16.3617 8.46931Z" fill-rule="evenodd" clip-rule="evenodd" fill="#525965"/>
                                    </svg>
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

                            <div className="grid grid-cols-3 gap-x-4 gap-y-2 flex-1 w-full">
                                <Field label="Artwork Name" value={order_item?.artwork_title ?? 'Unavailable'} />
                                <Field label="Artwork Cost" value={formatCurrency(order_item?.unit_price)} />
                                <Field label="Quantity" value={String(order_item?.quantity ?? 1)} />
                                <Field 
                                    label="Artwork Type" 
                                    value={
                                        order_item?.artwork_format
                                        ? order_item.artwork_format.charAt(0).toUpperCase() +
                                            order_item.artwork_format.slice(1).toLowerCase()
                                        : '—'
                                    }
                                />
                                <Field label="Shipping Cost" value={formatCurrency(physical.shipping_cost)} />
                                <Field label="Purchase Date" value={formatDate(order_item?.created_at)} />
                                <Field
                                label="Variant"
                                value={order_item?.variant_snapshot ? `${order_item.variant_snapshot.variant_type}: ${order_item.variant_snapshot.option_label}` : '—'}
                                />
                                <Field label="Total" value={formatCurrency(total)} valueClassName="text-error-500" />
                                {/* <Field label='License Type' value={String()}/> */}
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