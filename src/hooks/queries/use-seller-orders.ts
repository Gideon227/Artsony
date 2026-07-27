import { useQuery, keepPreviousData } from '@tanstack/react-query'
// Adjust this import to wherever order.service.ts actually lives in your repo.
import { orderService } from '@/services/order/order.service'
import type { Order } from '@/types/order'

/**
 * Fetches a broad, unfiltered page of the seller's orders. Only sort_order is a
 * real server-side filter today (see lib/orders/filters.ts for why). limit is
 * intentionally generous so the client-side filter pipeline has enough data to
 * work with — revisit once the backend supports the full filter set server-side.
 */
export function useSellerOrders(sortOrder: 'asc' | 'desc') {
  return useQuery({
    queryKey: ['seller-orders', sortOrder],
    queryFn: async (): Promise<Order[]> => {
      const res = await orderService.getSellerOrders({ page: 1, limit: 100, sort_order: sortOrder })
      return res.data
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: 2,
  })
}