// src/hooks/use-artwork.ts
// Full replacement for the existing stub.
// Every hook follows the same pattern as use-auth-mutations.ts:
//   useMutation → service call → cache invalidation → toast feedback

import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { artworkService } from '@/services/artwork.service'
import { useArtworkStore } from '@/store/artwork.store'
import { useToast } from '@/components/ui/toaster'
import { QUERY_KEYS, STALE_TIMES } from '@/constants'
import type {
  Artwork,
  ArtworkFilters,
  CreateArtworkPayload,
  UpdateArtworkPayload,
  PaginatedArtworksResponse,
} from '@/types/artwork'

// ── Query key helpers ─────────────────────────────────────────────────────────
// Extend the existing QUERY_KEYS from constants/index.ts

const ART_KEYS = {
  all:       ['artworks'] as const,
  lists:     () => [...ART_KEYS.all, 'list'] as const,
  list:      (f: ArtworkFilters) => [...ART_KEYS.lists(), f] as const,
  feed:      (p: object) => [...ART_KEYS.all, 'feed', p] as const,
  detail:    () => [...ART_KEYS.all, 'detail'] as const,
  byId:      (id: string) => [...ART_KEYS.detail(), id] as const,
  bySlug:    (slug: string) => [...ART_KEYS.all, 'slug', slug] as const,
  myDrafts:  () => [...ART_KEYS.all, 'my-drafts'] as const,
}

// ── Reads ─────────────────────────────────────────────────────────────────────

export function useArtwork(id: string) {
  return useQuery({
    queryKey:  ART_KEYS.byId(id),
    queryFn:   () => artworkService.getById(id).then((r) => r.data),
    staleTime: STALE_TIMES.medium,
    enabled:   Boolean(id),
  })
}

export function useArtworkBySlug(slug: string) {
  return useQuery({
    queryKey:  ART_KEYS.bySlug(slug),
    queryFn:   () => artworkService.getBySlug(slug).then((r) => r.data),
    staleTime: STALE_TIMES.medium,
    enabled:   Boolean(slug),
  })
}

export function useArtworkList(filters: ArtworkFilters = {}) {
  return useQuery({
    queryKey:  ART_KEYS.list(filters),
    queryFn:   () => artworkService.list(filters),
    staleTime: STALE_TIMES.fast,
  })
}

// Infinite scroll feed — used by FeedSection and discover pages
export function useFeed(
  params: {
    category?: string
    sort?: 'newest' | 'trending' | 'recommended'
  } = {},
) {
  return useInfiniteQuery<PaginatedArtworksResponse>({
    queryKey: ART_KEYS.feed(params),
    queryFn: ({ pageParam = 1 }) =>
      artworkService.getFeed({ page: pageParam as number, perPage: 12, ...params }),
    getNextPageParam: (last) => last.has_next ? last.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: STALE_TIMES.fast,
  })
}

// Artist's own artworks (profile page — includes drafts when authed)
export function useMyArtworks(filters: Omit<ArtworkFilters, 'creator_id'> = {}) {
  return useQuery({
    queryKey:  ART_KEYS.myDrafts(),
    queryFn:   () => artworkService.list({ ...filters }),
    staleTime: STALE_TIMES.medium,
  })
}

export function useSearchArtworks(query: string, filters?: ArtworkFilters) {
  return useQuery({
    queryKey:  [...ART_KEYS.lists(), 'search', query, filters],
    queryFn:   () => artworkService.search(query, filters),
    enabled:   query.length >= 2,
    staleTime: STALE_TIMES.medium,
  })
}

// ── Create ────────────────────────────────────────────────────────────────────

export function useCreateArtwork() {
  const qc        = useQueryClient()
  const router    = useRouter()
  const clearDraft = useArtworkStore((s) => s.clearDraft)
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (payload: CreateArtworkPayload) => artworkService.create(payload),

    onSuccess: ({ data }) => {
      qc.invalidateQueries({ queryKey: ART_KEYS.lists() })
      qc.setQueryData(ART_KEYS.byId(data.id), data)
      clearDraft()
      success('Artwork created', `"${data.title}" was saved as a draft.`)
      router.push(`/artwork/${data.id}/edit`)
    },

    onError: () => {
      error('Upload failed', 'Could not save your artwork. Please try again.')
    },
  })
}

// ── Update ────────────────────────────────────────────────────────────────────

export function useUpdateArtwork(id: string) {
  const qc = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (payload: UpdateArtworkPayload) => artworkService.update(id, payload),

    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: ART_KEYS.byId(id) })
      const prev = qc.getQueryData<Artwork>(ART_KEYS.byId(id))
      qc.setQueryData<Artwork>(ART_KEYS.byId(id), (old) =>
        old ? { ...old, ...payload } : old,
      )
      return { prev }
    },

    onSuccess: ({ data }) => {
      qc.setQueryData(ART_KEYS.byId(id), data)
      qc.invalidateQueries({ queryKey: ART_KEYS.lists() })
      success('Saved', 'Your changes have been saved.')
    },

    onError: (_err, _payload, ctx) => {
      if (ctx?.prev) qc.setQueryData(ART_KEYS.byId(id), ctx.prev)
      error('Save failed', 'Could not save your changes. Please try again.')
    },
  })
}

