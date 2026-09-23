import { Heart, MessageCircle, UserPlus, ShoppingBag, Reply, Package, Bell, AtSign, Star } from 'lucide-react'
import { cn } from '@/utils'
import type { Notification } from '@/types'

const ICON_MAP: Record<Notification['type'], React.ElementType> = {
  like: Heart,
  comment: MessageCircle,
  message: MessageCircle,
  reply: Reply,
  follow: UserPlus,
  sale: ShoppingBag,
  order_update: Package,
  system: Bell,
  broadcast: Bell,
  mention: AtSign,
  review: Star,
}

type NotificationIconProps = {
  type: Notification['type']
  className?: string
}

/** Small orange circle with a white icon — shown bottom-right of avatar. */
export function NotificationIcon({ type, className }: NotificationIconProps) {
  // Fall back to Bell if the type is undefined or unmapped
  const Icon = ICON_MAP[type] ?? Bell

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