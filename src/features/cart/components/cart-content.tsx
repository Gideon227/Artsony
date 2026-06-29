'use client'

import React, { useEffect } from 'react'
import Image from 'next/image'
import { useCartStore } from '@/store/cart.store'
import EmptyCartPage from './empty-cart-page'
import CartPage from './cart-page' // your existing filled-cart component

const CartContent = () => {
  const { cart, isLoading, error, fetchCart } = useCartStore()

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  // ── Loading (first fetch only — cart is still null) ─────────────────────
  if (isLoading && !cart) {
    return (
      <div className='flex justify-center items-center py-40'>
        <div className='h-10 w-10 animate-spin rounded-full border-b-2 border-primary-500' />
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error && !cart) {
    return (
      <div className='flex justify-center items-center py-40'>
        <p className='font-poppins text-red-500'>{error}</p>
      </div>
    )
  }

  // ── Empty (cart fetched but has no items) ────────────────────────────────
  if (!cart || cart.items.length === 0) {
    return (
      <div className='flex justify-between items-center py-12 px-8'>
        {/* Header */}
        <div className='flex justify-between items-center w-full'>
          <h2 className='font-raleway font-semibold text-body text-h4 leading-10 tracking-wide'>Cart</h2>
          <div className='flex gap-3 items-center'>
            <div className='rounded-full bg-primary-500 p-2'>
              <Image src='/icons/cart-white.svg' width={24} height={24} alt='cart icon' />
            </div>
            <p className='font-raleway font-medium text-h5 text-body leading-8 tracking-wide'>
              0
            </p>
          </div>
        </div>
        <EmptyCartPage />
      </div>
    )
  }

  // ── Has items ────────────────────────────────────────────────────────────
  return <CartPage />
}

export default CartContent