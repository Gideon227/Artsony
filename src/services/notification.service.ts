import { apiClient } from '@/lib/api-client'
import type { ApiResponse, Notification } from '@/types'

export type NotificationPage = {
  items: Notification[]
  next_cursor: string | null
  has_more: boolean
}

export const notificationService = {
  getAll: (params: { cursor?: string; limit?: number; unreadOnly?: boolean } = {}) =>
    apiClient.get<ApiResponse<NotificationPage>>('/api/notifications', {
      params: {
        ...(params.cursor ? { cursor: params.cursor } : {}),
        limit: params.limit ?? 20,
        ...(params.unreadOnly ? { unread_only: true } : {}),
      },
    }),

  markRead: (id: string) =>
    apiClient.patch<ApiResponse<Notification>>(`/api/notifications/${id}/read`),

  markAllRead: () =>
    apiClient.patch<ApiResponse<{ updated: number }>>('/api/notifications/read-all'),

  delete: (id: string) =>
    apiClient.delete(`/api/notifications/${id}`),

  getUnreadCount: () =>
    apiClient.get<ApiResponse<{ unread_count: number }>>('/api/notifications/unread-count'),
}