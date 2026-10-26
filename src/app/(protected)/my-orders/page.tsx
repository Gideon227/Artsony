import { Suspense } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { OrdersPageContent } from '@/features/orders/my-orders/components/orders-page-content'

export default function MyOrderPage() {
  return (
    <>
      {/* `contents` keeps the sticky navbar's layout unchanged on desktop; it is
          hidden on phones, where the page has its own header. */}
      <div className="contents max-md:hidden">
        <Navbar />
      </div>
      <div className="lg:px-8 lg:py-6 flex bg-white min-h-screen max-lg:pb-16 scrollbar-hide">
        <div className="bg-secondary-50 rounded-2xl max-lg:bg-white max-lg:rounded-none lg:p-4 flex gap-x-4 w-full scrollbar-hide">
          <Suspense fallback={null}>
            <OrdersPageContent />
          </Suspense>
        </div>
      </div>
    </>
  )
}