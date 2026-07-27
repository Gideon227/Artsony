import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types'
import type { Moodboard, MoodboardSummary } from '@/features/moodboards/types'

export const moodboardService = {
  list: () =>
    apiClient.get<ApiResponse<MoodboardSummary[]>>('/api/moodboards'),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Moodboard>>(`/api/moodboards/${id}`),

  create: (title: string) =>
    apiClient.post<ApiResponse<Moodboard>>('/api/moodboards', { title }),

  update: (id: string, title: string) =>
    apiClient.patch<ApiResponse<Moodboard>>(`/api/moodboards/${id}`, { title }),

  delete: (id: string) =>
    apiClient.delete(`/api/moodboards/${id}`),

  addArtwork: (id: string, artworkId: string) =>
    apiClient.post<ApiResponse<{ message: string }>>(`/api/moodboards/${id}/artworks`, {
      artwork_id: artworkId,
    }),

  removeArtwork: (id: string, artworkId: string) =>
    apiClient.delete(`/api/moodboards/${id}/artworks/${artworkId}`),
}
