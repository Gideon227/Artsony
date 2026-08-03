import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types'
import type { Comment, CreateCommentInput, PaginatedResponse } from '@/types/social'

export const commentService = {
  create: (input: CreateCommentInput): Promise<ApiResponse<Comment>> =>
    apiClient.post('/api/comments', input),

  listForArtwork: (artworkId: string, params: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Comment>> => {
    const q = new URLSearchParams()
    if (params.page)  q.set('page', String(params.page))
    if (params.limit) q.set('limit', String(params.limit))
    return apiClient.get(`/api/comments/artwork/${artworkId}?${q.toString()}`)
  },

  listReplies: (commentId: string, params: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Comment>> => {
    const q = new URLSearchParams()
    if (params.page)  q.set('page', String(params.page))
    if (params.limit) q.set('limit', String(params.limit))
    return apiClient.get(`/api/comments/${commentId}/replies?${q.toString()}`)
  },

  delete: (commentId: string): Promise<ApiResponse<null>> =>
    apiClient.delete(`/api/comments/${commentId}`),
}