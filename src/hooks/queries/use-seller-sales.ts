import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS, STALE_TIMES } from '@/constants'
import { sellerSalesService } from '@/services/order/seller-sales.service'
import type { SellerSalesParams } from '@/types/seller-sales'

export const sellerSalesKeys = {
  all: [...QUERY_KEYS.orders, 'seller-sales'] as const,
  list: (params: SellerSalesParams) => [...QUERY_KEYS.orders, 'seller-sales', 'list', params] as const,
  counts: [...QUERY_KEYS.orders, 'seller-sales', 'counts'] as const,
}

export function useSellerSales(params: SellerSalesParams, enabled: boolean) {
  return useQuery({
    queryKey: sellerSalesKeys.list(params),
    queryFn: ({ signal }) => sellerSalesService.list(params, signal),
    placeholderData: keepPreviousData,
    staleTime: STALE_TIMES.fast,
    enabled,
  })
}

export function useSellerSalesCounts(enabled: boolean) {
  return useQuery({
    queryKey: sellerSalesKeys.counts,
    queryFn: ({ signal }) => sellerSalesService.counts(signal),
    staleTime: STALE_TIMES.fast,
    enabled,
  })
}
