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

export default function MessagesPage() {
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
        <Navbar />
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
    <div className="relative flex flex-col min-h-screen w-full overflow-hidden bg-white font-poppins">
        <Navbar />
        {/* Reconnecting banner */}
        {!isConnected && status !== 'idle' && (
            <div className="absolute top-0 left-0 z-50 w-full bg-amber-500 py-1.5 text-center text-xs font-semibold text-white">
            {status === 'connecting' ? 'Connecting...' : 'Reconnecting to messaging server...'}
            </div>
        )}

        <div className='flex justify-between items-center mb-6 px-8 pt-12'>
            <h2 className='font-raleway font-semibold text-h4 text-body leading-10'>Messages</h2>
            <Button onClick={() => setIsNewChatOpen(true)} leftIcon='/icons/plus-white-bg.svg'>New Chat</Button>
        </div>

        <div className='flex justify-between flex-1'>
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