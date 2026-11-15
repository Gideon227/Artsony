import React from 'react'
import Image from 'next/image'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components'

export function EmptyInbox({ onNewChat }: { onNewChat: () => void }) {
  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-white">
      <Navbar />

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-4 font-poppins md:gap-6">
        <div className="relative min-h-0 w-[203px] flex-1 basis-0 md:w-[384px] md:max-h-[400px]">
          <Image
            src="/illustrations/empty-inbox.svg"
            alt="Empty inbox"
            fill
            priority
            className="object-contain"
          />
        </div>

        <div className="flex shrink-0 flex-col items-center text-center">
          <h2 className="mb-4 text-center font-poppins text-body-m font-medium tracking-wide text-heading lg:text-h6">
            Your inbox is empty
          </h2>
          <p className="mb-6 w-full text-center font-poppins text-body-xs font-normal text-body lg:w-[552px] lg:text-body-m lg:leading-7">
            When someone sends you a message, it will appear here. Start a
            conversation to ask about an artwork or connect with an artist.
          </p>
        </div>

        <div className="shrink-0 pb-4 md:pb-0">
          <Button onClick={onNewChat} leftIcon="/icons/plus-white-bg.svg">
            New Chat
          </Button>
        </div>
      </div>
    </div>
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