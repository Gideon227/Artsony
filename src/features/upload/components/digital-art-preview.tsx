'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useArtworkStore } from '@/store/artwork.store'
import { useAuthStore } from '@/store'
import { Button } from '@/components'
import { cn } from '@/lib/utils'

interface Props {
    isOpen: boolean
    onClose: () => void
    onPublish: () => void
    onSaveDraft: () => void
    onEdit: () => void
}

const DigitalArtPreview = ({
    isOpen,
    onClose,
    onPublish,
    onSaveDraft,
    onEdit
}: Props) => {
    const { draft } = useArtworkStore()
    const { user } = useAuthStore()
    const [currentSlide, setCurrentSlide] = useState(0)

    // Safely extract assets from the draft store
    const assets = draft?.assets || []
    const totalSlides = Math.max(assets.length, 1)
    const currentAsset = assets[currentSlide]

    // Fallback image if draft asset is empty or loading
    const imageUrl = currentAsset?.original_url || currentAsset?.optimized_url || '/images/placeholder.png'

    if (!isOpen) return null

    // Navigation Handlers
    const handleNext = () => setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1))
    const handlePrev = () => setCurrentSlide((prev) => Math.max(prev - 0, 0))

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center font-poppins">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" 
                onClick={onClose}
            />

            {/* Global Left Navigation */}
            <button
                onClick={handlePrev}
                disabled={currentSlide === 0}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white shadow-lg transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
                <ChevronLeft className="text-gray-600" size={24} />
            </button>

            {/* Modal Container */}
            <div
                className="relative z-10 flex w-[90vw] max-w-[1400px] h-[85vh] transform overflow-hidden rounded-[40px] bg-white shadow-2xl transition-all duration-500 ease-out"
            >
                {/* LEFT PANEL - Image & Carousel */}
                <div className="relative flex flex-1 flex-col overflow-hidden bg-[#0A192F]">
                    
                    {/* Main Image Area */}
                    <div className={cn(
                        "relative w-full transition-all duration-500",
                        assets.length > 1 ? "h-[75%]" : "h-full"
                    )}>
                        <Image
                            src={imageUrl}
                            alt={draft?.title || "Artwork thumbnail"}
                            fill
                            className="object-cover"
                            priority
                        />
                        {/* Overlay Video/Type Icon (Top Left) */}
                        <div className="absolute left-6 top-6 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/30 backdrop-blur-md">
                            <Image src="/icons/video-camera.svg" width={24} height={24} alt="media type" className="opacity-80" />
                        </div>
                    </div>

                    {/* Bottom Carousel (Only visible if multiple assets exist) */}
                    {assets.length > 1 && (
                        <div className="relative h-[25%] w-full bg-[#EEF4F4] px-16 py-6 flex items-center justify-center">
                            {/* Inner Carousel Controls */}
                            <button
                                onClick={handlePrev}
                                disabled={currentSlide === 0}
                                className="absolute left-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#F15A2B] text-white shadow-md transition-all hover:bg-[#d94f24] disabled:opacity-50"
                            >
                                <Image src="/icons/alt-arrow-left.svg" width={20} height={20} alt="prev" className="brightness-0 invert" />
                            </button>

                            {/* Thumbnail Strip */}
                            <div className="flex h-full w-full items-center justify-center gap-4 overflow-x-auto scrollbar-hide px-4">
                                {assets.map((asset, index) => {
                                    const isActive = index === currentSlide;
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentSlide(index)}
                                            className={cn(
                                                "relative h-[120px] w-[120px] shrink-0 overflow-hidden rounded-2xl transition-all duration-300",
                                                isActive ? "ring-4 ring-[#F15A2B] ring-offset-2 ring-offset-[#EEF4F4] scale-105" : "opacity-70 hover:opacity-100"
                                            )}
                                        >
                                            <Image
                                                src={asset?.optimized_url as string || '/images/placeholder.png'}
                                                alt={`Thumbnail ${index + 1}`}
                                                fill
                                                className="object-cover bg-[#D9D9D9]"
                                            />
                                        </button>
                                    )
                                })}
                            </div>

                            <button
                                onClick={handleNext}
                                disabled={currentSlide === totalSlides - 1}
                                className="absolute right-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#F15A2B] text-white shadow-md transition-all hover:bg-[#d94f24] disabled:opacity-50"
                            >
                                <Image src="/icons/alt-arrow-left.svg" width={20} height={20} alt="next" className="rotate-180 brightness-0 invert" />
                            </button>
                        </div>
                    )}
                </div>

                {/* RIGHT PANEL - Sidebar Details */}
                <div className="flex w-[380px] shrink-0 flex-col bg-white px-8 py-10 border-l border-gray-100 overflow-y-auto scrollbar-hide">
                    
                    {/* Header / Profile */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 overflow-hidden rounded-full border border-gray-100 bg-gray-200">
                                <Image 
                                    src={user?.avatarUrl || '/images/avatar-placeholder.png'} 
                                    alt={user?.username || 'User'} 
                                    fill 
                                    className="object-cover" 
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-[15px] text-[#F15A2B] leading-tight">
                                    {user?.username || 'Boluwatife Adeniji'}
                                </span>
                                <span className="font-light text-xs text-gray-500 mt-0.5">
                                    Landscape Photography
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={onEdit}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50"
                        >
                            <Image src="/icons/pen.svg" width={16} height={16} alt="edit icon" />
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex gap-3 w-full">
                        <Button
                            onClick={onPublish}
                            className="flex-1 bg-[#F15A2B] hover:bg-[#d94f24] text-white rounded-full py-2.5 font-medium flex items-center justify-center gap-2"
                        >
                            <Image src="/icons/upload.svg" width={18} height={18} alt="upload" className="brightness-0 invert" />
                            Publish
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onSaveDraft}
                            className="flex-1 border-[#F15A2B] text-[#F15A2B] hover:bg-[#FFF5F2] rounded-full py-2.5 font-medium"
                        >
                            Save Draft
                        </Button>
                    </div>

                    <hr className="my-8 border-gray-100" />

                    {/* Title & Meta Info */}
                    <div className="flex flex-col mb-8">
                        <h2 className="font-semibold text-[18px] text-gray-800 leading-snug mb-2">
                            {draft?.title || 'Poonhill - Ghorepani'}
                        </h2>
                        <span className="text-[13px] text-blue-400 font-medium mb-1">
                            {`${draft?.artwork_format} Artwork` || 'Digital Artwork'}
                        </span>
                        <span className="text-[12px] text-gray-400">
                            Published: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 mb-10">
                        <div className="flex items-center gap-2">
                            <Image src="/icons/heart-red.svg" width={20} height={20} alt="likes" />
                            <span className="text-[14px] text-gray-600 font-medium">{draft?.like_count || '00'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Image src="/icons/eye-red.svg" width={20} height={20} alt="views" />
                            <span className="text-[14px] text-gray-600 font-medium">{draft?.view_count || '00'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Image src="/icons/chat-round-red.svg" width={20} height={20} alt="comments" />
                            <span className="text-[14px] text-gray-600 font-medium">{draft?.comment_count || '00'}</span>
                        </div>
                    </div>

                    {/* Interaction Icons */}
                    <div className="flex items-center gap-4">
                        <button className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200">
                            <Image src="/icons/folder-add.svg" width={20} height={20} alt="Folder Add" />
                        </button>
                        <button className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200">
                            <Image src="/icons/share.svg" width={20} height={20} alt="Share" />
                        </button>
                        <button className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200">
                            <Image src="/icons/flag.svg" width={18} height={18} alt="Flag" />
                        </button>
                    </div>

                    {/* Spacer to push social icons to the bottom */}
                    <div className="flex-1 min-h-[40px]" />

                    {/* Social Icons */}
                    <div className="flex items-center gap-5 pt-6">
                        <a href="#" className="opacity-60 transition-opacity hover:opacity-100">
                            <Image src="/socials/instagram-grey.svg" width={22} height={22} alt="Instagram" />
                        </a>
                        <a href="#" className="opacity-60 transition-opacity hover:opacity-100">
                            <Image src="/socials/facebook-grey.svg" width={22} height={22} alt="Facebook" />
                        </a>
                        <a href="#" className="opacity-60 transition-opacity hover:opacity-100">
                            <Image src="/socials/linkedin.svg" width={22} height={22} alt="LinkedIn" className="grayscale" />
                        </a>
                        <a href="#" className="opacity-60 transition-opacity hover:opacity-100">
                            <Image src="/socials/twitter-grey.svg" width={22} height={22} alt="Twitter" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Global Right Navigation */}
            <button
                onClick={handleNext}
                disabled={currentSlide === totalSlides - 1}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white shadow-lg transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
                <ChevronRight className="text-gray-600" size={24} />
            </button>
        </div>
    )
}

export default DigitalArtPreview