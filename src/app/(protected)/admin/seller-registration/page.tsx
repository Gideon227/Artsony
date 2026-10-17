'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { buttonVariants } from '@/components'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { selectIsHydrated, selectUser, useAuthStore } from '@/store'
import { SellerApplicationsView } from '@/features/admin/seller-applications/components/seller-applications-view'

export default function AdminSellerRegistrationsPage() {
  const user = useAuthStore(selectUser)
  const isHydrated = useAuthStore(selectIsHydrated)

  return (
    <div className='min-h-screen flex flex-col bg-white'>
      <Navbar />
      <main className='flex-1 flex flex-col justify-center px-4 py-8 sm:px-8 md:py-12 lg:px-22'>
        {!isHydrated ? (
          <div className='mx-auto flex w-full max-w-5xl flex-col gap-y-4' aria-busy='true'>
            <Skeleton className='h-10 w-64' />
            <Skeleton className='h-28 w-full rounded-2xl' />
            <Skeleton className='h-28 w-full rounded-2xl' />
          </div>
        ) : user?.role !== 'ADMIN' ? (
          <div
            role='alert'
            className='mx-auto my-auto flex w-full max-w-3xl flex-col items-center gap-y-6 rounded-2xl border border-gray-50 px-4 py-10 text-center sm:px-12'
          >
            <h5 className='font-raleway font-semibold text-h5 text-primary-500 tracking-wide'>You don&apos;t have access to this page</h5>
            <p className='font-poppins text-body-s text-body tracking-wide leading-6'>
              Seller applications can only be reviewed by Artsony administrators.
            </p>
            <Link href='/home' className={cn(buttonVariants({ size: 'lg' }), 'w-full sm:w-auto')}>
              Back to Home
            </Link>
          </div>
        ) : (
          <Suspense fallback={null}>
            <SellerApplicationsView />
          </Suspense>
        )}
      </main>
    </div>
  )
}