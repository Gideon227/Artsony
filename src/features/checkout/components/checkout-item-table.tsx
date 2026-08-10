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
          <div key={col} className="py-4 text-center font-poppins text-[13px] text-gray-400">
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
            <div key={item.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center py-5">
              {/* Artwork */}
              <div className="flex items-center gap-4 pl-6 pr-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-neutral-100">
                  <Image
                    src={item.artwork.thumbnail_url || '/placeholder.png'}
                    alt={item.artwork.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-0.5 font-poppins">
                  <h3 className="truncate text-[15px] font-semibold text-gray-900">
                    {item.artwork.title}
                  </h3>
                  <p className="truncate text-[13px] text-gray-400">
                    By: {item.artwork.seller_name}
                  </p>
                  <p className="text-[12px] text-gray-300">
                    Format: {isDigital ? 'Digital' : 'Physical'}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="text-center font-poppins text-[14px] text-gray-700">
                $ {item.price_at_add.toLocaleString('en-US')} {item.currency_at_add}
              </div>

              {/* Variant */}
              <div className="flex flex-col items-center gap-0.5 text-center font-poppins">
                {variant ? (
                  <>
                    <span className="text-[13px] text-gray-400 capitalize">{variant.variant_name}:</span>
                    <span className="text-[13px] font-semibold text-gray-900">{variant.option_label}</span>
                  </>
                ) : (
                  <span className="text-[13px] text-gray-400">Regular:</span>
                )}
              </div>

              {/* Quantity */}
              <div className="text-center font-poppins text-[14px] text-gray-700">
                x {item.quantity}
              </div>

              {/* Total */}
              <div className="text-center font-poppins text-[14px] font-semibold text-gray-900">
                $ {lineTotal.toLocaleString('en-US')} {item.currency_at_add}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
