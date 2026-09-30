import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { blockService } from '@/services/block.service'
import { useToast } from '@/components/ui/toaster'
import { useAuthStore } from '@/store/auth.store'
import type { BlockedUser, PaginatedResponse } from '@/types/social'

export const BLOCK_KEYS = {
  all: ['blocks'] as const,
  list: () => [...BLOCK_KEYS.all, 'list'] as const,
}

type BlockedPages = InfiniteData<PaginatedResponse<BlockedUser>, number>

export function useBlockedUsers(limit = 20) {
  const isAuthenticated = useAuthStore((s) => s.user !== null)

  return useInfiniteQuery({
    queryKey: BLOCK_KEYS.list(),
    queryFn: ({ pageParam }) => blockService.listBlocked({ page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.has_next ? last.page + 1 : undefined),
    enabled: isAuthenticated,
  })
}

export function useUnblockUser() {
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (userId: string) => blockService.unblockUser(userId),

    onSuccess: (_data, userId) => {
      queryClient.setQueryData<BlockedPages>(BLOCK_KEYS.list(), (old) =>
        old && {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.filter((user) => user.id !== userId),
            total: Math.max(0, page.total - 1),
          })),
        },
      )
      queryClient.invalidateQueries({ queryKey: BLOCK_KEYS.list() })
      queryClient.invalidateQueries({ queryKey: ['interactionPermissions', userId] })
      success('User unblocked')
    },

    onError: () => {
      error('Failed to unblock user', 'Please try again.')
    },
  })
}
