'use client'

import { useMemo, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components'
import { OrderCard } from './order-card'
import type { OrderItemPhysicalWithArtwork } from '@/types/physical-order'
import { HttpError } from '@/lib/api-client'

interface Props {
  orders: OrderItemPhysicalWithArtwork[] | undefined
  isLoading: boolean
  isError: boolean
  error: unknown
  selectedId: string | undefined
  onSelect: (physicalId: string) => void
  onRetry: () => void
}

export function OrderList({ orders, isLoading, isError, error, selectedId, onSelect, onRetry }: Props) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!orders) return []
    const query = search.trim().toLowerCase()
    if (!query) return orders
    return orders.filter(
      (o) =>
        o.order_item?.artwork_title?.toLowerCase().includes(query) ||
        o.order_id.toLowerCase().includes(query),
    )
  }, [orders, search])

  return (
    <div className="flex flex-col gap-y-4 flex-1 min-h-0">
      <div className="flex gap-x-2 items-center w-full">
        <Input
          leftIcon="/home/magnifier.svg"
          placeholder="Search Order"
          className="flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search orders"
        />
        <button
          type="button"
          disabled
          aria-label="Filter orders (coming soon)"
          className="border border-gray-50 rounded-full p-2 cursor-not-allowed opacity-60"
        >
          <SlidersHorizontal size={16} className="text-body" />
        </button>
      </div>

      <div className="flex flex-col gap-y-3 overflow-y-auto flex-1 min-h-0">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[220px] rounded-xl bg-gray-50 animate-pulse" />
          ))}

        {isError && !isLoading && (
          <div className="flex flex-col items-center gap-y-3 py-12 text-center">
            <p className="font-poppins text-body-s text-body">
              {error instanceof HttpError ? error.message : 'Could not load your orders.'}
            </p>
            <button type="button" onClick={onRetry} className="text-info-500 font-poppins text-body-s underline">
              Try again
            </button>
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-y-2 py-12 text-center">
            <Search size={32} className="text-gray-200" />
            <p className="font-poppins text-body-s text-body">
              {search ? 'No orders match your search.' : 'No orders here yet.'}
            </p>
          </div>
        )}

        {!isLoading &&
          !isError &&
          filtered.map((order) => (
            <OrderCard key={order.id} order={order} selected={order.id === selectedId} onSelect={onSelect} />
          ))}
      </div>
    </div>
  )
}