import { useQuery, useMutation } from '@tanstack/react-query'
import { userService, type PublicProfileSummary } from '@/services/user.service'
import { useAuthStore } from '@/store/auth.store'
import type { InteractionPermissions } from '@/types'
import { useToast } from '@/components/ui/toaster'

// Resolves a set of user ids (e.g. artwork collaborator ids) to public
// profile summaries in one request. Keyed on the sorted id list so the same
// collaborator set across renders hits cache instead of refetching.
export function useUsersByIds(ids: string[]) {
  const unique = Array.from(new Set(ids.filter(Boolean))).sort()

  return useQuery({
    queryKey: ['users', 'by-ids', unique],
    queryFn: async (): Promise<PublicProfileSummary[]> => (await userService.getByIds(unique)).data,
    enabled: unique.length > 0,
    staleTime: 5 * 60_000,
  })
}

export function useReportUser() {
  const { success, error } = useToast()
  return useMutation({
    mutationFn: ({ userId, reason, notes, conversationId }: { userId: string; reason: string; notes?: string; conversationId?: string }) =>
      userService.reportUser(userId, { reason, notes, conversation_id: conversationId }),
    onSuccess: () => success('Reported', "Thanks — we'll take a look."),
    onError: () => error('Report failed', 'Could not submit your report. Please try again.'),
  })
}

// Whether the signed-in user can message/comment on/purchase from
// `targetUserId`, given that user's privacy settings and block status.
// Drives disabling/hiding the message button, comment box, and buy button
// ahead of time. Always resolves true for your own id without a request.
// This is a UI convenience only — the backend re-checks the real rule on
// every actual send/comment/purchase attempt regardless of this result.
export function useInteractionPermissions(targetUserId: string | undefined) {
  const currentUserId = useAuthStore((s) => s.user?.id)
  const isSelf = Boolean(targetUserId && currentUserId && targetUserId === currentUserId)

  return useQuery({
    queryKey: ['interactionPermissions', targetUserId],
    queryFn: async (): Promise<InteractionPermissions> =>
      (await userService.getInteractionPermissions(targetUserId as string)).data,
    enabled: Boolean(targetUserId) && Boolean(currentUserId) && !isSelf,
    staleTime: 60_000,
    // Own content is always fully permitted — skip the request entirely.
    placeholderData: isSelf
      ? { can_message: true, can_comment: true, can_purchase: true }
      : undefined,
  })
}
