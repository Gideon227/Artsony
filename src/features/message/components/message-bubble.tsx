import React from 'react'
import { Check } from 'lucide-react'
import type { MessageWithSender } from '@/types/messaging'
import { formatMessageDate } from '../utils/messaging.utils'

interface MessageBubbleProps {
  message: MessageWithSender
  isMe: boolean
}

export function MessageBubble({ message, isMe }: MessageBubbleProps) {
  const isTemp = message.id.startsWith('temp_')

  return (
    <div className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`relative max-w-[65%] rounded-[20px] px-4 py-3 text-[14px] leading-relaxed text-white transition-opacity ${
          isMe
            ? 'rounded-br-[4px] bg-primary-500'
            : 'rounded-bl-[4px] bg-[#49A0A0]'
        } ${isTemp ? 'opacity-70' : ''}`}
      >
        {message.deleted_at ? (
          <span className="italic opacity-70">Message deleted</span>
        ) : (
          <p>{message.body}</p>
        )}

        <div className="mt-1 flex items-center justify-end gap-1">
          <span className="text-[10px] opacity-60">
            {formatMessageDate(message.created_at)}
          </span>
          {isMe && !isTemp && <Check size={10} className="opacity-60" />}
        </div>
      </div>
    </div>
  )
}