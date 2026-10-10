'use client'

import React from 'react'
import { assetFromLink, assetFromUpload } from './asset-factory'
import { ImageModal } from './modals/image-modal'
import { VideoModal } from './modals/video-modal'
import { EmbedModal } from './modals/link-modals'
import { PdfModal, ThreeDModal } from './modals/file-upload-modal'
import { ModalBackdrop } from './modals/modal-primitives'
import type { DraftAsset, ModalKind } from './types'

interface MediaModalHostProps {
  modal:    ModalKind | null
  onClose:  () => void
  onAssets: (assets: DraftAsset[]) => void
}

export function MediaModalHost({ modal, onClose, onAssets }: MediaModalHostProps) {
  if (!modal) return null

  const emit = (items: Array<DraftAsset | null>) => {
    const valid = items.filter((item): item is DraftAsset => item !== null)
    if (valid.length > 0) onAssets(valid)
  }

  return (
    <ModalBackdrop onClose={onClose}>
      {modal === 'image' && (
        <ImageModal onClose={onClose} onSaved={(files) => emit(files.map((file) => assetFromUpload(file, 'IMAGE')))} />
      )}
      {modal === 'video' && (
        <VideoModal onClose={onClose} onSaved={(file) => emit([assetFromUpload(file, 'VIDEO')])} />
      )}
      {modal === 'embed' && (
        <EmbedModal onClose={onClose} onSaved={(url) => emit([assetFromLink(url)])} />
      )}
      {modal === 'pdf' && (
        <PdfModal onClose={onClose} onSaved={(file) => emit([assetFromUpload(file, 'PDF')])} />
      )}
      {modal === '3d' && (
        <ThreeDModal onClose={onClose} onSaved={(file) => emit([assetFromUpload(file, 'THREE_D')])} />
      )}
    </ModalBackdrop>
  )
}
