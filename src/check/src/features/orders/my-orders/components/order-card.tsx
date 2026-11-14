'use client'

import Image from 'next/image'
import { Loader2 } from 'lucide-react'
import { OrderProgressTrack } from './order-progress-track'
import { StatusPill } from './status-pill'
import { MailIcon } from '../ui/mail-icon'
import { useMessageArtist } from '@/features/orders/my-orders/use-message-artist'
import { ACTIVE_CARD_RING } from '../constant'
import { formatActorRole, formatArtworkType, formatOrderNumber, formatShortDate, getOrderTotal } from '../utils'
import type { OrderItemPhysicalListEntry } from '@/types/physical-order'
// clsx (not cn/twMerge): twMerge treats the custom `text-body-*` size tokens as colours
// and would drop them next to a `text-<color>` class.
import { clsx } from 'clsx'

interface Props {
  order: OrderItemPhysicalListEntry
  /** The card whose details are open on the right. Only this card gets a ring. */
  selected: boolean
  onSelect: (physicalId: string) => void
  /**
   * False for a physical artwork that has no physical-order row yet (payment pending,
   * failed or expired): its courier marker stays at the very start of the line.
   */
  tripStarted?: boolean
}

const LABEL = 'text-gray-300'
const VALUE = 'text-heading'

/** "Total: $ 1,901.45" — 12px label + 12px value. */
function Line({ label, value }: { label: string; value: string }) {
  return (
    <p className="font-poppins text-body-xs leading-4 tracking-wide">
      <span className={LABEL}>{label}</span> <span className={VALUE}>{value}</span>
    </p>
  )
}

/** "Order ID: AR-…" — 10px label, 12px value. */
function SmallLabelLine({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    // h-4 pins the line to 16px: a 12px value inside a 10px line would otherwise grow the line box.
    <p className="h-4 font-poppins text-body-xxs leading-4 tracking-wide">
      <span className={LABEL}>{label}</span>{' '}
      <span className={clsx('ml-[1.5px] text-body-xs', VALUE, valueClassName)}>{value}</span>
    </p>
  )
}

export function OrderCard({ order, selected, onSelect, tripStarted = true }: Props) {
  const messageArtist = useMessageArtist()
  const item = order.order_item
  const seller = order.seller
  const status = order.delivery_status
  const artistName = seller?.display_name || seller?.username || 'Unknown Artist'
  const orderNumber = formatOrderNumber(order.order_number, order.order_id)
  const total = getOrderTotal(item?.unit_price, item?.quantity, order.shipping_cost)
  const formattedTotal = `$ ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  // Second line of each footer column depends on the order state.
  const footer = {
    DELIVERED: {
      left: <SmallLabelLine label="Order ID:" value={orderNumber} />,
      dateLabel: 'Delivery Date:',
      date: formatShortDate(order.delivered_at),
    },
    LIVE: {
      left: <Line label="Courier:" value={order.courier_name ?? '—'} />,
      dateLabel: 'Purchase Date:',
      date: formatShortDate(item?.created_at ?? order.created_at),
    },
    CANCELLED: {
      left: <Line label="Canceled By:" value={formatActorRole(order.cancelled_by)} />,
      dateLabel: 'Canceled Date:',
      date: formatShortDate(order.cancelled_at),
    },
  }[status]

  return (
    <div
      className={clsx(
        'flex w-full flex-col gap-y-6 rounded-xl border border-gray-50 bg-white p-[11px]',
        selected && ACTIVE_CARD_RING[status],
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(order.id)}
        aria-current={selected}
        className="flex w-full flex-col gap-y-6 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
      >
        {/* Artwork + title + status */}
        <div className="flex w-full items-start justify-between gap-x-3">
          <div className="flex min-w-0 items-center gap-x-2">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-m bg-gray-50">
              <Image
                src={item?.artwork_thumbnail_url || '/icons/artwork-placeholder.svg'}
                alt={item?.artwork_title ?? 'Artwork unavailable'}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div className="flex min-w-0 flex-col gap-y-1">
              <p className="truncate font-poppins text-body-xs font-medium leading-4 tracking-wide text-heading">
                {item?.artwork_title ?? 'Artwork unavailable'}
              </p>
              {status === 'DELIVERED' ? (
                <SmallLabelLine label="Type:" value={formatArtworkType(item?.artwork_format)} valueClassName="text-info-500" />
              ) : (
                <SmallLabelLine label="Order ID:" value={orderNumber} />
              )}
            </div>
          </div>
          <StatusPill status={status} className="shrink-0" />
        </div>

        <OrderProgressTrack deliveryStatus={status} timelineStatus={order.timeline_status} atStart={!tripStarted} />

        {/* Totals / dates */}
        <div className="flex w-full items-start justify-between gap-x-4">
          <div className="flex flex-col gap-y-2">
            <Line label="Total:" value={formattedTotal} />
            {footer.left}
          </div>
          <div className="flex flex-col gap-y-2">
            <p className={clsx('font-poppins text-body-xs leading-4 tracking-wide', LABEL)}>{footer.dateLabel}</p>
            <p className={clsx('font-poppins text-body-xs leading-4 tracking-wide', VALUE)}>{footer.date}</p>
          </div>
        </div>
      </button>

      {/* Artist */}
      <div className="flex items-center justify-between gap-x-3 border-t border-gray-50 pt-[15px]">
        <div className="flex min-w-0 items-center gap-x-2">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-full border border-gray-50 bg-gray-50">
            {seller?.avatar_url && (
              <Image src={seller.avatar_url} alt="" fill sizes="40px" className="object-cover" />
            )}
          </div>
          <div className="min-w-0">
            <p className={clsx('truncate font-poppins text-body-xs leading-4 tracking-wide', selected ? 'text-primary-500' : 'text-heading')}>
              {artistName}
            </p>
            <p className="mt-px font-poppins text-body-xxs leading-4 tracking-wide text-gray-300">Artist</p>
          </div>
        </div>

        {/* Opens (or creates) the direct conversation with this artist. */}
        <button
          type="button"
          onClick={() => seller && messageArtist.mutate(seller.id)}
          disabled={!seller || messageArtist.isPending}
          aria-label={`Message ${artistName}`}
          aria-busy={messageArtist.isPending}
          className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-gray-50 text-gray-400 transition-colors hover:border-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {messageArtist.isPending ? <Loader2 size={16} className="animate-spin" /> : <MailIcon />}
        </button>
      </div>
    </div>
  )
}
