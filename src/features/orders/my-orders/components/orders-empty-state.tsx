'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components'
import Image from 'next/image'

export function OrdersEmptyState() {
  const router = useRouter()

  return (
    <section className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-white px-4 py-4 lg:rounded-2xl lg:border-2 lg:border-gray-50 lg:px-8">
      {/* Decorative elements */}
      <div
        className="pointer-events-none absolute -top-6 right-[-60px] rotate-90"
        aria-hidden="true"
      >
        <Image
          src="/upload/vector.svg"
          width={248}
          height={248}
          className="h-auto w-40 lg:w-56"
          alt=""
        />
      </div>

      <div
        className="pointer-events-none absolute -bottom-16 left-[-60px] -rotate-90"
        aria-hidden="true"
      >
        <Image
          src="/upload/vector.svg"
          width={248}
          height={248}
          className="h-auto w-40 lg:w-56"
          alt=""
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex shrink-0 items-center gap-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-50"
        >
          <ArrowLeft color="#525965" size={24} />
        </button>

        <h4 className="font-raleway text-h5 font-semibold leading-10 tracking-wide text-body">
          My Orders
        </h4>
      </header>

      {/* Empty state content */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center gap-y-3 overflow-hidden py-2 text-center sm:gap-y-4 lg:gap-y-5">
        {/* Illustration */}
        <div className="flex min-h-0 w-full flex-1 items-center justify-center">
          <Image
            src="/illustrations/empty-inbox.svg"
            width={382}
            height={400}
            alt="Empty inbox illustration"
            priority
            className="h-full max-h-full w-auto max-w-full object-contain"
          />
        </div>

        {/* Text */}
        <div className="flex shrink-0 flex-col items-center gap-y-2 px-2 sm:gap-y-3" style={{ maxWidth: '552px' }}>
          <h5 className="font-poppins text-body-m font-medium tracking-wide text-heading md:text-h6">
            No Orders Yet
          </h5>

          <p className="font-poppins text-body-s tracking-wide text-body md:text-body-m">
            You haven&apos;t purchased any artwork yet. Visit the Artsony Store to discover original artwork from
            creators around the world and find something that speaks to you.
          </p>
        </div>

        {/* Action */}
        <div className="shrink-0 pt-1">
          <Button
            rightIcon="/icons/alt-arrow-right-double.svg"
            onClick={() => router.push('/shop')}
          >
            Artsony Shop
          </Button>
        </div>
      </div>
    </section>
  )
}