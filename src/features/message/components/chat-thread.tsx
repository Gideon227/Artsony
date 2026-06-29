'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { MoreHorizontal, Smile, Image as ImageIcon } from 'lucide-react'
import { useMessagingStore } from '@/store/messaging.store'
import { useMessages, useSendMessage, useMarkRead } from '@/hooks/use-messaging'
import { MessageBubble } from './message-bubble'
import { ConversationAvatar } from './conversation-list'
import { getConvDisplayName, getConvAvatar } from '../utils/messaging.utils'
import type { ConversationSummary, MessageWithSender } from '@/types/messaging'

interface ChatThreadProps {
  conversationId: string
  conversation: ConversationSummary | null
  myId: string
}

export function ChatThread({ conversationId, conversation, myId }: ChatThreadProps) {
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { sendRaw, getTypingUsers } = useMessagingStore()
  const { data: messagesData, fetchNextPage, hasNextPage, isFetchingNextPage } = useMessages(conversationId)
  const { mutate: sendMessage, isPending: isSending } = useSendMessage(conversationId)
  const markRead = useMarkRead()

  const messages: MessageWithSender[] = useMemo(() => {
    if (!messagesData?.pages) return []
    return messagesData.pages.flatMap((p) => p.items).reverse()
  }, [messagesData])

  const typingUsers = getTypingUsers(conversationId)
  const displayName = conversation ? getConvDisplayName(conversation, myId) : ''
  const avatar = conversation ? getConvAvatar(conversation) : null

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  // Mark read when conversation is viewed
  useEffect(() => {
    const lastMsg = messages[messages.length - 1]
    if (lastMsg && !lastMsg.id.startsWith('temp_')) {
      markRead(conversationId, lastMsg.id, myId)
    }
  }, [conversationId, messages, markRead, myId])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isSending) return
    sendMessage({ body: input.trim() })
    setInput('')
    sendRaw({ event: 'typing:stop', conversation_id: conversationId })
    setIsTyping(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)

    if (!isTyping) {
      sendRaw({ event: 'typing:start', conversation_id: conversationId })
      setIsTyping(true)
    }

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(() => {
      sendRaw({ event: 'typing:stop', conversation_id: conversationId })
      setIsTyping(false)
    }, 2_000)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-gray-100 px-6">
        <div className="flex items-center gap-3">
          <ConversationAvatar name={displayName} avatar={avatar} size="sm" />
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900">{displayName}</h2>
            {typingUsers.length > 0 && (
              <p className="text-[12px] italic text-gray-400">typing...</p>
            )}
          </div>
        </div>
        <button className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-50">
          <MoreHorizontal size={20} />
        </button>
      </header>

      {/* Load older messages */}
      {hasNextPage && (
        <div className="flex justify-center py-2">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="text-[12px] text-primary-500 hover:underline disabled:opacity-50"
          >
            {isFetchingNextPage ? 'Loading...' : 'Load older messages'}
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isMe={msg.sender_id === myId || msg.sender_id === '__me__'}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <footer className="shrink-0 border-t border-gray-100 px-4 py-3">
        <form
          onSubmit={handleSend}
          className="flex items-center gap-3 rounded-full border border-gray-100 bg-white px-4 py-2.5 shadow-sm"
        >
          <button type="button" className="shrink-0 text-gray-400 hover:text-gray-600">
            <Smile size={20} />
          </button>
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Message"
            className="flex-1 bg-transparent text-[14px] text-gray-700 outline-none placeholder:text-gray-400"
          />
          <button type="button" className="shrink-0 text-gray-400 hover:text-gray-600">
            <ImageIcon size={20} />
          </button>
          {input.trim() && (
            <button
              type="submit"
              disabled={isSending}
              className="shrink-0 rounded-full bg-primary-500 px-4 py-1.5 text-[13px] font-semibold text-white hover:bg-primary-600 disabled:opacity-50"
            >
              Send
            </button>
          )}
        </form>
      </footer>
    </div>
  )
}