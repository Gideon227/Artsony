import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { shippingAddressService, type ShippingAddressInput } from '@/services/shipping-address.service'
import { useToast } from '@/components/ui/toaster'
import { HttpError } from '@/lib/api-client'
import { STALE_TIMES } from '@/constants'

const KEY = ['shipping-addresses'] as const

export function useShippingAddresses() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => shippingAddressService.list().then((r) => r.data),
    staleTime: STALE_TIMES.fast,
  })
}

export function useCreateShippingAddress() {
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (input: ShippingAddressInput) => shippingAddressService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY })
      success('Address added', 'Your delivery address has been saved.')
    },
    onError: (err) => {
      error('Could not save address', err instanceof HttpError ? err.message : 'Please try again.')
    },
  })
}

export function useUpdateShippingAddress() {
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ShippingAddressInput> }) =>
      shippingAddressService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY })
      success('Address updated', 'Your changes have been saved.')
    },
    onError: (err) => {
      error('Could not update address', err instanceof HttpError ? err.message : 'Please try again.')
    },
  })
}

export function useSetDefaultShippingAddress() {
  const queryClient = useQueryClient()
  const { error } = useToast()

  return useMutation({
    mutationFn: (id: string) => shippingAddressService.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY })
    },
    onError: (err) => {
      error('Could not set default address', err instanceof HttpError ? err.message : 'Please try again.')
    },
  })
}

export function useDeleteShippingAddress() {
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (id: string) => shippingAddressService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY })
      success('Address removed', '')
    },
    onError: (err) => {
      error('Could not remove address', err instanceof HttpError ? err.message : 'Please try again.')
    },
  })
}
