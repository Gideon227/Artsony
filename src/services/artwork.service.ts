import { apiClient } from '@/lib/api-client'
import type { Artwork, PaginatedResponse, ApiResponse } from '@/types'
import type { UploadArtworkInput } from '@/schemas'

type FeedParams = {
  page?: number
  perPage?: number
  category?: string
  sort?: 'newest' | 'trending' | 'recommended'
}

type SearchParams = {
  q: string
  page?: number
  perPage?: number
  category?: string
  price?: string        // e.g. "0-500", "500-1000"
  color?: string
  size?: string
  location?: string
  sort?: 'newest' | 'trending' | 'recommended'
}

export const artworkService = {
  getFeed: (params: FeedParams = {}) =>
    apiClient.get<PaginatedResponse<Artwork>>('/api/artworks/feed', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Artwork>>(`/api/artworks/${id}`),

  create: (body: UploadArtworkInput & { imageUrl: string; thumbnailUrl: string }) =>
    apiClient.post<ApiResponse<Artwork>>('/api/artworks', body),

  update: (id: string, body: Partial<UploadArtworkInput>) =>
    apiClient.patch<ApiResponse<Artwork>>(`/api/artworks/${id}`, body),

  delete: (id: string) =>
    apiClient.delete(`/api/artworks/${id}`),

  like: (id: string) =>
    apiClient.post<ApiResponse<{ likesCount: number; isLiked: boolean }>>(`/api/artworks/${id}/like`),

  unlike: (id: string) =>
    apiClient.delete<ApiResponse<{ likesCount: number; isLiked: boolean }>>(`/api/artworks/${id}/like`),

  save: (id: string) =>
    apiClient.post(`/api/artworks/${id}/save`),

  unsave: (id: string) =>
    apiClient.delete(`/api/artworks/${id}/save`),

  search: (params: SearchParams) =>
    apiClient.get<PaginatedResponse<Artwork>>('/api/artworks/search', { params }),

  uploadImage: async (file: File): Promise<{ url: string; thumbnailUrl: string }> => {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: form,
    })
    if (!res.ok) throw new Error('Upload failed')
    return res.json() as Promise<{ url: string; thumbnailUrl: string }>
  },
}