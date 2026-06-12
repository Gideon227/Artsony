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
import { artworkService } from '@/services'
import type { ArtworkStatus, CreateArtworkPayload } from '@/types/artwork'

export default function ShareArtworkWizardPage() {
    const router = useRouter()
    const { id: urlArtworkId } = useParams<{ id: string }>()

    const draft = useArtworkStore((state) => state.draft)
    const clearDraft = useArtworkStore((state) => state.clearDraft)

    const [stepIndex, setStepIndex] = useState<number>(0)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    if (!draft) return null

    /**
     * Cleans the draft and injects the URL ID.
     * We cast to `any` on the return type specifically to inject `status`, 
     * which your backend controller expects but isn't in `CreateArtworkPayload`.
     */
    const preparePayload = (rawDraft: typeof draft, targetStatus: ArtworkStatus): CreateArtworkPayload & { status: ArtworkStatus } => {
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
            ...formFields
        } = rawDraft as any
        
        return {
            id: urlArtworkId, // Enforce the ID from the routing parameters
            title: formFields.title?.trim() ?? '',
            description: formFields.description?.trim() ?? '',
            listing_type: formFields.listing_type ?? 'PORTFOLIO',
            artwork_format: formFields.artwork_format ?? 'DIGITAL',
            visibility: formFields.visibility ?? 'PUBLIC',
            has_variants: formFields.has_variants ?? false,
            assets: formFields.assets ?? [],
            variants: formFields.variants ?? [],
            categories: formFields.categories ?? [],
            keywords: formFields.keywords ?? [],
            tools_used: formFields.tools_used ?? [],
            collaborator_ids: formFields.collaborator_ids ?? [],
            allow_moodboard_save: formFields.allow_moodboard_save ?? true,
            allow_comments: formFields.allow_comments ?? true,
            allow_likes: formFields.allow_likes ?? true,
            show_engagement_stats: formFields.show_engagement_stats ?? true,
            
            // Default metrics
            view_count: 0,
            like_count: 0,
            save_count: 0,
            comment_count: 0,
            
            // The critical backend flag determining if this is live or just a draft
            status: targetStatus, 

            ...(formFields.price !== undefined ? { price: Number(formFields.price) } : {}),
            ...(formFields.currency ? { currency: String(formFields.currency) } : {}),
            ...(formFields.max_purchase_quantity ? { max_purchase_quantity: Number(formFields.max_purchase_quantity) } : {}),
            ...(formFields.physical_details ? { physical_details: formFields.physical_details } : {}),
        }
    }

    const handleFinishUpload = async () => {
        setIsSubmitting(true)
        try {
            // Create the record in the backend, explicitly flagging it as PUBLISHED
            const finalizedPayload = preparePayload(draft, 'PUBLISHED')
            await artworkService.create(finalizedPayload)

            // Wipe local progress and redirect to main gallery
            clearDraft()
            router.push('/profile')
        } catch (error) {
            console.error('[Workflow Execution Failure]:', error)
            alert(error instanceof Error ? error.message : 'An unexpected error occurred.')
        } finally {
            setIsSubmitting(false)
        }
    }

    /**
     * Preserves the incomplete progress as a backend draft
     */
    const handleSaveAndExit = async () => {
        setIsSubmitting(true)
        try {
            if (!draft.title || draft.title.trim().length === 0) {
                alert('You need to select a artwork title to save in draft')
                // clearDraft()
                // router.push('/profile')
                return
            }

            // Create the record in the backend, explicitly flagging it as DRAFT
            const finalizedPayload = preparePayload(draft, 'DRAFT')
            await artworkService.create(finalizedPayload)

            clearDraft()
            router.push('/profile')
        } catch (error) {
            console.error('[Save Progress Background Attempt Blocked]:', error)
            alert('Something went wrong while saving your draft.')
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
                />
            }
        />,
    ]

    return (
        <div className="min-h-screen bg-white w-screen">
            <Navbar />
            {portfolioFlowComponents[stepIndex]}
            <Footer />
        </div>
    )
}