import { create } from 'zustand'
import type { Artwork } from '@/types/artwork'

export type ArtworkViewerVariant = 'home' | 'shop'
export type ArtworkViewerDirection = 'prev' | 'next'

type ArtworkViewerState = {
  artworks: Artwork[]
  variant: ArtworkViewerVariant | null
  open: (artwork: Artwork, options?: { siblings?: Artwork[]; variant?: ArtworkViewerVariant }) => void
  replaceContext: (artwork: Artwork) => void
  find: (slug: string) => Artwork | undefined
  neighbour: (slug: string, direction: ArtworkViewerDirection) => Artwork | null
}

export const useArtworkViewerStore = create<ArtworkViewerState>((set, get) => ({
  artworks: [],
  variant: null,

  open: (artwork, options = {}) => {
    const siblings = options.siblings ?? []
    const list = siblings.some((a) => a.id === artwork.id) ? siblings : [artwork]
    set({ artworks: list, variant: options.variant ?? 'home' })
  },

  replaceContext: (artwork) => set({ artworks: [artwork] }),

  find: (slug) => get().artworks.find((a) => a.slug === slug),

  neighbour: (slug, direction) => {
    const { artworks } = get()
    const index = artworks.findIndex((a) => a.slug === slug)
    if (index === -1 || artworks.length < 2) return null
    const next = direction === 'next' ? index + 1 : index - 1
    return artworks[next] ?? null
  },
}))
