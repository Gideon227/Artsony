import { apiClient } from '@/lib/api-client'

export type SellerRegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'

export type SellerRegistration = {
  id: string
  user_id: string
  full_name: string
  username: string
  email: string
  phone_number: string
  address: string
  city?: string | null
  state: string
  country: string
  postal_code: string | null
  email_verified_at: string | null
  status: SellerRegistrationStatus
  reviewed_by: string | null
  review_notes: string | null
  created_at: string
  updated_at: string
}

export type SubmitSellerRegistrationInput = {
  full_name: string
  username: string
  email: string
  phone_number: string
  address: string
  state: string
  country: string
  city?: string
  postal_code?: string
}

export type DispatchAddressInput = Partial<{
  phone_number: string
  address: string
  state: string
  city: string
  country: string
  postal_code: string
}>

export type EmailCodeReceipt = {
  expires_in: number
  resend_in: number
}

export type PaginatedSellerRegistrations = {
  data: SellerRegistration[]
  total: number
  page: number
  limit: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export type AdminSellerFilters = {
  status?: SellerRegistrationStatus
  page?: number
  limit?: number
}

export type SellerReviewAction = 'approve' | 'reject' | 'suspend' | 'reactivate'

type ApiResponse<T> = { success: true; data: T }

const BASE = '/api/seller-registrations'

export const sellerService = {
  getMyRegistration: () => apiClient.get<ApiResponse<SellerRegistration>>(`${BASE}/me`),

  submitRegistration: (input: SubmitSellerRegistrationInput) =>
    apiClient.post<ApiResponse<SellerRegistration>>(BASE, input),

  sendEmailCode: (email: string) =>
    apiClient.post<ApiResponse<EmailCodeReceipt>>(`${BASE}/email-code`, { email }),

  verifyEmailCode: (input: { email: string; code: string }) =>
    apiClient.post<ApiResponse<{ verified: true }>>(`${BASE}/email-code/verify`, input),

  updateDispatchAddress: (input: DispatchAddressInput) =>
    apiClient.patch<ApiResponse<SellerRegistration>>(`${BASE}/me/dispatch-address`, input),

  adminList: (filters: AdminSellerFilters) =>
    apiClient.get<ApiResponse<PaginatedSellerRegistrations>>(`${BASE}/admin`, {
      params: { status: filters.status, page: filters.page, limit: filters.limit },
    }),

  adminReview: (id: string, action: SellerReviewAction, notes?: string) =>
    apiClient.post<ApiResponse<SellerRegistration>>(`${BASE}/admin/${id}/${action}`, { notes }),
}