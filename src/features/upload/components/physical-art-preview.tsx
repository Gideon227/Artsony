'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Video from 'next-video'
import { motion, AnimatePresence } from 'framer-motion'
import { useArtworkStore, selectDraft } from '@/store/artwork.store'
import { Button } from '@/components'
import { cn } from '@/utils'
import { useAuthStore } from '@/store'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PhysicalArtPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: () => void;
  onSaveDraft: () => void;
  onEdit: () => void;
}

// Framer motion variants for smooth directional sliding
const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0
  })
}

export const PhysicalArtPreview = ({ 
  isOpen, 
  onClose, 
  onPublish, 
  onSaveDraft, 
  onEdit 
}: PhysicalArtPreviewProps) => {
  const draft = useArtworkStore(selectDraft)
  const { user } = useAuthStore()
  
  // -- Carousel State --
  const [[page, direction], setPage] = useState([0, 0])
  const assets = draft?.assets || []
  const totalSlides = Math.max(assets.length, 1)

  const paginate = (newDirection: number) => {
    const newPage = page + newDirection;
    // Prevent out of bounds
    if (newPage < 0 || newPage >= totalSlides) return;
    setPage([newPage, newDirection]);
  }

  if (!isOpen) return null

  // Safely get the current asset
  const currentAsset = assets[page]
  const imageUrl = currentAsset?.original_url || '/placeholder.png' // Add your placeholder path
  const isVideo = currentAsset?.media_type === 'VIDEO'
  const title = draft?.title || 'Untitled Artwork'

  // Mock User Data (Replace with your auth store data)
  const artOwner = {
    name: user?.username,
    role: 'Landscape Photography', //Placeholder
    avatar: user?.avatarUrl || '/images/image-avatar.svg' 
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-8">
      
        {/* Background Click to Close */}
        <div className="absolute inset-0" onClick={onClose} />

        <div className="relative flex items-center w-full max-w-[1200px] gap-6">
            <div className='absolute inset-0 w-screen z-50 flex justify-between items-center flex-1'>
                {/* Left Arrow (Outside Card) */}
                <button
                    onClick={() => paginate(-1)}
                    disabled={page === 0}
                    className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-transparent text-gray-500 shadow-lg transition-all hover:scale-105 hover:text-gray-800 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                    <ChevronLeft size={24} />
                </button>

                {/* Right Arrow (Outside Card) */}
                <button
                    onClick={() => paginate(1)}
                    disabled={page === totalSlides - 1}
                    className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-gray-500 shadow-lg transition-all hover:scale-105 hover:text-gray-800 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Main Card */}
            <div className="relative z-10 flex h-screen w-full max-w-[1080px] overflow-hidden rounded-2xl bg-white shadow-2xl flex-1">
            
                {/* LEFT PANEL: Image Carousel */}
                <div className="relative flex-1 bg-gray-100 overflow-y-auto w-7/10 flex flex-col">
                    {draft?.assets?.map((asset) => (
                        <div className='h-[80vh] p-6 relative w-full'>
                            {(asset?.media_type === 'IMAGE' || asset?.media_type === 'EXTERNAL_LINK' || asset?.media_type === 'THREE_D') &&
                                <Image 
                                    src={asset?.thumbnail_url as string}
                                    alt='Artwork media file'
                                    fill
                                    priority
                                    className='absolute inset-0'
                                />
                            }

                            {asset?.media_type === 'VIDEO' &&
                                <>
                                    <Video src={asset?.optimized_url as string} className='absolute inset-0' />
                                    
                                    <div className="absolute left-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-transparent border-gray-400 ">
                                        <Image src='/icons/video-camera.svg' width={20} height={16} alt='Video Icon' />
                                    </div>
                                </>
                            }
                        </div>
                    ))}
                </div>

                {/* RIGHT PANEL: Sidebar Details */}
                <div className="flex w-3/10 flex-col items-center py-8 px-6 bg-white border-l border-gray-100 shrink-0 min-h-screen">
        
                    {/* Header / Profile */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            <div className="relative h-14 w-14 overflow-hidden rounded-full bg-gray-200">
                                <Image src={user?.avatarUrl as string} alt={user?.username as string} fill className="object-cover" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-poppins font-medium text-body-m leading-6 text-primary-500 tracking-wide">{user?.username}</span>
                                <span className="font-poppins font-light text-body-xs text-gray-400 leading-4 tracking-wide">{artOwner.role}</span>
                            </div>
                        </div>
                        <button 
                            onClick={onEdit}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-50 hover:bg-gray-50 transition-colors"
                        >
                            <Image src='/icons/pen.svg' width={20} height={20} alt='edit icon' />
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex gap-2 w-full">
                        <Button 
                            onClick={onPublish}
                            leftIcon='/icons/upload.svg'
                            fullWidth
                        >
                            Publish
                        </Button>
                        <Button 
                            variant="outline"
                            onClick={onSaveDraft}
                            fullWidth
                        >
                            Save Draft
                        </Button>
                    </div>

                    <hr className="mt-8 mb-4 border-gray-50" />

                    {/* Title & Stats */}
                    <h2 className="font-poppins font-medium text-body-m text-gray-500 leading-6 tracking-wide mb-4">{title}</h2>
                    
                    <div className="flex items-center gap-6 mb-8">
                        <div className="flex items-center gap-2 text-gray-600 font-medium">
                            <Image src='/icons/heart-red.svg' width={20} height={18} alt='heart icon' />
                            <span>{draft?.like_count|| '00'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 font-medium">
                            <Image src='/icons/eye-red.svg' width={20} height={18} alt='eye icon' />
                            <span>{draft?.view_count || '00'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 font-medium">
                            <Image src='/icons/chat-round-red.svg' width={20} height={18} alt='chat icon' />
                            <span>{draft?.comment_count || '00'}</span>
                        </div>
                    </div>

                    {/* Interaction Icons */}
                    <div className="flex items-center gap-4">
                        <button className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 hover:bg-gray-200 transition-colors">
                            <Image src='/icons/folder-add.svg' width={20} height={20} alt='Folder Icon' />
                        </button>
                        <button className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 hover:bg-gray-200 transition-colors">
                            <Image src='/icons/share.svg' width={20} height={20} alt='Share Icon' />
                        </button>
                        <button className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 hover:bg-gray-200 transition-colors">
                            <Image src='/icons/flag.svg' width={20} height={20} alt='Flag Icon' />
                        </button>
                    </div>

                    {/* Spacer to push social icons to the bottom */}
                    <div className="flex-1" />

                    {/* Social Icons */}
                    <div className="flex items-center gap-6 ">
                        <a href="#" className="hover:bg-gray-500 bg-gray-400 transition-colors"><Image src='/socials/instagram-grey.svg' width={24} height={24} alt='Instagram Icon' /></a>
                        <a href="#" className="hover:bg-gray-500 bg-gray-400 transition-colors"><Image src='/socials/facebook-grey.svg' width={24} height={24} alt='Facebook Icon' /></a>
                        <a href="#" className="hover:bg-gray-500 bg-gray-400 transition-colors"><Image src='/socials/linkedin.svg' width={24} height={24} alt='Folder Icon' /></a>
                        <a href="#" className="hover:bg-gray-500 bg-gray-400 transition-colors"><Image src='/socials/twitter-grey.svg' width={24} height={24} alt='Folder Icon' /></a>
                    </div>

                </div>
            </div>

            

        </div>
    </div>
  )
}