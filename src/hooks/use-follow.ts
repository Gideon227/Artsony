import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { followService } from '@/services/follow.service'
import { useToast } from '@/components/ui/toaster'

const FOLLOW_KEYS = {
  isFollowing: (userId: string) => ['follows', 'is-following', userId] as const,
  followers:   (userId: string) => ['follows', 'followers', userId] as const,
  following:   (userId: string) => ['follows', 'following', userId] as const,
}

export function useIsFollowing(userId?: string) {
  return useQuery({
    queryKey: FOLLOW_KEYS.isFollowing(userId ?? ''),
    queryFn: async () => (await followService.isFollowing(userId as string)).data.is_following,
    enabled: Boolean(userId),
    staleTime: 60_000,
  })
}

export function useToggleFollow(userId: string) {
  const queryClient = useQueryClient()
  const { error } = useToast()

  return useMutation({
    mutationFn: () => followService.toggle(userId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: FOLLOW_KEYS.isFollowing(userId) })
      const previous = queryClient.getQueryData<boolean>(FOLLOW_KEYS.isFollowing(userId))
      queryClient.setQueryData(FOLLOW_KEYS.isFollowing(userId), !previous)
      return { previous }
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(FOLLOW_KEYS.isFollowing(userId), context?.previous)
      error('Something went wrong', 'Could not update follow status. Please try again.')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FOLLOW_KEYS.isFollowing(userId) })
    },
  })
}

export function useFollowers(userId: string, page = 1) {
  return useQuery({
    queryKey: [...FOLLOW_KEYS.followers(userId), page],
    queryFn: () => followService.listFollowers(userId, { page, limit: 20 }),
    enabled: Boolean(userId),
  })
}

export function useFollowing(userId: string, page = 1) {
  return useQuery({
    queryKey: [...FOLLOW_KEYS.following(userId), page],
    queryFn: () => followService.listFollowing(userId, { page, limit: 20 }),
    enabled: Boolean(userId),
  })
}