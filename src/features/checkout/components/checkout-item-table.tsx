'use client'

import Image from 'next/image'
import type { CartItemWithArtwork } from '@/types/cart'

const COLUMNS = ['Artworks', 'Artwork Price', 'Variant', 'Quantity', 'Total']

export function CheckoutItemTable({ items }: { items: CartItemWithArtwork[] }) {
  return (
    <div className="flex flex-col">
      {/* Column headers */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] rounded-full border border-gray-50 bg-white">
        {COLUMNS.map((col) => (
          <div key={col} className="py-4 text-center font-poppins text-body-xs text-text-disabled border-gray-50 not-last:border-r">
            {col}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div className="mt-4 flex flex-col overflow-hidden rounded-2xl border border-gray-50 divide-y divide-gray-50">
        {items.map((item) => {
          const isDigital = item.artwork.artwork_format === 'DIGITAL'
          const variant = item.variant_snapshot
          const lineTotal = item.price_at_add * item.quantity

          return (
            <div key={item.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center">
              {/* Artwork */}
              <div className="flex items-center gap-4 p-2 border-gray-50 border-r">
                <div className="relative h-26 w-25 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                  <Image
                    src={item.artwork.thumbnail_url || '/placeholder.png'}
                    alt={item.artwork.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-col font-poppins">
                  <h3 className="truncate text-body-s font-medium text-heading">
                    {item.artwork.title}
                  </h3>
                  <p className="truncate text-body-xs text-body font-light">
                    By: {item.artwork.seller_name}
                  </p>
                  <p className="text-body-xs font-light text-body mt-4">
                    Format: {isDigital ? 'Digital' : 'Physical'}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="text-center font-poppins text-body-xs text-heading h-full content-center border-gray-50 border-r">
                $ {item.price_at_add.toLocaleString('en-US')} {item.currency_at_add}
              </div>

              {/* Variant */}
              <div className="flex flex-col flex-1 items-center gap-2 text-center font-poppins border-gray-50 h-full border-r">
                {variant ? (
                  <>
                    <span className="text-body-xs text-body font-light capitalize">{variant.variant_name}:</span>
                    <span className="text-body-xs font-medium text-heading">{variant.option_label}</span>
                  </>
                ) : (
                  <span className="text-body-xs text-body content-center h-full">Regular:</span>
                )}
              </div>

              {/* Quantity */}
              <div className="text-center font-poppins text-body-xs h-full content-center text-heading border-gray-50 border-r">
                x {item.quantity}
              </div>

              {/* Total */}
              <div className="text-center font-poppins text-body-xs font-medium text-heading">
                $ {lineTotal.toLocaleString('en-US')} {item.currency_at_add}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
