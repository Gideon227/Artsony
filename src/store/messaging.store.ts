import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { getMemoryToken } from '@/lib/api-client'
import type { WsServerEvent, WsNewMessageEvent, WsMessageReadEvent, WsTypingEvent } from '@/types/messaging'

type WsListener = (event: WsServerEvent) => void

type TypingState = {
  userId: string
  displayName: string | null
  conversationId: string
  expiresAt: number
}

interface MessagingState {
  socket: WebSocket | null
  status: 'idle' | 'connecting' | 'connected' | 'error' | 'disconnected'
  reconnectAttempts: number
  typingUsers: Map<string, TypingState> // key: `${convId}:${userId}`
  listeners: Set<WsListener>

  // Computed
  isConnected: boolean

  // Actions
  connect: () => void
  disconnect: () => void
  sendRaw: (data: object) => void
  subscribe: (listener: WsListener) => () => void
  notifyListeners: (event: WsServerEvent) => void
  setTyping: (conversationId: string, isTyping: boolean) => void
  getTypingUsers: (conversationId: string) => TypingState[]
}

const MAX_RECONNECT = 6
const BASE_DELAY_MS = 2_000

// Backend WS is at /ws, not /api/ws
const getWsUrl = (): string => {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
  return base.replace(/^http/, 'ws') + '/ws'
}

export const useMessagingStore = create<MessagingState>()(
  devtools(
    (set, get) => ({
      socket: null,
      status: 'idle',
      reconnectAttempts: 0,
      typingUsers: new Map(),
      listeners: new Set(),

      get isConnected() {
        return get().status === 'connected'
      },

      connect: () => {
        const { status, socket } = get()
        if (status === 'connected' || status === 'connecting') return
        if (socket) socket.close()

        set({ status: 'connecting' })

        const token = getMemoryToken()
        if (!token) {
          console.warn('[WS] No access token — cannot connect')
          set({ status: 'idle' })
          return
        }

        const ws = new WebSocket(`${getWsUrl()}?token=${token}`)

        ws.onopen = () => {
          set({ status: 'connected', reconnectAttempts: 0, socket: ws })
        }

        ws.onmessage = (e: MessageEvent) => {
          try {
            const event = JSON.parse(e.data as string) as WsServerEvent
            get().notifyListeners(event)

            // Handle typing events internally
            if (event.event === 'typing') {
              const t = event as WsTypingEvent
              const key = `${t.conversation_id}:${t.user_id}`
              const { typingUsers } = get()
              const next = new Map(typingUsers)
              if (t.is_typing) {
                next.set(key, {
                  userId: t.user_id,
                  displayName: t.display_name,
                  conversationId: t.conversation_id,
                  expiresAt: Date.now() + 4_000,
                })
              } else {
                next.delete(key)
              }
              set({ typingUsers: next })
            }

            // Handle pong
            if (event.event === 'pong') {
              // Server sent pong — connection alive
            }
          } catch (err) {
            console.error('[WS] Parse error:', err)
          }
        }

        ws.onclose = (e: CloseEvent) => {
          const { reconnectAttempts } = get()
          set({ status: 'disconnected', socket: null })

          if (e.code !== 1000 && reconnectAttempts < MAX_RECONNECT) {
            const delay = BASE_DELAY_MS * Math.pow(1.5, reconnectAttempts)
            set((s) => ({ reconnectAttempts: s.reconnectAttempts + 1 }))
            setTimeout(() => get().connect(), delay)
          }
        }

        ws.onerror = () => {
          set({ status: 'error' })
        }

        set({ socket: ws })
      },

      disconnect: () => {
        const { socket } = get()
        socket?.close(1000, 'Client disconnected intentionally')
        set({ status: 'idle', socket: null, reconnectAttempts: 0 })
      },

      sendRaw: (data: object) => {
        const { socket, status } = get()
        if (status !== 'connected' || !socket) return
        try {
          socket.send(JSON.stringify(data))
        } catch (err) {
          console.error('[WS] sendRaw failed:', err)
        }
      },

      subscribe: (listener: WsListener) => {
        get().listeners.add(listener)
        return () => { get().listeners.delete(listener) }
      },

      notifyListeners: (event: WsServerEvent) => {
        get().listeners.forEach((l) => l(event))
      },

      setTyping: (conversationId: string, isTyping: boolean) => {
        get().sendRaw({
          event: isTyping ? 'typing:start' : 'typing:stop',
          conversation_id: conversationId,
        })
      },

      getTypingUsers: (conversationId: string) => {
        const now = Date.now()
        return Array.from(get().typingUsers.values()).filter(
          (t) => t.conversationId === conversationId && t.expiresAt > now
        )
      },
    }),
    { name: 'MessagingStore', enabled: process.env.NODE_ENV === 'development' }
  )
)