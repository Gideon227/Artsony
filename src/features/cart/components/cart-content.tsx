'use client'

import React, { useEffect } from 'react'
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
    return <EmptyCartPage />
  }

  // ── Has items ────────────────────────────────────────────────────────────
  return <CartPage />
}

export default CartContent