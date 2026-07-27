import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { walletService } from '@/services/wallet.service'
import { useToast } from '@/components/ui/toaster'
import type { WalletPeriod, WithdrawInput } from '@/types/wallet'

export function useWalletSummary(period: WalletPeriod) {
  return useQuery({
    queryKey: ['wallet-summary', period],
    queryFn: () => walletService.getSummary(period),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: 2,
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
    retry: 2,
  })
}

export function useWithdraw() {
  const qc = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (input: WithdrawInput) => walletService.withdraw(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallet-activity'] })
      qc.invalidateQueries({ queryKey: ['wallet-summary'] })
      success('Withdrawal submitted', 'Your withdrawal is now pending confirmation.')
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'Could not process your withdrawal.'
      error('Withdrawal failed', message)
    },
  })
}
