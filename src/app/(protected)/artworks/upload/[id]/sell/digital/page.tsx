// app/artworks/upload/[id]/sell/digital/page.tsx
'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

import { Navbar } from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'

import UploadStepOne from '@/features/upload/components/upload-step-one'
import UploadArtworkFiles from '@/features/upload/components/upload-artwork-files'
import PhysicalArtDimension from '@/features/upload/components/physical-art-dimension'
import UploadStepTwo from '@/features/upload/components/upload-step-two'
import UploadArtCollaborators from '@/features/upload/components/upload-art-collaborators'
import UploadPreview from '@/features/upload/components/upload-preview'
import UploadFlowLayout from '@/features/upload/components/upload-flow-layout'

import { useArtworkStore } from '@/store/artwork.store'
import { artworkService } from '@/services'
import type { ArtworkStatus, CreateArtworkPayload } from '@/types/artwork'

export default function DigitalSellWizardPage() {
    const router = useRouter()
    const { id: urlArtworkId } = useParams<{ id: string }>()

    const draft = useArtworkStore((state) => state.draft)
    const clearDraft = useArtworkStore((state) => state.clearDraft)

    const [stepIndex, setStepIndex] = useState<number>(0)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    if (!draft) return null

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
            id: urlArtworkId,
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
            
            view_count: 0,
            like_count: 0,
            save_count: 0,
            comment_count: 0,
            
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
            const finalizedPayload = preparePayload(draft, 'PUBLISHED')
            await artworkService.create(finalizedPayload)

            clearDraft()
            router.push('/artworks')
        } catch (error) {
            console.error('[Workflow Execution Failure]:', error)
            alert(error instanceof Error ? error.message : 'An unexpected error occurred.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSaveAndExit = async () => {
        setIsSubmitting(true)
        try {
            if (!draft.title || draft.title.trim().length === 0) {
                clearDraft()
                router.push('/profile')
                return
            }

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

    const digitalFlowComponents = [
        <UploadFlowLayout 
            key="flow-1"
            currentStepIndex={stepIndex}
            flowComponents={[
                <UploadStepOne
                    key="step-1"
                    id="step-1"
                    onSaveAndExit={handleSaveAndExit}
                    onNext={() => setStepIndex(1)}
                    steps="6"
                    number='1'
                />
            ]}
        />,
        <UploadFlowLayout 
            key="flow-2"
            currentStepIndex={stepIndex}
            flowComponents={[
                <UploadArtworkFiles
                    key="step-2"
                    id="step-2"
                    onSaveAndExit={handleSaveAndExit}
                    handleBackStep={() => setStepIndex(0)}
                    onNext={() => setStepIndex(2)}
                    number="2"
                    steps="6"
                />
            ]}
        />,
        <UploadFlowLayout 
            key="flow-3"
            currentStepIndex={stepIndex}
            flowComponents={[
                <PhysicalArtDimension
                    key="step-3"
                    id="step-3"
                    onSaveAndExit={handleSaveAndExit}
                    onBack={() => setStepIndex(1)}
                    onNext={() => {
                        setStepIndex(3)
                        console.log("Draft data: ", draft)
                    }}
                    steps="6"
                    number="3"
                    hideVariationSection = {true}
                />
            ]}
        />,
        <UploadFlowLayout 
            key="flow-4"
            currentStepIndex={stepIndex}
            flowComponents={[
                <UploadStepTwo
                    key="step-4"
                    id="step-4"
                    onSaveAndExit={handleSaveAndExit}
                    onBack={() => setStepIndex(2)}
                    onNext={() => setStepIndex(4)}
                    steps="6"
                    number="4"
                />
            ]}
        />,
        <UploadFlowLayout 
            key="flow-5"
            currentStepIndex={stepIndex}
            flowComponents={[
                <UploadArtCollaborators
                    key="step-5"
                    id="step-5"
                    onSaveAndExit={handleSaveAndExit} 
                    onBack={() => setStepIndex(3)}
                    onNext={() => setStepIndex(5)}
                    steps="6"
                    number="5"
                />
            ]}
        />,
        <UploadFlowLayout 
            key="flow-6"
            currentStepIndex={stepIndex}
            flowComponents={[
                <UploadPreview
                    key="step-6"
                    onSaveAndExit={handleSaveAndExit}
                    onBack={() => setStepIndex(4)}
                    onNext={handleFinishUpload}
                    steps="6"
                    number="6"
                />
            ]}
        />,
    ]

    return (
        <div className="min-h-screen bg-white w-screen">
            <Navbar />
            {digitalFlowComponents[stepIndex]}
            <Footer />
        </div>
    )
}