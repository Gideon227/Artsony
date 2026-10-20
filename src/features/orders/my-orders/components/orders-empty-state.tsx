'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components'
import Image from 'next/image'

function OrdersEmptyIllustration() {
  return (
    <svg
      width="320"
      height="280"
      viewBox="0 0 320 280"
      fill="none"
      role="img"
      aria-label="No orders illustration placeholder"
      className="max-w-full h-auto"
    >
      <circle cx="170" cy="120" r="100" className="fill-gray-50" />
      <circle cx="170" cy="120" r="60" className="fill-gray-100" />
      <ellipse cx="160" cy="236" rx="120" ry="14" className="fill-gray-100" />
      <circle cx="262" cy="224" r="14" className="fill-primary-500" />
      <circle cx="70" cy="214" r="12" className="fill-primary-500" />
    </svg>
  )
}

export function OrdersEmptyState() {
  const router = useRouter()

  return (
    <section className="flex-1 relative overflow-x-hidden overflow-y-auto scrollbar-hide bg-white rounded-2xl border-2 border-gray-50 px-4 lg:px-8 pt-12 pb-30 flex flex-col gap-y-6 min-h-screen h-full">
      <div className='absolute top-10 md:rotate-90' style={{ right: '-60px' }}>
        <Image src='/upload/vector.svg' width={248} height={248} className='max-md:w-8 w-62 h-auto'  alt='vector element' />
      </div>

      <div className='absolute md:-rotate-90' style={{ left: '-60px', bottom: '-60px' }}>
        <Image src='/upload/vector.svg' width={248} height={248} className='max-md:w-30' alt='vector element' />
      </div>
      
      <div className="flex items-center gap-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="p-2 w-10 h-10 border border-gray-50 rounded-full"
        >
          <ArrowLeft color="#525965" size={24} />
        </button>
        <h4 className="font-raleway font-semibold text-h5 text-body tracking-wide leading-10">My Orders</h4>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-y-8 text-center">
        {/* <OrdersEmptyIllustration /> */}

        <Image src='/illustrations/empty-inbox.svg' width={382} height={400} alt='empty order illustration' className='w-[382px] h-100 max-md:w-[90%] lg:h-auto'/>

        <div className="flex flex-col items-center gap-y-3 max-md:w-full" style={{ maxWidth: '552px' }}>
          <h5 className="font-poppins font-medium max-md:text-body-m md:text-h6 text-heading tracking-wide">No Orders Yet</h5>
          <p className="font-poppins text-body-s md:text-body-m text-body tracking-wide">
            You haven&apos;t purchased any artwork yet. Visit the Artsony Store to discover original artwork from
            creators around the world and find something that speaks to you.
          </p>
        </div>

        <Button rightIcon="/icons/alt-arrow-right-double.svg" onClick={() => router.push('/shop')}>
          Artsony Shop
        </Button>
      </div>
    </section>
  )
}
