'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants'
import { useArtworkBySlug } from '@/hooks/use-artwork'
import { selectIsHydrated, useAuthStore } from '@/store/auth.store'
import { useArtworkViewerStore, type ArtworkViewerDirection } from '@/store/artwork-viewer.store'
import type { Artwork } from '@/types/artwork'
import HomeArtworkViewOverlay from './home/artwork-view-overlay'
import ShopArtworkViewOverlay from './shop/artwork-view-overlay'

export function useResolvedArtwork(slug: string) {
  const isHydrated = useAuthStore(selectIsHydrated)
  const seeded = useArtworkViewerStore((s) => s.artworks.find((a) => a.slug === slug))
  const query = useArtworkBySlug(slug, isHydrated && !seeded)
  const artwork = seeded ?? query.data

  return {
    artwork,
    isError: !artwork && query.isError,
    retry: query.refetch,
    isRetrying: query.isFetching,
  }
}

type ArtworkOverlayHostProps = {
  slug: string
  onClose: () => void
}

export function ArtworkOverlayHost({ slug, onClose }: ArtworkOverlayHostProps) {
  const router = useRouter()
  const { artwork, isError, retry, isRetrying } = useResolvedArtwork(slug)
  const storedVariant = useArtworkViewerStore((s) => s.variant)
  const canNavigate = useArtworkViewerStore(
    (s) => s.artworks.length > 1 && s.artworks.some((a) => a.slug === slug),
  )

  const handleNavigate = useCallback(
    (direction: ArtworkViewerDirection) => {
      const target = useArtworkViewerStore.getState().neighbour(slug, direction)
      if (target) router.replace(ROUTES.artwork(target.slug), { scroll: false })
    },
    [router, slug],
  )

  const handleSwap = useCallback(
    (next: Artwork) => {
      useArtworkViewerStore.getState().replaceContext(next)
      router.replace(ROUTES.artwork(next.slug), { scroll: false })
    },
    [router],
  )

  if (isError) {
    return (
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="artwork-unavailable-title"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      >
        <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-[var(--radius-l)] bg-white p-6 text-center">
          <h2 id="artwork-unavailable-title" className="font-poppins text-body-l font-semibold text-heading">
            Artwork unavailable
          </h2>
          <p className="font-poppins text-body-s text-gray-400">
            It may have been removed, made private, or the connection failed.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={onClose} aria-label="Close">
              Close
            </Button>
            <Button size="lg" isLoading={isRetrying} onClick={() => void retry()} aria-label="Retry loading artwork">
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!artwork) {
    return (
      <div
        role="status"
        aria-label="Loading artwork"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      >
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  const variant = storedVariant ?? (artwork.listing_type === 'MARKETPLACE' ? 'shop' : 'home')
  const Overlay = variant === 'shop' ? ShopArtworkViewOverlay : HomeArtworkViewOverlay

  return (
    <Overlay
      artwork={artwork}
      onClose={onClose}
      onNavigate={canNavigate ? handleNavigate : undefined}
      onSwapArtwork={handleSwap}
    />
  )
}
