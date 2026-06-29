import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types'
import type {
  ConversationSummary,
  MessageWithSender,
  CursorPage,
  SendMessageInput,
  MarkReadInput,
} from '@/types'
import { ConversationWithDetails } from '@/types/messaging'

export const messagingService = {
  // ── Conversations ──────────────────────────────────────────────────────────

  getConversations: async (
    cursor?: string,
    limit = 20,
    type?: 'direct' | 'broadcast'
  ): Promise<CursorPage<ConversationSummary>> => {
    const res = await apiClient.get<ApiResponse<CursorPage<ConversationSummary>>>(
      '/api/conversations',
      { params: { ...(cursor ? { cursor } : {}), limit, ...(type ? { type } : {}) } }
    )
    return res.data
  },

  getConversation: async (id: string): Promise<ConversationWithDetails> => {
    const res = await apiClient.get<ApiResponse<ConversationWithDetails>>(
      `/api/conversations/${id}`
    )
    return res.data
  },

  createDirect: async (recipientId: string): Promise<ConversationWithDetails> => {
    const res = await apiClient.post<ApiResponse<ConversationWithDetails>>(
      '/api/conversations',
      { type: 'direct', recipient_id: recipientId }
    )
    return res.data
  },

  createBroadcast: async (
    recipientIds: string[],
    initialBody: string,
    title?: string
  ): Promise<ConversationWithDetails> => {
    const res = await apiClient.post<ApiResponse<ConversationWithDetails>>(
      '/api/conversations',
      { type: 'broadcast', recipient_ids: recipientIds, initial_body: initialBody, title }
    )
    return res.data
  },

  // ── Messages ──────────────────────────────────────────────────────────────

  getMessages: async (
    conversationId: string,
    cursor?: string,
    limit = 30
  ): Promise<CursorPage<MessageWithSender>> => {
    const res = await apiClient.get<ApiResponse<CursorPage<MessageWithSender>>>(
      `/api/conversations/${conversationId}/messages`,
      { params: { ...(cursor ? { cursor } : {}), limit } }
    )
    return res.data
  },

  sendMessage: async (payload: SendMessageInput): Promise<MessageWithSender> => {
    const res = await apiClient.post<ApiResponse<MessageWithSender>>(
      `/api/conversations/${payload.conversation_id}/messages`,
      {
        body: payload.body,
        type: payload.type ?? 'text',
        ...(payload.reply_to_id ? { reply_to_id: payload.reply_to_id } : {}),
        client_message_id: payload.client_message_id,
      }
    )
    return res.data
  },

  markAsRead: async (payload: MarkReadInput): Promise<void> => {
    await apiClient.post<ApiResponse<void>>(
      `/api/conversations/${payload.conversation_id}/messages/read`,
      { up_to_message_id: payload.up_to_message_id }
    )
  },

  // ── User search (for New Chat) ─────────────────────────────────────────────

  searchUsers: async (q: string): Promise<UserSearchResult[]> => {
    if (q.trim().length < 2) return []
    const res = await apiClient.get<ApiResponse<UserSearchResult[]>>(
      '/api/users/search',
      { params: { q: q.trim(), limit: 10 } }
    )
    return res.data
  },
}

export type UserSearchResult = {
  id: string
  username: string
  email: string
  role: string
  onboarded: boolean
}