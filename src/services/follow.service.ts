import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types'
import type { FollowUser, PaginatedResponse } from '@/types/social'

export const followService = {
  toggle: (userId: string): Promise<ApiResponse<{ is_following: boolean }>> =>
    apiClient.post(`/api/follows/${userId}/toggle`, {}),

  isFollowing: (userId: string): Promise<ApiResponse<{ is_following: boolean }>> =>
    apiClient.get(`/api/follows/${userId}/is-following`),

  listFollowers: (userId: string, params: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<FollowUser>> => {
    const q = new URLSearchParams()
    if (params.page)  q.set('page', String(params.page))
    if (params.limit) q.set('limit', String(params.limit))
    return apiClient.get(`/api/follows/${userId}/followers?${q.toString()}`)
  },

  listFollowing: (userId: string, params: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<FollowUser>> => {
    const q = new URLSearchParams()
    if (params.page)  q.set('page', String(params.page))
    if (params.limit) q.set('limit', String(params.limit))
    return apiClient.get(`/api/follows/${userId}/following?${q.toString()}`)
  },
}