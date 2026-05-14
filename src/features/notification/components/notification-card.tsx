'use client'

import Image from 'next/image'
import Link from 'next/link'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils'
import { Avatar } from '@/components/ui/avatar'
import { NotificationIcon } from './notification-icon'
import { NOTIFICATION_LABELS, relativeTime } from '@/utils/index'
import { ROUTES } from '@/constants'
import type { Notification } from '@/types'

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
  const href = resolveHref(n)

  const handleClick = () => {
    if (!n.isRead) onRead(n.id)
  }

  return (
    <AnimatePresence>
      {!isDeleting && (
        <motion.div
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className={cn(
            'group flex items-center gap-3 px-4 py-3 rounded-2xl border',
            'transition-colors duration-150',
            n.isRead
              ? 'bg-white border-neutral-100 hover:bg-neutral-50'
              : 'bg-primary-50 border-primary-100 hover:bg-primary-50/80'
          )}
        >
          {/* ── Unread dot ─────────────────────────────────────────────── */}
          <span
            className={cn(
              'shrink-0 w-2 h-2 rounded-full transition-opacity duration-300',
              n.isRead ? 'opacity-0' : 'opacity-100 bg-primary-500'
            )}
            aria-hidden="true"
          />

          {/* ── Avatar + type icon ──────────────────────────────────────── */}
          <div className="relative shrink-0">
            <Avatar
              src={n.actor.avatarUrl}
              name={n.actor.displayName}
              size="md"
            />
            <NotificationIcon
              type={n.type}
              className="absolute -bottom-1 -right-1 w-[18px] h-[18px]"
            />
          </div>

          {/* ── Text content ────────────────────────────────────────────── */}
          <Link
            href={href}
            onClick={handleClick}
            className="flex-1 min-w-0"
          >
            <p className="font-poppins text-[13px] leading-5 text-neutral-600 line-clamp-2">
              <span className="font-semibold text-neutral-700">
                {n.actor.displayName}
              </span>{' '}
              {NOTIFICATION_LABELS[n.type]}
            </p>
            <span className="font-poppins text-[11px] text-neutral-400 mt-0.5 block">
              {relativeTime(n.createdAt)}
            </span>
          </Link>

          {/* ── Artwork thumbnail (when notification is about an artwork) ─ */}
          {n.resourceType === 'artwork' && (
            <Link
              href={ROUTES.artwork(n.resourceId)}
              onClick={handleClick}
              tabIndex={-1}
              className="shrink-0 w-[52px] h-[52px] rounded-xl overflow-hidden border border-neutral-100 hover:opacity-90 transition-opacity"
            >
              <div className="relative w-full h-full">
                <Image
                  src={`/images/artwork-${n.resourceId}.jpg`}
                  alt="Artwork thumbnail"
                  fill
                  className="object-cover"
                  onError={(e) => {
                    // Graceful fallback if image doesn't exist yet
                    ;(e.currentTarget as HTMLImageElement).src = '/images/placeholder-art.jpg'
                  }}
                />
              </div>
            </Link>
          )}

          {/* ── Delete button ────────────────────────────────────────────── */}
          <button
            onClick={() => onDelete(n.id)}
            aria-label="Dismiss notification"
            className={cn(
              'shrink-0 w-7 h-7 flex items-center justify-center rounded-full',
              'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100',
              'opacity-0 group-hover:opacity-100 transition-all duration-150',
              'focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-primary-500'
            )}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Resolve destination href for each notification type ─────────────────────

function resolveHref(n: Notification): string {
  if (n.resourceType === 'artwork')  return ROUTES.artwork(n.resourceId)
  if (n.resourceType === 'user')     return ROUTES.profile(n.actor.username)
  if (n.resourceType === 'comment')  return ROUTES.artwork(n.resourceId)
  return ROUTES.notifications
}