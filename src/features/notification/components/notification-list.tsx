'use client'

import { useCallback, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { NotificationCard } from './notification-card'
import { NotificationSkeleton } from './notification-skeleton'
import { groupNotifications } from '@/utils/index'
import type { Notification } from '@/types'

type NotificationListProps = {
  notifications: Notification[]
  isLoading: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  fetchNextPage: () => void
  onRead: (id: string) => void
  onDelete: (id: string) => void
  deletingIds: Set<string>
}

export function NotificationList({
  notifications,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  onRead,
  onDelete,
  deletingIds,
}: NotificationListProps) {
  // ── Infinite scroll sentinel ─────────────────────────────────────────────
  const observerRef = useRef<IntersectionObserver | null>(null)

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect()
      if (!node) return
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage()
        },
        { rootMargin: '200px' }
      )
      observerRef.current.observe(node)
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  )

  // ── States ────────────────────────────────────────────────────────────────
  if (isLoading) return <NotificationSkeleton count={8} />

  if (notifications.length === 0) return <EmptyState />

  const groups = groupNotifications(notifications)

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group.label}>
          {/* Section label */}
          <div className="flex items-center gap-3 mb-3">
            <span className="w-1 h-4 rounded-full bg-primary-500 shrink-0" />
            <h3 className="font-raleway font-semibold text-[13px] uppercase tracking-[0.08em] text-neutral-400">
              {group.label}
            </h3>
          </div>

          {/* Cards */}
          <div className="flex flex-col gap-2">
            {group.items.map((notification, i) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.2), duration: 0.3 }}
              >
                <NotificationCard
                  notification={notification}
                  onRead={onRead}
                  onDelete={onDelete}
                  isDeleting={deletingIds.has(notification.id)}
                />
              </motion.div>
            ))}
          </div>
        </section>
      ))}

      {/* Infinite scroll trigger */}
      <div ref={sentinelRef} className="h-4" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
        </div>
      )}

      {!hasNextPage && notifications.length > 0 && (
        <p className="text-center font-poppins text-[12px] text-neutral-300 pb-4">
          You&apos;re all caught up ✓
        </p>
      )}
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path
            d="M14 3C14 3 7 7 7 14v5l-2 2v1h18v-1l-2-2v-5c0-7-7-11-7-11z"
            stroke="#F25B38" strokeWidth="1.8" strokeLinejoin="round" fill="none"
          />
          <path d="M11.5 22a2.5 2.5 0 005 0" stroke="#F25B38" strokeWidth="1.8" />
        </svg>
      </div>
      <div>
        <p className="font-raleway font-semibold text-[16px] text-neutral-600">
          No notifications yet
        </p>
        <p className="font-poppins text-[13px] text-neutral-400 mt-1 max-w-xs mx-auto leading-5">
          When someone likes, comments, or follows you — it'll show up here.
        </p>
      </div>
    </div>
  )
}