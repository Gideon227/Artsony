'use client'

import { useState, useMemo } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import { UnreadBanner } from '@/features/notification/components/unread-banner'
import { FilterTabs } from '@/features/notification/components/filter-tabs'
import { NotificationList } from '@/features/notification/components/notification-list'
import {
  useNotifications,
  useUnreadCount,
  useMarkRead,
  useMarkAllRead,
  useDeleteNotification,
} from '@/hooks/use-notification'
import { ROUTES } from '@/constants'
import type { Notification } from '@/types'

export default function NotificationsPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  // ── Data ──────────────────────────────────────────────────────────────────
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useNotifications(filter)

  const { data: unreadCount = 0 } = useUnreadCount()

  const notifications: Notification[] = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data]
  )

  // ── Mutations ─────────────────────────────────────────────────────────────
  const { mutate: markRead }          = useMarkRead()
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllRead()
  const { mutate: deleteNotification } = useDeleteNotification()

  const handleDelete = (id: string) => {
    setDeletingIds((prev) => new Set(prev).add(id))
    // Let exit animation play before mutating
    setTimeout(() => {
      deleteNotification(id)
      setDeletingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }, 280)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* ── Unread banner ────────────────────────────────────────────────── */}
      <UnreadBanner
        count={unreadCount}
        onMarkAllRead={() => markAllRead()}
        isLoading={isMarkingAll}
      />

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 md:px-6 py-8">

        {/* ── Page header ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="w-9 h-9 flex items-center justify-center rounded-full border border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 transition-colors active:scale-95 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="font-raleway font-semibold text-[22px] md:text-[26px] text-neutral-700 leading-tight">
              Notifications
            </h1>
          </div>

          {/* ── Filter tabs ─────────────────────────────────────────────── */}
          <FilterTabs
            active={filter}
            unreadCount={unreadCount}
            onChange={setFilter}
          />
        </div>

        {/* ── Notification list ────────────────────────────────────────── */}
        <NotificationList
          notifications={notifications}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage ?? false}
          fetchNextPage={fetchNextPage}
          onRead={markRead}
          onDelete={handleDelete}
          deletingIds={deletingIds}
        />
      </main>

      <Footer />
    </div>
  )
}