'use client'

import React, { useCallback, useState } from 'react'
import { useArtworkStore } from '@/store/artwork.store'
import { UploadArtCanvas } from './canvas'
import { MediaModalHost } from './media-modal-host'
import { ModalBackdrop } from './modals/modal-primitives'
import { DeleteMediaModal } from './modals/confirm-modals'
import type { DraftAsset, ModalKind } from './types'

const EMPTY_ASSETS: DraftAsset[] = []

interface InsertTarget {
  modal: ModalKind
  index: number
}

const UploadArtIndex = () => {
  const assets = useArtworkStore((s) => s.draft.assets) ?? EMPTY_ASSETS
  const insertDraftAssets = useArtworkStore((s) => s.insertDraftAssets)
  const reorderDraftAssets = useArtworkStore((s) => s.reorderDraftAssets)
  const removeDraftAsset = useArtworkStore((s) => s.removeDraftAsset)

  const [target, setTarget] = useState<InsertTarget | null>(null)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

  const handleInsert = useCallback((index: number, modal: ModalKind) => {
    setTarget({ modal, index })
  }, [])

  const closeModal = useCallback(() => setTarget(null), [])

  const requestDelete = useCallback((index: number) => setDeleteIndex(index), [])
  const closeDelete = useCallback(() => setDeleteIndex(null), [])

  const confirmDelete = () => {
    if (deleteIndex !== null) removeDraftAsset(deleteIndex)
    setDeleteIndex(null)
  }

  const handleAssets = (incoming: DraftAsset[]) => {
    if (target) insertDraftAssets(target.index, incoming)
  }

  return (
    <>
      <div className="w-full pb-4">
        <UploadArtCanvas
          assets={assets}
          onInsert={handleInsert}
          onMove={reorderDraftAssets}
          onDeleteAsset={requestDelete}
        />
      </div>

      {deleteIndex !== null && (
        <ModalBackdrop onClose={closeDelete}>
          <DeleteMediaModal onClose={closeDelete} onConfirm={confirmDelete} />
        </ModalBackdrop>
      )}

      <MediaModalHost modal={target?.modal ?? null} onClose={closeModal} onAssets={handleAssets} />
    </>
  )
}

export default UploadArtIndex