// ── Publish ───────────────────────────────────────────────────────────────────

export function usePublishArtwork() {
  const qc = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (id: string) => artworkService.publish(id),

    onSuccess: ({ data }) => {
      qc.setQueryData(ART_KEYS.byId(data.id), data)
      qc.invalidateQueries({ queryKey: ART_KEYS.lists() })
      success('Published!', `"${data.title}" is now live.`)
    },

    onError: () => {
      error('Publish failed', 'Could not publish your artwork. Please try again.')
    },
  })
}

// ── Archive ───────────────────────────────────────────────────────────────────

export function useArchiveArtwork() {
  const qc = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (id: string) => artworkService.archive(id),

    onSuccess: ({ data }) => {
      qc.setQueryData(ART_KEYS.byId(data.id), data)
      qc.invalidateQueries({ queryKey: ART_KEYS.lists() })
      success('Archived', `"${data.title}" has been archived.`)
    },

    onError: () => {
      error('Archive failed', 'Could not archive this artwork.')
    },
  })
}

// ── Delete ────────────────────────────────────────────────────────────────────

export function useDeleteArtwork() {
  const qc     = useQueryClient()
  const router = useRouter()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (id: string) => artworkService.delete(id),

    onSuccess: (_data, id) => {
      qc.removeQueries({ queryKey: ART_KEYS.byId(id) })
      qc.invalidateQueries({ queryKey: ART_KEYS.lists() })
      success('Deleted', 'Artwork has been removed.')
      router.push('/profile')
    },

    onError: () => {
      error('Delete failed', 'Could not delete this artwork. Please try again.')
    },
  })
}

// ── Like (with optimistic update) ─────────────────────────────────────────────

export function useLikeArtwork() {
  const qc = useQueryClient()
  const setOptimisticLike = useArtworkStore((s) => s.setOptimisticLike)
  const { error } = useToast()

  return useMutation({
    mutationFn: ({ id, isLiked }: { id: string; isLiked: boolean }) =>
      isLiked ? artworkService.unlike(id) : artworkService.like(id),

    onMutate: async ({ id, isLiked }) => {
      await qc.cancelQueries({ queryKey: ART_KEYS.byId(id) })
      const prev = qc.getQueryData<Artwork>(ART_KEYS.byId(id))

      setOptimisticLike(id, !isLiked)

      qc.setQueryData<Artwork>(ART_KEYS.byId(id), (old) =>
        old
          ? {
              ...old,
              like_count: isLiked ? old.like_count - 1 : old.like_count + 1,
            }
          : old,
      )

      // Also update the artwork inside any cached infinite feed pages
      qc.setQueriesData<InfiniteData<PaginatedArtworksResponse>>(
        { queryKey: ART_KEYS.all },
        (old) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((a) =>
                a.id === id
                  ? { ...a, like_count: isLiked ? a.like_count - 1 : a.like_count + 1 }
                  : a,
              ),
            })),
          }
        },
      )

      return { prev }
    },

    onError: (_err, { id }, ctx) => {
      if (ctx?.prev) qc.setQueryData(ART_KEYS.byId(id), ctx.prev)
      setOptimisticLike(id, false)
      error('Action failed', 'Could not update like. Please try again.')
    },

    onSettled: (_data, _err, { id }) => {
      // Re-fetch to get authoritative server count
      void qc.invalidateQueries({ queryKey: ART_KEYS.byId(id) })
    },
  })
}

// ── Save / Unsave (with optimistic update) ────────────────────────────────────

export function useSaveArtwork() {
  const qc = useQueryClient()
  const setOptimisticSave = useArtworkStore((s) => s.setOptimisticSave)
  const { error } = useToast()

  return useMutation({
    mutationFn: ({ id, isSaved }: { id: string; isSaved: boolean }) =>
      isSaved ? artworkService.unsave(id) : artworkService.save(id),

    onMutate: ({ id, isSaved }) => {
      setOptimisticSave(id, !isSaved)
    },

    onError: (_err, { id, isSaved }) => {
      setOptimisticSave(id, isSaved)
      error('Action failed', 'Could not update saved status.')
    },

    onSettled: (_data, _err, { id }) => {
      void qc.invalidateQueries({ queryKey: ART_KEYS.byId(id) })
    },
  })
}

// ── Flag (moderation) ─────────────────────────────────────────────────────────

export function useFlagArtwork() {
  const qc = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: ({
      id,
      notes,
      moderationStatus,
    }: {
      id: string
      notes: string
      moderationStatus: 'APPROVED' | 'REJECTED' | 'FLAGGED'
    }) => artworkService.flag(id, notes, moderationStatus),

    onSuccess: ({ data }) => {
      qc.setQueryData(ART_KEYS.byId(data.id), data)
      qc.invalidateQueries({ queryKey: ART_KEYS.lists() })
      success('Moderation saved', 'The artwork moderation status has been updated.')
    },

    onError: () => {
      error('Moderation failed', 'Could not update moderation status.')
    },
  })
}

// ── Re-export query key map for external cache invalidation ───────────────────
export { ART_KEYS }
