import { apiClient } from '@/lib/api-client'
import type { CommerceApiSuccess } from '@/types/order'

export type ReviewEligibility = {
  eligible: boolean
  reason?: string
}

export type CreateReviewInput = {
  order_item_id: string
  rating: number
  comment?: string
  condition_rating?: number
  delivery_rating?: number
}

export type OrderReview = {
  id: string
  order_item_id: string
  order_id: string
  artwork_id: string
  buyer_id: string
  seller_id: string
  rating: number
  comment: string | null
  condition_rating: number | null
  delivery_rating: number | null
  created_at: string
  updated_at: string
}

export const reviewService = {
  getEligibility: (orderItemId: string) =>
    apiClient.get<CommerceApiSuccess<ReviewEligibility>>(`/api/reviews/order-item/${orderItemId}/eligibility`),

  create: (input: CreateReviewInput) =>
    apiClient.post<CommerceApiSuccess<OrderReview>>('/api/reviews', input),
}
