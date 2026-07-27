import { Suspense } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { OrdersPageContent } from '@/features/orders/my-orders/components/orders-page-content'

export default function MyOrderPage() {
  return (
    <>
      <Navbar />
      <div className="px-8 py-6 flex bg-white min-h-[calc(100vh-96px)]">
        <div className="bg-secondary-50 rounded-2xl p-4 flex gap-x-4 w-full">
          <Suspense fallback={null}>
            <OrdersPageContent />
          </Suspense>
        </div>
      </div>
    </>
  )
}