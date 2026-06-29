import React from 'react'
import Image from 'next/image'
import { Plus } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components'

export function EmptyInbox({ onNewChat }: { onNewChat: () => void }) {
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-white font-poppins">
        <Image
          src="/illustrations/empty-inbox.svg"
          alt="Empty inbox"
          width={384}
          height={400}
          className="object-cover"
        />
        <div className="flex flex-col items-center text-center">
          <h2 className="font-poppins text-h6 mb-4 font-medium text-heading text-center tracking-wide">
            Your inbox is empty
          </h2>
          <p style={{ width: '552px' }} className="max-w-[340px] mb-6 text-body-m text-center text-wrap leading-7 text-body font-normal font-poppins ">
            When someone sends you a message, it will appear here. Start a
            conversation to ask about an artwork or connect with an artist.
          </p>
        </div>

        <Button onClick={onNewChat} leftIcon='/icons/plus-white-bg.svg'>
          New Chat
        </Button>
      </div>
    </>
  )
}

export function NoConversationSelected() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 font-poppins">
      <div className="relative h-64 w-64 opacity-90">
        <Image
          src="/illustrations/select-chat.svg"
          alt="Select a conversation"
          fill
          className="object-contain"
        />
      </div>
      <p className="max-w-[300px] text-center text-[14px] leading-6 text-gray-500">
        Choose a message from the list to view the conversation, or start a new
        chat to reach out.
      </p>
    </div>
  )
}