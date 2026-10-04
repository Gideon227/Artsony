'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useCartStore } from '@/store/cart.store'
import type { CartItemWithArtwork } from '@/types/cart'
import { DynamicTooltip } from '@/components/ui/dynamic-tooltip'
import { StepperInput } from '@/components/ui/quantity-input' 
import EditCartItem from './edit-cart-item'

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
      setLocalQty(newQty)
    } catch {
      setLocalQty(item.quantity)
    } finally {
      setIsUpdating(false)
    }
  }

  // Used for inline stepper input changes
  const handleQuantityChange = (newQty: number) => {
    if (isDigital) return
    setLocalQty(newQty)
    commitQuantity(newQty)
  }

  // Used specifically by the Edit modal
  const handleModalSave = async (newQty: number) => {
    if (isDigital) return
    await commitQuantity(newQty)
    setIsEditing(false)
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
    <>
      <div className="relative flex max-lg:flex-col w-full overflow-hidden bg-white max-lg:pb-4">
        {/* Left action column (Desktop Only) */}
        <div className="hidden lg:flex flex-col items-center justify-between py-6 px-4 shrink-0">
          <button
            onClick={handleRemove}
            aria-label="Remove item"
            className="cursor-pointer p-2"
          >
            <Image src='/icons/cancel.svg' width={24} height={24} alt='cancel icon' />
          </button>

          <button
            onClick={() => setIsEditing(true)}
            aria-label="Edit item"
            className="cursor-pointer p-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.5999 16.1612L10.5999 16.1612L3.20404 8.76532C4.21062 8.34637 5.40282 7.6582 6.53034 6.53068C7.65805 5.40298 8.34625 4.21058 8.76518 3.2039L16.1612 10.5999L16.1612 10.5999C16.7383 11.1771 17.0269 11.4657 17.2751 11.7838C17.5679 12.1592 17.8189 12.5653 18.0237 12.995C18.1973 13.3593 18.3263 13.7465 18.5844 14.5208L19.9455 18.6042C20.0726 18.9852 19.9734 19.4053 19.6894 19.6894C19.4053 19.9734 18.9852 20.0726 18.6042 19.9456L14.5208 18.5844C13.7465 18.3263 13.3593 18.1973 12.995 18.0237C12.5653 17.8189 12.1592 17.5679 11.7838 17.2751C11.4657 17.0269 11.177 16.7383 10.5999 16.1612Z" fill="#525965"/>
              <path d="M1.15178 6.71305C-0.383925 5.17735 -0.383925 2.68748 1.15178 1.15178C2.68748 -0.383928 5.17735 -0.383927 6.71306 1.15178L7.60009 2.03882C7.58795 2.0755 7.57535 2.11268 7.56228 2.15035C7.23715 3.0875 6.6237 4.31601 5.46968 5.47002C4.31567 6.62403 3.08716 7.23748 2.15002 7.56261C2.11252 7.57562 2.0755 7.58817 2.03899 7.60026L1.15178 6.71305Z" fill="#525965"/>
            </svg>
          </button>
        </div>

        {/* Main content */}
        <div className="flex flex-1 items-center max-lg:items-start max-lg:gap-3 lg:gap-6 lg:py-4 lg:pr-6">
          
          {/* 1. Thumbnail (Fixed width) */}
          <div className="relative h-[132px] w-[132px] lg:h-[152px] lg:w-[152px] shrink-0 overflow-hidden rounded-2xl bg-neutral-100">
            <Image
              src={item.artwork.thumbnail_url || '/placeholder.png'}
              alt={item.artwork.title}
              fill
              className="object-cover"
            />
          </div>

          {/* 2. Title / seller / price / type */}
          <div className="flex flex-[2] min-w-0 flex-col gap-1 font-poppins">
            <h3 className="truncate font-poppins max-lg:text-body-s lg:text-body-m font-medium text-heading">
              {item.artwork.title}
            </h3>
            <p className="font-poppins font-light max-lg:text-body-xs lg:text-body-s text-body truncate">
              By: <span className="font-medium text-heading">{item.artwork.seller_name}</span>
            </p>
            <p className="font-poppins max-lg:text-body-xs lg:text-body-s font-medium text-heading">
              $ {item.price_at_add.toLocaleString('en-US')} {item.currency_at_add}
            </p>
            <div className="hidden lg:flex items-center gap-2">
              <span className="font-poppins max-lg:text-body-xs lg:text-body-s font-light text-info-500">{artworkTypeLabel}</span>
              <DynamicTooltip 
                content="This is a physical product"
              />
            </div>

            <div className="block lg:hidden mt-2 font-poppins text-body-s font-semibold text-heading">
              $ {lineTotal.toLocaleString('en-US')} {item.currency_at_add}
            </div>

            {(item.is_unavailable || item.is_price_changed || item.is_stock_insufficient) && (
              <div className="mt-1 flex flex-col gap-0.5">
                {item.is_unavailable && (
                  <span className="text-body-xs text-red-500">No longer available</span>
                )}
                {item.is_price_changed && (
                  <span className="text-body-xs text-amber-600">Price has changed</span>
                )}
                {item.is_stock_insufficient && (
                  <span className="text-body-xs text-red-500">Not enough stock for selected quantity</span>
                )}
              </div>
            )}
          </div>

          {/* 3. Variant */}
          <div className="hidden lg:flex flex-1 min-w-0 flex-col items-center justify-center gap-2 text-center font-poppins">
            {variant ? (
              <>
                <span className="font-poppins text-body-s text-body font-light">{variant.variant_name}:</span>
                <span className="font-poppins text-body-s font-medium text-heading">{variant.option_label}</span>
              </>
            ) : (
              <span className="font-poppins text-body-s font-medium text-heading">Regular</span>
            )}
          </div>

          {/* 4. Quantity controls */}
          <div className="hidden lg:flex flex-1 min-w-0 items-center justify-center">
            <StepperInput 
              value={localQty}
              min={1}
              max={maxQty}
              disabled={isDigital || isUpdating}
              onValueChange={handleQuantityChange}
            />
          </div>

          {/* 5. Line total (Last Div - Fixed width) */}
          <div className="hidden lg:block w-[120px] shrink-0 text-right font-poppins text-body-s font-semibold text-heading">
            $ {lineTotal.toLocaleString('en-US')} {item.currency_at_add}
          </div>
          
        </div>

        {/* Mobile Stepper & Actions */}
        <div className='flex lg:hidden items-center justify-between w-full mt-4 border-t border-gray-50 pt-4'>
          <div className='w-full flex-1'>
            <StepperInput 
              value={localQty}
              min={1}
              max={maxQty}
              disabled={isDigital || isUpdating}
              onValueChange={handleQuantityChange}
            />
          </div>
            
          <div className='flex items-center gap-x-2 justify-end w-full flex-1'>
            <button
              onClick={() => setIsEditing(true)}
              className='flex items-center border rounded-full border-gray-50 p-2 '
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.4001 18.1612L11.4001 18.1612L18.796 10.7653C17.7894 10.3464 16.5972 9.6582 15.4697 8.53068C14.342 7.40298 13.6537 6.21058 13.2348 5.2039L5.83882 12.5999L5.83879 12.5999C5.26166 13.1771 4.97307 13.4657 4.7249 13.7838C4.43213 14.1592 4.18114 14.5653 3.97634 14.995C3.80273 15.3593 3.67368 15.7465 3.41556 16.5208L2.05445 20.6042C1.92743 20.9852 2.0266 21.4053 2.31063 21.6894C2.59466 21.9734 3.01478 22.0726 3.39584 21.9456L7.47918 20.5844C8.25351 20.3263 8.6407 20.1973 9.00498 20.0237C9.43469 19.8189 9.84082 19.5679 10.2162 19.2751C10.5343 19.0269 10.823 18.7383 11.4001 18.1612Z" fill="#525965"/>
                <path d="M20.8482 8.71306C22.3839 7.17735 22.3839 4.68748 20.8482 3.15178C19.3125 1.61607 16.8226 1.61607 15.2869 3.15178L14.3999 4.03882C14.4121 4.0755 14.4246 4.11268 14.4377 4.15035C14.7628 5.0875 15.3763 6.31601 16.5303 7.47002C17.6843 8.62403 18.9128 9.23749 19.85 9.56262C19.8875 9.57563 19.9245 9.58817 19.961 9.60026L20.8482 8.71306Z" fill="#525965"/>
              </svg>
            </button>

            <button 
              onClick={handleRemove}
              className='flex items-center border rounded-full border-gray-50 p-2 '
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.75 6.16667C2.75 5.70644 3.09538 5.33335 3.52143 5.33335L6.18567 5.3329C6.71502 5.31841 7.18202 4.95482 7.36214 4.41691C7.36688 4.40277 7.37232 4.38532 7.39185 4.32203L7.50665 3.94993C7.5769 3.72179 7.6381 3.52303 7.72375 3.34536C8.06209 2.64349 8.68808 2.1561 9.41147 2.03132C9.59457 1.99973 9.78848 1.99987 10.0111 2.00002H13.4891C13.7117 1.99987 13.9056 1.99973 14.0887 2.03132C14.8121 2.1561 15.4381 2.64349 15.7764 3.34536C15.8621 3.52303 15.9233 3.72179 15.9935 3.94993L16.1083 4.32203C16.1279 4.38532 16.1333 4.40277 16.138 4.41691C16.3182 4.95482 16.8778 5.31886 17.4071 5.33335H19.9786C20.4046 5.33335 20.75 5.70644 20.75 6.16667C20.75 6.62691 20.4046 7 19.9786 7H3.52143C3.09538 7 2.75 6.62691 2.75 6.16667Z" fill="#525965"/>
                <path d="M11.6068 21.9998H12.3937C15.1012 21.9998 16.4549 21.9998 17.3351 21.1366C18.2153 20.2734 18.3054 18.8575 18.4855 16.0256L18.745 11.945C18.8427 10.4085 18.8916 9.6402 18.45 9.15335C18.0084 8.6665 17.2628 8.6665 15.7714 8.6665H8.22905C6.73771 8.6665 5.99204 8.6665 5.55047 9.15335C5.10891 9.6402 5.15777 10.4085 5.25549 11.945L5.515 16.0256C5.6951 18.8575 5.78515 20.2734 6.66534 21.1366C7.54553 21.9998 8.89927 21.9998 11.6068 21.9998Z" fill="#525965"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Render the attached Edit Modal */}
      <EditCartItem
        isOpen={isEditing}
        item={item}
        isUpdating={isUpdating}
        isDigital={isDigital}
        maxQty={maxQty}
        onClose={() => setIsEditing(false)}
        onSave={handleModalSave}
      />
    </>
  )
}