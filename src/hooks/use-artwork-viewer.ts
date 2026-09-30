'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/constants'
import { useArtworkViewerStore, type ArtworkViewerVariant } from '@/store/artwork-viewer.store'
import type { Artwork } from '@/types/artwork'

type OpenArtworkOptions = {
  siblings?: Artwork[]
  variant?: ArtworkViewerVariant
}

export function useOpenArtwork() {
  const router = useRouter()

  return useCallback(
    (artwork: Artwork, options?: OpenArtworkOptions) => {
      useArtworkViewerStore.getState().open(artwork, options)
      router.push(ROUTES.artwork(artwork.slug), { scroll: false })
    },
    [router],
  )
}
