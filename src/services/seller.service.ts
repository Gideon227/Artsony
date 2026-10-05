import { apiClient } from '@/lib/api-client'

export type SellerRegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'

export type SellerRegistration = {
  id: string
  full_name: string
  username: string
  email: string
  phone_number: string
  address: string
  city?: string
  state: string
  country: string
  postal_code: string | null
  status: SellerRegistrationStatus
  reviewed_by: string | null
  review_notes: string | null
  created_at: string
  updated_at: string
}

export type DispatchAddressInput = Partial<{
  phone_number: string
  address: string
  state: string
  country: string
  postal_code: string
}>

export const sellerService = {
  getMyRegistration: () =>
    apiClient.get<{ success: true; data: SellerRegistration }>('/api/seller-registrations/me'),

  updateDispatchAddress: (input: DispatchAddressInput) =>
    apiClient.patch<{ success: true; data: SellerRegistration }>(
      '/api/seller-registrations/me/dispatch-address',
      input,
    ),
}
