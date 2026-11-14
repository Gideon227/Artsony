'use client'

import Image from 'next/image'
import Link from 'next/link'
import { PackageSearch } from 'lucide-react'
import {
  describeNonPhysicalOrder,
  formatCurrency,
  formatOrderNumber,
  formatShortDate,
  getOrderTotal,
  supportMailto,
} from '../utils'
import type { OrderItemPhysicalListEntry } from '@/types/physical-order'
import { cn } from '@/lib/utils'

const TONE_CLASSES = {
  info: 'bg-info-50 text-info-500',
  success: 'bg-successful-50 text-successful-500',
  error: 'bg-error-50 text-error-500',
} as const

const PAYMENT_LABEL: Record<string, string> = {
  PENDING: 'Not submitted yet',
  CONFIRMING: 'Verifying on-chain',
  CONFIRMED: 'Confirmed',
  FAILED: 'Failed',
  EXPIRED: 'Expired',
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-y-1">
      <p className="font-poppins text-body-xs text-gray-200 tracking-wide">{label}</p>
      <p className="font-poppins text-body-s text-body">{value}</p>
    </div>
  )
}

// Shared by the desktop panel and the mobile full-screen layer. Used for list
// entries that have no physical-order detail: digital purchases and orders
// whose payment is unconfirmed, expired or canceled.
export function NonPhysicalOrderDetailsContent({ order }: { order: OrderItemPhysicalListEntry }) {
  const item = order.order_item
  const info = describeNonPhysicalOrder(order)
  const orderNumber = formatOrderNumber(order.order_number, order.order_id)
  const total = getOrderTotal(item?.unit_price, item?.quantity, order.shipping_cost)
  const seller = order.seller
  const artistName = seller?.display_name || seller?.username || 'Unknown Artist'
  const typeLabel = item?.artwork_format === 'DIGITAL' ? 'Digital' : 'Physical'

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex items-start justify-between gap-x-4">
        <div className="flex items-center gap-x-4 min-w-0">
          <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-50 shrink-0">
            <Image
              src={item?.artwork_thumbnail_url || '/icons/artwork-placeholder.svg'}
              alt={item?.artwork_title ?? 'Artwork unavailable'}
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex flex-col gap-y-1">
            <p className="font-poppins font-medium text-body-m text-heading truncate">
              {item?.artwork_title ?? 'Artwork unavailable'}
            </p>
            <p className="font-poppins text-body-xs text-gray-200 tracking-wide">
              Order ID: <span className="text-body">{orderNumber}</span>
            </p>
          </div>
        </div>
        <span
          className={cn(
            'px-3 py-1 rounded-[8px] border border-current font-poppins text-body-s font-medium tracking-wide shrink-0',
            TONE_CLASSES[info.tone],
          )}
        >
          {info.label}
        </span>
      </div>

      <p className="font-poppins text-body-s text-body tracking-wide">{info.hint}</p>

      <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-gray-50 pt-4">
        <Field label="Type" value={typeLabel} />
        <Field label="Purchase Date" value={formatShortDate(item?.created_at ?? order.created_at)} />
        <Field label="Quantity" value={String(item?.quantity ?? 1)} />
        <Field label="Unit Price" value={formatCurrency(item?.unit_price)} />
        <Field label="Total" value={formatCurrency(total)} />
        <Field label="Payment" value={order.payment_status ? (PAYMENT_LABEL[order.payment_status] ?? '—') : '—'} />
        <Field label="Artist" value={artistName} />
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {info.href ? (
          <Link href={info.href} className="font-poppins text-body-s text-info-500 underline underline-offset-2">
            Go to downloads
          </Link>
        ) : (
          <a
            href={supportMailto(`Order ${orderNumber}`)}
            className="font-poppins text-body-s text-info-500 underline underline-offset-2"
          >
            Need help? Contact support
          </a>
        )}
      </div>
    </div>
  )
}

export function NonPhysicalOrderDetails({ order }: { order: OrderItemPhysicalListEntry }) {
  return (
    <div className="border-2 border-gray-50 rounded-xl bg-white h-full min-h-[400px] p-6 flex flex-col gap-y-6">
      {/* <div className="flex items-center gap-x-2 text-gray-200">
        <PackageSearch size={20} />
        <p className="font-poppins text-body-xs tracking-wide">Order details</p>
      </div> */}
      <NonPhysicalOrderDetailsContent order={order} />
    </div>
  )
}
