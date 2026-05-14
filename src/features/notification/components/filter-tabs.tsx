'use client'

import { motion } from 'framer-motion'
import { cn } from '@/utils'

type FilterTab = { label: string; value: 'all' | 'unread' }

const TABS: FilterTab[] = [
  { label: 'All',    value: 'all' },
  { label: 'Unread', value: 'unread' },
]

type FilterTabsProps = {
  active: 'all' | 'unread'
  unreadCount: number
  onChange: (value: 'all' | 'unread') => void
}

export function FilterTabs({ active, unreadCount, onChange }: FilterTabsProps) {
  return (
    <div className="flex items-center gap-2">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'relative flex items-center gap-1.5 h-9 px-4 rounded-full',
            'font-poppins text-[13px] font-medium transition-colors duration-200',
            'focus-visible:outline-2 focus-visible:outline-primary-500',
            active === tab.value
              ? 'text-white'
              : 'text-neutral-500 border border-neutral-200 bg-white hover:bg-neutral-50'
          )}
        >
          {/* Animated active pill */}
          {active === tab.value && (
            <motion.span
              layoutId="notif-tab-pill"
              className="absolute inset-0 rounded-full bg-primary-500"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}

          <span className="relative z-10">{tab.label}</span>

          {/* Unread count badge on the "Unread" tab */}
          {tab.value === 'unread' && unreadCount > 0 && (
            <span
              className={cn(
                'relative z-10 inline-flex items-center justify-center',
                'min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold',
                active === 'unread'
                  ? 'bg-white/25 text-white'
                  : 'bg-primary-500 text-white'
              )}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}