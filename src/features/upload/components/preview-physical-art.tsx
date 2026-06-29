'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useArtworkStore, selectDraft } from '@/store/artwork.store'
import { 
  ChevronLeft, 
  ChevronRight, 
  Edit3, 
  Upload, 
  Heart, 
  Eye, 
  MessageCircle, 
  Globe, 
  ShoppingCart, 
  FolderPlus, 
  Share2, 
  Flag 
} from 'lucide-react'
import { User } from '@/types'
import { Button } from '@/components'
import { Dropdown, DropdownOption } from '@/components/ui/dropdown'

// Authentic background colors from the design's carousel items
const CAROUSEL_BGS = ['bg-[#353738]', 'bg-[#C4924A]', 'bg-[#5A422B]', 'bg-[#B84A1A]']
const DEFAULT_TITLES = ['MOON', 'VENUS', 'JUPITER', 'MARS']

export default function PreviewPhysicalArt({ user } : { user: User | null}) {
  const draft = useArtworkStore(selectDraft)
  
  // draft.assets is typed as Omit<ArtworkAsset, 'id'>[]
  const assets = draft?.assets || []

  // Component State
  const [activeAssetIndex, setActiveAssetIndex] = useState(0)
  const [quantity, setQuantity] = useState(1) // Default to 1 instead of 0 for purchasing

  // -- Derived Data from Zustand Draft --
  const activeAsset = assets[activeAssetIndex]
  const mainImageSrc = activeAsset?.original_url || '/placeholder-earth.png' 
  
  const displayTitle = draft.title || 'POONHILL - GHOREPANI'
  const displayFormat = draft.artwork_format === 'PHYSICAL' ? 'PHYSICAL ARTWORK' : 'DIGITAL ARTWORK'
  const price = draft.price ? `${draft.currency === 'USD' ? '$' : draft.currency}${draft.price}` : '$200'
  const availableQty = draft.physical_details?.available_quantity || 13000
  const maxQty = draft.max_purchase_quantity || 3
  const variants = draft.variants || []
  {/**TODO */}
  const isArtAvailableInCountry = true 
//   const dropdownOptions: DropdownOption[] = variants.map((v, i) => {
//     id: i;
//     label: v.name;
//   })

  // Handlers
  const handlePrev = () => setActiveAssetIndex((prev) => Math.max(0, prev - 1))
  const handleNext = () => setActiveAssetIndex((prev) => Math.min(assets.length - 1, prev + 1))
  
  const decreaseQty = () => setQuantity((prev) => Math.max(1, prev - 1))
  const increaseQty = () => setQuantity((prev) => Math.min(maxQty, prev + 1))

  return (
    <div className="flex w-full min-h-screen px-4 py-12 bg-white overflow-hidden">
      
        {/* ================= LEFT COLUMN: IMAGES ================= */}
        <div className="w-2/3 flex flex-col relative">
            

            {/* Main Display Area */}
            <div className="flex-1 bg-[#0A1221] flex items-center justify-center p-12 relative overflow-hidden">
                <div className='absolute top-1/2 left-0 right-0 -translate-y-1/2 z-20 flex justify-between items-center mx-4'>
                    <button 
                        onClick={handlePrev}
                        disabled={activeAssetIndex === 0 || assets.length === 0}
                        className="w-12 h-12  cursor-pointer bg-white rounded-full flex items-center justify-center text-gray-600 hover:scale-105 transition-transform border border-gray-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    {/* Carousel Right Arrow */}
                    <button 
                        onClick={handleNext}
                        disabled={activeAssetIndex === assets.length - 1 || assets.length === 0}
                        className="w-12 h-12 cursor-pointer bg-primary-500 text-white rounded-full flex items-center justify-center hover:bg-primary-600 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight size={20} strokeWidth={3} />
                    </button>
                
                </div>
            
                <div className="relative w-full h-150 p-12 bg-black overflow-hidden">
                    <Image 
                        src={mainImageSrc} 
                        alt="Artwork Preview" 
                        fill 
                        className="object-cover object-center"
                    />
                </div>
            </div>

            {/* Bottom Carousel Area */}
            <div className="h-[300px] bg-gray-50 p-6 flex items-center justify-center gap-6 relative px-20">
            {/* Carousel Left Arrow */}
            <button 
                onClick={handlePrev}
                disabled={activeAssetIndex === 0}
                className="absolute left-8 w-10 h-10 bg-[#F15A2B] text-white rounded-full flex items-center justify-center z-10 shadow-md hover:bg-[#E0481D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronLeft size={20} strokeWidth={3} />
            </button>

            {/* Render Thumbnails (Min 4 slots for design accuracy) */}
            {(assets.length >= 4 ? assets : Array.from({ length: 4 })).map((_, idx) => {
                const assetData = assets[idx]
                // We NO LONGER check assetData.id to fix the TypeScript error
                const hasRealAsset = !!assetData?.original_url
                
                return (
                <div 
                    key={idx}
                    onClick={() => hasRealAsset && setActiveAssetIndex(idx)}
                    className={`w-[220px] h-[260px] rounded-[32px] p-4 flex flex-col shadow-sm transition-transform ${hasRealAsset ? 'cursor-pointer hover:-translate-y-2' : 'opacity-70'} ${CAROUSEL_BGS[idx % CAROUSEL_BGS.length]}`}
                >
                    <div className="bg-[#D9DBD9] p-2 pb-10 w-full h-full flex flex-col shadow-inner relative rounded-sm">
                    <div className="relative w-full flex-1 bg-black overflow-hidden">
                        <Image 
                        src={assetData?.original_url || `/placeholder-thumb-${idx + 1}.png`} 
                        alt={`Thumbnail ${idx}`} 
                        fill 
                        className="object-cover"
                        />
                    </div>
                    <div className="absolute bottom-2 left-2">
                        <h4 className="text-gray-900 font-extrabold text-[15px] uppercase leading-none tracking-wide">
                            {hasRealAsset ? `ASSET 0${idx+1}` : DEFAULT_TITLES[idx]}
                        </h4>
                        <p className="text-[9px] text-gray-800 font-bold uppercase mt-0.5 tracking-[0.2em]">
                            PLANET - #0{idx + 1}
                        </p>
                    </div>
                    </div>
                </div>
                )
            })}

            
            </div>
        </div>

        {/* ================= RIGHT COLUMN: DETAILS ================= */}
        <div className="w-1/3 bg-white px-6 py-8 flex flex-col relative ">
            
            {/* Absolute Right Navigation Arrow (Global Component Pagination) */}
            {/* <button className="absolute -right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.1)] flex items-center justify-center text-gray-600 hover:scale-105 transition-transform border border-gray-50">
            <ChevronRight size={24} />
            </button> */}

            {/* Profile Header */}
            <div className="flex items-center gap-y-6 mb-8 border-b border-gray-50">
                <div className="flex items-center gap-x-8">
                    <div className='flex items-center gap-2'>
                        <div className="relative rounded-full overflow-hidden w-14 h-14 bg-gray-200">
                            <Image src={user?.avatarUrl as string} alt="Avatar" fill className="object-cover" />
                        </div>

                        <div className="flex flex-col">
                            <span className="font-poppins font-medium text-body-m text-primary-500 leading-6 tracking-wide">Boluwatife Adeniji</span>
                            <span className="font-poppins font-light text-body text-body-xs leading-4 tracking-wide ">Landscape Photography</span>
                        </div>
                    </div>

                    <button className="w-10 h-10 p-2 rounded-full border border-gray-50 flex items-center justify-center hover:bg-gray-50">
                        <Image src='/icons/pen.svg' fill alt='edit icon' />
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <Button
                        fullWidth
                        leftIcon='/icons/upload.svg'
                    >
                        Publish
                    </Button>
                    <Button
                        fullWidth
                        variant='outline'

                    >
                        Save Draft
                    </Button>
                </div>
            </div>

            {/* Artwork Info */}
            <div className="flex flex-col pt-4 gap-y-2 justify-center items-center border-b border-gray-50 mb-4">
                <h4 className="font-poppins font-medium text-body-m leading-6 text-heading tracking-wide">
                    {displayTitle}
                </h4>
                <span className="font-poppins font-light text-info-500 text-body-xs leading-4 tracking-wide">
                    {displayFormat}
                </span>
                <span className="font-poppins font-light text-text-disabled text-body-xs tracking-wide leading-4">
                    Published: {String(draft.created_at)}
                </span>
                
                {/* Stats */}
                {draft.show_engagement_stats !== false && (
                    <div className="flex items-center gap-6 mt-5">
                        <div className="flex items-center gap-2">
                            <Image src='/icons/heart-red.svg' width={20} height={18} alt='heart icon' />
                            <span className="font-poppins text-body tracking-wide leading-6 text-body-s">{draft.like_count}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Image src='/icons/eye-red.svg' width={20} height={18} alt='heart icon' />
                            <span className="font-poppins text-body tracking-wide leading-6 text-body-s">{draft.view_count}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Image src='/icons/chat-rounded-red.svg' width={20} height={18} alt='heart icon' />
                            <span className="font-poppins text-body tracking-wide leading-6 text-body-s">{draft.comment_count}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Purchasing Details */}
            <div className="flex flex-col gap-y-4 pt-4">
                <div className='flex flex-col gap-y-2'>
                    <div className='flex items-center gap-x-2'>
                        <Image src='/icons/global.svg' width={14} height={14} alt='globe' />
                        <p className={`font-poppins font-light text-body-xs leading-4 tracking-wide ${isArtAvailableInCountry ? 'text-info-500' : 'text-gray-400'}`}>{isArtAvailableInCountry ? 'Available in your region' : 'This artwork is not available in your region'}</p>
                    </div>
                    <div className="font-poppins font-light text-body-xs leading-4 tracking-wide text-body">
                        Available quantity: <span className="text-primary-500 ml-2">{availableQty}</span>
                    </div>
                    <div className="font-poppins font-medium text-body-m leading-6 tracking-wide text-body">
                        Price: <span className="text-primary-500 ml-2">{price}</span>
                    </div>
                </div>

                <div className='flex flex-col gap-y-4'>
                    {/* <Dropdown 
                        options={dropdownOptions}
                        placeholder='Select Type'
                    /> */}
                </div>
            </div>

            {/* Form Controls */}
            <div className="flex flex-col gap-5">
                {/* Select Type Dropdown */}
                <div className="relative">
                    <select className="w-full appearance-none border-2 border-gray-100 rounded-full py-4 px-6 text-[15px] text-gray-500 font-semibold outline-none focus:border-[#F15A2B] transition-colors cursor-pointer bg-white">
                    <option value="">Select type</option>
                    {variants.map(v => (
                        <option key={v.name} value={v.name}>{v.name}</option> // Used v.name instead of v.id for draft variants
                    ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronRight size={18} className="text-gray-400 rotate-90 stroke-[3]" />
                    </div>
                </div>

                {/* Quantity Adjuster */}
                <div className="flex items-center justify-between mt-1">
                    <div className="border-2 border-gray-100 rounded-full flex items-center justify-between w-[150px] py-1 px-1">
                    <button 
                        onClick={decreaseQty} 
                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-800 rounded-full transition-colors"
                    >
                        <ChevronLeft size={18} strokeWidth={3} />
                    </button>
                    <span className="text-[#F15A2B] font-bold text-lg w-8 text-center">
                        {quantity.toString().padStart(2, '0')}
                    </span>
                    <button 
                        onClick={increaseQty} 
                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-800 rounded-full transition-colors"
                    >
                        <ChevronRight size={18} strokeWidth={3} />
                    </button>
                    </div>
                    
                    <div className="text-[14px] font-semibold text-gray-400 flex items-center gap-1.5">
                    Max Qty <span className="text-[#F15A2B]">( {maxQty} )</span>
                    </div>
                </div>

                {/* Add to Cart */}
                <button className="w-full bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#9CA3AF] py-4 rounded-full flex items-center justify-center gap-2 font-bold text-[16px] mt-2 transition-colors">
                    <ShoppingCart size={20} strokeWidth={2.5} /> Add to Cart
                </button>
            </div>

            {/* Spacer to push icons to bottom */}
            <div className="flex-1"></div>

            {/* Footer Icons */}
            <div className="flex items-center gap-4 mt-8">
                <button className="w-[46px] h-[46px] bg-[#F3F4F6] rounded-full flex items-center justify-center text-[#9CA3AF] hover:bg-gray-200 hover:text-gray-600 transition-colors">
                    <FolderPlus size={20} strokeWidth={2.5} />
                </button>
                <button className="w-[46px] h-[46px] bg-[#F3F4F6] rounded-full flex items-center justify-center text-[#9CA3AF] hover:bg-gray-200 hover:text-gray-600 transition-colors">
                    <Share2 size={20} strokeWidth={2.5} />
                </button>
                <button className="w-[46px] h-[46px] bg-[#F3F4F6] rounded-full flex items-center justify-center text-[#9CA3AF] hover:bg-gray-200 hover:text-gray-600 transition-colors">
                    <Flag size={20} strokeWidth={2.5} />
                </button>
            </div>

        </div>
    </div>
  )
}