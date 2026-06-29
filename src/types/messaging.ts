export type ConversationType = 'direct' | 'broadcast'
export type MessageType = 'text' | 'image' | 'system'
export type ParticipantRole = 'owner' | 'member'

export type SenderProfile = {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
}

export type MessagePreview = {
  id: string
  sender_id: string
  body: string
  type: MessageType
  created_at: string
  deleted_at: string | null
}

export type ParticipantProfile = {
  user_id: string
  role: ParticipantRole
  last_read_at: string
  is_muted: boolean
  joined_at: string
  left_at: string | null
  email: string
  display_name: string | null
  avatar_url: string | null
}

export type ConversationSummary = {
  id: string
  type: ConversationType
  title: string | null
  last_activity_at: string
  last_message_id: string | null
  unread_count: number
  last_message?: MessagePreview | null
  other_user?: ParticipantProfile | null
}

export type ConversationWithDetails = {
  id: string
  type: ConversationType
  title: string | null
  created_by: string
  last_message_id: string | null
  last_activity_at: string
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  participants: ParticipantProfile[]
  last_message?: MessagePreview | null
  unread_count: number
}

export type Message = {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  type: MessageType
  reply_to_id: string | null
  metadata: Record<string, unknown>
  is_broadcast_root: boolean
  created_at: string
  edited_at: string | null
  deleted_at: string | null
}

export type MessageWithSender = Message & {
  sender: SenderProfile
  reply_to?: MessagePreview | null
}

export type CursorPage<T> = {
  items: T[]
  next_cursor: string | null
  has_more: boolean
}

export type SendMessageInput = {
  conversation_id: string
  sender_id: string
  body: string
  type?: MessageType
  reply_to_id?: string | null
  client_message_id: string
}

export type MarkReadInput = {
  conversation_id: string
  user_id: string
  up_to_message_id: string
}

// ── WebSocket event shapes (matching backend WsServerEvent union) ──────────────

export type WsNewMessageEvent = {
  event: 'message:new'
  message: MessageWithSender
  conversation_id: string
  client_message_id?: string
}

export type WsMessageReadEvent = {
  event: 'message:read'
  conversation_id: string
  user_id: string
  up_to_message_id: string
  read_at: string
}

export type WsTypingEvent = {
  event: 'typing'
  conversation_id: string
  user_id: string
  display_name: string | null
  is_typing: boolean
}

export type WsUserOnlineEvent = { event: 'user:online'; user_id: string }
export type WsUserOfflineEvent = { event: 'user:offline'; user_id: string }
export type WsErrorEvent = { event: 'error'; code: string; message: string }
export type WsPongEvent = { event: 'pong'; ts: number }

export type WsServerEvent =
  | WsNewMessageEvent
  | WsMessageReadEvent
  | WsTypingEvent
  | WsUserOnlineEvent
  | WsUserOfflineEvent
  | WsErrorEvent
  | WsPongEvent