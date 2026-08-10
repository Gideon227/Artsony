import { apiClient } from '@/lib/api-client'

export type NotificationType =
  | 'like' | 'comment' | 'reply' | 'follow' | 'sale' | 'order_update'
  | 'system' | 'message' | 'broadcast' | 'mention' | 'review'

export type NotificationPreferences = {
  id: string
  user_id: string
  push_enabled: boolean
  email_enabled: boolean
  ws_enabled: boolean
  types_muted: NotificationType[]
  updated_at: string
}

export const notificationPreferencesService = {
  get: () =>
    apiClient.get<{ success: true; data: NotificationPreferences }>('/api/notifications/preferences'),

  update: (changes: Partial<Pick<NotificationPreferences, 'push_enabled' | 'email_enabled' | 'ws_enabled' | 'types_muted'>>) =>
    apiClient.patch<{ success: true; data: NotificationPreferences }>('/api/notifications/preferences', changes),
}
