'use client'

import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export type AvatarSize = 'sm' | 'md' | 'lg'

interface User {
  id: string | number
  name: string
  avatarUrl?: string
}

interface AvatarStackProps {
  users: User[]
  max?: number
  size?: AvatarSize
  showCount?: boolean
  className?: string
}

const AVATAR_CONFIG = {
  sm: { size: 'w-[39px] h-[39px]', offset: '-ml-2', text: 'text-[11px]', border: 'border-[1.5px]' },
  md: { size: 'w-[55px] h-[55px]', offset: '-ml-6', text: 'text-[14px]', border: 'border-2' },
  lg: { size: 'w-[70px] h-[70px]', offset: '-ml-8', text: 'text-[17px]', border: 'border-2' },
}

const AVATAR_COLORS = [
  { bg: 'bg-[#DAD0FC]', text: 'text-[#6C47E8]' },
  { bg: 'bg-[#FFF2B9]', text: 'text-[#B88700]' },
  { bg: 'bg-[#D1FFF4]', text: 'text-[#00836A]' },
  { bg: 'bg-[#FFDDE1]', text: 'text-[#C0392B]' },
  { bg: 'bg-[#D4F1F4]', text: 'text-[#0087A8]' },
]

const getInitials = (name: string) => 
  name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

export function AvatarStack({ users = [], max = 4, size = 'md', showCount = false, className }: AvatarStackProps) {
  const cfg = AVATAR_CONFIG[size]
  const visibleUsers = users.slice(0, max)
  const remaining = users.length - max

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex flex-row-reverse justify-end"> {/* Reversed for proper CSS overlap */}
        {remaining > 0 && (
          <div className={cn(
            "relative flex items-center justify-center rounded-full bg-[#F1F3F5] border-[#E6E8EB] z-0",
            cfg.size, cfg.border, cfg.offset
          )}>
            <span className={cn("font-semibold text-[#525965] tracking-tighter", cfg.text)}>
              +{remaining}
            </span>
          </div>
        )}

        {visibleUsers.reverse().map((user, i) => {
          const color = AVATAR_COLORS[i % AVATAR_COLORS.length]
          return (
            <div
              key={user.id}
              className={cn(
                "relative rounded-full border-[#E6E8EB] overflow-hidden flex items-center justify-center transition-transform hover:scale-110 hover:z-50",
                cfg.size, cfg.border, i < visibleUsers.length - 1 ? cfg.offset : "ml-0", color?.bg
              )}
              style={{ zIndex: i + 1 }}
            >
              {user.avatarUrl ? (
                <Image src={user.avatarUrl} alt={user.name} fill className="object-cover" />
              ) : (
                <span className={cn("font-bold select-none", color?.text, cfg.text)}>
                  {getInitials(user.name)}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {showCount && (
        <span className="font-dm-sans text-sm font-medium text-[#525965] whitespace-nowrap">
          {users.length.toLocaleString()} user{users.length !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  )
}