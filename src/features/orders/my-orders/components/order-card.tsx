'use client'

import Image from 'next/image'
import { Loader2, Mail } from 'lucide-react'
import { OrderProgressTrack } from './order-progress-track'
import { StatusPill } from './status-pill'
import { useMessageArtist } from '@/features/orders/my-orders/use-message-artist'
import { formatActorRole, formatOrderNumber, formatShortDate, getOrderTotal } from '../utils'
import type { OrderItemPhysicalListEntry } from '@/types/physical-order'
import { cn } from '@/lib/utils'

interface Props {
  order: OrderItemPhysicalListEntry
  selected: boolean
  onSelect: (physicalId: string) => void
}

function Meta({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <p className="font-poppins text-body-xs text-gray-200 tracking-wide">
      {label} <span className={cn('text-body', valueClassName)}>{value}</span>
    </p>
  )
}

export function OrderCard({ order, selected, onSelect }: Props) {
  const messageArtist = useMessageArtist()
  const item = order.order_item
  const seller = order.seller
  const artistName = seller?.display_name || seller?.username || 'Unknown Artist'
  const orderNumber = formatOrderNumber(order.order_number, order.order_id)
  const total = getOrderTotal(item?.unit_price, item?.quantity, order.shipping_cost)
  const formattedTotal = `$ ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const typeLabel = item?.artwork_format === 'DIGITAL' ? 'Digital' : 'Physical'

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
              {item?.artwork_thumbnail_url ? (
                <Image src={item.artwork_thumbnail_url} alt={item.artwork_title} fill sizes="56px" className="object-cover" />
              ) : (
                <Image src="/icons/artwork-placeholder.svg" alt="Artwork unavailable" fill sizes="56px" className="object-cover" />
              )}
            </div>
            <div className="min-w-0 flex flex-col gap-y-1">
              <p className="font-poppins font-medium text-body-s text-body truncate">
                {item?.artwork_title ?? 'Artwork unavailable'}
              </p>
              {order.delivery_status === 'DELIVERED' ? (
                <Meta label="Type:" value={typeLabel} valueClassName="text-info-500" />
              ) : (
                <Meta label="Order ID:" value={orderNumber} />
              )}
            </div>
          </div>
          <StatusPill status={order.delivery_status} className="shrink-0" />
        </div>

        <OrderProgressTrack deliveryStatus={order.delivery_status} timelineStatus={order.timeline_status} />

        <div className="flex items-start justify-between gap-x-4">
          <div className="flex flex-col gap-y-2">
            <Meta label="Total:" value={formattedTotal} valueClassName="font-medium" />
            {footer.left}
          </div>
          <div className="flex flex-col gap-y-2 text-right">
            <p className="font-poppins text-body-xs text-gray-200 tracking-wide">{footer.dateLabel}</p>
            <p className="font-poppins text-body-xs text-body tracking-wide">{footer.date}</p>
          </div>
        </div>
      </button>

      <div className="border-t border-gray-50 pt-3 flex items-center justify-between gap-x-3">
        <div className="flex items-center gap-x-2 min-w-0">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-50 shrink-0">
            {seller?.avatar_url && (
              <Image src={seller.avatar_url} alt={artistName} fill sizes="40px" className="object-cover" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-poppins text-body-s text-primary-500 truncate">{artistName}</p>
            <p className="font-poppins text-body-xs text-gray-200">Artist</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => seller && messageArtist.mutate(seller.id)}
          disabled={!seller || messageArtist.isPending}
          aria-label={`Message ${artistName}`}
          aria-busy={messageArtist.isPending}
          className="w-10 h-10 shrink-0 rounded-full border border-gray-50 flex items-center justify-center hover:border-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {messageArtist.isPending ? (
            <Loader2 size={16} className="animate-spin text-body" />
          ) : (
            <Mail size={16} className="text-body" />
          )}
        </button>
      </div>
    </div>
  )
}
