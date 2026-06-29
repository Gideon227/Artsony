import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types'

// NOTE: Backend endpoints (POST/DELETE /api/users/:id/follow, and a way to
// know current follow state) do not exist yet. These calls will 404 until
// that's built. The UI uses optimistic local state in the meantime —
// swap this stub for real calls once the routes exist.

export const followService = {
  follow: (userId: string): Promise<ApiResponse<{ following: boolean }>> =>
    apiClient.post<ApiResponse<{ following: boolean }>>(`/api/users/${userId}/follow`),

  unfollow: (userId: string): Promise<ApiResponse<{ following: boolean }>> =>
    apiClient.delete<ApiResponse<{ following: boolean }>>(`/api/users/${userId}/follow`),
}