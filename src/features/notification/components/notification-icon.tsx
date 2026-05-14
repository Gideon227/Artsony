import { Heart, MessageCircle, UserPlus, ShoppingBag, Reply } from 'lucide-react'
import { cn } from '@/utils'
import type { Notification } from '@/types'

const ICON_MAP: Record<Notification['type'], React.ElementType> = {
  like:    Heart,
  comment: MessageCircle,
  reply:   Reply,
  follow:  UserPlus,
  sale:    ShoppingBag,
}

type NotificationIconProps = {
  type: Notification['type']
  className?: string
}

/** Small orange circle with a white icon — shown bottom-right of avatar. */
export function NotificationIcon({ type, className }: NotificationIconProps) {
  const Icon = ICON_MAP[type]

  return (
    <span
      className={cn(
        'flex items-center justify-center w-5 h-5 rounded-full bg-primary-500 text-white shrink-0',
        className
      )}
      aria-hidden="true"
    >
      <Icon className="w-3 h-3" strokeWidth={2.5} />
    </span>
  )
}