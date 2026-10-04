'use client'

import React, { useEffect } from 'react'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components'
import { useCartStore } from '@/store/cart.store'
import { useAuthStore, selectIsAuthenticated } from '@/store'
import EmptyCartPage from './empty-cart-page'
import CartPage from './cart-page' // your existing filled-cart component

// The cart page itself is open to guests (per product decision — only
// checkout requires an account), but the cart API is user-scoped on the
// backend, so there's nothing to fetch for a guest yet. Rather than hitting
// the API and showing a raw 401 error, guests get a sign-in prompt here and
// checkout remains the actual gate.
const GuestCartPrompt = () => {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div className='py-[85px] mb-14 flex justify-center items-center bg-white h-screen'>
      {/* Changed w-[509px] to w-full max-w-[509px] and added px-4 for mobile padding */}
      <div className='w-full max-w-[509px] px-4 lg:h-[590px]'>
        
        {/* Fixed typo: changed 'item-center' to 'items-center' */}
        <div className='flex flex-col justify-center items-center gap-y-12 w-full'>
          
          {/* Added mx-auto just to ensure the image block centers within its container */}
          <div className="relative mx-auto h-[168px] w-[203px] lg:h-[378px] lg:w-[448px]">
            <Image
              src='/images/empty-cart.svg'
              fill
              className="object-cover"
              alt='empty cart icon'
            />
          </div>
          
          <div className='flex flex-col gap-y-4 justify-center items-center text-center'>
            <p className='font-poppins font-medium max-lg:text-body-m lg:text-xl leading-8 tracking-wide text-heading'>
              Sign in to see what&apos;s in your cart
            </p>
            <p className='max-w-[509px] font-poppins max-lg:text-body-xs lg:text-body-m text-body tracking-wide text-center leading-6'>
              Your cart is tied to your account — log in to add pieces and check out.
            </p>
            <Button
              onClick={() => router.push(`/login?next=${encodeURIComponent(pathname)}`)}
              variant='primary'
              size='lg'
              rightIcon='/icons/alt-arrow-right-double.svg'
              className='px-6'
            >
              Log in
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

const CartContent = () => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const { cart, isLoading, error, fetchCart } = useCartStore()

  useEffect(() => {
    if (!isAuthenticated) return
    fetchCart()
  }, [isAuthenticated, fetchCart])

  if (!isAuthenticated) {
    return <GuestCartPrompt />
  }

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
