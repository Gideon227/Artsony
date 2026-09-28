import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types'

export const blockService = {
  blockUser: async (userId: string): Promise<void> => {
    await apiClient.post<ApiResponse<void>>(`/api/blocks/${userId}`)
  },

  unblockUser: async (userId: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/api/blocks/${userId}`)
  },
}
