'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { MoreHorizontal, Smile, Image as ImageIcon } from 'lucide-react'
import { useMessagingStore } from '@/store/messaging.store'
import { useMessages, useSendMessage, useMarkRead } from '@/hooks/use-messaging'
import { MessageBubble } from './message-bubble'
import { ConversationAvatar } from './conversation-list'
import { getConvDisplayName, getConvAvatar } from '../utils/messaging.utils'
import type { ConversationSummary, MessageWithSender } from '@/types/messaging'
import { ConversationOptionsMenu } from './conversation-options-menu'

interface ChatThreadProps {
  conversationId: string
  conversation: ConversationSummary | null
  myId: string
  goBack?: () => void;
  onClose?: () => void
}

export function ChatThread({ conversationId, conversation, myId, goBack }: ChatThreadProps) {
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
    <div className="flex h-[100dvh] flex-col w-full overflow-hidden bg-white">
      {/* Header */}
      <div className='shrink-0 px-4 lg:px-6 pt-6 pb-4 flex items-center justify-between w-full border-b border-gray-50'>
        <div className="flex items-center gap-2">
          <button onClick={goBack} className='lg:hidden'>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <mask id="path-1-inside-1_10823_1736" fill="white">
                <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z"/>
              </mask>
              <path d="M0 20M40 20M40 20M0 20M20 0M40 20M20 40M0 20M20 40V38C10.0589 38 2 29.9411 2 20H0H-2C-2 32.1503 7.84974 42 20 42V40ZM40 20H38C38 29.9411 29.9411 38 20 38V40V42C32.1503 42 42 32.1503 42 20H40ZM20 0V2C29.9411 2 38 10.0589 38 20H40H42C42 7.84974 32.1503 -2 20 -2V0ZM20 0V-2C7.84974 -2 -2 7.84974 -2 20H0H2C2 10.0589 10.0589 2 20 2V0Z" fill="#E6E8EB" mask="url(#path-1-inside-1_10823_1736)"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M30 20C30 25.5228 25.5228 30 20 30C14.4772 30 10 25.5228 10 20C10 14.4772 14.4772 10 20 10C25.5228 10 30 14.4772 30 20ZM16.9696 16.9696C17.2625 16.6768 17.7374 16.6768 18.0303 16.9696L20 18.9393L21.9696 16.9697C22.2625 16.6768 22.7374 16.6768 23.0303 16.9697C23.3232 17.2626 23.3232 17.7374 23.0303 18.0303L21.0606 20L23.0303 21.9696C23.3232 22.2625 23.3232 22.7374 23.0303 23.0303C22.7374 23.3232 22.2625 23.3232 21.9696 23.0303L20 21.0607L18.0303 23.0303C17.7374 23.3232 17.2625 23.3232 16.9696 23.0303C16.6768 22.7374 16.6768 22.2625 16.9696 21.9697L18.9393 20L16.9696 18.0303C16.6767 17.7374 16.6767 17.2625 16.9696 16.9696Z" fill="#525965"/>
            </svg>
          </button>

          <div className='flex items-center gap-2'>
            <ConversationAvatar name={displayName} avatar={avatar} />
            <div>
              <h2 className="text-body-s lg:text-body-m font-medium font-poppins text-body lg:text-[#02272F]">{displayName}</h2>
              {typingUsers.length > 0 && (
                <p className="text-body-xxs italic text-body">typing...</p>
              )}
            </div>
          </div>
        </div>

        <ConversationOptionsMenu conversation={conversation} onCloseChat={() => onclose} />
      </div>

      {/* Load older messages */}
      {hasNextPage && (
        <div className="shrink-0 flex justify-center py-2">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="text-[12px] text-primary-500 hover:underline disabled:opacity-50"
          >
            {isFetchingNextPage ? 'Loading...' : 'Load older messages'}
          </button>
        </div>
      )}

      {/* Messages (Scrollable Area) */}
      <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4 min-h-0">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isMe={msg.sender_id === myId || msg.sender_id === '__me__'}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Footer */}
      <footer className="shrink-0 border-t border-gray-100 px-4 py-3 bg-white">
        <form 
          className='flex items-center py-3 px-6 gap-3 w-full border border-gray-50 rounded-2xl'
          onSubmit={handleSend}
        >
          <button className='cursor-pointer'>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 8C18 9.10457 17.1046 10 16 10C14.8954 10 14 9.10457 14 8C14 6.89543 14.8954 6 16 6C17.1046 6 18 6.89543 18 8Z" fill="#525965"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M11.9426 1.25H12.0574C14.3658 1.24999 16.1748 1.24998 17.5863 1.43975C19.031 1.63399 20.1711 2.03933 21.0659 2.93414C21.9607 3.82895 22.366 4.96897 22.5603 6.41371C22.75 7.82519 22.75 9.63423 22.75 11.9426V12.0309C22.75 13.9397 22.75 15.5023 22.6463 16.7745C22.5422 18.0531 22.3287 19.1214 21.8509 20.0087C21.6401 20.4001 21.3812 20.7506 21.0659 21.0659C20.1711 21.9607 19.031 22.366 17.5863 22.5603C16.1748 22.75 14.3658 22.75 12.0574 22.75H11.9426C9.63423 22.75 7.82519 22.75 6.41371 22.5603C4.96897 22.366 3.82895 21.9607 2.93414 21.0659C2.14086 20.2726 1.7312 19.2852 1.51335 18.0604C1.29935 16.8573 1.2602 15.3603 1.25207 13.5015C1.25 13.0287 1.25 12.5286 1.25 12.001V11.9426C1.24999 9.63424 1.24998 7.82519 1.43975 6.41371C1.63399 4.96897 2.03933 3.82895 2.93414 2.93414C3.82895 2.03933 4.96897 1.63399 6.41371 1.43975C7.82519 1.24998 9.63424 1.24999 11.9426 1.25ZM6.61358 2.92637C5.33517 3.09825 4.56445 3.42514 3.9948 3.9948C3.42514 4.56445 3.09825 5.33517 2.92637 6.61358C2.75159 7.91356 2.75 9.62178 2.75 12C2.75 12.2905 2.75 12.5715 2.75034 12.8435L3.75148 11.9675C4.66275 11.1702 6.03617 11.2159 6.89238 12.0721L11.1821 16.3618C11.8693 17.0491 12.9511 17.1428 13.7463 16.5839L14.0445 16.3744C15.1887 15.5702 16.7368 15.6634 17.7764 16.599L20.6068 19.1463C20.8917 18.548 21.0609 17.7618 21.1513 16.6527C21.2494 15.4482 21.25 13.9459 21.25 12C21.25 9.62178 21.2484 7.91356 21.0736 6.61358C20.9018 5.33517 20.5749 4.56445 20.0052 3.9948C19.4355 3.42514 18.6648 3.09825 17.3864 2.92637C16.0864 2.75159 14.3782 2.75 12 2.75C9.62178 2.75 7.91356 2.75159 6.61358 2.92637Z" fill="#525965"/>
            </svg>
          </button>

          <input 
            value={input}
            onChange={handleInputChange}
            placeholder="Message"
            className='flex-1 font-poppins text-body-s placeholder:text-text-disabled text-body outline-none'
          />

          <button 
            type='submit'
            disabled={isSending}
            className='shrink-0 cursor-pointer'
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.6357 15.6701L20.3521 10.5208C21.8516 6.02242 22.6013 3.77322 21.414 2.58595C20.2268 1.39869 17.9776 2.14842 13.4792 3.64788L8.32987 5.36432C4.69923 6.57453 2.88392 7.17964 2.36806 8.06698C1.87731 8.91112 1.87731 9.95369 2.36806 10.7978C2.88392 11.6852 4.69923 12.2903 8.32987 13.5005C8.77981 13.6505 9.28601 13.5434 9.62294 13.2096L15.1286 7.75495C15.4383 7.44808 15.9382 7.45041 16.245 7.76015C16.5519 8.06989 16.5496 8.56975 16.2398 8.87662L10.8231 14.2432C10.4518 14.6111 10.3342 15.1742 10.4995 15.6701C11.7097 19.3007 12.3148 21.1161 13.2022 21.6319C14.0463 22.1227 15.0889 22.1227 15.933 21.6319C16.8204 21.1161 17.4255 19.3008 18.6357 15.6701Z" fill="#525965"/>
            </svg>
          </button>
        </form>
      </footer>
    </div>
  )
}