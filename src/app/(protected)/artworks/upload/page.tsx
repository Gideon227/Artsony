// app/artworks/upload/page.tsx
'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import UploadType from '@/features/upload/components/upload-type'
import { useUploadStore } from '@/store/useUploadStore'

const UploadArtworkPage = () => {
    const router = useRouter();
    const initDraft = useUploadStore((state) => state.initDraft);

    const [step, setStep] = useState<'stepOne' | 'stepTwo'>('stepOne');
    const [selection, setSelection] = useState<{
        purpose: 'share' | 'sell' | null;
    }>({ purpose: null });

    // Handlers for Step 1
    const handleSelectPurpose = (purpose: 'share' | 'sell') => {
        if (purpose === 'share') {
            const draftId = crypto.randomUUID(); 
            
            // Shared items are automatically digital, skipping step 2 entirely
            initDraft(draftId, 'share', 'digital');
            router.push(`/artworks/upload/${draftId}/share`);
            return;
        }

        // If they choose to sell, save choice and proceed to step two selection
        setSelection({ purpose });
        setStep('stepTwo');
    };

    // Handlers for Step 2 (Only accessible if purpose is 'sell')
    const handleSelectType = (artworkType: 'digital' | 'physical') => {
        if (selection.purpose !== 'sell') return;

        const draftId = crypto.randomUUID(); 
        initDraft(draftId, 'sell', artworkType);

        // Dynamic routing path for products up for sale
        router.push(`/artworks/upload/${draftId}/sell/${artworkType}`);
    };

    if (step === 'stepOne') {
        return (
            <UploadType
                title="Upload"
                subText="Would you like to share or sell an artwork?"
                cardOne={{
                    iconStr: '/icons/camera.svg',
                    text: 'Share Artwork',
                    onClickFunction: () => handleSelectPurpose('share')
                }}
                cardTwo={{
                    iconStr: '/icons/tag.svg',
                    text: 'Sell Artwork',
                    onClickFunction: () => handleSelectPurpose('sell')
                }}
            />
        );
    }

    return (
        <UploadType
            title="Sell Artwork"
            subText="What type of Art do you want to put up for sale?"
            cardOne={{
                iconStr: '/icons/cloud.svg',
                text: 'Digital Artwork',
                onClickFunction: () => handleSelectType('digital')
            }}
            cardTwo={{
                iconStr: '/icons/box.svg',
                text: 'Physical Artwork',
                onClickFunction: () => handleSelectType('physical')
            }}
            backButton
            onClickFunction={() => setStep('stepOne')}
        />
    );
};

export default UploadArtworkPage;