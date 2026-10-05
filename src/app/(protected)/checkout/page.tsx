'use client'

import { Suspense, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { Spinner } from '@/components'
import { ErrorState } from '@/components/feedback/states'
import { useCartStore } from '@/store/cart.store'
import { CheckoutForm } from '@/features/checkout/components/checkout-form'
import { CheckoutFooterLinks } from '@/features/checkout/components/checkout-footer-links'

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { cart, isLoading, error, fetchCart } = useCartStore()

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
      <div className="flex items-center justify-between border-b border-gray-50 px-4 py-4 lg:border-b-0 lg:px-8 lg:pb-12 lg:pt-10">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-50 text-gray-400 transition-colors hover:bg-gray-50/40 focus-visible:outline-2 focus-visible:outline-primary-500"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-raleway text-h6 font-semibold leading-10 tracking-wide text-body lg:text-h4">
            Checkout
          </h1>
        </div>
        <span className="hidden font-poppins text-body-s text-gray-500 lg:inline">
          Items/<span className="font-semibold text-primary-500">{items.length}</span>
        </span>
      </div>

      <div className="pt-6 lg:pt-0">
        {isLoading && !cart ? (
          <div className="flex justify-center py-32">
            <Spinner size="lg" />
          </div>
        ) : error && !cart ? (
          <ErrorState
            title="Couldn't load your checkout"
            description={error}
            onRetry={() => fetchCart()}
          />
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 px-4 py-32 text-center">
            <p className="font-poppins text-gray-400">
              We couldn&apos;t find those items in your cart anymore.
            </p>
            <Link
              href="/cart"
              className="rounded-full bg-primary-500 px-6 py-3 font-poppins text-body-s font-medium text-white hover:bg-primary-600"
            >
              Back to Cart
            </Link>
          </div>
        ) : (
          <CheckoutForm items={items} />
        )}
      </div>

      <CheckoutFooterLinks />
    </>
  )
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="hidden lg:block">
        <Navbar />
      </div>

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
