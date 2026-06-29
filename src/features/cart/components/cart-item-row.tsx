'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, Minus, X, Pencil, ChevronsRight, HelpCircle } from 'lucide-react'
import { useCartStore } from '@/store/cart.store'
import type { CartItemWithArtwork } from '@/types/cart'

function formatCurrency(amount: number, currency: string) {
  return `$ ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currency}`
}

export function CartItemRow({ item }: { item: CartItemWithArtwork }) {
  const { updateQuantity, removeItem } = useCartStore()
  const [isEditing, setIsEditing] = useState(false)
  const [localQty, setLocalQty] = useState(item.quantity)
  const [isUpdating, setIsUpdating] = useState(false)

  const lineTotal = item.price_at_add * item.quantity
  const isDigital = item.artwork.artwork_format === 'DIGITAL'
  const maxQty = item.artwork.max_purchase_quantity ?? 100

  const commitQuantity = async (newQty: number) => {
    if (newQty < 1 || newQty > maxQty || newQty === item.quantity) {
      setLocalQty(item.quantity)
      return
    }
    setIsUpdating(true)
    try {
      await updateQuantity(item.id, newQty)
    } catch {
      setLocalQty(item.quantity)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleIncrement = () => {
    if (isDigital) return
    const next = Math.min(localQty + 1, maxQty)
    setLocalQty(next)
    commitQuantity(next)
  }

  const handleDecrement = () => {
    if (isDigital) return
    const next = Math.max(localQty - 1, 1)
    setLocalQty(next)
    commitQuantity(next)
  }

  const handleRemove = async () => {
    try {
      await removeItem(item.id)
    } catch {
      // error surfaced via store state
    }
  }

  const artworkTypeLabel = isDigital ? 'Digital Artwork' : 'Physical Artwork'
  const variant = item.variant_snapshot

  return (
    <div className="relative flex w-full overflow-hidden bg-white">
      {/* Left action column */}
      <div className="flex flex-col items-center justify-between py-6 px-4">
        <button
          onClick={handleRemove}
          aria-label="Remove item"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-white transition-colors hover:bg-gray-900"
        >
          <X size={14} strokeWidth={2.5} />
        </button>

        <button
          onClick={() => setIsEditing((v) => !v)}
          aria-label="Edit item"
          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-50"
        >
          <Pencil size={16} strokeWidth={2} />
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 items-center gap-6 py-4 pr-6">
        {/* Thumbnail */}
        <Link href={`/marketplace/${item.artwork.slug}`} className="relative h-[152px] w-[152px] shrink-0 overflow-hidden rounded-[24px] bg-neutral-100">
          <Image
            src={item.artwork.thumbnail_url || '/placeholder.png'}
            alt={item.artwork.title}
            fill
            className="object-cover"
          />
        </Link>

        {/* Title / seller / price / type */}
        <div className="flex min-w-0 flex-col gap-1.5 font-poppins">
          <h3 className="truncate text-[16px] font-semibold text-gray-900 max-w-[260px]">
            {item.artwork.title}
          </h3>
          <p className="text-[13px] text-gray-500">
            By: <span className="font-semibold text-gray-700">{item.artwork.seller_name}</span>
          </p>
          <p className="text-[13px] font-medium text-gray-700">
            $ {item.price_at_add.toLocaleString('en-US')} {item.currency_at_add}
          </p>
          <div className="flex items-center gap-1.5">
            <Link
              href={`/marketplace/${item.artwork.slug}`}
              className="text-[12px] font-medium text-blue-500 hover:underline"
            >
              {artworkTypeLabel}
            </Link>
            <HelpCircle size={14} className="text-blue-500" />
          </div>

          {(item.is_unavailable || item.is_price_changed || item.is_stock_insufficient) && (
            <div className="mt-1 flex flex-col gap-0.5">
              {item.is_unavailable && (
                <span className="text-[12px] font-medium text-red-500">No longer available</span>
              )}
              {item.is_price_changed && (
                <span className="text-[12px] font-medium text-amber-600">Price has changed</span>
              )}
              {item.is_stock_insufficient && (
                <span className="text-[12px] font-medium text-red-500">Not enough stock for selected quantity</span>
              )}
            </div>
          )}
        </div>

        {/* Variant */}
        <div className="flex w-[140px] shrink-0 flex-col items-center gap-1 text-center font-poppins">
          {variant ? (
            <>
              <span className="text-[13px] text-gray-500 capitalize">{variant.variant_name}:</span>
              <span className="text-[13px] font-semibold text-gray-900">{variant.option_label}</span>
            </>
          ) : (
            <span className="text-[14px] font-medium text-gray-700">Regular</span>
          )}
        </div>

        {/* Quantity controls */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={handleIncrement}
            disabled={isDigital || isUpdating || localQty >= maxQty}
            aria-label="Increase quantity"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-700 text-white transition-opacity disabled:opacity-40"
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>

          <input
            type="text"
            readOnly={!isEditing || isDigital}
            value={String(localQty).padStart(2, '0')}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10)
              if (!isNaN(val)) setLocalQty(val)
            }}
            onBlur={() => commitQuantity(localQty)}
            className="h-9 w-[72px] rounded-full border border-gray-100 text-center font-poppins text-[14px] font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-300"
          />

          <button
            onClick={handleDecrement}
            disabled={isDigital || isUpdating || localQty <= 1}
            aria-label="Decrease quantity"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-opacity disabled:opacity-40"
          >
            <Minus size={14} strokeWidth={2.5} />
          </button>
        </div>

        {/* Line total */}
        <div className="w-[120px] shrink-0 text-right font-poppins text-[14px] font-semibold text-gray-900">
          $ {lineTotal.toLocaleString('en-US')} {item.currency_at_add}
        </div>
      </div>

      {/* Right expand affordance */}
      {/* <Link
        href={`/marketplace/${item.artwork.slug}`}
        aria-label="View artwork details"
        className="flex w-[116px] shrink-0 items-center justify-center bg-[#FEEFEC] transition-colors hover:bg-[#FCDFDA]"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-700 text-white">
          <ChevronsRight size={16} strokeWidth={2.5} />
        </span>
      </Link> */}
    </div>
  )
}