import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types'
import type {
  Cart,
  AddToCartInput,
  UpdateCartItemInput,
} from '@/types/cart'

export const cartService = {
  // ── Read ───────────────────────────────────────────────────────────────────
  getCart: (): Promise<ApiResponse<Cart>> =>
    apiClient.get<ApiResponse<Cart>>('/api/cart'),

  // ── Writes ─────────────────────────────────────────────────────────────────
  addItem: (payload: AddToCartInput): Promise<ApiResponse<Cart>> =>
    apiClient.post<ApiResponse<Cart>>('/api/cart/items', payload),

  updateItem: (id: string, payload: UpdateCartItemInput): Promise<ApiResponse<Cart>> =>
    apiClient.patch<ApiResponse<Cart>>(`/api/cart/items/${id}`, payload),

  removeItem: (id: string): Promise<ApiResponse<Cart>> =>
    apiClient.delete<ApiResponse<Cart>>(`/api/cart/items/${id}`),

  clearCart: (): Promise<void> =>
    apiClient.delete<void>('/api/cart'),
}