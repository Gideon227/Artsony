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
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/utils'

export default function CartPage() {
  const cart = useCartStore((s) => s.cart)

  if (!cart) return null

  const groups = groupBySeller(cart.items)

  return (
    <div className="flex flex-col lg:pt-16 w-full max-w-[100vw] overflow-x-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between max-lg:py-6 px-4 lg:px-8 lg:pb-12 w-full">
        <h1 className="font-raleway font-semibold lg:text-h4 text-h5 leading-10 text-body tracking-wide">Cart</h1>
        
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-full bg-primary-500 text-white">
            <Image src="/icons/cart.svg" width={20} height={20} alt="cart icon" />
          </span>
          <span className="font-raleway font-medium text-h6 lg:text-h5 leading-9 text-body tracking-wide">
            / {cart.item_count}
          </span>
        </div>
      </div>

      {/* Items grouped by seller */}
      <div className="flex flex-col gap-y-6 px-4 lg:px-8 py-6 lg:py-12 w-full">
        {groups.map((group) => {
          const checkoutHref = `/checkout?items=${group.items.map((i) => i.id).join(',')}`

          return (
            <div key={group.sellerId} className="flex flex-col gap-y-4 w-full">
              <SellerDivider name={group.sellerName} />
              
              <div className="w-full pb-4">
                {/* Removed min-w-[850px] so it stops breaking mobile width limits */}
                <div className="flex max-lg:flex-col max-lg:gap-y-6 w-full lg:min-w-0 max-lg:border max-lg:border-gray-50 max-lg:rounded-2xl max-lg:p-3">
                  
                  <div className="flex flex-1 min-w-0 flex-col overflow-hidden lg:rounded-tl-2xl border-b lg:border border-gray-50 divide-y divide-gray-50">
                    {group.items.map((item) => (
                      <CartItemRow key={item.id} item={item} />
                    ))}
                  </div>

                  <Link
                    href={checkoutHref}
                    aria-label={`Checkout items from ${group.sellerName}`}
                    className="hidden lg:flex w-[116px] shrink-0 rounded-r-2xl border-y border-r border-gray-50 items-center justify-center bg-primary-50 transition-colors hover:bg-[#FCDFDA]"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-700 text-white">
                      <ChevronsRight size={16} strokeWidth={2.5} />
                    </span>
                  </Link>

                  {/* Mobile Button */}
                  <Link
                    href={checkoutHref}
                    className={cn(buttonVariants({ fullWidth: true }), 'lg:hidden')}
                  >
                    Checkout
                  </Link>
                </div>
              </div>

            </div>
          )
        })}
      </div>

      <AlsoLikeSection />
      <Footer />
    </div>
  )
}

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