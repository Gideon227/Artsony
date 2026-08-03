import { useQuery } from '@tanstack/react-query'
import { userService, type PublicProfileSummary } from '@/services/user.service'

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
