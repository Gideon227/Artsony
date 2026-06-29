'use client'

import React from 'react'
import Image from 'next/image'
import { Search } from 'lucide-react'
import type { ConversationSummary } from '@/types/messaging'
import { getConvDisplayName, getConvAvatar, formatMessageDate } from '../utils/messaging.utils'
import { Input } from '@/components'

interface ConversationListProps {
  conversations: ConversationSummary[]
  selectedId: string | null
  myId: string
  isLoading: boolean
  searchQuery: string
  onSearchChange: (q: string) => void
  onSelect: (id: string) => void
}

export function ConversationList({
  conversations,
  selectedId,
  myId,
  isLoading,
  searchQuery,
  onSearchChange,
  onSelect,
}: ConversationListProps) {
  return (
    <aside className="flex shrink-0 flex-col border-r border-gray-100" style={{ width: '40%' }}>

      {/* Search */}
      <div className="px-4 pb-4">
        <Input 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search Profile"
          leftIcon='/home/magnifier.svg'
        />

      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary-500" />
          </div>
        ) : (
          conversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conv={conv}
              myId={myId}
              isSelected={conv.id === selectedId}
              onSelect={() => onSelect(conv.id)}
            />
          ))
        )}
      </div>
    </aside>
  )
}

interface ConversationItemProps {
  conv: ConversationSummary
  myId: string
  isSelected: boolean
  onSelect: () => void
}

function ConversationItem({ conv, myId, isSelected, onSelect }: ConversationItemProps) {
  const name = getConvDisplayName(conv, myId)
  const avatar = getConvAvatar(conv)

  return (
    <button
      onClick={onSelect}
      className={`relative flex w-full items-center gap-3 border-l-[3px] p-4 cursor-pointer text-left transition-colors ${
        isSelected
          ? 'border-l-primary-500 bg-[#FFF1EE]'
          : 'border-l-transparent hover:bg-primary-50'
      }`}
    >
      <ConversationAvatar name={name} avatar={avatar} />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[14px] font-semibold text-gray-900">{name}</span>
          {conv.last_message && (
            <span className="shrink-0 text-[11px] text-gray-400">
              {formatMessageDate(conv.last_message.created_at)}
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-[12px] text-gray-500">
          {conv.last_message?.deleted_at
            ? 'Message deleted'
            : (conv.last_message?.body ?? '')}
        </p>
      </div>

      {conv.unread_count > 0 && (
        <span className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
          {conv.unread_count > 99 ? '99+' : conv.unread_count}
        </span>
      )}
    </button>
  )
}

export function ConversationAvatar({
  name,
  avatar,
  size = 'md',
}: {
  name: string
  avatar: string | null
  size?: 'sm' | 'md'
}) {
  const dim = size === 'sm' ? 'h-9 w-9' : 'h-12 w-12'
  const textSize = size === 'sm' ? 'text-sm' : 'text-lg'

  return (
    <div className={`relative shrink-0 overflow-hidden rounded-full bg-indigo-100 ${dim}`}>
      {avatar ? (
        <Image src={avatar} alt={name} fill className="object-cover" />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center font-semibold text-indigo-500 ${textSize}`}
        >
          {name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  )
}