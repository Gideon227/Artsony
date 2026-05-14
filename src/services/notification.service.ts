import { apiClient } from '@/lib/api-client'
import type { ApiResponse, Notification, PaginatedResponse } from '@/types'

export const notificationService = {
  getAll: (params: { page?: number; perPage?: number; filter?: 'all' | 'unread' } = {}) =>
    apiClient.get<PaginatedResponse<Notification>>('/api/notifications', { params }),

  markRead: (id: string) =>
    apiClient.patch<ApiResponse<Notification>>(`/api/notifications/${id}/read`),

  markAllRead: () =>
    apiClient.patch<ApiResponse<{ updated: number }>>('/api/notifications/read-all'),

  delete: (id: string) =>
    apiClient.delete(`/api/notifications/${id}`),

  getUnreadCount: () =>
    apiClient.get<ApiResponse<{ count: number }>>('/api/notifications/unread-count'),
}