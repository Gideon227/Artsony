'use client'

import React from 'react'
import Image from 'next/image'
import { ChevronRight, ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProfileUser {
  id: string | number
  name: string
  username?: string
  avatarUrl?: string
  subtitle?: string
}

interface ProfileListItemProps {
  user: ProfileUser
  variant?: 'default' | 'active' | 'sortAsc' | 'sortDesc' | 'group'
  onClick?: () => void
  onSort?: (dir: 'asc' | 'desc') => void
  disabled?: boolean
}

export function ProfileListItem({ user, variant = 'default', onClick, onSort, disabled }: ProfileListItemProps) {
  const isActive = variant === 'active'
  
  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={cn(
        "group flex items-center gap-3 px-4 py-3 min-h-[64px] transition-all cursor-pointer select-none",
        isActive ? "bg-[#2F333A] text-white" : "bg-white hover:bg-[#F7F8F9] text-[#525965]",
        disabled && "opacity-40 pointer-events-none"
      )}
    >
      {/* Avatar */}
      <div className={cn(
        "relative w-[39px] h-[39px] rounded-full overflow-hidden shrink-0 border",
        isActive ? "border-white/20" : "border-[#E6E8EB] bg-[#DAD0FC]"
      )}>
        {user.avatarUrl ? (
          <Image src={user.avatarUrl} alt={user.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#DAD0FC]">
            <span className="text-[13px] font-bold text-[#6C47E8]">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-semibold truncate leading-tight", isActive ? "text-white" : "text-[#525965]")}>
          {user.name}
        </p>
        <p className={cn("text-xs truncate mt-0.5", isActive ? "text-white/50" : "text-[#788191]")}>
          {user.subtitle || `@${user.username}`}
        </p>
      </div>

      {/* Action Icons */}
      <div className="shrink-0 flex items-center">
        {isActive && <div className="flex text-white/60"><ChevronRight size={16} /><ChevronRight size={16} className="-ml-2" /></div>}
        {variant === 'sortAsc' && <ChevronUp size={18} className="text-[#525965]" />}
        {variant === 'sortDesc' && <ChevronDown size={18} className="text-[#525965]" />}
      </div>
    </div>
  )
}

export function ProfileList({ users, activeId, onSelect }: { users: ProfileUser[], activeId?: string | number, onSelect?: (u: ProfileUser) => void }) {
  return (
    <div className="flex flex-col w-full rounded-2xl overflow-hidden border border-[#E6E8EB] shadow-sm bg-white">
      {users.map((user, i) => (
        <React.Fragment key={user.id}>
          <ProfileListItem 
            user={user} 
            variant={user.id === activeId ? 'active' : 'default'} 
            onClick={() => onSelect?.(user)} 
          />
          {i < users.length - 1 && (
            <div className="h-[1px] bg-[#E6E8EB] ml-[67px]" /> /* Indent past avatar (16px padding + 39px avatar + 12px gap) */
          )}
        </React.Fragment>
      ))}
    </div>
  )
}