import { apiClient } from '@/lib/api-client'

export type NotificationType =
  | 'like' | 'comment' | 'reply' | 'follow' | 'sale' | 'order_update'
  | 'system' | 'message' | 'broadcast' | 'mention' | 'review'

export type NotificationEvent =
  | 'new_order' | 'order_activated' | 'shipment_updates' | 'order_delivered' | 'order_canceled'
  | 'earnings_received' | 'funds_available' | 'withdrawal_completed' | 'refund_issued' | 'transaction_failed'
  | 'new_device_login' | 'password_changed' | 'suspicious_activity'
  | 'new_message' | 'new_comment' | 'new_follower' | 'artwork_liked'
  | 'new_review' | 'rating_updated'
  | 'product_updates' | 'policy_changes' | 'maintenance_alerts'
  | 'featured_opportunities' | 'challenge_events'

export type MutedNotificationKey = NotificationType | NotificationEvent

export type NotificationPreferences = {
  id: string
  user_id: string
  push_enabled: boolean
  email_enabled: boolean
  ws_enabled: boolean
  types_muted: MutedNotificationKey[]
  updated_at: string
}

export const notificationPreferencesService = {
  get: () =>
    apiClient.get<{ success: true; data: NotificationPreferences }>('/api/notifications/preferences'),

  update: (changes: Partial<Pick<NotificationPreferences, 'push_enabled' | 'email_enabled' | 'ws_enabled' | 'types_muted'>>) =>
    apiClient.patch<{ success: true; data: NotificationPreferences }>('/api/notifications/preferences', changes),
}