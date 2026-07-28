import { create } from 'zustand'

type ArtworkViewerState = {
  isOpen: boolean
  artworkId: string | null
  contextIds: string[]
  open: (artworkId: string, contextIds?: string[]) => void
  close: () => void
  next: () => void
  prev: () => void
}

export const useArtworkViewerStore = create<ArtworkViewerState>((set, get) => ({
  isOpen: false,
  artworkId: null,
  contextIds: [],

  open: (artworkId, contextIds = []) =>
    set({
      isOpen: true,
      artworkId,
      contextIds: contextIds.length ? contextIds : [artworkId],
    }),

  close: () => set({ isOpen: false, artworkId: null, contextIds: [] }),

  next: () => {
    const { artworkId, contextIds } = get()
    if (!artworkId || contextIds.length < 2) return
    const idx = contextIds.indexOf(artworkId)
    if (idx === -1) return
    set({ artworkId: contextIds[(idx + 1) % contextIds.length] })
  },

  prev: () => {
    const { artworkId, contextIds } = get()
    if (!artworkId || contextIds.length < 2) return
    const idx = contextIds.indexOf(artworkId)
    if (idx === -1) return
    set({ artworkId: contextIds[(idx - 1 + contextIds.length) % contextIds.length] })
  },
}))