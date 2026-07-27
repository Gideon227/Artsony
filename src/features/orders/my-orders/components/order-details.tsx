'use client'

import { useState } from 'react'
import { OrderActionsMenu, type OrderActionsMenuItem } from '../ui/order-actions-menu'
import { PackagingProofLightbox } from './packaging-proof-lightbox'
import { useDownloadReceipt, useDownloadInvoice } from '@/hooks/use-physical-order'
import { RequestReviewModal } from './request-review-modal'
import Image from 'next/image'
import type { UseQueryResult } from '@tanstack/react-query'
import { Input } from '@/components'
import type { CommerceApiSuccess } from '@/types/order'
import { PhysicalOrderDetailView } from '@/types/physical-order'
import { DetailSkeleton } from './detail-skeleton'
import { DetailErrorState } from './detail-error-state'
import { formatCurrency, formatDate } from '../utils'


interface Props {
  query: UseQueryResult<CommerceApiSuccess<PhysicalOrderDetailView>, unknown>
  status: 'completed' | 'canceled'
}

export function OrderDetails({ query, status }: Props) {
    const { data, isLoading, isError, error, refetch } = query
    const [proofOpen, setProofOpen] = useState(false)
    const [proofStartIndex, setProofStartIndex] = useState(0)
    const [reviewOpen, setReviewOpen] = useState(false)
    const downloadReceipt = useDownloadReceipt()
    const downloadInvoice = useDownloadInvoice()

    const contactSupportItem: OrderActionsMenuItem = {
    id: 'support',
    label: 'Contact Support',
    onSelect: () =>
        window.open(`mailto:support@artsony.com?subject=${encodeURIComponent(`Order ${physical.order_id}`)}`),
    }

    const packagingProofItem: OrderActionsMenuItem = {
    id: 'proof',
    label: 'View Packaging Proof',
    onSelect: () => {
        setProofStartIndex(0)
        setProofOpen(true)
    },
    }

    const menuItems: OrderActionsMenuItem[] =
        status === 'canceled'
        ? [
            {
                id: 'receipt',
                label: 'Download Receipt',
                isPending: downloadReceipt.isPending,
                onSelect: () =>
                    downloadReceipt.mutate(physical.id, {
                    onSuccess: (data) => window.open(data.receipt_url, '_blank', 'noopener,noreferrer'),
                    }),
            },
            packagingProofItem,
            contactSupportItem,
        ]
        : [
            // TODO: "View Shipping Label" needs a backend discriminator (e.g. DeliveryProof.proof_type)
            // to separate label images from packaging images. Currently opens the same proof set.
            { id: 'label', label: 'View Shipping Label', onSelect: () => { setProofStartIndex(0); setProofOpen(true) } },
            packagingProofItem,
            {
                id: 'invoice',
                label: 'Download Invoice',
                isPending: downloadInvoice.isPending,
                onSelect: () =>
                    downloadInvoice.mutate(physical.id, {
                    onSuccess: (data) => window.open(data.invoice_url, '_blank', 'noopener,noreferrer'),
                    }),
            },
            { id: 'review', label: 'Request Review', onSelect: () => setReviewOpen(true) },
            contactSupportItem,
        ]

    if (isLoading) return <DetailSkeleton />
    if (isError || !data) return <DetailErrorState error={error} onRetry={refetch} />

    const { physical, order_item, delivery_address, refund_requests, delivery_proofs } = data.data
    const total = (order_item?.unit_price ?? 0) * (order_item?.quantity ?? 1) + (physical.shipping_cost ?? 0)
    const latestRefund = refund_requests[refund_requests.length - 1]

    return (
        <div className="bg-white py-4 border-2 border-gray-50 rounded-xl flex flex-col">
            <div className="px-4 w-full flex flex-col gap-y-10">
                <div className="flex justify-between items-center w-full">
                    <h5 className="font-raleway font-semibold text-h5 text-heading leading-10 tracking-wide">
                        {status === 'completed' ? 'Delivery Information' : 'Canceled Order Info'}
                    </h5>
                    <OrderActionsMenu items={menuItems} />
                </div>

                <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-4">
                    <span className="border border-gray-50 rounded-[20px] p-3">
                    <Image src="/icons/box.svg" width={38} height={38} alt="" />
                    </span>
                    <div className="flex flex-col gap-y-2">
                    <p className="font-poppins text-body-xs text-gray-200 tracking-wide">
                        Artwork Type: <span className="text-body">{order_item?.artwork_format ?? '—'}</span>
                    </p>
                    <p className="font-poppins text-body-xs text-gray-200 tracking-wide">
                        Order ID: <span className="text-body">{physical.order_id.slice(0, 12).toUpperCase()}</span>
                    </p>
                    <p className="font-poppins text-body-xs text-gray-200 tracking-wide">
                        Status:{' '}
                        <span className={status === 'completed' ? 'text-successful-500' : 'text-error-500'}>
                        {status === 'completed' ? 'Delivered' : 'Cancelled'}
                        </span>
                    </p>
                    </div>
                </div>

                <div className="flex flex-col gap-y-2 text-right">
                    <p className="font-poppins text-body-xs text-gray-200 tracking-wide">
                    Purchase Date: <span className="text-body">{formatDate(order_item?.created_at, true)}</span>
                    </p>
                    <p className="font-poppins text-body-xs text-gray-200 tracking-wide">
                    {status === 'completed' ? 'Pickup Date:' : 'Canceled Date:'}{' '}
                    <span className="text-body">
                        {status === 'completed' ? formatDate(physical.picked_up_at, true) : formatDate(physical.updated_at, true)}
                    </span>
                    </p>
                    <p className="font-poppins text-body-xs text-gray-200 tracking-wide">
                    {status === 'completed' ? 'Delivery Date:' : 'Refund Date:'}{' '}
                    <span className={status === 'completed' ? 'text-body' : 'text-info-500'}>
                        {status === 'completed'
                        ? formatDate(physical.delivered_at, true)
                        : physical.refund_completed_at
                            ? formatDate(physical.refund_completed_at, true)
                            : 'In Progress'}
                    </span>
                    </p>
                </div>
                </div>
            </div>

            <div className="py-6 px-4 flex flex-col gap-y-4 border-y border-gray-50">
                <p className="font-poppins font-medium text-body-m text-body tracking-wide">Artwork Details</p>
                <div className="flex gap-x-4 items-center">
                    <div className="relative w-[114px] h-[114px] rounded-xl overflow-hidden bg-gray-50 shrink-0">
                        {order_item?.artwork_thumbnail_url ? (
                            <Image src={order_item.artwork_thumbnail_url} alt={order_item.artwork_title} fill sizes="114px" className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center font-poppins text-body-xxs text-gray-200">No image</div>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-x-4 gap-y-4 flex-1">
                        <ReadOnlyField label="Artwork Name" value={order_item?.artwork_title ?? 'Unavailable'} />
                        <ReadOnlyField label="Artwork Cost" value={formatCurrency(order_item?.unit_price)} />
                        <ReadOnlyField label="Quantity" value={String(order_item?.quantity ?? 1)} />
                        <ReadOnlyField label="Shipping Cost" value={formatCurrency(physical.shipping_cost)} />
                        <ReadOnlyField
                            label="Variant"
                            value={order_item?.variant_snapshot ? `${order_item.variant_snapshot.variant_type}: ${order_item.variant_snapshot.option_label}` : '—'}
                        />
                        <ReadOnlyField label="Total Cost" value={formatCurrency(total)} />
                    </div>
                </div>
            </div>

            {status === 'canceled' && (
                <div className="px-4 pt-6 flex flex-col gap-y-6">
                <p className="font-poppins font-medium text-body-m leading-6 tracking-wide text-body">Refund Details</p>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                    <ReadOnlyField label="Courier" value={physical.courier_name ?? '—'} />
                    <ReadOnlyField label="Reason" value={latestRefund?.reason ?? '—'} />
                    <ReadOnlyField label="Tracking ID :" value={physical.tracking_id ?? '—'} />
                    <ReadOnlyField label="Refund Status" value={physical.refund_status} valueClassName={physical.refund_status === 'COMPLETED' ? 'text-successful-500' : 'text-info-500'} />
                    <ReadOnlyField label="Service Type" value={physical.courier_service_type ?? 'Not Activated'} />
                    <ReadOnlyField label="Refund Amount" value={formatCurrency(physical.refund_amount)} />
                    <ReadOnlyField label="Pickup Address" value={physical.pickup_address ?? '—'} />
                </div>
                </div>
            )}

            {status === 'completed' && (
                <div className="px-4 pt-6 flex flex-col gap-y-6">
                <p className="font-poppins font-medium text-body-m leading-6 tracking-wide text-body">Shipping Details</p>
                <div className="flex items-start gap-x-12 w-full">
                    <div className="flex flex-col gap-y-4 w-2/3">
                    <ReadOnlyField label="Courier" value={physical.courier_name ?? '—'} />
                    <ReadOnlyField label="Tracking ID:" value={physical.tracking_id ?? '—'} />
                    <ReadOnlyField label="Service Type" value={physical.courier_service_type ?? '—'} />
                    <ReadOnlyField
                        label="Delivery Address"
                        value={delivery_address ? `${delivery_address.address_line_1}, ${delivery_address.city}, ${delivery_address.postal_code}, ${delivery_address.country_code}` : '—'}
                    />
                    </div>

                    <div className="flex flex-col gap-y-3 flex-1">
                        <p className="font-poppins text-body-m text-body leading-6 tracking-wide">Delivery Gallery</p>
                        {delivery_proofs.length === 0 ? (
                            <p className="font-poppins text-body-xs text-gray-200">No delivery photos yet.</p>
                        ) : (
                            <div className="flex -space-x-4">
                                {delivery_proofs.slice(0, 3).map((proof) => (
                                    <button
                                        key={proof.id}
                                        type="button"
                                        onClick={() => {
                                            setProofStartIndex(delivery_proofs.indexOf(proof))
                                            setProofOpen(true)
                                        }}
                                        aria-label="View delivery photo"
                                        className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-white shadow-sm hover:opacity-90 transition-opacity"
                                    >
                                        <Image src={proof.secure_url} alt="Delivery proof" fill sizes="80px" className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                </div>
            )}

            <PackagingProofLightbox
                proofs={delivery_proofs}
                startIndex={proofStartIndex}
                open={proofOpen}
                onClose={() => setProofOpen(false)}
            />
            
            {status === 'completed' && (
                <RequestReviewModal
                    open={reviewOpen}
                    onClose={() => setReviewOpen(false)}
                    artworkTitle={order_item?.artwork_title ?? 'this artwork'}
                />
            )}

            <PackagingProofLightbox proofs={delivery_proofs} open={proofOpen} onClose={() => setProofOpen(false)} />
        </div>
    )
}

function ReadOnlyField({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="flex flex-col gap-y-2">
      <label className="font-poppins text-body-xxs text-body tracking-wide">{label}</label>
      <Input value={value} disabled className={valueClassName} />
    </div>
  )
}