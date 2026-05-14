'use client'

import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils'

type UnreadBannerProps = {
  count: number
  onMarkAllRead: () => void
  isLoading?: boolean
}

export function UnreadBanner({ count, onMarkAllRead, isLoading }: UnreadBannerProps) {
  if (count === 0) return null

  return (
    <div className="w-full bg-primary-50 border-b border-primary-100 px-4 md:px-8 py-4">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-500 text-white shrink-0">
            <Bell className="w-4 h-4" />
          </span>
          <div>
            <p className="font-raleway font-semibold text-[15px] text-neutral-700 leading-tight">
              {count} unread notification{count !== 1 ? 's' : ''}
            </p>
            <p className="font-poppins text-[12px] text-neutral-400 mt-0.5">
              Stay on top of your activity
            </p>
          </div>
        </div>

        <Button
          variant="ghost-primary"
          size="sm"
          onClick={onMarkAllRead}
          isLoading={isLoading}
          loadingText="Marking…"
          className={cn(
            'font-poppins text-[13px] shrink-0 whitespace-nowrap',
          )}
        >
          Mark all read
        </Button>
      </div>
    </div>
  )
}