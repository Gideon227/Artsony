'use client'

import React, { useCallback, useMemo, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useArtworkStore } from '@/store/artwork.store'
import { AssetMedia } from '../asset-block'
import { AssetToolbar } from '../asset-toolbar'
import { buildAssetKeys } from '../asset-keys'
import { EmptyBlock } from '../empty-block'
import { MediaModalHost } from '../media-modal-host'
import { ModalBackdrop } from '../modals/modal-primitives'
import { DeleteMediaModal } from '../modals/confirm-modals'
import type { DraftAsset, ModalKind } from '../types'
import { GalleryStrip } from './gallery-strip'
import {
  buildStrip,
  clampSlots,
  resolveSelection,
  slotsAfterDelete,
  slotsAfterDismiss,
  slotsAfterFill,
  type EmptySlot,
  type GallerySelection,
} from './slots'

const EMPTY_ASSETS: DraftAsset[] = []

const STAGE_FRAME =
  'relative aspect-[1824/1447] min-h-80 w-full overflow-hidden rounded-2xl border border-gray-50 bg-white shadow-sm'

interface InsertTarget {
  modal:  ModalKind
  slotId: string | null
}

const UploadArtGallery = () => {
  const assets = useArtworkStore((s) => s.draft.assets) ?? EMPTY_ASSETS
  const insertDraftAssets = useArtworkStore((s) => s.insertDraftAssets)
  const reorderDraftAssets = useArtworkStore((s) => s.reorderDraftAssets)
  const removeDraftAsset = useArtworkStore((s) => s.removeDraftAsset)

  const [slots, setSlots] = useState<EmptySlot[]>([])
  const [selection, setSelection] = useState<GallerySelection>(() =>
    assets.length > 0 ? { kind: 'asset', index: 0 } : { kind: 'add' },
  )
  const [target, setTarget] = useState<InsertTarget | null>(null)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

  const activeSlots = useMemo(() => clampSlots(slots, assets.length), [slots, assets.length])
  const active = resolveSelection(selection, assets.length, activeSlots)
  const strip = useMemo(() => buildStrip(assets.length, activeSlots), [assets.length, activeSlots])
  const assetKeys = useMemo(() => buildAssetKeys(assets), [assets])

  const openModal = (modal: ModalKind) => {
    setTarget({ modal, slotId: active.kind === 'empty' ? active.id : null })
  }

  const closeModal = useCallback(() => setTarget(null), [])

  const handleAssets = (incoming: DraftAsset[]) => {
    const count = useArtworkStore.getState().draft.assets?.length ?? 0
    const slot = target?.slotId ? activeSlots.find((candidate) => candidate.id === target.slotId) : undefined

    if (slot) {
      const index = Math.min(slot.at, count)
      insertDraftAssets(index, incoming)
      setSlots(slotsAfterFill(activeSlots, slot.id, incoming.length))
      setSelection({ kind: 'asset', index })
      return
    }

    insertDraftAssets(count, incoming)
    setSlots(activeSlots)
    setSelection({ kind: 'asset', index: count })
  }

  const confirmDelete = () => {
    if (deleteIndex === null) return
    const index = deleteIndex
    const slotId = uuidv4()

    removeDraftAsset(index)
    setSlots(slotsAfterDelete(activeSlots, index, slotId))

    if (active.kind === 'asset' && active.index === index) setSelection({ kind: 'empty', id: slotId })
    else if (active.kind === 'asset' && active.index > index) setSelection({ kind: 'asset', index: active.index - 1 })
    else setSelection(active)

    setDeleteIndex(null)
  }

  const dismissSlot = (id: string) => {
    const slot = activeSlots.find((candidate) => candidate.id === id)
    setSlots(slotsAfterDismiss(activeSlots, id))
    if (active.kind !== 'empty' || active.id !== id) return

    setSelection(
      assets.length > 0
        ? { kind: 'asset', index: Math.min(slot?.at ?? 0, assets.length - 1) }
        : { kind: 'add' },
    )
  }

  const moveSelected = (from: number, to: number) => {
    reorderDraftAssets(from, to)
    setSelection({ kind: 'asset', index: to })
  }

  const selectedAsset = active.kind === 'asset' ? assets[active.index] : undefined

  return (
    <>
      <div className="flex w-full flex-col gap-6 pb-4">
        {selectedAsset && active.kind === 'asset' ? (
          <div className={STAGE_FRAME}>
            <AssetMedia key={assetKeys[active.index]} asset={selectedAsset} alt={`Artwork media ${active.index + 1}`} fill />
            <AssetToolbar
              hideDelete
              onMoveUp={active.index === 0 ? undefined : () => moveSelected(active.index, active.index - 1)}
              onMoveDown={active.index === assets.length - 1 ? undefined : () => moveSelected(active.index, active.index + 1)}
            />
          </div>
        ) : (
          <EmptyBlock hideDelete onSelect={openModal} />
        )}

        <GalleryStrip
          assets={assets}
          assetKeys={assetKeys}
          items={strip}
          selection={active}
          onSelect={setSelection}
          onDeleteAsset={setDeleteIndex}
          onDismissSlot={dismissSlot}
        />
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
