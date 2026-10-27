'use client'

import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { moodboardService } from '@/services/moodboard.service'
import { useToast } from '@/components/ui/toaster'
import { HttpError } from '@/lib/api-client'

const MOODBOARD_KEYS = {
  all: ['moodboards'] as const,
  mine: () => [...MOODBOARD_KEYS.all, 'mine'] as const,
  detail: (id: string) => [...MOODBOARD_KEYS.all, id] as const,
}

export function useMoodboards() {
  return useQuery({
    queryKey: MOODBOARD_KEYS.mine(),
    queryFn: () => moodboardService.list().then((r) => r.data),
  })
}

export function useMoodboard(id: string) {
  return useQuery({
    queryKey: MOODBOARD_KEYS.detail(id),
    queryFn: () => moodboardService.getById(id).then((r) => r.data),
    enabled: Boolean(id),
  })
}

// Which of the given moodboards already contain this artwork. There's no
// lightweight "is artwork X in board Y" endpoint, so this reads each board's
// detail (shares the cache with useMoodboard, and the add/remove mutations
// below invalidate it). If the API grows a `contains_artwork` flag on the list
// response, this hook is the only thing that needs to change.
export function useArtworkMoodboardMembership(artworkId: string, moodboardIds: string[], enabled = true) {
  const results = useQueries({
    queries: moodboardIds.map((id) => ({
      queryKey: MOODBOARD_KEYS.detail(id),
      queryFn: () => moodboardService.getById(id).then((r) => r.data),
      enabled: enabled && Boolean(artworkId),
      staleTime: 30_000,
    })),
  })

  const containing = new Set<string>()
  const checking = new Set<string>()
  results.forEach((res, i) => {
    const id = moodboardIds[i]
    if (!id) return
    if (res.data) {
      if (res.data.artworks?.some((a) => a.id === artworkId)) containing.add(id)
    } else if (res.isPending && res.fetchStatus !== 'idle') {
      checking.add(id)
    }
  })

  return { containing, checking }
}

export function useCreateMoodboard() {
  const qc = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (title: string) => moodboardService.create(title),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MOODBOARD_KEYS.mine() })
      success('Moodboard created')
    },
    onError: () => error('Could not create moodboard', 'Please try again.'),
  })
}

export function useUpdateMoodboard() {
  const qc = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => moodboardService.update(id, title),
    onSuccess: (_res, { id }) => {
      qc.invalidateQueries({ queryKey: MOODBOARD_KEYS.mine() })
      qc.invalidateQueries({ queryKey: MOODBOARD_KEYS.detail(id) })
      success('Moodboard renamed')
    },
    onError: () => error('Could not rename moodboard'),
  })
}

export function useDeleteMoodboard() {
  const qc = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (id: string) => moodboardService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MOODBOARD_KEYS.mine() })
      success('Moodboard deleted')
    },
    onError: () => error('Could not delete moodboard'),
  })
}

export function useAddToMoodboard() {
  const qc = useQueryClient()
  const { success, error, info } = useToast()

  return useMutation({
    mutationFn: ({ moodboardId, artworkId }: { moodboardId: string; artworkId: string }) =>
      moodboardService.addArtwork(moodboardId, artworkId),
    onSuccess: (_res, { moodboardId }) => {
      qc.invalidateQueries({ queryKey: MOODBOARD_KEYS.mine() })
      qc.invalidateQueries({ queryKey: MOODBOARD_KEYS.detail(moodboardId) })
      success('Saved to moodboard')
    },
    onError: (err: Error) => {
      if (err instanceof HttpError && err.statusCode === 403) {
        error('Cannot save this artwork', "The artist has disabled saving this piece to moodboards.")
      } else if (err instanceof HttpError && err.statusCode === 409) {
        info('Already in this moodboard')
      } else {
        error('Could not save to moodboard')
      }
    },
  })
}

export function useRemoveFromMoodboard() {
  const qc = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: ({ moodboardId, artworkId }: { moodboardId: string; artworkId: string }) =>
      moodboardService.removeArtwork(moodboardId, artworkId),
    onSuccess: (_res, { moodboardId }) => {
      qc.invalidateQueries({ queryKey: MOODBOARD_KEYS.mine() })
      qc.invalidateQueries({ queryKey: MOODBOARD_KEYS.detail(moodboardId) })
      success('Removed from moodboard')
    },
    onError: () => error('Could not remove artwork'),
  })
}