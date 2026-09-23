'use client'

import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils'
import { NotificationIcon } from './notification-icon'
import { NOTIFICATION_LABELS, relativeTime } from '@/utils/index'
import { ROUTES } from '@/constants'
import type { Notification } from '@/types'
import { Button } from '@/components'
import { useRouter } from 'next/navigation'

type NotificationCardProps = {
  notification: Notification
  onRead: (id: string) => void
  onDelete: (id: string) => void
  isDeleting?: boolean
}

export function NotificationCard({
  notification: n,
  onRead,
  onDelete,
  isDeleting,
}: NotificationCardProps) {
  const router = useRouter()
  const href = resolveHref(n)

  const handleClick = () => {
    if (!n.is_read) onRead(n.id)
    if (href) router.push(href)
  }

  const actorName = n.actor?.display_name || n.actor?.username || null
  const isMessage = n.type === 'message'
  const preview = typeof n.data?.['preview'] === 'string' ? n.data['preview'] as string : null
  const conversationId = typeof n.data?.['conversation_id'] === 'string' ? n.data['conversation_id'] as string : null

  return (
    <AnimatePresence>
      {!isDeleting && (
        <motion.div
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          onClick={handleClick}
          className={cn(
            'group flex items-start gap-4 p-6 border cursor-pointer',
            'transition-colors duration-150',
            n.is_read
              ? 'bg-white border-neutral-100 hover:bg-neutral-50'
              : 'bg-primary-50 border-primary-100 hover:bg-primary-50/80'
          )}
        >
          <div className="relative shrink-0">
            <Image
              src={n.actor?.avatar_url || '/images/image-avatar.svg'}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover"
              alt={actorName ?? 'Artsony'}
            />
            <NotificationIcon type={n.type} className="absolute -bottom-1 -right-1" />
          </div>

          <div className='flex flex-col w-full gap-y-2'>
            <p className='font-poppins text-body-s text-heading'>
              {actorName && <span className="font-medium">{actorName} </span>}
              {NOTIFICATION_LABELS[n.type]}
            </p>

            {isMessage && preview && (
              <p className='font-poppins font-light text-body-xs text-body'>{preview}</p>
            )}

            {isMessage && conversationId && (
              <div className='border border-gray-50 bg-white flex gap-4 py-2 pl-2 pr-4 rounded-m w-full'>
                <Image
                  src={n.actor?.avatar_url || '/images/image-avatar.svg'}
                  width={72}
                  height={72}
                  className='object-cover rounded-m'
                  alt='sender avatar'
                />
                <div className='h-full flex flex-col gap-2 justify-center'>
                  <Button
                    variant='outline'
                    size='md'
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/messages/${conversationId}`)
                    }}
                  >
                    Send a Message
                  </Button>
                </div>
              </div>
            )}

            <p className='font-poppins text-text-alt-grey text-body-xxs'>{relativeTime(n.created_at)}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Resolve destination href for each notification type ─────────────────────
//
// Only 'user' (follow) notifications resolve to a real page right now —
// artworks are viewed through ArtworkViewOverlay, opened from a page's own
// client state (see home/shop/profile pages), not a standalone route, so
// there's no URL to send a comment/like notification to yet. Falls back to
// no navigation (still marks as read) rather than linking somewhere broken.
function resolveHref(n: Notification): string | null {
  if (n.entity_type === 'user' && n.actor_id) return ROUTES.profile(n.actor_id)
  return null
}