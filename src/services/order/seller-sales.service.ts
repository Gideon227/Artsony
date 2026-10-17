import { apiClient } from '@/lib/api-client'
import type {
  SellerSalesCountsResponse,
  SellerSalesParams,
  SellerSalesResponse,
} from '@/types/seller-sales'

export const sellerSalesService = {
  list: (params: SellerSalesParams, signal?: AbortSignal) =>
    apiClient.get<SellerSalesResponse>('/api/orders/sales/lines', {
      params,
      ...(signal && { signal }),
    }),

  counts: (signal?: AbortSignal) =>
    apiClient.get<SellerSalesCountsResponse>('/api/orders/sales/lines/counts', {
      ...(signal && { signal }),
    }),
}
