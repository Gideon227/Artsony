'use client'

import React, { useEffect } from 'react'
import { ChevronsRight, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cart.store'
import { CartItemRow } from './cart-item-row'
import { SellerDivider } from './cart-summary-bar'
import { CartItemWithArtwork } from '@/types/cart'
import Image from 'next/image'
import Link from 'next/link'

export default function CartPage() {
  const { cart, isLoading, error, fetchCart } = useCartStore()

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  return (
    <div className="flex flex-col py-10">
      {/* Header */}
      <div className="flex items-center justify-between px-8 pb-12">
        <h1 className="font-raleway font-semibold text-h4 leading-10 text-body tracking-wide">Cart</h1>
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-white">
            <Image src='/icons/cart.svg' width={20} height={20} alt='cart icon' />
          </span>
          <span className="font-raleway font-medium text-h5 leading-9 text-body tracking-wide">
            / {cart?.item_count ?? 0}
          </span>
        </div>
      </div>

      {/* Loading */}
      {isLoading && !cart && (
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary-500" />
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="py-10 text-center font-poppins text-red-500">{error}</div>
      )}

      {/* Empty */}
      {!isLoading && !error && cart && cart.items.length === 0 && (
        <div className="py-20 text-center font-poppins text-gray-500">
          Your cart is empty.
        </div>
      )}

      {/* Items grouped by seller */}
      {!isLoading && cart && cart.items.length > 0 && (
        <div className="flex flex-col gap-y-4 px-8">
          {groupBySeller(cart.items).map((group) => (
            <div key={group.sellerId} className="flex flex-col gap-y-4">
              <SellerDivider name={group.sellerName} />
              <div className='flex w-[95vw]'>
                <div className="flex flex-col overflow-hidden rounded-tl-2xl border border-gray-50 divide-y divide-gray-50">
                  {group.items.map((item, index) => (
                    <>
                      <CartItemRow key={item.id} item={item} />
                      {group.items.length - 1 < index && (
                        <hr className='text-gray-50' />
                      )}
                    </>
                  ))}
                </div>

                <Link
                  href={`/marketplace`}
                  aria-label="View artwork details"
                  className="flex w-[116px] shrink-0 rounded-r-2xl border border-gray-50 items-center justify-center bg-[#FEEFEC] transition-colors hover:bg-[#FCDFDA]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-700 text-white">
                    <ChevronsRight size={16} strokeWidth={2.5} />
                  </span>
                </Link>
              </div>
            </div>
          ))}

          {/* Subtotal */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-6">
            <span className="font-poppins text-[16px] text-gray-500">Subtotal</span>
            <span className="font-poppins text-[20px] font-semibold text-gray-900">
              $ {cart.subtotal.toLocaleString('en-US')} {cart.currency}
            </span>
          </div>
        </div>
      )}
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