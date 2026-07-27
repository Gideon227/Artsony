import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { commentService } from '@/services/comment.service'
import { useAuthStore } from '@/store/auth.store'
import { useToast } from '@/components/ui/toaster'
import type { Comment, CreateCommentInput, PaginatedResponse } from '@/types/social'

const COMMENT_KEYS = {
  forArtwork: (artworkId: string) => ['comments', 'artwork', artworkId] as const,
  replies:    (commentId: string) => ['comments', 'replies', commentId] as const,
}

export function useComments(artworkId: string, page = 1) {
  return useQuery({
    queryKey: [...COMMENT_KEYS.forArtwork(artworkId), page],
    queryFn: () => commentService.listForArtwork(artworkId, { page, limit: 20 }),
    enabled: Boolean(artworkId),
  })
}

export function useReplies(commentId: string, enabled: boolean) {
  return useQuery({
    queryKey: COMMENT_KEYS.replies(commentId),
    queryFn: () => commentService.listReplies(commentId, { limit: 50 }),
    enabled: enabled && Boolean(commentId),
  })
}

export function useCreateComment(artworkId: string) {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const { error } = useToast()

  return useMutation({
    mutationFn: (input: Omit<CreateCommentInput, 'artwork_id'>) =>
      commentService.create({ ...input, artwork_id: artworkId }),

    onMutate: async (input) => {
      const key = input.parent_id
        ? COMMENT_KEYS.replies(input.parent_id)
        : [...COMMENT_KEYS.forArtwork(artworkId), 1]

      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<PaginatedResponse<Comment>>(key)

      if (previous && user) {
        const optimistic: Comment = {
          id: `optimistic-${Date.now()}`,
          artwork_id: artworkId,
          user_id: user.id,
          parent_id: input.parent_id ?? null,
          body: input.body,
          likes_count: 0,
          reply_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
          author: {
            id: user.id,
            username: user.username,
            display_name: user.displayName ?? null,
            avatar_url: user.avatarUrl ?? null,
          },
        }
        queryClient.setQueryData(key, {
          ...previous,
          data: [optimistic, ...previous.data],
          total: previous.total + 1,
        })
      }

      return { previous, key }
    },

    onError: (_err, _vars, context) => {
      if (context) queryClient.setQueryData(context.key, context.previous)
      error('Comment failed to send', 'Please try again.')
    },

    onSettled: (_data, _err, input) => {
      queryClient.invalidateQueries({ queryKey: [...COMMENT_KEYS.forArtwork(artworkId), 1] })
      if (input.parent_id) {
        queryClient.invalidateQueries({ queryKey: COMMENT_KEYS.replies(input.parent_id) })
      }
    },
  })
}

export function useDeleteComment(artworkId: string) {
  const queryClient = useQueryClient()
  const { error, success } = useToast()

  return useMutation({
    mutationFn: (commentId: string) => commentService.delete(commentId),
    onSuccess: () => {
      success('Comment deleted', '')
      queryClient.invalidateQueries({ queryKey: COMMENT_KEYS.forArtwork(artworkId) })
    },
    onError: () => {
      error('Could not delete comment', 'Please try again.')
    },
  })
}