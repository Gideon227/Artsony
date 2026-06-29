'use client'

import { Button } from '@/components'
import { ArtCard, Artist } from '@/components/ui/art-card'
import { useArtworkStore, selectDraft } from '@/store/artwork.store'
import Image from 'next/image'
import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react'
import UploadHeader from './upload-header'
import { useAuthStore } from '@/store'

interface UploadPreviewProps {
  id?: string;
  onNext: () => void;
  onBack: () => void;
  onSaveAndExit: () => void;
  steps: string;
  number: string;
  previewFunction?: () => void
  loading?: boolean
}

const UploadPreview = ({ onNext, onBack, onSaveAndExit, steps, number, previewFunction, loading }: UploadPreviewProps) => {
  const draft = useArtworkStore(selectDraft)
  const { user } = useAuthStore()
  
  // -- Slide Navigation State --
  const [currentSlide, setCurrentSlide] = useState(0)
  const assets = draft?.assets || []
  const totalSlides = Math.max(assets.length, 1)

  const handlePrev = () => setCurrentSlide((prev) => Math.max(0, prev - 1))
  const handleNextSlide = () => setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1))

  // -- Derived Card Data --
  const currentAsset = assets[currentSlide]
  const previewImage = currentAsset?.original_url || '/placeholder.png' // Fallback image
  const displayTitle = draft?.title || 'Untitled Artwork'

  // TODO: Replace this with the actual logged-in user from your Auth/User store
  const currentUser: Artist = {
    id: user?.id as string,
    name: user?.username!,
    avatarUrl: user?.avatarUrl!,
    role: 'Artist',
    stats: { followers: String(user?.followersCount) || '0', likes: String(user?.likesCount) || '0' , following: String(user?.followingCount) || '0' }
  }

  // Map through collaborators to build the full artists array
  const collaborators: Artist[] = (draft?.collaborator_ids || []).map((collabId, index) => ({
    id: typeof collabId === 'string' ? collabId : String(collabId),
    name: `Collaborator ${index + 1}`, // TODO: Fetch real collaborator details from your store based on ID
    avatarUrl: '/default-avatar.png',
    role: 'Collaborator'
  }))

  // The full artist array passed to the ArtCard
  const allArtists = [currentUser, ...collaborators]

  return (
    <div className='border border-gray-50 rounded-2xl flex flex-col justify-between bg-white min-h-screen'>
      <div>
        {/* TOP CONTROLS */}
        <UploadHeader 
          number={number}
          steps={steps}
          onSaveAndExit={onSaveAndExit}
        />

        {/* PREVIEW ART CARD */}
        <div className='p-6 py-12 gap-8 flex flex-col items-center justify-center w-full'>
          <div className="w-full max-w-[332px] flex flex-col gap-6">
            
            {/* The Artwork Card mapped to the current slide */}
            <ArtCard 
              image={previewImage}
              title={displayTitle}
              artist={allArtists}
              variant="bland"
              alternate={true} // Enable this to show the AvatarGroup of collaborators nicely
            />

            {/* Thumbnail Controls */}
            {totalSlides > 1 && (
              <div className="flex items-center justify-between w-full mt-2">
                <span className="font-poppins font-medium text-[15px] text-gray-800 tracking-wide">
                  Thumbnail
                </span>
                
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handlePrev}
                    disabled={currentSlide === 0}
                    className="h-9 w-9 rounded-full border border-gray-100 flex items-center cursor-pointer justify-center hover:bg-gray-50 disabled:opacity-50 transition-all"
                  >
                    <div className="hover:bg-gray-400 rounded-full p-0.5 text-white flex items-center justify-center" style={{ backgroundColor: '#25282D' }}>
                      <ChevronLeft size={16} strokeWidth={3} />
                    </div>
                  </button>
                  
                  <span className="text-[#F15A2B] font-medium text-[14px]">
                    Slide {currentSlide + 1} of {totalSlides}
                  </span>
                  
                  <button 
                    onClick={handleNextSlide}
                    disabled={currentSlide === totalSlides - 1}
                    className="h-9 w-9 rounded-full border border-gray-100 cursor-pointer flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 transition-all"
                  >
                    <div className="hover:bg-gray-400 rounded-full p-0.5 text-white flex items-center justify-center" style={{ backgroundColor: '#25282D' }}>
                      <ChevronRight size={16} strokeWidth={3} />
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Preview Button */}
            <button onClick={previewFunction} className="w-full bg-primary-50 cursor-pointer group text-gray-400 border-transparent border hover:border-primary-500 hover:text-primary-500 transition-colors flex items-center justify-center gap-3 py-3 leading-6 rounded-full font-medium font-poppins text-body-s mt-2">
              Preview <ChevronsRight size={18} strokeWidth={2.5} className="text-gray-400 group-hover:text-primary-500" />
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="py-6 px-6 flex gap-4 border-t border-gray-50 bg-white sticky bottom-0 z-10">
        <Button
          fullWidth
          onClick={onNext}
          isLoading={loading}
        >
          Upload
        </Button>
      </div>
    </div>
  )
}

export default UploadPreview