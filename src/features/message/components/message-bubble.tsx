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
        className={`relative lg:max-w-[65%] max-lg:max-w-full rounded-m px-4 py-3 text-[14px] leading-relaxed text-white transition-opacity ${
          isMe
            ? 'rounded-tr-[4px] bg-primary-500 max-lg:ml-8'
            : 'rounded-tl-[4px] bg-secondary-600 max-lg:mr-8'
        } ${isTemp ? 'opacity-70' : ''}`}
      >
        {message.deleted_at ? (
          <span className="italic opacity-70">Message deleted</span>
        ) : (
          <p className='text-body-xs lg:text-body-s leading-4 lg:leading-6 font-poppins font-light text-white'>{message.body}</p>
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