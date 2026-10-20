import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS, STALE_TIMES } from '@/constants'
import { sellerActivationService } from '@/services/order/seller-activation.service'
import { sellerSalesService } from '@/services/order/seller-sales.service'
import type { SaveShippingInput, SellerSalesParams } from '@/types/seller-sales'

export const sellerSalesKeys = {
  all: [...QUERY_KEYS.orders, 'seller-sales'] as const,
  list: (params: SellerSalesParams) => [...QUERY_KEYS.orders, 'seller-sales', 'list', params] as const,
  counts: [...QUERY_KEYS.orders, 'seller-sales', 'counts'] as const,
  infinite: (params: Omit<SellerSalesParams, 'page'>) =>
    [...QUERY_KEYS.orders, 'seller-sales', 'infinite', params] as const,
  detail: (orderItemId: string) => [...QUERY_KEYS.orders, 'seller-sales', 'detail', orderItemId] as const,
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

export function useSellerSalesInfinite(params: Omit<SellerSalesParams, 'page'>, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: sellerSalesKeys.infinite(params),
    queryFn: ({ pageParam, signal }) => sellerSalesService.list({ ...params, page: pageParam }, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.has_next ? lastPage.page + 1 : undefined),
    staleTime: STALE_TIMES.fast,
    enabled,
  })
}

export function useSellerSaleDetail(orderItemId: string | null) {
  return useQuery({
    queryKey: sellerSalesKeys.detail(orderItemId ?? ''),
    queryFn: ({ signal }) => sellerSalesService.detail(orderItemId as string, signal),
    select: (response) => response.data,
    staleTime: STALE_TIMES.fast,
    enabled: orderItemId !== null,
  })
}

export function useSaveShipping() {
  return useMutation({
    mutationFn: ({ orderItemId, input }: { orderItemId: string; input: SaveShippingInput }) =>
      sellerActivationService.saveShipping(orderItemId, input),
  })
}

export function useCreateActivationSession() {
  return useMutation({
    mutationFn: (orderItemId: string) => sellerActivationService.createSession(orderItemId).then((response) => response.data),
  })
}

const SESSION_POLL_MS = 2000

export function useActivationSessionState(orderItemId: string, sessionId: string | null) {
  return useQuery({
    queryKey: [...QUERY_KEYS.orders, 'seller-sales', 'activation-session', orderItemId, sessionId] as const,
    queryFn: ({ signal }) => sellerActivationService.sessionState(orderItemId, sessionId as string, signal),
    select: (response) => response.data,
    enabled: sessionId !== null,
    refetchInterval: (query) => {
      const status = query.state.data?.data.status
      return status === 'PENDING' || status === 'PROCESSING' ? SESSION_POLL_MS : false
    },
    refetchIntervalInBackground: true,
    staleTime: 0,
    gcTime: 0,
  })
}

export function useInvalidateSellerSales() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: sellerSalesKeys.all })
}
