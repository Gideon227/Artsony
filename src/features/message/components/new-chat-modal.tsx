'use client'

import React, { useState, useRef, useEffect } from 'react'
import { X, Search } from 'lucide-react'
import { messagingService, type UserSearchResult } from '@/services/messaging.service'
import Image from 'next/image'
import { Input, Textarea } from '@/components'

interface NewChatModalProps {
  onClose: () => void
  onStartConversation: (conversationId: string) => void
}

export function NewChatModal({ onClose, onStartConversation }: NewChatModalProps) {
  const [searchQ, setSearchQ] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null)
  const [messageBody, setMessageBody] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showResults = searchQ.trim().length >= 2 && !selectedUser
  const canSend = !!selectedUser && messageBody.trim().length > 0

  // Debounced search
  useEffect(() => {
    if (selectedUser || searchQ.trim().length < 2) {
      setSearchResults([])
      return
    }

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    setIsSearching(true)

    searchTimerRef.current = setTimeout(async () => {
      try {
        const results = await messagingService.searchUsers(searchQ.trim())
        setSearchResults(results)
      } catch {
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    }
  }, [searchQ, selectedUser])

  const handleSelectUser = (user: UserSearchResult) => {
    setSelectedUser(user)
    setSearchQ('')
    setSearchResults([])
  }

  const handleClearUser = () => {
    setSelectedUser(null)
    setSearchQ('')
  }

  const handleSend = async () => {
    if (!canSend || isSending) return
    setIsSending(true)
    try {
      const conv = await messagingService.createDirect(selectedUser!.id)
      await messagingService.sendMessage({
        conversation_id: conv.id,
        sender_id: '',
        body: messageBody.trim(),
        type: 'text',
        client_message_id: `new_${Date.now()}`,
      })
      onStartConversation(conv.id)
    } catch (err) {
      console.error('[NewChat]', err)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black/40">
      <div className="relative rounded-2xl bg-white px-10 py-16" style={{ width: 564, height: 632 }}>
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute left-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-50 p-2 cursor-pointer hover:bg-gray-50"
        >
          <Image src='/icons/cancel.svg' width={24} height={24} alt='cancel icon' />
        </button>

        <h2 className="mb-8 text-center font-raleway font-medium text-h4 leading-12 text-[#333333]">
          New Chat
        </h2>

        {/* To field */}
        <div className="mb-6">
          <label className="mb-2 block text-body-s font-poppins font-medium text-heading">To:</label>

          {/* Selected user chip */}
          {selectedUser && (
            <div className="mb-3 flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5">
                <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-indigo-200 text-[11px] font-bold text-indigo-600">
                  {selectedUser.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-[14px] font-semibold text-gray-900">
                  {selectedUser.username}
                </span>
                <button onClick={handleClearUser}>
                  <X size={14} className="text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            </div>
          )}

          {/* Search input */}
          <Input 
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Enter Username"
            leftIcon='/icons/magnifier-red.svg'
          />

          {/* Results dropdown */}
          {showResults && (
            <div className="mt-2 overflow-hidden rounded-2xl border border-gray-50 bg-white">
              <div className="py-4 px-6">
                <p className="mb-2 px-1 text-body-xs font-poppins font-medium text-body">{searchQ}</p>
                {isSearching ? (
                  <div className="flex justify-center py-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-primary-500" />
                  </div>
                ) : searchResults.length === 0 ? (
                  <p className="py-6 text-body-xs text-gray-200 font-raleway text-center">No users found</p>
                ) : (
                  searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className="flex w-full items-center gap-3 rounded-full px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-indigo-100 font-semibold text-indigo-500">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[14px] font-semibold text-gray-900">
                        {user.username}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Message body */}
        <div className="mb-8">
          <Textarea 
            label='Subject: '
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value.slice(0, 1000))}
            placeholder="Message"
            rows={5}
          />
          <div className="flex justify-between px-4 pt-3">
            <span className="text-[11px] text-gray-400">1000 characters max</span>
            <span className="text-[11px] text-gray-400">{messageBody.length}/1000</span>
          </div>
        </div>

        <button
          onClick={handleSend}
          disabled={!canSend || isSending}
          className="w-full rounded-full cursor-pointer bg-primary-500 py-4 text-[15px] font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  )
}