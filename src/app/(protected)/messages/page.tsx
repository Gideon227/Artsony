'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { messagingService } from '@/services/messaging.service'
import { useMessagingStore } from '@/store/messaging.store'
import { useAuthStore, selectUser, selectIsHydrated } from '@/store/auth.store'
import { QUERY_KEYS } from '@/constants'
import {
  ConversationList,
  ChatThread,
  EmptyInbox,
  NoConversationSelected,
  NewChatModal,
} from '@/features/message/components'
import type { ConversationSummary } from '@/types/messaging'
import { getConvDisplayName } from '@/features/message/utils/messaging.utils'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components'
import Router from 'next/router'
import { useRouter } from 'next/navigation'

export default function MessagesPage() {
  const router = useRouter()
  const me = useAuthStore(selectUser)
  const isHydrated = useAuthStore(selectIsHydrated)
  const myId = me?.id ?? ''

  const { connect, disconnect, status } = useMessagingStore()
  const isConnected = status === 'connected'

  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)

  // Connect only after session is hydrated so getMemoryToken() is set
  useEffect(() => {
    if (!isHydrated) return
    connect()
    return () => disconnect()
  }, [isHydrated, connect, disconnect])

  const { data: convData, isLoading } = useQuery({
    queryKey: QUERY_KEYS.conversations(),
    queryFn: () => messagingService.getConversations(),
    enabled: isHydrated,
    refetchInterval: 30_000,
  })

  const conversations: ConversationSummary[] = (convData as any)?.items ?? []

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return conversations
    const q = searchQuery.toLowerCase()
    return conversations.filter((c) =>
      getConvDisplayName(c, myId).toLowerCase().includes(q)
    )
  }, [conversations, searchQuery, myId])

  const activeConv = useMemo(
    () => conversations.find((c) => c.id === selectedConvId) ?? null,
    [conversations, selectedConvId]
  )

  if (!isLoading && conversations.length === 0) {
    return (
      <>
        {/* <Navbar /> */}
        <EmptyInbox onNewChat={() => setIsNewChatOpen(true)} />
        {isNewChatOpen && (
          <NewChatModal
            onClose={() => setIsNewChatOpen(false)}
            onStartConversation={(id) => {
              setSelectedConvId(id)
              setIsNewChatOpen(false)
            }}
          />
        )}
      </>
    )
  }

  return (
    <div className="relative flex flex-col h-full min-h-screen w-full overflow-hidden bg-white font-poppins">
      <Navbar />
      {/* Reconnecting banner */}
      {!isConnected && status !== 'idle' && (
        <div className="absolute top-0 left-0 z-50 w-full bg-amber-500 py-1.5 text-center text-xs font-semibold text-white">
        {status === 'connecting' ? 'Connecting...' : 'Reconnecting to messaging server...'}
        </div>
      )}

      <div className='flex justify-between items-center mb-6 px-8 pt-12'>
        <div className='flex items-center gap-4'>
          <button onClick={() => router.back()} className='cursor-pointer'>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <mask id="path-1-inside-1_5857_7717" fill="white">
                <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z"/>
              </mask>
              <path d="M20 40V38C10.0589 38 2 29.9411 2 20H0H-2C-2 32.1503 7.84974 42 20 42V40ZM40 20H38C38 29.9411 29.9411 38 20 38V40V42C32.1503 42 42 32.1503 42 20H40ZM20 0V2C29.9411 2 38 10.0589 38 20H40H42C42 7.84974 32.1503 -2 20 -2V0ZM20 0V-2C7.84974 -2 -2 7.84974 -2 20H0H2C2 10.0589 10.0589 2 20 2V0Z" fill="#E6E8EB" mask="url(#path-1-inside-1_5857_7717)"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M18.5303 13.4697C18.8232 13.7626 18.8232 14.2374 18.5303 14.5303L13.8107 19.25H28C28.4142 19.25 28.75 19.5858 28.75 20C28.75 20.4142 28.4142 20.75 28 20.75H13.8107L18.5303 25.4697C18.8232 25.7626 18.8232 26.2374 18.5303 26.5303C18.2374 26.8232 17.7626 26.8232 17.4697 26.5303L11.4697 20.5303C11.1768 20.2374 11.1768 19.7626 11.4697 19.4697L17.4697 13.4697C17.7626 13.1768 18.2374 13.1768 18.5303 13.4697Z" fill="#525965"/>
            </svg>
          </button>
          <h2 className='font-raleway font-semibold text-h4 text-body leading-10'>Messages</h2>
        </div>
        <Button onClick={() => setIsNewChatOpen(true)} leftIcon='/icons/plus-white-bg.svg'>New Chat</Button>
      </div>

      <div className='flex border border-gray-50 rounded-xl justify-between flex-1 mx-8'>
        <ConversationList
          conversations={filtered}
          selectedId={selectedConvId}
          myId={myId}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelect={setSelectedConvId}
        />

        <main className="relative flex flex-1 flex-col overflow-hidden">
          {!selectedConvId ? (
            <NoConversationSelected />
          ) : (
            <ChatThread
              conversationId={selectedConvId}
              conversation={activeConv}
              myId={myId}
            />
          )}
        </main>
      </div>

      {isNewChatOpen && (
        <NewChatModal
          onClose={() => setIsNewChatOpen(false)}
          onStartConversation={(id) => {
            setSelectedConvId(id)
            setIsNewChatOpen(false)
          }}
        />
      )}
    </div>
  )
}