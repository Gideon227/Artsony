'use client'

import Image from 'next/image'
import { Loader2, Mail } from 'lucide-react'
import { MobileProgressTrack } from './progress-track'
import { StatusPill } from '../components/status-pill'
import { useMessageArtist } from '../use-message-artist'
import { formatActorRole, formatOrderNumber, formatShortDate, getOrderTotal } from '../utils'
import type { OrderItemPhysicalListEntry } from '@/types/physical-order'
import { cn } from '@/lib/utils'

interface Props {
  order: OrderItemPhysicalListEntry
  onSelect: (physicalId: string) => void
}

function Meta({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <p className="font-poppins text-body-xs tracking-wide text-gray-200">
      {label} <span className={cn('text-body', valueClassName)}>{value}</span>
    </p>
  )
}

export function MobileOrderCard({ order, onSelect }: Props) {
  const messageArtist = useMessageArtist()
  const item = order.order_item
  const seller = order.seller
  const artistName = seller?.display_name || seller?.username || 'Unknown Artist'
  const orderNumber = formatOrderNumber(order.order_number, order.order_id)
  const total = getOrderTotal(item?.unit_price, item?.quantity, order.shipping_cost)
  const formattedTotal = `$ ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const typeLabel = item?.artwork_format === 'DIGITAL' ? 'Digital' : 'Physical'
  const isDelivered = order.delivery_status === 'DELIVERED'

  const footer = {
    DELIVERED: {
      left: <Meta label="Order ID:" value={orderNumber} />,
      dateLabel: 'Delivery Date:',
      date: formatShortDate(order.delivered_at),
    },
    LIVE: {
      left: <Meta label="Courier:" value={order.courier_name ?? '—'} />,
      dateLabel: 'Purchase Date:',
      date: formatShortDate(item?.created_at ?? order.created_at),
    },
    CANCELLED: {
      left: <Meta label="Canceled By:" value={formatActorRole(order.cancelled_by)} />,
      dateLabel: 'Canceled Date:',
      date: formatShortDate(order.cancelled_at),
    },
  }[order.delivery_status]

  return (
    <article className="flex w-full flex-col gap-4 rounded-[20px] border border-gray-50 bg-white p-4 transition-shadow active:outline-2 active:outline-offset-2 active:outline-primary-500">
      <button
        type="button"
        onClick={() => onSelect(order.id)}
        className="flex w-full flex-col gap-5 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-50">
              <Image
                src={item?.artwork_thumbnail_url || '/icons/artwork-placeholder.svg'}
                alt={item?.artwork_title ?? 'Artwork unavailable'}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <p className="truncate font-poppins text-body-s font-medium tracking-wide text-heading">
                {item?.artwork_title ?? 'Artwork unavailable'}
              </p>
              {isDelivered ? (
                <Meta label="Type:" value={typeLabel} valueClassName="text-info-500" />
              ) : (
                <Meta label="Order ID:" value={orderNumber} />
              )}
            </div>
          </div>
          <StatusPill status={order.delivery_status} className="shrink-0" />
        </div>

        <MobileProgressTrack deliveryStatus={order.delivery_status} timelineStatus={order.timeline_status} />

        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Meta label="Total:" value={formattedTotal} valueClassName="font-medium" />
            {footer.left}
          </div>
          <div className="flex flex-col gap-2 text-right">
            <p className="font-poppins text-body-xs tracking-wide text-gray-200">{footer.dateLabel}</p>
            <p className="font-poppins text-body-xs tracking-wide text-body">{footer.date}</p>
          </div>
        </div>
      </button>

      <div className="flex items-center justify-between gap-3 border-t border-gray-50 pt-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-50">
            {seller?.avatar_url && (
              <Image src={seller.avatar_url} alt={artistName} fill sizes="40px" className="object-cover" />
            )}
          </div>
          <div className="min-w-0">
            <p className={cn('truncate font-poppins text-body-s tracking-wide', isDelivered ? 'text-primary-500' : 'text-body')}>
              {artistName}
            </p>
            <p className="font-poppins text-body-xs text-gray-200">Artist</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => seller && messageArtist.mutate(seller.id)}
          disabled={!seller || messageArtist.isPending}
          aria-label={`Message ${artistName}`}
          aria-busy={messageArtist.isPending}
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-50 transition-colors active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {messageArtist.isPending ? (
            <Loader2 size={16} className="animate-spin text-body" />
          ) : (
            <Mail size={16} className="text-body" />
          )}
        </button>
      </div>
    </article>
  )
}
