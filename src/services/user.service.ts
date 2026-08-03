import { apiClient } from '@/lib/api-client'
import type { User, Artwork, PaginatedResponse, ApiResponse } from '@/types'
import type { EditProfileInput } from '@/schemas'

export interface PublicProfileSummary {
  id: string
  username: string
  role: string
  profile: { display_name: string | null; avatar_url: string | null } | null
}

export const userService = {
  getProfile: (username: string) =>
    apiClient.get<ApiResponse<User>>(`/api/users/${username}`),

  updateProfile: (body: EditProfileInput) =>
    apiClient.patch<ApiResponse<User>>('/api/users/me', body),

  updateAvatar: async (file: File): Promise<ApiResponse<{ avatarUrl: string }>> => {
    const form = new FormData()
    form.append('avatar', file)
    const res = await fetch('/api/users/me/avatar', { method: 'POST', body: form })
    if (!res.ok) throw new Error('Avatar upload failed')
    return res.json() as Promise<ApiResponse<{ avatarUrl: string }>>
  },

  getArtworks: (username: string, params?: { page?: number }) =>
    apiClient.get<PaginatedResponse<Artwork>>(`/api/users/${username}/artworks`, { params }),

  getSaved: (params?: { page?: number }) =>
    apiClient.get<PaginatedResponse<Artwork>>('/api/users/me/saved', { params }),

  follow: (userId: string) =>
    apiClient.post(`/api/users/${userId}/follow`),

  unfollow: (userId: string) =>
    apiClient.delete(`/api/users/${userId}/follow`),

  getFollowers: (username: string) =>
    apiClient.get<PaginatedResponse<User>>(`/api/users/${username}/followers`),

  getFollowing: (username: string) =>
    apiClient.get<PaginatedResponse<User>>(`/api/users/${username}/following`),

  getSuggested: () =>
    apiClient.get<ApiResponse<User[]>>('/api/users/suggested'),

  // Batch-resolves user ids to public profile summaries (id/username/role/
  // display_name/avatar_url). Backed by the real GET /api/users/by-ids route.
  getByIds: (ids: string[]) => {
    const unique = Array.from(new Set(ids.filter(Boolean)))
    if (unique.length === 0) return Promise.resolve({ success: true as const, data: [] as PublicProfileSummary[] })
    return apiClient.get<ApiResponse<PublicProfileSummary[]>>('/api/users/by-ids', {
      params: { ids: unique.join(',') },
    })
  },
}
