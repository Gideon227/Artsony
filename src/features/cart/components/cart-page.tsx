'use client'

import React from 'react'
import { ChevronsRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import Footer from '@/components/layout/footer'
import { useCartStore } from '@/store/cart.store'
import { CartItemRow } from './cart-item-row'
import { SellerDivider } from './cart-summary-bar'
import { AlsoLikeSection } from './also-like-section'
import type { CartItemWithArtwork } from '@/types/cart'

// Cart data is fetched once by the parent (CartContent) before this component
// ever mounts — it owns the has-items branch only, so it never re-fetches.
export default function CartPage() {
  const cart = useCartStore((s) => s.cart)

  if (!cart) return null

  const groups = groupBySeller(cart.items)

  return (
    <div className="flex flex-col py-10">
      {/* Header */}
      <div className="flex items-center justify-between px-8 pb-12">
        <h1 className="font-raleway font-semibold text-h4 leading-10 text-body tracking-wide">Cart</h1>
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-white">
            <Image src="/icons/cart.svg" width={20} height={20} alt="cart icon" />
          </span>
          <span className="font-raleway font-medium text-h5 leading-9 text-body tracking-wide">
            / {cart.item_count}
          </span>
        </div>
      </div>

      {/* Items grouped by seller */}
      <div className="flex flex-col gap-y-4 px-8">
        {groups.map((group) => {
          const checkoutHref = `/checkout?items=${group.items.map((i) => i.id).join(',')}`

          return (
            <div key={group.sellerId} className="flex flex-col gap-y-4">
              <SellerDivider name={group.sellerName} />
              <div className="flex w-full">
                <div className="flex flex-1 flex-col overflow-hidden rounded-tl-2xl border border-gray-50 divide-y divide-gray-50">
                  {group.items.map((item) => (
                    <CartItemRow key={item.id} item={item} />
                  ))}
                </div>

                <Link
                  href={checkoutHref}
                  aria-label={`Checkout items from ${group.sellerName}`}
                  className="flex w-[116px] shrink-0 rounded-r-2xl border border-gray-50 items-center justify-center bg-[#FEEFEC] transition-colors hover:bg-[#FCDFDA]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-700 text-white">
                    <ChevronsRight size={16} strokeWidth={2.5} />
                  </span>
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      <AlsoLikeSection />

      <div className="mt-16">
        <Footer />
      </div>
    </div>
  )
}

// ── Group consecutive cart items by seller, preserving order ─────────────────
function groupBySeller(items: CartItemWithArtwork[]) {
  const groups: { sellerId: string; sellerName: string; items: CartItemWithArtwork[] }[] = []

  for (const item of items) {
    const last = groups[groups.length - 1]
    if (last && last.sellerId === item.artwork.seller_id) {
      last.items.push(item)
    } else {
      groups.push({
        sellerId: item.artwork.seller_id,
        sellerName: item.artwork.seller_name,
        items: [item],
      })
    }
  }

  return groups
}
