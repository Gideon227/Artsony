import { useEffect, useRef, useCallback } from 'react'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { v4 as uuidv4 } from 'uuid'
import { messagingService } from '@/services/messaging.service'
import { useMessagingStore } from '@/store/messaging.store'
import { QUERY_KEYS } from '@/constants'
import type { MessageWithSender, CursorPage, SendMessageInput, WsNewMessageEvent, WsMessageReadEvent } from '@/types/messaging'

// ── useMessages: infinite cursor-paginated messages with WS live updates ──────

export function useMessages(conversationId: string) {
  const queryClient = useQueryClient()
  const { subscribe } = useMessagingStore()

  const query = useInfiniteQuery({
    queryKey: QUERY_KEYS.messages(conversationId),
    queryFn: ({ pageParam }) =>
      messagingService.getMessages(conversationId, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.has_more ? lastPage.next_cursor ?? undefined : undefined,
    enabled: !!conversationId,
  })

  // Subscribe to WS new messages and splice into query cache
  useEffect(() => {
    if (!conversationId) return
    const unsub = subscribe((event) => {
      if (event.event === 'message:new' && event.conversation_id === conversationId) {
        const newMsg = event.message
        queryClient.setQueryData(
          QUERY_KEYS.messages(conversationId),
          (old: any) => {
            if (!old) return old
            const firstPage: CursorPage<MessageWithSender> = old.pages[0]
            // Deduplicate by id and client_message_id
            const exists = firstPage.items.some(
              (m) => m.id === newMsg.id
            )
            if (exists) return old
            return {
              ...old,
              pages: [
                { ...firstPage, items: [newMsg, ...firstPage.items] },
                ...old.pages.slice(1),
              ],
            }
          }
        )
      }
    })
    return unsub
  }, [conversationId, subscribe, queryClient])

  return query
}

// ── useSendMessage: optimistic + WS send ──────────────────────────────────────

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient()
  const { sendRaw, status } = useMessagingStore()

  return useMutation({
    mutationFn: async (input: Omit<SendMessageInput, 'conversation_id' | 'client_message_id' | 'sender_id'>) => {
      const client_message_id = `client_${uuidv4()}`

      // Prefer WS send when connected; fall back to REST
      if (status === 'connected') {
        sendRaw({
          event: 'message:send',
          conversation_id: conversationId,
          body: input.body,
          type: input.type ?? 'text',
          ...(input.reply_to_id ? { reply_to_id: input.reply_to_id } : {}),
          client_message_id,
        })
        // WS delivery confirmed via message:new event — no REST call needed
        return null
      }

      // REST fallback
      return messagingService.sendMessage({
        conversation_id: conversationId,
        sender_id: '', // filled server-side from auth
        body: input.body,
        type: input.type ?? 'text',
        client_message_id,
      })
    },
    onMutate: async (input) => {
      // Optimistic insert
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.messages(conversationId) })
      const snapshot = queryClient.getQueryData(QUERY_KEYS.messages(conversationId))

      const tempMsg: MessageWithSender = {
        id: `temp_${uuidv4()}`,
        conversation_id: conversationId,
        sender_id: '__me__',
        body: input.body,
        type: input.type ?? 'text',
        reply_to_id: input.reply_to_id ?? null,
        metadata: {},
        is_broadcast_root: false,
        created_at: new Date().toISOString(),
        edited_at: null,
        deleted_at: null,
        sender: { id: '__me__', email: '', display_name: null, avatar_url: null },
      }

      queryClient.setQueryData(QUERY_KEYS.messages(conversationId), (old: any) => {
        if (!old) return old
        const firstPage = old.pages[0]
        return {
          ...old,
          pages: [
            { ...firstPage, items: [tempMsg, ...firstPage.items] },
            ...old.pages.slice(1),
          ],
        }
      })

      // Invalidate conversation list so last_message updates
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations() })

      return { snapshot }
    },
    onError: (_err, _input, ctx: any) => {
      if (ctx?.snapshot) {
        queryClient.setQueryData(QUERY_KEYS.messages(conversationId), ctx.snapshot)
      }
    },
  })
}

// ── useMarkRead ────────────────────────────────────────────────────────────────

export function useMarkRead() {
  const { sendRaw, status } = useMessagingStore()
  const queryClient = useQueryClient()

  return useCallback((conversationId: string, upToMessageId: string, userId: string) => {
    if (status === 'connected') {
      sendRaw({ event: 'message:read', conversation_id: conversationId, up_to_message_id: upToMessageId })
    } else {
      void messagingService.markAsRead({ conversation_id: conversationId, user_id: userId, up_to_message_id: upToMessageId })
    }
    // Optimistically zero out unread count in conversations cache
    queryClient.setQueryData(QUERY_KEYS.conversations(), (old: any) => {
      if (!old) return old
      return {
        ...old,
        items: old.items?.map((c: any) =>
          c.id === conversationId ? { ...c, unread_count: 0 } : c
        ),
      }
    })
  }, [sendRaw, status, queryClient])
}

// ── useUserSearch ─────────────────────────────────────────────────────────────

export function useUserSearch(q: string) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.userSearch(q),
    queryFn: () => messagingService.searchUsers(q),
    initialPageParam: undefined,
    getNextPageParam: () => undefined,
    enabled: q.trim().length >= 2,
    staleTime: 30_000,
  })
}