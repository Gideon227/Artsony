'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateReviewInput } from '@/services/review.service'
import { reviewService } from '@/services/review.service'
import { HttpError } from '@/lib/api-client'
import { useAuthStore, selectIsAuthenticated } from '@/store'
import { useToast } from '@/components/ui/toaster'
import { STALE_TIMES } from '@/constants'

export const reviewKeys = {
  all: ['reviews'] as const,
  eligibility: (orderItemId: string) => [...reviewKeys.all, 'eligibility', orderItemId] as const,
}

export function useReviewEligibility(orderItemId: string | undefined, enabled = true) {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  return useQuery({
    queryKey: reviewKeys.eligibility(orderItemId ?? ''),
    queryFn: () => reviewService.getEligibility(orderItemId!).then((res) => res.data),
    enabled: enabled && isAuthenticated && Boolean(orderItemId),
    staleTime: STALE_TIMES.fast,
  })
}

export function useSubmitReview() {
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (input: CreateReviewInput) => reviewService.create(input).then((res) => res.data),

    onSuccess: (_review, input) => {
      success('Review submitted', 'Thanks for sharing your feedback.')
      void queryClient.invalidateQueries({ queryKey: reviewKeys.eligibility(input.order_item_id) })
    },

    onError: (err, input) => {
      if (err instanceof HttpError && err.statusCode === 409) {
        void queryClient.invalidateQueries({ queryKey: reviewKeys.eligibility(input.order_item_id) })
        error('Review not submitted', err.message)
        return
      }
      error('Could not submit review', err instanceof HttpError ? err.message : 'Please try again.')
    },
  })
}
