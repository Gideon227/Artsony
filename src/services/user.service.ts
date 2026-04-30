import { apiClient } from '@/lib/api-client'
import type { User, Artwork, PaginatedResponse, ApiResponse } from '@/types'
import type { EditProfileInput } from '@/schemas'

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
}
