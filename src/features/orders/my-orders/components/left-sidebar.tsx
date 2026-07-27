'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ORDER_TABS } from '../constant'
import { OrderList } from './order-list'
import { useBuyerPhysicalOrders } from '@/hooks/use-physical-order'
import type { BuyerOrderView, OrderItemPhysicalWithArtwork } from '@/types/physical-order'
import { cn } from '@/lib/utils'

interface Props {
  view: BuyerOrderView
  selectedId: string | undefined
  onViewChange: (view: BuyerOrderView) => void
  onSelect: (physicalId: string) => void
}

export function LeftSideBar({ view, selectedId, onViewChange, onSelect }: Props) {
  const router = useRouter()
  const { data, isLoading, isError, error, refetch } = useBuyerPhysicalOrders(view)
  const orders = data?.data as OrderItemPhysicalWithArtwork[] | undefined

  return (
    <div className="flex flex-col gap-y-4 w-[396px] min-h-0">
      <div className="flex flex-col gap-y-8 pb-4">
        <div className="flex items-center justify-start gap-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="p-2 border border-gray-50 rounded-full"
          >
            <ArrowLeft color="#525965" size={24} />
          </button>
          <h4 className="font-raleway font-semibold text-h5 text-body tracking-wide leading-10">My Orders</h4>
        </div>

        <div className="flex items-center gap-x-2 w-full">
          {ORDER_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => onViewChange(tab.value)}
              aria-pressed={view === tab.value}
              className={cn(
                'cursor-pointer flex-1 px-6 py-3 rounded-2xl font-poppins text-body-s transition-colors',
                view === tab.value
                  ? 'bg-primary-500 text-white border border-primary-500'
                  : 'border border-gray-50 text-body',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <OrderList
        orders={orders}
        isLoading={isLoading}
        isError={isError}
        error={error}
        selectedId={selectedId}
        onSelect={onSelect}
        onRetry={refetch}
      />
    </div>
  )
}