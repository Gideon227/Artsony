'use client'

import { Suspense, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { Spinner } from '@/components'
import { useCartStore } from '@/store/cart.store'
import { CheckoutForm } from '@/features/checkout/components/checkout-form'
import { CheckoutFooterLinks } from '@/features/checkout/components/checkout-footer-links'

// 1. Move all the search params, cart logic, and page content into this inner component
function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { cart, isLoading, fetchCart } = useCartStore()

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const requestedIds = useMemo(() => {
    const raw = searchParams.get('items')
    return raw ? raw.split(',').filter(Boolean) : null
  }, [searchParams])

  const items = useMemo(() => {
    if (!cart) return []
    if (!requestedIds) return cart.items
    const idSet = new Set(requestedIds)
    return cart.items.filter((item) => idSet.has(item.id))
  }, [cart, requestedIds])

  return (
    <>
      <div className="flex items-center justify-between px-8 pt-10 pb-12">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 text-gray-600 transition-colors hover:bg-gray-50"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-raleway font-semibold text-h4 leading-10 text-body tracking-wide">
            Checkout
          </h1>
        </div>
        <span className="font-poppins text-[14px] text-gray-500">
          Items/<span className="font-semibold text-primary-500">{items.length}</span>
        </span>
      </div>

      {isLoading && !cart ? (
        <div className="flex justify-center py-32">
          <Spinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-32 text-center">
          <p className="font-poppins text-gray-500">
            We couldn&apos;t find those items in your cart anymore.
          </p>
          <Link
            href="/cart"
            className="rounded-full bg-primary-500 px-6 py-3 font-poppins text-[14px] font-medium text-white hover:bg-primary-600"
          >
            Back to Cart
          </Link>
        </div>
      ) : (
        <CheckoutForm items={items} />
      )}

      <CheckoutFooterLinks />
    </>
  )
}

// 2. Export the main page, wrapping the inner component in Suspense
export default function CheckoutPage() {
  return (
    <div className="bg-white">
      <Navbar />
      
      <Suspense
        fallback={
          <div className="flex justify-center py-32">
            <Spinner size="lg" />
          </div>
        }
      >
        <CheckoutContent />
      </Suspense>
    </div>
  )
}