import Image from 'next/image'
import { Mail } from 'lucide-react'
import { OrderProgressTrack } from './order-progress-track'
import { StatusPill } from './status-pill'
import type { OrderItemPhysicalWithArtwork } from '@/types/physical-order'
import { cn } from '@/lib/utils'

interface Props {
  order: OrderItemPhysicalWithArtwork
  selected: boolean
  onSelect: (physicalId: string) => void
  artistName?: string
  artistAvatarUrl?: string | null
}

const RING_COLOR = {
  LIVE: 'ring-info-500',
  CANCELLED: 'ring-error-500',
  DELIVERED: 'ring-successful-500',
} as const

export function OrderCard({ order, selected, onSelect, artistName, artistAvatarUrl }: Props) {
  const artwork = order.order_item

  return (
    <button
      type="button"
      onClick={() => onSelect(order.id)}
      aria-current={selected}
      className={cn(
        'w-full text-left border border-gray-50 rounded-xl p-4 flex flex-col gap-y-4 transition-shadow',
        selected && `ring-2 ${RING_COLOR[order.delivery_status]}`,
      )}
    >
      <div className="flex items-start justify-between gap-x-3">
        <div className="flex items-center gap-x-3 min-w-0">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-50 shrink-0">
            {artwork?.artwork_thumbnail_url ? (
              <Image
                src={artwork.artwork_thumbnail_url}
                alt={artwork.artwork_title}
                fill
                sizes="56px"
                className="object-cover"
              />
            ) : (
              <Image src="/icons/artwork-placeholder.svg" alt="Artwork unavailable" fill sizes="56px" className="object-cover" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-poppins font-medium text-body-s text-body truncate">
              {artwork?.artwork_title ?? 'Artwork unavailable'}
            </p>
            <p className="font-poppins text-body-xs text-gray-200 tracking-wide truncate">
              Order ID: <span className="text-body">{order.order_id.slice(0, 12).toUpperCase()}</span>
            </p>
          </div>
        </div>
        <StatusPill status={order.delivery_status} className="shrink-0" />
      </div>

      <OrderProgressTrack deliveryStatus={order.delivery_status} timelineStatus={order.timeline_status} />

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-y-1">
          <p className="font-poppins text-body-xs text-gray-200 tracking-wide">
            Total: <span className="text-body font-medium">${(artwork?.unit_price ?? 0).toFixed(2)}</span>
          </p>
          <p className="font-poppins text-body-xs text-gray-200 tracking-wide">
            {order.delivery_status === 'CANCELLED' ? 'Canceled By:' : 'Courier:'}{' '}
            <span className="text-body">{order.delivery_status === 'CANCELLED' ? 'Buyer' : order.courier_name ?? '—'}</span>
          </p>
        </div>
      </div>

      <div className="border-t border-gray-50 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-50">
            {artistAvatarUrl && <Image src={artistAvatarUrl} alt={artistName ?? 'Artist'} fill sizes="32px" className="object-cover" />}
          </div>
          <div>
            <p className="font-poppins text-body-xs text-body">{artistName ?? 'Unknown Artist'}</p>
            <p className="font-poppins text-body-xxs text-gray-200">Artist</p>
          </div>
        </div>
        <a
          href={artistName ? `mailto:?subject=Regarding order ${order.order_id}` : undefined}
          onClick={(e) => e.stopPropagation()}
          aria-label="Message artist"
          className="w-8 h-8 rounded-full border border-gray-50 flex items-center justify-center"
        >
          <Mail size={14} className="text-body" />
        </a>
      </div>
    </button>
  )
}