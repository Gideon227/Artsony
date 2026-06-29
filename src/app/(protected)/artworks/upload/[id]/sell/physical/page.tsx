'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

import { Navbar } from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'

import UploadStepOne from '@/features/upload/components/upload-step-one'
import PhysicalArtDimension from '@/features/upload/components/physical-art-dimension'
import PhysicalArtVariable from '@/features/upload/components/physical-art-variable'
import PhysicalArtShipping from '@/features/upload/components/physical-art-shipping'
import UploadStepTwo from '@/features/upload/components/upload-step-two'
import UploadArtCollaborators from '@/features/upload/components/upload-art-collaborators'
import UploadPreview from '@/features/upload/components/upload-preview'
import UploadFlowLayout from '@/features/upload/components/upload-flow-layout'

import { useArtworkStore } from '@/store/artwork.store'
import { artworkService } from '@/services'
import type { ArtworkStatus, CreateArtworkPayload } from '@/types/artwork'
import PreviewPhysicalArt from '@/features/upload/components/preview-physical-art'
import { useAuthStore } from '@/store'

export default function PhysicalSellWizardPage() {
    const router = useRouter()
    const { id: urlArtworkId } = useParams<{ id: string }>()

    const draft = useArtworkStore((state) => state.draft)
    const clearDraft = useArtworkStore((state) => state.clearDraft)
    const { user } = useAuthStore()

    const [stepIndex, setStepIndex] = useState<number>(0)
    const [previewArt, setPreviewArt] = useState(false)
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
        
        const sanitizedAssets = (formFields.assets || []).map((asset: any, index: number) => {
            const mediaType = ['IMAGE', 'VIDEO', 'THREE_D', 'EXTERNAL_LINK'].includes(asset.media_type) 
                ? asset.media_type 
                : 'IMAGE';

            const cleanAsset: any = {
                original_url: asset.original_url,
                media_type: mediaType,
                mime_type: asset.mime_type || 'image/jpeg',
                file_size_bytes: Math.max(1, parseInt(asset.file_size_bytes) || 1024),
                ordering_index: index,
            };

            if (asset.width) cleanAsset.width = parseInt(asset.width);
            if (asset.height) cleanAsset.height = parseInt(asset.height);

            if (mediaType === 'VIDEO' && asset.duration_secs !== null && asset.duration_secs !== undefined) {
                cleanAsset.duration_secs = parseInt(asset.duration_secs);
            }

            return cleanAsset;
        });

        let safePhysicalDetails = undefined;
        if (formFields.physical_details) {
            safePhysicalDetails = {
                length: Math.max(0.01, parseFloat(formFields.physical_details.length) || 1),
                width: Math.max(0.01, parseFloat(formFields.physical_details.width) || 1),
                height: Math.max(0.01, parseFloat(formFields.physical_details.height) || 1),
                unit: ['cm', 'in'].includes(formFields.physical_details.unit) ? formFields.physical_details.unit : 'cm',
                available_quantity: Math.max(0, parseInt(formFields.physical_details.available_quantity) || 0),
                
                // Add the missing shipping fields here:
                ships_worldwide: formFields.physical_details.ships_worldwide ?? false,
                shipping_regions: formFields.physical_details.shipping_regions ?? [],
            };
        }
        
        return {
            id: urlArtworkId,
            title: formFields.title?.trim() ?? '',
            description: formFields.description?.trim() ?? '',
            listing_type: formFields.listing_type ?? 'MARKETPLACE',
            artwork_format: 'PHYSICAL', 
            visibility: formFields.visibility ?? 'PUBLIC',
            has_variants: formFields.has_variants ?? false,
            
            assets: sanitizedAssets, 
            
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

            ...(formFields.price !== undefined && formFields.price !== null ? { price: Math.max(0, parseFloat(formFields.price) || 0) } : {}),
            ...(formFields.currency ? { currency: String(formFields.currency) } : {}),
            ...(formFields.max_purchase_quantity ? { max_purchase_quantity: Math.max(1, parseInt(formFields.max_purchase_quantity) || 1) } : {}),
            ...(safePhysicalDetails ? { physical_details: safePhysicalDetails } : {}),
        }
    }

    const handleFinishUpload = async () => {
        setIsSubmitting(true)
        try {
            const finalizedPayload = preparePayload(draft, 'PUBLISHED')
            await artworkService.create(finalizedPayload)
            console.log("Draft: ", draft)

            clearDraft()
            router.push('/profile')
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
        } catch (error: any) {
            console.error('[Save Progress Background Attempt Blocked]:', error, error.field)
            alert('Something went wrong while saving your draft.')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Dynamic Flow Builder
    const hasVariants = draft.has_variants ?? false;
    const totalSteps = hasVariants ? '7' : '6';

    const buildFlow = () => {
        const flow: React.ReactNode[] = [];

        // 1. Step One
        flow.push(
            <UploadFlowLayout 
                key={`flow-${flow.length}`}
                currentStepIndex={stepIndex}
                flowComponents={[
                    <UploadStepOne
                        key="step-1"
                        id="step-1"
                        onSaveAndExit={handleSaveAndExit}
                        onNext={() => setStepIndex(1)}
                        steps={totalSteps}
                        number={(flow.length + 1).toString()}
                    />
                ]}
            />
        );

        // 2. Dimensions
        flow.push(
            <UploadFlowLayout 
                key={`flow-${flow.length}`}
                currentStepIndex={stepIndex}
                flowComponents={[
                    <PhysicalArtDimension
                        key="step-2"
                        id="step-2"
                        onSaveAndExit={handleSaveAndExit}
                        onBack={() => setStepIndex(0)}
                        onNext={() => setStepIndex(2)}
                        steps={totalSteps}
                        number={(flow.length + 1).toString()}
                    />
                ]}
            />
        );

        // 3. Variations (CONDITIONAL)
        if (hasVariants) {
            const currentIndex = flow.length;
            flow.push(
                <UploadFlowLayout 
                    key={`flow-${currentIndex}`}
                    currentStepIndex={stepIndex}
                    flowComponents={[
                        <PhysicalArtVariable
                            key="step-3"
                            id="step-3"
                            onSaveAndExit={handleSaveAndExit}
                            onBack={() => setStepIndex(currentIndex - 1)}
                            onNext={() => setStepIndex(currentIndex + 1)}
                            steps={totalSteps}
                            number={(currentIndex + 1).toString()}
                        />
                    ]}
                />
            );
        }

        // 4. Shipping
        const shipIndex = flow.length;
        flow.push(
            <UploadFlowLayout 
                key={`flow-${shipIndex}`}
                currentStepIndex={stepIndex}
                flowComponents={[
                    <PhysicalArtShipping
                        key="step-shipping"
                        id="step-shipping"
                        onSaveAndExit={handleSaveAndExit}
                        onBack={() => setStepIndex(shipIndex - 1)}
                        onNext={() => setStepIndex(shipIndex + 1)}
                        steps={totalSteps}
                        number={(shipIndex + 1).toString()}
                    />
                ]}
            />
        );

        // 5. Step Two
        const stepTwoIndex = flow.length;
        flow.push(
            <UploadFlowLayout 
                key={`flow-${stepTwoIndex}`}
                currentStepIndex={stepIndex}
                flowComponents={[
                    <UploadStepTwo
                        key="step-two"
                        id="step-two"
                        onSaveAndExit={handleSaveAndExit}
                        onBack={() => setStepIndex(stepTwoIndex - 1)}
                        onNext={() => setStepIndex(stepTwoIndex + 1)}
                        steps={totalSteps}
                        number={(stepTwoIndex + 1).toString()}
                    />
                ]}
            />
        );

        // 6. Collaborators
        const collabIndex = flow.length;
        flow.push(
            <UploadFlowLayout 
                key={`flow-${collabIndex}`}
                currentStepIndex={stepIndex}
                flowComponents={[
                    <UploadArtCollaborators
                        key="step-collaborators"
                        id="step-collaborators"
                        onSaveAndExit={handleSaveAndExit}
                        onBack={() => setStepIndex(collabIndex - 1)}
                        onNext={() => setStepIndex(collabIndex + 1)}
                        steps={totalSteps}
                        number={(collabIndex + 1).toString()}
                    />
                ]}
            />
        );

        // 7. Preview
        const previewIndex = flow.length;
        flow.push(
            <UploadFlowLayout 
                key={`flow-${previewIndex}`}
                currentStepIndex={stepIndex}
                flowComponents={[
                    <UploadPreview
                        key="step-preview"
                        id="step-preview"
                        onSaveAndExit={handleSaveAndExit}
                        onBack={() => setStepIndex(previewIndex - 1)}
                        onNext={handleFinishUpload}
                        steps={totalSteps}
                        number={(previewIndex + 1).toString()}
                        previewFunction={() => setPreviewArt(true)}
                    />
                ]}
            />
        );

        return flow;
    };

    const physicalFlowComponents = buildFlow();

    return (
        <div className="min-h-screen bg-white w-screen pb-4">
            <Navbar />
            {previewArt ? <PreviewPhysicalArt user={user} /> : physicalFlowComponents[stepIndex]}
            <Footer />
        </div>
    )
}