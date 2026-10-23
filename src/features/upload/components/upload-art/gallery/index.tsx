'use client'

import React, { useMemo, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { cn } from '@/utils'
import { useArtworkStore } from '@/store/artwork.store'
import { AssetMedia } from '../asset-block'
import { buildAssetKeys } from '../asset-keys'
import { EmptyBlock } from '../empty-block'
import { MediaModalHost } from '../media-modal-host'
import { ModalBackdrop } from '../modals/modal-primitives'
import { DeleteMediaModal } from '../modals/confirm-modals'
import type { DraftAsset, ModalKind } from '../types'
import {
  buildStrip,
  clampSlots,
  slotsAfterDelete,
  slotsAfterDismiss,
  slotsAfterFill,
  type EmptySlot,
} from './slots'

const EMPTY_ASSETS: DraftAsset[] = []

// Controls fade in on hover / keyboard focus, and are always visible on touch screens.
const REVEAL =
  'opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100'

const CONTROL =
  'flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white bg-black/30 text-white backdrop-blur-md transition-colors hover:bg-black/50 focus-visible:outline-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-black/30'

interface InsertTarget {
  modal:  ModalKind
  slotId: string | null
}

interface GalleryItem {
  asset: DraftAsset
  realIndex: number
}

const toGalleryItems = (assets: DraftAsset[]): GalleryItem[] =>
  assets.flatMap((asset, realIndex) => (asset.is_file ? [] : [{ asset, realIndex }]))

// Position in the full draft array for a position in the gallery list
function realIndexFor(items: GalleryItem[], position: number): number {
  if (position < items.length) return items[position]!.realIndex
  const last = items[items.length - 1]
  return last ? last.realIndex + 1 : 0
}

// Rows × columns so every tile is visible at once (roughly square cells)
function gridFor(count: number) {
  const cols = count <= 1 ? 1 : count === 2 ? 2 : Math.ceil(Math.sqrt(count))
  return { cols, rows: Math.max(1, Math.ceil(count / cols)) }
}

const UploadArtGallery = () => {
  const assets = useArtworkStore((s) => s.draft.assets) ?? EMPTY_ASSETS
  const insertDraftAssets = useArtworkStore((s) => s.insertDraftAssets)
  const reorderDraftAssets = useArtworkStore((s) => s.reorderDraftAssets)
  const removeDraftAsset = useArtworkStore((s) => s.removeDraftAsset)

  const [slots, setSlots] = useState<EmptySlot[]>([])
  // null = showing the grid; otherwise the "pick a media type" screen
  const [choosing, setChoosing] = useState<{ slotId: string | null } | null>(null)
  const [target, setTarget] = useState<InsertTarget | null>(null)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

  const items = useMemo(() => toGalleryItems(assets), [assets])
  const activeSlots = useMemo(() => clampSlots(slots, items.length), [slots, items.length])
  const strip = useMemo(() => buildStrip(items.length, activeSlots), [items.length, activeSlots])
  const assetKeys = useMemo(() => buildAssetKeys(items.map((item) => item.asset)), [items])

  // With nothing to show, go straight to the media picker
  const showChooser = choosing !== null || items.length === 0
  const chooserSlotId = choosing ? choosing.slotId : (activeSlots[0]?.id ?? null)

  const openModal = (modal: ModalKind) => setTarget({ modal, slotId: chooserSlotId })
  const closeModal = () => setTarget(null)

  const handleAssets = (incoming: DraftAsset[]) => {
    const latest = toGalleryItems(useArtworkStore.getState().draft.assets ?? [])
    const slot = target?.slotId ? activeSlots.find((candidate) => candidate.id === target.slotId) : undefined
    const position = slot ? Math.min(slot.at, latest.length) : latest.length

    insertDraftAssets(realIndexFor(latest, position), incoming)
    setSlots(slot ? slotsAfterFill(activeSlots, slot.id, incoming.length) : activeSlots)
    setChoosing(null)
  }

  const confirmDelete = () => {
    if (deleteIndex === null) return
    const item = items[deleteIndex]
    if (item) {
      removeDraftAsset(item.realIndex)
      setSlots(slotsAfterDelete(activeSlots, deleteIndex, uuidv4()))
    }
    setDeleteIndex(null)
  }

  const dismissSlot = (id: string) => {
    setSlots(slotsAfterDismiss(activeSlots, id))
    if (choosing?.slotId === id) setChoosing(null)
  }

  const moveItem = (from: number, to: number) => {
    const source = items[from]
    const destination = items[to]
    if (source && destination) reorderDraftAssets(source.realIndex, destination.realIndex)
  }

  const { cols, rows } = gridFor(strip.length)

  return (
    <>
      <div className="relative h-full min-h-[480px] w-full">
        {showChooser ? (
          <div className="relative h-full [&>div]:h-full [&>div]:min-h-0 [&>div]:aspect-auto">
            <EmptyBlock hideDelete onSelect={openModal} />
            {items.length > 0 && (
              <button
                type="button"
                onClick={() => setChoosing(null)}
                aria-label="Cancel adding media"
                className="absolute right-6 top-6 flex h-10 cursor-pointer items-center gap-2 rounded-full border border-gray-100 bg-white px-4 font-poppins text-body-s font-medium text-gray-500 transition-colors hover:bg-gray-50"
              >
                <X size={16} aria-hidden /> Cancel
              </button>
            )}
          </div>
        ) : (
          <>
            <ul
              aria-label="Artwork media"
              className="grid h-full w-full gap-4"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
              }}
            >
              {strip.map((entry) => {
                if (entry.kind === 'empty') {
                  return (
                    <li key={`empty-${entry.slot.id}`} className="group relative min-h-0 min-w-0">
                      <button
                        type="button"
                        aria-label="Empty slot. Choose a media type to fill it"
                        onClick={() => setChoosing({ slotId: entry.slot.id })}
                        className="h-full w-full cursor-pointer rounded-2xl bg-gray-300/40 transition-colors hover:bg-gray-300/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                      />
                      <button
                        type="button"
                        aria-label="Remove empty slot"
                        onClick={() => dismissSlot(entry.slot.id)}
                        className={cn(CONTROL, 'absolute right-4 top-4 z-10', REVEAL)}
                      >
                        <X size={16} aria-hidden />
                      </button>
                    </li>
                  )
                }

                const item = items[entry.index]
                if (!item) return null

                return (
                  <li
                    key={assetKeys[entry.index]}
                    className="group relative min-h-0 min-w-0 overflow-hidden rounded-2xl border border-gray-50 bg-gray-50 shadow-sm [&_img]:object-cover [&_video]:object-cover"
                  >
                    <AssetMedia asset={item.asset} alt={`Artwork media ${entry.index + 1}`} fill />

                    <div className={cn('absolute left-4 top-4 z-10 flex gap-2', REVEAL)}>
                      <button
                        type="button"
                        aria-label="Move media earlier"
                        disabled={entry.index === 0}
                        onClick={() => moveItem(entry.index, entry.index - 1)}
                        className={CONTROL}
                      >
                        <ChevronLeft size={18} aria-hidden />
                      </button>
                      <button
                        type="button"
                        aria-label="Move media later"
                        disabled={entry.index === items.length - 1}
                        onClick={() => moveItem(entry.index, entry.index + 1)}
                        className={CONTROL}
                      >
                        <ChevronRight size={18} aria-hidden />
                      </button>
                    </div>

                    <button
                      type="button"
                      aria-label={`Delete media ${entry.index + 1}`}
                      onClick={() => setDeleteIndex(entry.index)}
                      className={cn(CONTROL, 'absolute right-4 top-4 z-10', REVEAL)}
                    >
                      <X size={16} aria-hidden />
                    </button>
                  </li>
                )
              })}
            </ul>

            <button
              type="button"
              onClick={() => setChoosing({ slotId: null })}
              className="absolute bottom-6 left-1/2 z-20 flex h-11 -translate-x-1/2 cursor-pointer items-center gap-2 rounded-full bg-primary-500 px-5 font-poppins text-body-s font-medium text-white shadow-lg transition-colors hover:bg-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            >
              <Plus size={18} aria-hidden /> Add media
            </button>
          </>
        )}
      </div>

      {deleteIndex !== null && (
        <ModalBackdrop onClose={() => setDeleteIndex(null)}>
          <DeleteMediaModal onClose={() => setDeleteIndex(null)} onConfirm={confirmDelete} />
        </ModalBackdrop>
      )}

      <MediaModalHost modal={target?.modal ?? null} onClose={closeModal} onAssets={handleAssets} />
    </>
  )
}

export default UploadArtGallery