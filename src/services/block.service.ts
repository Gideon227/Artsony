import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types'
import type { BlockedUser, PaginatedResponse } from '@/types/social'

export const blockService = {
  blockUser: async (userId: string): Promise<void> => {
    await apiClient.post<ApiResponse<void>>(`/api/blocks/${userId}`)
  },

  listBlocked: (params: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<BlockedUser>> => {
    const q = new URLSearchParams()
    if (params.page) q.set('page', String(params.page))
    if (params.limit) q.set('limit', String(params.limit))
    return apiClient.get(`/api/blocks?${q.toString()}`)
  },

  unblockUser: async (userId: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/api/blocks/${userId}`)
  },
}
