'use client'

import React from 'react'
import Image from 'next/image'
import { Search } from 'lucide-react'
import type { ConversationSummary } from '@/types/messaging'
import { getConvDisplayName, getConvAvatar, formatMessageDate } from '../utils/messaging.utils'
import { Input } from '@/components'
import { ConversationOptionsMenu } from './conversation-options-menu'

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
    <aside className="flex shrink-0 flex-col lg:border-r border-gray-100 w-full lg:w-2/5">

      {/* Search */}
      <div className="py-4 px-6 border-b border-gray-50">
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
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1 py-16 px-6 text-center">
            <p className="text-[13px] font-medium text-neutral-500">
              {searchQuery ? 'No conversations match your search' : 'No conversations yet'}
            </p>
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
    <div
      className={`group relative flex w-full items-center gap-3 border-l-[3px] p-4 text-left transition-colors ${conv.unread_count > 0 && 'border-l-4 border-primary-500 bg-primary-50'} ${
        isSelected
          ? 'border-l-primary-500 bg-[#FFF1EE]'
          : 'border-l-transparent hover:bg-primary-50'
      }`}
    >
      <button onClick={onSelect} className="flex min-w-0 flex-1 items-center gap-3 cursor-pointer text-left">
        <ConversationAvatar name={name} avatar={avatar} />

        <div className='flex-1 min-w-0 flex items-center justify-between w-full'>
          <div className='flex flex-col gap-y-1 flex-1'>
            <p className='font-poppins text-body-xs lg:text-body-s text-black leading-6'>{name}</p>
            <p className='font-poppins font-light text-body-xxs lg:text-body-xs text-[#333333]'>
              {conv.last_message?.deleted_at ? 'Deleted Message' : (conv.last_message?.body ?? '')}
            </p>
          </div>

          <div className='flex flex-col gap-y-1 items-center h-full'>
            <p className='font-poppins font-light text-[#949392] text-body-xxs'>{formatMessageDate(conv.last_activity_at)}</p>
            <div className='rounded-full p-0.5 h-5 w-5 bg-primary-500 flex items-center justify-center'>
              <p className='font-poppins text-white text-body-xs'>{conv.unread_count > 99 ? '99+' : conv.unread_count}</p>
            </div>
          </div>
        </div>

        {/* <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-[14px] font-semibold text-heading">{name}</span>
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
        </div> */}

        {/* {conv.unread_count > 0 && (
          <span className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
            {conv.unread_count > 99 ? '99+' : conv.unread_count}
          </span>
        )} */}
      </button>

      {/* <ConversationOptionsMenu conversation={conv} /> */}
    </div>
  )
}

export function ConversationAvatar({
  name,
  avatar
}: {
  name: string
  avatar: string | null
}) {
  // const textSize = size === 'sm' ? 'text-sm' : 'text-lg'

  return (
    <div className={`relative shrink-0 overflow-hidden rounded-full bg-indigo-100 w-10 h-10`}>
      {avatar ? (
        <Image src={avatar} alt={name} fill className="object-cover" />
      ) : (
        <Image src='images/image-avatar.svg' width={40} height={40} alt='profile picture' />
      )}
    </div>
  )
}
