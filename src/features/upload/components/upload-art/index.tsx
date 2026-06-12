// upload-art/index.tsx
// Orchestrator — owns no UI itself, only state + wiring.
// All rendering is delegated to sub-components.
'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useArtworkStore } from '@/store/artwork.store'
import { artworkService } from '@/services/artwork.service'

// Sub-components
import { UploadArtCanvas } from './canvas'
import { ImageModal } from './modals/image-modal'
import { VideoModal } from './modals/video-modal'
import { EmbedModal, ThreeDModal } from './modals/link-modals'
import { SaveDraftModal, PublishModal } from './modals/confirm-modals'
import { ModalBackdrop, OrangeBtn, OutlineBtn, ErrorMsg } from './modals/modal-primitives'

// Types
import type { ModalType, LocalAsset, UploadedFile } from './types'
import type { CreateArtworkPayload } from '@/types/artwork'

// ── Props ─────────────────────────────────────────────────────────────────────

interface UploadArtProps {
  onPublished?:  () => void
  onDraftSaved?: () => void
}

// ── Component ─────────────────────────────────────────────────────────────────

const UploadArtIndex = ({ onPublished, onDraftSaved }: UploadArtProps) => {
  const { draft, addDraftAsset, removeDraftAsset } = useArtworkStore()

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [activeModal,      setActiveModal]      = useState<ModalType>(null)
  const [showDraftModal,   setShowDraftModal]   = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)

  // ── API state ───────────────────────────────────────────────────────────────
  const [savingDraft,  setSavingDraft]  = useState(false)
  const [publishing,   setPublishing]   = useState(false)
  const [apiError,     setApiError]     = useState<string | null>(null)
  const [apiSuccess,   setApiSuccess]   = useState<string | null>(null)

  // ── Local display list ──────────────────────────────────────────────────────
  const [localAssets, setLocalAssets] = useState<LocalAsset[]>(() =>
    (draft.assets ?? []).map((a) => ({
      url:  a.thumbnail_url ?? a.original_url,
      type: a.media_type,
      name: a.original_url,
    }))
  )

  // ── Asset handlers ──────────────────────────────────────────────────────────

  const pushAsset = (
    asset: Parameters<typeof addDraftAsset>[0],
    local: LocalAsset,
  ) => {
    addDraftAsset(asset)
    setLocalAssets((prev) => [...prev, local])
  }

  const handleImagesSaved = (files: UploadedFile[]) => {
    files.forEach((uf) => {
      if (!uf.uploadedAsset) return
      pushAsset(
        {
          original_url:    uf.uploadedAsset.original_url,
          optimized_url:   uf.uploadedAsset.optimized_url,
          thumbnail_url:   uf.uploadedAsset.thumbnail_url,
          media_type:      'IMAGE',
          mime_type:       uf.uploadedAsset.mime_type,
          file_size_bytes: uf.uploadedAsset.file_size_bytes,
          width:           uf.uploadedAsset.width,
          height:          uf.uploadedAsset.height,
          duration_secs:   null,
          ordering_index:  draft.assets?.length ?? 0,
        },
        {
          url:  uf.uploadedAsset.thumbnail_url ?? uf.uploadedAsset.original_url,
          type: 'IMAGE',
          name: uf.file.name,
        },
      )
    })
  }

  const handleVideoSaved = (uf: UploadedFile) => {
    if (!uf.uploadedAsset) return
    pushAsset(
      {
        original_url:    uf.uploadedAsset.original_url,
        optimized_url:   uf.uploadedAsset.optimized_url,
        thumbnail_url:   uf.uploadedAsset.thumbnail_url,
        media_type:      'VIDEO',
        mime_type:       uf.uploadedAsset.mime_type,
        file_size_bytes: uf.uploadedAsset.file_size_bytes,
        width:           uf.uploadedAsset.width,
        height:          uf.uploadedAsset.height,
        duration_secs:   null,
        ordering_index:  draft.assets?.length ?? 0,
      },
      {
        url:  uf.uploadedAsset.thumbnail_url ?? uf.uploadedAsset.original_url,
        type: 'VIDEO',
        name: uf.file.name,
      },
    )
  }

  const handleLinkSaved = (url: string, mediaType: 'EXTERNAL_LINK' | 'THREE_D', localType: 'embed' | '3d') => {
    pushAsset(
      {
        original_url:    url,
        optimized_url:   null,
        thumbnail_url:   null,
        media_type:      mediaType,
        mime_type:       mediaType === 'EXTERNAL_LINK' ? 'text/html' : 'model/gltf+json',
        file_size_bytes: 0,
        width:           null,
        height:          null,
        duration_secs:   null,
        ordering_index:  draft.assets?.length ?? 0,
      },
      { url, type: localType, name: url },
    )
  }

  const handleRemoveAsset = (idx: number) => {
    removeDraftAsset(idx)
    setLocalAssets((prev) => {
      const next = [...prev]
      next.splice(idx, 1)
      return next
    })
  }

  // ── API helpers ─────────────────────────────────────────────────────────────

  // By strictly typing the return as CreateArtworkPayload, TS will guarantee
  // we aren't leaking bad data into the service call.
  const buildPayload = (): CreateArtworkPayload => {
    // Safely strip 'id' from assets if they exist in the draft store
    const cleanAssets = (draft.assets ?? []).map((asset) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...rest } = asset as any
      return rest
    })

    // Safely strip 'id' from variants if they exist in the draft store
    const cleanVariants = (draft.variants ?? []).map((variant) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...rest } = variant as any
      return rest
    })

    return {
      // Required Strings & Enums
      listing_type:   draft.listing_type   ?? 'PORTFOLIO',
      artwork_format: draft.artwork_format ?? 'DIGITAL',
      title:          draft.title          ?? 'Untitled',
      description:    draft.description    ?? '',
      id: draft.id as string,
      
      // Required Arrays & Booleans
      has_variants:   draft.has_variants   ?? false,
      assets:         cleanAssets,
      
      // Required Numbers (Default to 0)
      view_count:     draft.view_count    ?? 0,
      like_count:     draft.like_count    ?? 0,
      save_count:     draft.save_count    ?? 0,
      comment_count:  draft.comment_count ?? 0,

      // Optional Fields mapped directly
      categories:            draft.categories,
      keywords:              draft.keywords,
      collaborator_ids:      draft.collaborator_ids,
      tools_used:            draft.tools_used,
      visibility:            draft.visibility,
      allow_moodboard_save:  draft.allow_moodboard_save,
      allow_comments:        draft.allow_comments,
      allow_likes:           draft.allow_likes,
      show_engagement_stats: draft.show_engagement_stats,
      currency:              draft.currency,

      // Handle nullish fields that DTO expects as strictly `undefined`
      price:                 draft.price ?? undefined,
      max_purchase_quantity: draft.max_purchase_quantity ?? undefined,
      physical_details:      draft.physical_details ?? undefined,
      
      variants:              cleanVariants.length > 0 ? cleanVariants : undefined,
    }
  }

  const handleSaveDraft = async () => {
    setApiError(null)
    setSavingDraft(true)
    try {
      await artworkService.create(buildPayload())
      setApiSuccess('Draft saved successfully!')
      setShowDraftModal(false)
      onDraftSaved?.()
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : 'Failed to save draft. Please try again.',
      )
    } finally {
      setSavingDraft(false)
    }
  }

  const handlePublish = async () => {
    setApiError(null)
    setPublishing(true)
    try {
      const created = await artworkService.create(buildPayload())
      if (created.data?.id) await artworkService.publish(created.data.id)
      setApiSuccess('Artwork published!')
      setShowPublishModal(false)
      onPublished?.()
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : 'Failed to publish artwork. Please try again.',
      )
    } finally {
      setPublishing(false)
    }
  }

  const hasAssets = localAssets.length > 0

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="w-full h-full flex flex-col gap-7 justify-start min-h-screen flex-1">

        {/* Main canvas */}
        <UploadArtCanvas
          localAssets={localAssets}
          onOpenModal={setActiveModal}
          onRemoveAsset={handleRemoveAsset}
        />

        {/* Bottom row */}
        <div className="w-full flex items-center justify-center pb-4 px-2">
          <button
            onClick={() => setActiveModal('image')}
            className="flex items-center justify-center w-[88px] h-[88px] rounded-full bg-[#FFF0EE] hover:bg-[#ffe4e0] transition-transform hover:scale-105 cursor-pointer shadow-sm"
          >
            <Image src="/icons/plus-red-bg.svg" width={28} height={28} alt="add asset" />
          </button>

          {/* {hasAssets && (
            <div className="flex items-center gap-3">
              <OutlineBtn onClick={() => { setApiError(null); setShowDraftModal(true) }}>
                Save Draft
              </OutlineBtn>
              <OrangeBtn onClick={() => { setApiError(null); setShowPublishModal(true) }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 11V3M8 3L5 6M8 3L11 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 12V13.5C2 13.7761 2.22386 14 2.5 14H13.5C13.7761 14 14 13.7761 14 13.5V12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Publish
              </OrangeBtn>
            </div>
          )} */}
        </div>

        {apiError   && <div className="w-full max-w-lg"><ErrorMsg message={apiError} /></div>}
        {apiSuccess && (
          <div className="w-full max-w-lg flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-100">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8L6.5 11.5L13 4.5" stroke="#4CAF50" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-sm text-green-700">{apiSuccess}</p>
          </div>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}

      {activeModal === 'image' && (
        <ModalBackdrop onClose={() => setActiveModal(null)}>
          <ImageModal onClose={() => setActiveModal(null)} onSaved={handleImagesSaved} />
        </ModalBackdrop>
      )}

      {activeModal === 'video' && (
        <ModalBackdrop onClose={() => setActiveModal(null)}>
          <VideoModal onClose={() => setActiveModal(null)} onSaved={handleVideoSaved} />
        </ModalBackdrop>
      )}

      {activeModal === 'embed' && (
        <ModalBackdrop onClose={() => setActiveModal(null)}>
          <EmbedModal
            onClose={() => setActiveModal(null)}
            onSaved={(url) => handleLinkSaved(url, 'EXTERNAL_LINK', 'embed')}
          />
        </ModalBackdrop>
      )}

      {activeModal === '3d' && (
        <ModalBackdrop onClose={() => setActiveModal(null)}>
          <ThreeDModal
            onClose={() => setActiveModal(null)}
            onSaved={(url) => handleLinkSaved(url, 'THREE_D', '3d')}
          />
        </ModalBackdrop>
      )}

      {showDraftModal && (
        <ModalBackdrop onClose={() => !savingDraft && setShowDraftModal(false)}>
          <SaveDraftModal
            onClose={() => setShowDraftModal(false)}
            onConfirm={handleSaveDraft}
            loading={savingDraft}
          />
        </ModalBackdrop>
      )}

      {showPublishModal && (
        <ModalBackdrop onClose={() => !publishing && setShowPublishModal(false)}>
          <PublishModal
            onClose={() => setShowPublishModal(false)}
            onConfirm={handlePublish}
            loading={publishing}
          />
        </ModalBackdrop>
      )}
    </>
  )
}

export default UploadArtIndex