import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { notificationService } from '@/services/notification.service'
import { QUERY_KEYS, STALE_TIMES } from '@/constants'
import { useToast } from '@/components/ui/toaster'
import type { Notification, PaginatedResponse } from '@/types'

type FilterType = 'all' | 'unread'

// ─── Infinite list of notifications ──────────────────────────────────────────

export function useNotifications(filter: FilterType = 'all') {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.notifications, filter],
    queryFn: ({ pageParam = 1 }) =>
      notificationService.getAll({ page: pageParam as number, perPage: 20, filter }),
    getNextPageParam: (last: PaginatedResponse<Notification>) =>
      last.hasNextPage ? last.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: STALE_TIMES.fast,
  })
}

// ─── Unread count (used in navbar badge) ─────────────────────────────────────

export function useUnreadCount() {
  return useQuery({
    queryKey: [...QUERY_KEYS.notifications, 'unread-count'],
    queryFn: () => notificationService.getUnreadCount().then((r) => r.data.count),
    staleTime: STALE_TIMES.fast,
    refetchInterval: 30_000, // poll every 30s
  })
}

// ─── Mark single notification as read ────────────────────────────────────────

export function useMarkRead() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),

    // Optimistic update — flip isRead immediately
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.notifications })

      const previousData = qc.getQueryData(QUERY_KEYS.notifications)

      qc.setQueriesData<{ pages: { data: Notification[] }[] }>(
        { queryKey: QUERY_KEYS.notifications },
        (old) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((n) =>
                n.id === id ? { ...n, isRead: true } : n
              ),
            })),
          }
        }
      )

      return { previousData }
    },

    onError: (_err, _id, ctx) => {
      if (ctx?.previousData) {
        qc.setQueryData(QUERY_KEYS.notifications, ctx.previousData)
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.notifications, 'unread-count'] })
    },
  })
}

// ─── Mark ALL notifications as read ──────────────────────────────────────────

export function useMarkAllRead() {
  const qc = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: () => notificationService.markAllRead(),

    onMutate: async () => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.notifications })

      qc.setQueriesData<{ pages: { data: Notification[] }[] }>(
        { queryKey: QUERY_KEYS.notifications },
        (old) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((n) => ({ ...n, isRead: true })),
            })),
          }
        }
      )
    },

    onSuccess: () => {
      success('All caught up!', 'All notifications marked as read.')
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.notifications, 'unread-count'] })
    },

    onError: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.notifications })
      error('Something went wrong', 'Could not mark all as read.')
    },
  })
}

// ─── Delete notification ──────────────────────────────────────────────────────

export function useDeleteNotification() {
  const qc = useQueryClient()
  const { error } = useToast()

  return useMutation({
    mutationFn: (id: string) => notificationService.delete(id),

    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.notifications })

      qc.setQueriesData<{ pages: { data: Notification[] }[] }>(
        { queryKey: QUERY_KEYS.notifications },
        (old) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter((n) => n.id !== id),
            })),
          }
        }
      )
    },

    onError: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.notifications })
      error('Could not delete notification')
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.notifications, 'unread-count'] })
    },
  })
}