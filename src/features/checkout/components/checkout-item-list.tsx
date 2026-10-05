'use client'

import { useId, useMemo, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronsDown, ChevronsUp } from 'lucide-react'
import { cn } from '@/utils'
import type { CartItemWithArtwork } from '@/types/cart'

const VISIBLE_WHEN_COLLAPSED = 1

function sellerLabel(items: CartItemWithArtwork[]): string {
  const names = [...new Set(items.map((i) => i.artwork.seller_name))]
  const [first, ...rest] = names
  if (!first) return ''
  return rest.length > 0 ? `${first} +${rest.length}` : first
}

function ItemRow({ item, divider }: { item: CartItemWithArtwork; divider: boolean }) {
  const option = item.variant_snapshot?.option_label ?? 'Regular'
  const lineTotal = item.price_at_add * item.quantity
  const currency = item.currency_at_add

  return (
    <div className={cn('mx-3 flex items-center gap-4 py-3', divider && 'border-t border-gray-50')}>
      <div className="relative h-26 w-26 shrink-0 overflow-hidden rounded-2xl bg-neutral-100">
        <Image
          src={item.artwork.thumbnail_url || '/placeholder.png'}
          alt={item.artwork.title}
          fill
          sizes="104px"
          className="object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 font-poppins">
        <h3 className="truncate text-body-s font-medium text-heading">{item.artwork.title}</h3>
        <p className="truncate text-body-xs font-medium text-body">{option}</p>
        <p className="text-body-xs font-light text-body">
          $ {item.price_at_add.toLocaleString('en-US')} {currency}
        </p>
        <p className="text-body-xs font-light text-body">x{item.quantity}</p>
        <p className="text-body-s font-medium text-heading">
          $ {lineTotal.toLocaleString('en-US')} {currency}
        </p>
      </div>
    </div>
  )
}

export function CheckoutItemList({
  items,
  className,
}: {
  items: CartItemWithArtwork[]
  className?: string
}) {
  const [expanded, setExpanded] = useState(false)
  const regionId = useId()

  const seller = useMemo(() => sellerLabel(items), [items])
  const visible = items.slice(0, VISIBLE_WHEN_COLLAPSED)
  const hidden = items.slice(VISIBLE_WHEN_COLLAPSED)
  const canCollapse = hidden.length > 0

  return (
    <section aria-label="Order items" className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-center justify-between">
        {seller && (
          <span className="rounded-full border border-gray-50 px-3 py-1.5 font-poppins text-body-xs text-body">
            <span className="font-light text-gray-200">By:</span>{' '}
            <span className="font-medium">{seller}</span>
          </span>
        )}
        <span className="ml-auto font-poppins text-body-m text-gray-200">
          Items/<span className="text-primary-500">{items.length}</span>
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-50">
        <ul id={regionId} className="flex flex-col">
          {visible.map((item, index) => (
            <li key={item.id}>
              <ItemRow item={item} divider={index > 0} />
            </li>
          ))}
          <AnimatePresence initial={false}>
            {expanded &&
              hidden.map((item) => (
                <motion.li
                  key={item.id}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <ItemRow item={item} divider />
                </motion.li>
              ))}
          </AnimatePresence>
        </ul>

        {canCollapse && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            aria-controls={regionId}
            className="flex w-full cursor-pointer items-center justify-center gap-2 bg-primary-50 py-4 font-poppins text-body-xs font-medium text-primary-500 transition-colors hover:bg-primary-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-500"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-white">
              {expanded ? (
                <ChevronsUp size={12} strokeWidth={3} />
              ) : (
                <ChevronsDown size={12} strokeWidth={3} />
              )}
            </span>
            {expanded ? 'See less' : 'See more'}
          </button>
        )}
      </div>
    </section>
  )
}
