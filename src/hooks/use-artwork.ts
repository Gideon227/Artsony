import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { artworkService } from '@/services'
import { QUERY_KEYS, STALE_TIMES } from '@/constants'
import { useToast } from '@/components/ui/toaster'
import type { Artwork, PaginatedResponse } from '@/types'

export function useArtwork(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.artwork(id),
    queryFn: () => artworkService.getById(id).then((r) => r.data),
    staleTime: STALE_TIMES.medium,
    enabled: Boolean(id),
  })
}

export function useFeed(params: { category?: string; sort?: 'newest' | 'trending' | 'recommended' } = {}) {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.feed, params],
    queryFn: ({ pageParam = 1 }) =>
      artworkService.getFeed({ page: pageParam as number, perPage: 12, ...params }),
    getNextPageParam: (last: PaginatedResponse<Artwork>) =>
      last.hasNextPage ? last.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: STALE_TIMES.fast,
  })
}

export function useLikeArtwork() {
  const qc = useQueryClient()
  const { error } = useToast()

  return useMutation({
    mutationFn: ({ id, isLiked }: { id: string; isLiked: boolean }) =>
      isLiked ? artworkService.unlike(id) : artworkService.like(id),

    onMutate: async ({ id, isLiked }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.artwork(id) })
      const prev = qc.getQueryData<Artwork>(QUERY_KEYS.artwork(id))
      qc.setQueryData<Artwork>(QUERY_KEYS.artwork(id), (old) =>
        old
          ? {
              ...old,
              isLiked: !isLiked,
              likesCount: isLiked ? old.likesCount - 1 : old.likesCount + 1,
            }
          : old
      )
      return { prev }
    },

    onError: (_err, { id }, ctx) => {
      if (ctx?.prev) qc.setQueryData(QUERY_KEYS.artwork(id), ctx.prev)
      error('Failed to update like')
    },
  })
}

export function useDeleteArtwork() {
  const qc = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (id: string) => artworkService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.feed })
      success('Artwork deleted')
    },
    onError: () => error('Failed to delete artwork'),
  })
}

type SearchFilters = {
  q: string
  category?: string
  price?: string
  color?: string
  size?: string
  location?: string
  sort?: 'newest' | 'trending' | 'recommended'
}

export function useSearchArtworks(filters: SearchFilters) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.artworks(filters as Record<string, unknown>),
    queryFn: ({ pageParam = 1 }) =>
      artworkService.search({ ...filters, page: pageParam as number, perPage: 12 }),
    getNextPageParam: (last: PaginatedResponse<Artwork>) =>
      last.hasNextPage ? last.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: STALE_TIMES.medium,
    enabled: filters.q.trim().length >= 1,
  })
}