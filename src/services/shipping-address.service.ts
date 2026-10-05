import { apiClient } from '@/lib/api-client'

export type ShippingAddress = {
  id: string
  label?: string | null
  full_name: string
  phone: string
  address_line_1: string
  address_line_2?: string | null
  city: string
  state: string
  postal_code: string
  country_code: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export type ShippingAddressInput = Omit<ShippingAddress, 'id' | 'is_default' | 'created_at' | 'updated_at'> & {
  is_default?: boolean
}

export const shippingAddressService = {
  list: () =>
    apiClient.get<{ success: true; data: ShippingAddress[] }>('/api/shipping-addresses'),

  create: (input: ShippingAddressInput) =>
    apiClient.post<{ success: true; data: ShippingAddress }>('/api/shipping-addresses', input),

  update: (id: string, input: Partial<ShippingAddressInput>) =>
    apiClient.patch<{ success: true; data: ShippingAddress }>(`/api/shipping-addresses/${id}`, input),

  setDefault: (id: string) =>
    apiClient.post<{ success: true; data: ShippingAddress }>(`/api/shipping-addresses/${id}/default`),

  remove: (id: string) =>
    apiClient.delete<void>(`/api/shipping-addresses/${id}`),
}
