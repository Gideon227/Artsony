// Manages:
//   1. The draft being created/edited (form state across multi-step wizard)
//   2. The currently viewed artwork (for detail page)
//   3. Optimistic like/save state before server confirms

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type {
  Artwork,
  ArtworkAsset,
  CreateArtworkPayload,
  PhysicalDetails,
  Variant,
  ListingType,
  ArtworkFormat,
  ArtworkVisibility,
} from '@/types/artwork'
import { v4 as uuidv4 } from 'uuid'

// ── Draft shape ───────────────────────────────────────────────────────────────
// Partial — the wizard fills it progressively across steps.

export type ArtworkDraft = Partial<CreateArtworkPayload>

type ArtworkState = {
  // Active draft (upload wizard / edit form)
  draft: ArtworkDraft
  draftStep: number // which wizard step the user is on (0-indexed)
  isDirty: boolean // any unsaved changes in the draft

  // Currently viewed artwork (detail page — avoids prop drilling)
  viewed: Artwork | null

  // Optimistic engagement maps: artworkId → boolean
  optimisticLikes:  Record<string, boolean>
  optimisticSaves:  Record<string, boolean>
}

type ArtworkActions = {
  // ── Draft management ────────────────────────────────────────────────────────
  setDraftField: <K extends keyof ArtworkDraft>(key: K, value: ArtworkDraft[K]) => void
  setDraft: (partial: ArtworkDraft) => void
  setDraftStep: (step: number) => void
  clearDraft: () => void

  // ── Asset management within draft ───────────────────────────────────────────
  addDraftAsset:    (asset: Omit<ArtworkAsset, 'id'>) => void
  removeDraftAsset: (index: number) => void
  reorderDraftAssets: (fromIndex: number, toIndex: number) => void

  // ── Variant management within draft ─────────────────────────────────────────
  addDraftVariant:    (variant: Omit<Variant, 'id'>) => void
  removeDraftVariant: (index: number) => void
  updateDraftVariant: (index: number, partial: Partial<Omit<Variant, 'id'>>) => void

  // ── Viewed artwork ──────────────────────────────────────────────────────────
  setViewed: (artwork: Artwork | null) => void
  clearViewed: () => void

  // ── Optimistic engagement ───────────────────────────────────────────────────
  setOptimisticLike: (artworkId: string, liked: boolean) => void
  setOptimisticSave: (artworkId: string, saved: boolean) => void
  clearOptimistic:   (artworkId: string) => void
}

const EMPTY_DRAFT: ArtworkDraft = {
  listing_type: 'PORTFOLIO',
  artwork_format: 'DIGITAL',
  visibility: 'PUBLIC',
  allow_moodboard_save:  true,
  allow_comments: true,
  allow_likes: true,
  show_engagement_stats: true,
  has_variants: false,
  categories: [],
  keywords: [],
  tools_used: [],
  collaborator_ids: [],
  assets: [],
  variants: [],
}

export const useArtworkStore = create<ArtworkState & ArtworkActions>()(
  devtools(
    persist(
      immer((set) => ({
        draft: { ...EMPTY_DRAFT },
        draftStep: 0,
        isDirty: false,
        viewed: null,
        optimisticLikes:  {},
        optimisticSaves:  {},

        // ── Draft ─────────────────────────────────────────────────────────────

        setDraftField: (key, value) =>
          set((s) => {
            (s.draft as any)[key] = value
            s.isDirty = true
          }),

        setDraft: (partial) =>
          set((s) => {
            Object.assign(s.draft, partial)
            s.isDirty = true
          }),

        setDraftStep: (step) =>
          set((s) => { s.draftStep = step }),

        clearDraft: () =>
          set((s) => {
            s.draft     = { ...EMPTY_DRAFT }
            s.draftStep = 0
            s.isDirty   = false
          }),

        // ── Assets ────────────────────────────────────────────────────────────

        addDraftAsset: (asset) =>
          set((s) => {
            const assets = s.draft.assets ?? []
            assets.push({ ...asset, ordering_index: assets.length })
            s.draft.assets = assets
            s.isDirty = true
          }),

        removeDraftAsset: (index) =>
          set((s) => {
            const assets = [...(s.draft.assets ?? [])]
            assets.splice(index, 1)
            // Re-number ordering_index after removal
            s.draft.assets = assets.map((a, i) => ({ ...a, ordering_index: i }))
            s.isDirty = true
          }),

        reorderDraftAssets: (fromIndex, toIndex) =>
          set((s) => {
            const assets = [...(s.draft.assets ?? [])]
            const [moved] = assets.splice(fromIndex, 1)
            if (moved) assets.splice(toIndex, 0, moved)
            s.draft.assets = assets.map((a, i) => ({ ...a, ordering_index: i }))
            s.isDirty = true
          }),

        // ── Variants ──────────────────────────────────────────────────────────

        addDraftVariant: (variant) =>
          set((s) => {
            const variants = s.draft.variants ?? []
            variants.push(variant)
            s.draft.variants = variants
            s.isDirty = true
          }),

        removeDraftVariant: (index) =>
          set((s) => {
            const variants = [...(s.draft.variants ?? [])]
            variants.splice(index, 1)
            s.draft.variants = variants
            s.isDirty = true
          }),

        updateDraftVariant: (index, partial) =>
          set((s) => {
            const variants = [...(s.draft.variants ?? [])]
            if (variants[index]) Object.assign(variants[index]!, partial)
            s.draft.variants = variants
            s.isDirty = true
          }),

        // ── Viewed ────────────────────────────────────────────────────────────

        setViewed:   (artwork) => set((s) => { s.viewed = artwork }),
        clearViewed: ()        => set((s) => { s.viewed = null }),

        // ── Optimistic engagement ─────────────────────────────────────────────

        setOptimisticLike: (artworkId, liked) =>
          set((s) => { s.optimisticLikes[artworkId] = liked }),

        setOptimisticSave: (artworkId, saved) =>
          set((s) => { s.optimisticSaves[artworkId] = saved }),

        clearOptimistic: (artworkId) =>
          set((s) => {
            delete s.optimisticLikes[artworkId]
            delete s.optimisticSaves[artworkId]
          }),
      })),
      {
        name: 'artsony-artwork-draft',
        // Only persist the draft + step — never the viewed artwork or optimistic state
        partialize: (state) => ({
          draft:     state.draft,
          draftStep: state.draftStep,
          isDirty:   state.isDirty,
        }),
      }
    ),
    { name: 'ArtworkStore', enabled: process.env.NODE_ENV === 'development' }
  )
)

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectDraft = (s: ArtworkState) => s.draft
export const selectDraftStep = (s: ArtworkState) => s.draftStep
export const selectIsDirty = (s: ArtworkState) => s.isDirty
export const selectViewed = (s: ArtworkState) => s.viewed
export const selectOptimisticLike = (artworkId: string) => (s: ArtworkState) =>
  s.optimisticLikes[artworkId]
export const selectOptimisticSave = (artworkId: string) => (s: ArtworkState) =>
  s.optimisticSaves[artworkId]
