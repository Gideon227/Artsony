'use client'

import React, { useCallback, useState } from 'react'
import { useArtworkStore } from '@/store/artwork.store'
import { UploadArtCanvas } from './canvas'
import { assetFromLink, assetFromUpload } from './asset-factory'
import { ImageModal } from './modals/image-modal'
import { VideoModal } from './modals/video-modal'
import { EmbedModal } from './modals/link-modals'
import { PdfModal, ThreeDModal } from './modals/file-upload-modal'
import { ModalBackdrop } from './modals/modal-primitives'
import { DeleteMediaModal } from './modals/confirm-modals'
import type { DraftAsset, ModalKind, UploadedFile } from './types'

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

  const insertAt = (items: Array<DraftAsset | null>) => {
    if (!target) return
    const valid = items.filter((item): item is DraftAsset => item !== null)
    if (valid.length > 0) insertDraftAssets(target.index, valid)
  }

  const handleImagesSaved = (files: UploadedFile[]) =>
    insertAt(files.map((file) => assetFromUpload(file, 'IMAGE')))

  const handleVideoSaved = (file: UploadedFile) =>
    insertAt([assetFromUpload(file, 'VIDEO')])

  const handleEmbedSaved = (url: string) =>
    insertAt([assetFromLink(url)])

  const handlePdfSaved = (file: UploadedFile) =>
    insertAt([assetFromUpload(file, 'PDF')])

  const handleThreeDSaved = (file: UploadedFile) =>
    insertAt([assetFromUpload(file, 'THREE_D')])

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

      {target?.modal === 'image' && (
        <ModalBackdrop onClose={closeModal}>
          <ImageModal onClose={closeModal} onSaved={handleImagesSaved} />
        </ModalBackdrop>
      )}

      {target?.modal === 'video' && (
        <ModalBackdrop onClose={closeModal}>
          <VideoModal onClose={closeModal} onSaved={handleVideoSaved} />
        </ModalBackdrop>
      )}

      {target?.modal === 'embed' && (
        <ModalBackdrop onClose={closeModal}>
          <EmbedModal onClose={closeModal} onSaved={handleEmbedSaved} />
        </ModalBackdrop>
      )}

      {target?.modal === 'pdf' && (
        <ModalBackdrop onClose={closeModal}>
          <PdfModal onClose={closeModal} onSaved={handlePdfSaved} />
        </ModalBackdrop>
      )}

      {target?.modal === '3d' && (
        <ModalBackdrop onClose={closeModal}>
          <ThreeDModal onClose={closeModal} onSaved={handleThreeDSaved} />
        </ModalBackdrop>
      )}
    </>
  )
}

export default UploadArtIndex
