import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sellerService, type DispatchAddressInput } from '@/services/seller.service'
import { useToast } from '@/components/ui/toaster'
import { HttpError } from '@/lib/api-client'
import { STALE_TIMES } from '@/constants'

const KEY = ['my-seller-registration'] as const

// A 404 here just means "never applied to sell" — a normal, common state,
// not an error — so this doesn't retry or surface a toast on failure.
export function useMySellerRegistration() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => sellerService.getMyRegistration().then((r) => r.data),
    staleTime: STALE_TIMES.fast,
    retry: false,
    throwOnError: false,
  })
}

export function useUpdateDispatchAddress() {
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (input: DispatchAddressInput) => sellerService.updateDispatchAddress(input),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(KEY, data)
      success('Saved', 'Your dispatch address has been updated.')
    },
    onError: (err) => {
      error('Could not save', err instanceof HttpError ? err.message : 'Please try again.')
    },
  })
}
