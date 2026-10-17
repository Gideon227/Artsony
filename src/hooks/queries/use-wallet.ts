import { studioRetry } from '@/lib/studio/query'
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { walletService } from '@/services/wallet.service'
import type { WalletPeriod, WithdrawInput } from '@/types/wallet'

export function useWalletSummary(period: WalletPeriod) {
  return useQuery({
    queryKey: ['wallet-summary', period],
    queryFn: () => walletService.getSummary(period),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: studioRetry,
  })
}

/**
 * Fetches the full activity list; filtering/sorting/pagination is applied
 * client-side via lib/wallet/filters.ts until the backend supports these
 * filters natively (see services/wallet.service.ts).
 */
export function useWalletActivity() {
  return useQuery({
    queryKey: ['wallet-activity'],
    queryFn: () => walletService.getActivity(),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    retry: studioRetry,
  })
}

export function useWithdraw() {
  const qc = useQueryClient()

  // Outcome feedback (success / failed / field errors) is shown by the withdraw
  // flow itself, so this hook only keeps the cached wallet data fresh.
  return useMutation({
    mutationFn: (input: WithdrawInput) => walletService.withdraw(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallet-activity'] })
      qc.invalidateQueries({ queryKey: ['wallet-summary'] })
    },
  })
}
