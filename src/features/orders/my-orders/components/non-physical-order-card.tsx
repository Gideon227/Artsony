'use client'

import Image from 'next/image'
import Link from 'next/link'
import { formatOrderNumber, formatShortDate, getOrderTotal, describeNonPhysicalOrder } from '../utils'
import type { OrderItemPhysicalListEntry } from '@/types/physical-order'
import { cn } from '@/lib/utils'

const TONE_CLASSES = {
  info: 'bg-info-50 text-info-500',
  success: 'bg-successful-50 text-successful-500',
  error: 'bg-error-50 text-error-500',
} as const

// Card for list entries that have no physical-order detail: digital purchases
// and orders whose payment is unconfirmed, expired or canceled. Selecting one
// opens NonPhysicalOrderDetails (not the physical detail query).
interface Props {
  order: OrderItemPhysicalListEntry
  selected?: boolean | undefined
  onSelect: (id: string) => void
}

export function NonPhysicalOrderCard({ order, selected = false, onSelect }: Props) {
  const item = order.order_item
  const info = describeNonPhysicalOrder(order)
  const orderNumber = formatOrderNumber(order.order_number, order.order_id)
  const total = getOrderTotal(item?.unit_price, item?.quantity, order.shipping_cost)
  const formattedTotal = `$ ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const typeLabel = item?.artwork_format === 'DIGITAL' ? 'Digital' : 'Physical'

  return (
    <div
      className={cn(
        'w-full border rounded-xl p-4 flex flex-col gap-y-4 bg-white transition-colors',
        selected ? 'border-primary-500 ring-1 ring-primary-500' : 'border-gray-50',
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(order.id)}
        aria-current={selected}
        className="w-full text-left flex flex-col gap-y-4 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
      >
      <div className="flex items-start justify-between gap-x-3">
        <div className="flex items-center gap-x-3 min-w-0">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-50 shrink-0">
            <Image
              src={item?.artwork_thumbnail_url || '/icons/artwork-placeholder.svg'}
              alt={item?.artwork_title ?? 'Artwork unavailable'}
              fill
              sizes="56px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex flex-col gap-y-1">
            <p className="font-poppins font-medium text-body-s text-body truncate">
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

      <p className="font-poppins text-body-xs text-body tracking-wide">{info.hint}</p>

      <div className="flex items-start justify-between gap-x-4">
        <div className="flex flex-col gap-y-2">
          <p className="font-poppins text-body-xs text-gray-200 tracking-wide">
            Total: <span className="text-body font-medium">{formattedTotal}</span>
          </p>
          <p className="font-poppins text-body-xs text-gray-200 tracking-wide">
            Type: <span className="text-body">{typeLabel}</span>
          </p>
        </div>
        <div className="flex flex-col gap-y-2 text-right">
          <p className="font-poppins text-body-xs text-gray-200 tracking-wide">Purchase Date:</p>
          <p className="font-poppins text-body-xs text-body tracking-wide">
            {formatShortDate(item?.created_at ?? order.created_at)}
          </p>
        </div>
      </div>
      </button>

      {info.href && (
        <Link
          href={info.href}
          className="self-start font-poppins text-body-s text-info-500 underline underline-offset-2"
        >
          Go to downloads
        </Link>
      )}
    </div>
  )
}
