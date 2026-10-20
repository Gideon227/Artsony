'use client'

import { Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatShortDate } from '@/features/orders/my-orders/utils'
import type { SellerSaleLine } from '@/types/seller-sales'
import { cancelledByLabel, getProgress } from '../../lib/detail'
import { formatMoney } from '../../lib/format'
import { SalesStatusPill } from '../sales-status-pill'
import { ArtworkThumb } from './artwork-thumb'
import { CustomerAvatar } from './customer-avatar'
import { OrderProgressBar } from './order-progress-bar'

type Props = {
  line: SellerSaleLine
  selected: boolean
  onSelect: (orderItemId: string) => void
  onMessage: (buyerId: string) => void
  isMessaging: boolean
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <p className="font-poppins text-body-xs tracking-wide text-gray-300">
      {label} <span className="font-medium text-gray-500">{value}</span>
    </p>
  )
}

export function OrderCard({ line, selected, onSelect, onMessage, isMessaging }: Props) {
  const status = line.seller_status
  const isPhysical = line.artwork_format === 'PHYSICAL'
  const price = formatMoney(line.line_total, line.currency)

  const secondary =
    status === 'COMPLETED'
      ? { label: 'Order ID:', value: line.order_code }
      : status === 'CANCELLED'
        ? { label: 'Canceled By:', value: cancelledByLabel(line.cancelled_by) }
        : { label: 'Courier:', value: isPhysical ? (line.courier_name ?? '—') : '—' }

  const dateLabel =
    status === 'COMPLETED' ? 'Delivery Date:' : status === 'CANCELLED' ? 'Canceled Date:' : 'Purchase Date:'
  const dateValue = formatShortDate(
    status === 'COMPLETED' ? (line.delivered_at ?? line.purchased_at) : status === 'CANCELLED' ? (line.cancelled_at ?? line.purchased_at) : line.purchased_at,
  )

  return (
    <li
      className={cn(
        'rounded-[24px] border bg-white transition-shadow',
        selected ? 'border-primary-500 shadow-sm ring-1 ring-primary-500' : 'border-gray-50 hover:border-gray-100',
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(line.order_item_id)}
        aria-pressed={selected}
        aria-label={`Open order ${line.order_code} for ${line.artwork_title}`}
        className="flex w-full cursor-pointer flex-col gap-4 rounded-t-[24px] p-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      >
        <div className="flex items-start gap-3">
          <ArtworkThumb src={line.artwork_thumbnail_url} alt={line.artwork_title} sizes="56px" className="h-16 w-14 rounded-[12px]" />
          <div className="flex min-w-0 flex-1 flex-col gap-1 pt-1">
            <p className="truncate font-poppins text-body-s font-medium tracking-wide text-gray-500">{line.artwork_title}</p>
            {status === 'COMPLETED' ? (
              <p className="font-poppins text-body-xxs tracking-wide text-gray-300">
                Type: <span className="text-info-500">{isPhysical ? 'Physical' : 'Digital'}</span>
              </p>
            ) : (
              <p className="font-poppins text-body-xxs tracking-wide text-gray-300">
                Order ID: <span className="text-gray-500">#{line.order_code}</span>
              </p>
            )}
          </div>
          <SalesStatusPill status={status} className="shrink-0" />
        </div>

        {status !== 'PENDING' && <OrderProgressBar status={status} progress={getProgress(line.timeline_status)} />}

        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-2">
            <Meta label="Price:" value={price} />
            <Meta label={secondary.label} value={secondary.value} />
          </div>
          <div className="flex shrink-0 flex-col gap-2">
            <p className="font-poppins text-body-xs tracking-wide text-gray-300">{dateLabel}</p>
            <p className="font-poppins text-body-xs font-medium tracking-wide text-gray-500">{dateValue}</p>
          </div>
        </div>
      </button>

      <div className="mx-3 flex items-center gap-3 border-t border-gray-50 py-3">
        <CustomerAvatar name={line.buyer_name} src={line.buyer_avatar_url} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-poppins text-body-s font-medium tracking-wide text-gray-500">{line.buyer_name}</p>
          <p className="font-poppins text-body-xxs tracking-wide text-gray-300">Customer</p>
        </div>
        <button
          type="button"
          onClick={() => onMessage(line.buyer_id)}
          disabled={isMessaging}
          aria-label={`Message ${line.buyer_name}`}
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-50 text-gray-400 transition-colors hover:border-gray-100 hover:bg-secondary-50 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
        >
          <Mail className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </li>
  )
}

export function OrderCardSkeleton() {
  return (
    <li aria-hidden="true" className="flex animate-pulse flex-col gap-4 rounded-[24px] border border-gray-50 bg-white p-3">
      <div className="flex gap-3">
        <div className="h-16 w-14 rounded-[12px] bg-secondary-100" />
        <div className="flex flex-1 flex-col gap-2 pt-1">
          <div className="h-4 w-2/3 rounded bg-secondary-100" />
          <div className="h-3 w-1/2 rounded bg-secondary-100" />
        </div>
      </div>
      <div className="h-6 rounded bg-secondary-100" />
      <div className="flex justify-between">
        <div className="h-8 w-1/3 rounded bg-secondary-100" />
        <div className="h-8 w-1/4 rounded bg-secondary-100" />
      </div>
    </li>
  )
}
