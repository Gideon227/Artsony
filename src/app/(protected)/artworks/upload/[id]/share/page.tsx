'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

import { Navbar } from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import UploadStepOne from '@/features/upload/components/upload-step-one'
import UploadStepTwo from '@/features/upload/components/upload-step-two'
import UploadArtCollaborators from '@/features/upload/components/upload-art-collaborators'
import UploadPreview from '@/features/upload/components/upload-preview'
import UploadFlowLayout from '@/features/upload/components/upload-flow-layout'

import { useArtworkStore } from '@/store/artwork.store'
import { useQueryClient } from '@tanstack/react-query'
import { artworkService } from '@/services'
import type { ArtworkStatus, CreateArtworkPayload } from '@/types/artwork'
import { describeSaveError, sanitizeAssets } from '@/features/upload/lib/artwork-draft'
import { useDraftHydration } from '@/features/upload/hooks/use-draft-hydration'
import DraftLoadState from '@/features/upload/components/draft-load-state'

export default function ShareArtworkWizardPage() {
    const router = useRouter()
    const { id: urlArtworkId } = useParams<{ id: string }>()

    const draft = useArtworkStore((state) => state.draft)
    const clearDraft = useArtworkStore((state) => state.clearDraft)
    const queryClient = useQueryClient()
    const hydration = useDraftHydration(urlArtworkId)

    const [stepIndex, setStepIndex] = useState<number>(0)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    if (!draft) return null
    if (hydration.status !== 'ready') return <DraftLoadState state={hydration} />

    // ── HELPER TO INFER MEDIA TYPE FOR BACKEND VALIDATION 
    function inferMediaType(mimeType: string): 'IMAGE' | 'VIDEO' | 'THREE_D' | 'EXTERNAL_LINK' {
        if (!mimeType) return 'IMAGE'
        if (mimeType.startsWith('video/')) return 'VIDEO'
        if (mimeType.includes('3d') || mimeType.includes('model/')) return 'THREE_D'
        return 'IMAGE'
    }

    const preparePayload = (rawDraft: typeof draft, targetStatus: ArtworkStatus): any => {
        const {
            id,
            slug,
            creator_id,
            status,
            is_flagged,
            moderation_status,
            created_at,
            updated_at,
            deleted_at,
            view_count,
            like_count,
            save_count,
            comment_count,
            ...formFields
        } = rawDraft as any
        
        // Validate if the URL param contains a real UUID, otherwise fall back to draft id or omit
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const verifiedId = isUUID.test(urlArtworkId) ? urlArtworkId : (isUUID.test(id) ? id : undefined);

        // Map and sanitize assets to guarantee required media_type exists
        // const sanitizedAssets = (formFields.assets || []).map((asset: any, index: number) => ({
        //     original_url: asset.original_url,
        //     optimized_url: asset.optimized_url || asset.original_url,
        //     thumbnail_url: asset.thumbnail_url || asset.original_url,
        //     mime_type: asset.mime_type || 'image/jpeg',
        //     file_size_bytes: Number(asset.file_size_bytes) || 0,
        //     width: asset.width ? Number(asset.width) : null,
        //     height: asset.height ? Number(asset.height) : null,
        //     ordering_index: index,
        //     media_type: asset.media_type || inferMediaType(asset.mime_type),
        //     duration_secs: asset.duration_secs ? Number(asset.duration_secs) : null,
        // }));

        const sanitizedAssets = sanitizeAssets(formFields.assets)

        return {
            // Only include ID if it's a validated sequence
            ...(verifiedId ? { id: verifiedId } : {}),
            title: formFields.title?.trim() ?? '',
            description: formFields.description?.trim() ?? '',
            listing_type: formFields.listing_type || 'PORTFOLIO',
            artwork_format: formFields.artwork_format || 'DIGITAL',
            visibility: formFields.visibility || 'PUBLIC',
            has_variants: formFields.has_variants ?? false,
            assets: sanitizedAssets,
            variants: formFields.variants || [],
            categories: formFields.categories || [],
            keywords: formFields.keywords || [],
            tools_used: formFields.tools_used || [],
            collaborator_ids: formFields.collaborator_ids || [],
            allow_moodboard_save: formFields.allow_moodboard_save ?? true,
            allow_comments: formFields.allow_comments ?? true,
            allow_likes: formFields.allow_likes ?? true,
            show_engagement_stats: formFields.show_engagement_stats ?? true,
            status: targetStatus, 
            ...(formFields.license_type ? { license_type: formFields.license_type } : {}),

            // Commerce optionals explicitly typed/casted
            ...(formFields.price !== undefined && formFields.price !== null ? { price: Number(formFields.price) } : {}),
            ...(formFields.currency ? { currency: String(formFields.currency) } : {}),
            ...(formFields.max_purchase_quantity ? { max_purchase_quantity: Number(formFields.max_purchase_quantity) } : {}),
            ...(formFields.physical_details ? { physical_details: formFields.physical_details } : {}),
        }
    }

    const handleFinishUpload = async () => {
        setIsSubmitting(true)
        try {
            const finalizedPayload = preparePayload(draft, 'PUBLISHED')
            await artworkService.create(finalizedPayload)

            void queryClient.invalidateQueries({ queryKey: ['artworks'] })
            clearDraft()
            router.push('/profile')
        } catch (error) {
            console.error('[Workflow Execution Failure]:', error)
            alert(describeSaveError(error, 'An unexpected error occurred.'))
        } finally {
            setIsSubmitting(false)
        }
    }

    /**
     * Saves whatever the draft currently holds, however little, under the
     * wizard's artwork id. Saving again updates the same draft.
     */
    const handleSaveAndExit = async () => {
        setIsSubmitting(true)
        try {
            const finalizedPayload = preparePayload(draft, 'DRAFT')
            await artworkService.create(finalizedPayload)

            void queryClient.invalidateQueries({ queryKey: ['artworks'] })
            clearDraft()
            router.push('/profile')
        } catch (error) {
            console.error('[Save Progress Background Attempt Blocked]:', error)
            alert(describeSaveError(error, 'Something went wrong while saving your draft.'))
        } finally {
            setIsSubmitting(false)
        }
    }

    const portfolioFlowComponents = [
        <UploadFlowLayout 
            key="flow-1"
            currentStepIndex={stepIndex}
            flowComponents={
                <UploadStepOne
                    key="step-1"
                    id="step-1"
                    onSaveAndExit={handleSaveAndExit}
                    onNext={() => setStepIndex(1)}
                    steps="4"
                    number='1'
                />
            }
        />,
        <UploadFlowLayout 
            key="flow-2"
            currentStepIndex={0} // FIXED: Was hardcoded to 0
            flowComponents={
                <UploadStepTwo
                    key="step-2"
                    id="step-2"
                    onSaveAndExit={handleSaveAndExit}
                    onBack={() => setStepIndex(0)}
                    onNext={() => setStepIndex(2)}
                    steps="4"
                    number="2"
                />
            }
        />,
        <UploadFlowLayout 
            key="flow-3"
            currentStepIndex={stepIndex} // FIXED: Was hardcoded to 0
            flowComponents={
                <UploadArtCollaborators
                    key="step-3"
                    id="step-3"
                    onSaveAndExit={handleSaveAndExit} 
                    onBack={() => setStepIndex(1)}
                    onNext={
                        () => {
                            setStepIndex(3)
                            console.log('Draft data: ', draft)
                        }
                    }
                    steps="4"
                    number="3"
                />
            }
        />,
        <UploadFlowLayout 
            key="flow-4"
            currentStepIndex={stepIndex}
            flowComponents={
                <UploadPreview
                    key="step-4"
                    onSaveAndExit={handleSaveAndExit}
                    onBack={() => setStepIndex(2)} // FIXED: Added missing onBack
                    onNext={handleFinishUpload}
                    steps="4"
                    number="4"
                    loading={isSubmitting}
                />
            }
        />,
    ]

    return (
        <div className="min-h-screen bg-white w-screen">
            <Navbar />
            {portfolioFlowComponents[stepIndex]}
        </div>
    )
}