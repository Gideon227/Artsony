import type { Metadata } from 'next'
import { Suspense } from 'react'
import {
  OrderManagementPage,
  OrderManagementSkeleton,
} from '@/features/orders/order-management/components/order-management-page'

export const metadata: Metadata = { title: 'Order Management' }

export default function Page() {
  return (
    <Suspense fallback={<OrderManagementSkeleton />}>
      <OrderManagementPage />
    </Suspense>
  )
}
