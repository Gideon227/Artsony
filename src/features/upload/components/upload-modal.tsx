'use client'
import React, { useState, useEffect, useTransition } from 'react' // Added useTransition
import UploadType from './upload-type'
import { useArtworkStore } from '@/store/artwork.store';
import UploadFlowLayout from './upload-flow-layout';
import UploadStepOne from './upload-step-one';
import UploadStepTwo from './upload-step-two';
import UploadPreview from './upload-preview';
import PhysicalArtDimension from './physical-art-dimension';
import PhysicalArtVariable from './physical-art-variable';
import PhysicalArtShipping from './physical-art-shipping';
import UploadArtCollaborators from './upload-art-collaborators';
import UploadArtworkFiles from './upload-artwork-files';

import { useRouter } from 'next/navigation';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
    const setDraft = useArtworkStore((state) => state.setDraft);
    const clearDraft = useArtworkStore((state) => state.clearDraft);
    const router = useRouter()
    
    // --- FIX: Added useTransition to handle route changes safely ---
    const [isPending, startTransition] = useTransition() 

    const [render, setRender] = useState(isOpen)
    const [animate, setAnimate] = useState(false)
    
    const [listingType, setListingType] = useState<'MARKETPLACE' | 'PORTFOLIO' | null>(null)
    const [flowType, setFlowType] = useState<'DIGITAL' | 'PHYSICAL' | null>(null)
    const [stepIndex, setStepIndex] = useState(0)
    
    // Handle Mount/Unmount Animation & Scroll Lock
    useEffect(() => {
        if (isOpen) {
            clearDraft();
            document.body.style.overflow = 'hidden';
            
            setRender(true)
            setTimeout(() => setAnimate(true), 10) 
        } else {
            document.body.style.overflow = 'unset';
            
            setAnimate(false)
            setTimeout(() => {
                setRender(false)
                setFlowType(null)
                setStepIndex(0)
            }, 300) 
        }

        return () => {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen, clearDraft])

    if (!render) return null

    console.log("Step: ", stepIndex)

    // ... [Your commented out components remain exactly the same below] ...

    // const portfolioFlowComponents = [
    //     <UploadFlowLayout 
    //         currentStepIndex={stepIndex}
    //         flowComponents={[
    //             <UploadStepOne
    //                 key="step-1"
    //                 id='step-1'
    //                 onSaveAndExit={
    //                     () => setRender(false)
    //                 }
    //                 onNext={() => setStepIndex(1)}
    //                 steps='4'
    //                 number='1'
    //             />
    //         ]}
    //     />,
    //     <UploadFlowLayout 
    //         currentStepIndex={0}
    //         flowComponents={[
    //             <UploadStepTwo
    //                 key="step-2"
    //                 id='step-2'
    //                 onSaveAndExit={
    //                     () => setRender(false)
    //                 }
    //                 onBack={() => setStepIndex(0)}
    //                 onNext={() => setStepIndex(2)}
    //                 steps='4'
    //                 number='2'
    //             />
    //         ]}
    //     />,
    //     <UploadFlowLayout 
    //         currentStepIndex={0}
    //         flowComponents={[
    //             <UploadArtCollaborators
    //                 key='step-3'
    //                 id='step-3'
    //                 onNext={() => setStepIndex(3)}
    //                 onBack={() => setStepIndex(1)}
    //                 onSaveAndExit={() => setRender(false)} 
    //                 steps='4'
    //                 number='3'
    //             />
    //         ]}
    //     />,
    //     <UploadFlowLayout 
    //         currentStepIndex={0}
    //         flowComponents={[
    //             <UploadPreview
    //                 key="step-4"
    //                 onSaveAndExit={
    //                     () => setRender(false)
    //                 }
    //                 onNext={() => setStepIndex(1)}
    //                 steps='4'
    //                 number='4'
    //             />
    //         ]}
    //     />,
    // ]

    // const digitalFlowComponents = [
    //     <UploadFlowLayout 
    //         currentStepIndex={stepIndex}
    //         flowComponents={[
    //             <UploadStepOne
    //                 key="step-1"
    //                 id='step-1'
    //                 onSaveAndExit={
    //                     () => setRender(false)
    //                 }
    //                 onNext={() => setStepIndex(1)}
    //                 steps='6'
    //             />
    //         ]}
    //     />,
    //     <UploadFlowLayout 
    //         currentStepIndex={stepIndex}
    //         flowComponents={[
    //             <UploadArtworkFiles
    //                 key="step-2"
    //                 id='step-2'
    //                 onSaveAndExit={
    //                     () => setRender(false)
    //                 }
    //                 onNext={() => setStepIndex(2)}
    //                 handleBackStep={() => setStepIndex(2)}
    //                 number='2'
    //                 steps='6'
    //             />
    //         ]}
    //     />,
    //     <UploadFlowLayout 
    //         currentStepIndex={0}
    //         flowComponents={[
    //             <PhysicalArtDimension
    //                 key="step-3"
    //                 id='step-3'
    //                 onSaveAndExit={
    //                     () => setRender(false)
    //                 }
    //                 handleBackStep={() => setStepIndex(1)}
    //                 onNext={() => setStepIndex(3)}
    //                 steps='6'
    //                 number='3'
    //             />
    //         ]}
    //     />,
    //     <UploadFlowLayout 
    //         currentStepIndex={0}
    //         flowComponents={[
    //             <UploadStepTwo
    //                 key="step-4"
    //                 id='step-4'
    //                 onSaveAndExit={
    //                     () => setRender(false)
    //                 }
    //                 onBack={() => setStepIndex(2)}
    //                 onNext={() => setStepIndex(4)}
    //                 steps='6'
    //                 number='4'
    //             />
    //         ]}
    //     />,
    //     <UploadFlowLayout 
    //         currentStepIndex={0}
    //         flowComponents={[
    //             <UploadArtCollaborators
    //                 key='step-5'
    //                 id='step-5'
    //                 onBack={() => setStepIndex(3)}
    //                 onNext={() => setStepIndex(5)}
    //                 onSaveAndExit={() => setRender(false)} 
    //                 steps='6'
    //                 number='5'
    //             />
    //         ]}
    //     />,
    //     <UploadFlowLayout 
    //         currentStepIndex={0}
    //         flowComponents={[
    //             <UploadPreview
    //                 key="step-6"
    //                 onSaveAndExit={
    //                     () => setRender(false)
    //                 }
    //                 onNext={() => setStepIndex(1)}
    //                 steps='6'
    //                 number='6'
    //             />
    //         ]}
    //     />,

    //     <div key="details" className="flex h-full items-center justify-center">Digital Details Component...</div>,
    //     <div key="review" className="flex h-full items-center justify-center">Digital Review Component...</div>,
    // ]

    // const physicalFlowComponents = [
    //     <UploadFlowLayout 
    //         currentStepIndex={stepIndex}
    //         flowComponents={[
    //             <UploadStepOne
    //                 key="step-1"
    //                 id='step-1'
    //                 onSaveAndExit={
    //                     () => setRender(false)
    //                 }
    //                 onNext={() => setStepIndex(1)}
    //                 steps='7'
    //             />
    //         ]}
    //     />,
    //     <UploadFlowLayout 
    //         currentStepIndex={0}
    //         flowComponents={[
    //             <PhysicalArtDimension
    //                 key="step-2"
    //                 id='step-2'
    //                 onSaveAndExit={
    //                     () => setRender(false)
    //                 }
    //                 handleBackStep={() => setStepIndex(0)}
    //                 onNext={() => setStepIndex(2)}
    //                 steps='7'
    //                 number='2'
    //             />
    //         ]}
    //     />,
    //     <UploadFlowLayout 
    //         currentStepIndex={0}
    //         flowComponents={[
    //             <PhysicalArtVariable
    //                 key="step-3"
    //                 id='step-3'
    //                 onSaveAndExit={
    //                     () => setRender(false)
    //                 }
    //                 handleBackStep={() => setStepIndex(1)}
    //                 onNext={() => setStepIndex(3)}
    //                 steps='7'
    //                 // number='2'
    //             />
    //         ]}
    //     />,
    //     <UploadFlowLayout 
    //         currentStepIndex={0}
    //         flowComponents={[
    //             <PhysicalArtShipping
    //                 key="step-4"
    //                 id='step-4'
    //                 onSaveAndExit={
    //                     () => setRender(false)
    //                 }
    //                 handleBackStep={() => setStepIndex(2)}
    //                 onNext={() => setStepIndex(4)}
    //                 steps='7'
    //                 number='4'
    //             />
    //         ]}
    //     />,
    //     <UploadFlowLayout 
    //         currentStepIndex={0}
    //         flowComponents={[
    //             <UploadStepTwo
    //                 key="step-5"
    //                 id='step-5'
    //                 onSaveAndExit={
    //                     () => setRender(false)
    //                 }
    //                 onBack={() => setStepIndex(3)}
    //                 onNext={() => setStepIndex(5)}
    //                 steps='7'
    //                 number='5'
    //             />
    //         ]}
    //     />,
    //     <UploadFlowLayout 
    //         currentStepIndex={0}
    //         flowComponents={[
    //             <UploadArtCollaborators
    //                 key='step-6'
    //                 id='step-6'
    //                 onBack={() => setStepIndex(4)}
    //                 onNext={() => setStepIndex(6)}
    //                 onSaveAndExit={() => setRender(false)} 
    //                 steps='7'
    //                 number='6'
    //             />
    //         ]}
    //     />,
    //     <UploadFlowLayout 
    //         currentStepIndex={0}
    //         flowComponents={[
    //             <UploadPreview
    //                 key="step-7"
    //                 onSaveAndExit={
    //                     () => setRender(false)
    //                 }
    //                 onNext={() => setStepIndex(1)}
    //                 steps='7'
    //                 number='7'
    //             />
    //         ]}
    //     />,
    // ]

    const handleSelectPortfolio = () => {
        setListingType('PORTFOLIO');
        const draftId = crypto.randomUUID(); 
        setDraft({
            id: draftId,
            listing_type: 'PORTFOLIO',
            artwork_format: 'DIGITAL'
        });
        
        // --- FIX: Trigger modal close before routing to clear body scroll lock ---
        onClose(); 
        
        // --- FIX: Wrap router push in transition ---
        startTransition(() => {
            router.push(`/artworks/upload/${draftId}/share`)
        });
    };

    const handleSelectMarketplaceFormat = (format: 'DIGITAL' | 'PHYSICAL') => {
        setFlowType(format);
        const draftId = crypto.randomUUID();
        setDraft({
            id: draftId,
            listing_type: 'MARKETPLACE',
            artwork_format: format
        });
        
        // --- FIX: Trigger modal close before routing to clear body scroll lock ---
        onClose();

        // --- FIX: Wrap router push in transition ---
        startTransition(() => {
            router.push(`/artworks/upload/${draftId}/sell/${format.toLowerCase()}`)
        });
    };

    const handleNext = () => {
        setStepIndex(prev => prev + 1)
    }

    const handleBack = () => {
        if (stepIndex > 0) {
            setStepIndex(prev => prev - 1)
        } else if (flowType) {
            setFlowType(null) 
        } else if (listingType) {
            setListingType(null)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            
            {/* Backdrop: Black with 0.4 opacity */}
            <div 
                className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${animate ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />
            
            <div 
                className={`relative scrollbar-hide rounded-2xl shadow-2xl transition-all duration-500 ease-out transform flex flex-col overflow-hidden ${
                    animate ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-[10vh] opacity-0 scale-95'
                }`}
                style={{ width: '85vw', height: '100vh' }}
            >
                {/* <div className="flex-1 overflow-y-auto w-full"> */}
                    {!listingType ? (
                        <UploadType 
                            title="Upload"
                            subText="Would you like to share or sell an artwork ?"
                            cardOne={{
                                iconStr: '/icons/camera.svg', 
                                text: 'Share Artwork',
                                onClickFunction: handleSelectPortfolio
                            }}
                            cardTwo={{
                                iconStr: '/icons/tag.svg', 
                                text: 'Sell Artwork',
                                onClickFunction: () => setListingType('MARKETPLACE')
                            }}
                            onClose={onClose}
                        />
                    ) : listingType === 'MARKETPLACE' && !flowType ? (
                        <UploadType 
                            title="Sell Artwork"
                            subText="What type of Art do you want to put up for sale ?"
                            cardOne={{
                                iconStr: '/icons/cloud.svg', 
                                text: 'Digital Art',
                                onClickFunction: () => handleSelectMarketplaceFormat('DIGITAL')
                            }}
                            cardTwo={{
                                iconStr: '/icons/box-black.svg', 
                                text: 'Physical Art',
                                onClickFunction: () => handleSelectMarketplaceFormat('PHYSICAL')
                            }}
                            onClose={onClose}
                            backButton={true}
                            onBackHandle={() => {
                                setListingType(null)
                                setFlowType(null)
                            }}
                        />
                    ) : (
                        <div className="h-full w-full flex flex-col relative">

                            {/* {listingType === 'PORTFOLIO' && portfolioFlowComponents[stepIndex]}
                            {flowType === 'DIGITAL' && digitalFlowComponents[stepIndex]}
                            {flowType === 'PHYSICAL' && physicalFlowComponents[stepIndex]} */}

                            {/* <div className="absolute bottom-6 right-6 z-20">
                                <button onClick={handleNext} className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition">
                                    Next Step
                                </button>
                            </div> */}
                        </div>
                    )}
                {/* </div> */}
            </div>
        </div>
    )
}