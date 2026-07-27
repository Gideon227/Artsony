'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
  const { success, error } = useToast()

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
