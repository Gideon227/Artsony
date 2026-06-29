'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Eye,
  MessageCircle,
  Globe,
  ShoppingCart,
  FolderPlus,
  Share2,
  Flag,
  X,
  UserPlus,
  Check,
  HeartIcon,
} from 'lucide-react'
import { artworkService } from '@/services/artwork.service'
import { followService } from '@/services/follow.service'
import { useCartStore } from '@/store/cart.store'
import type { Artwork, ArtworkAsset, Variant } from '@/types/artwork'
import { Button } from '@/components'
import { Dropdown } from '@/components/ui/dropdown'

// ── Number formatting (55.5k, 108k, 1,087) ────────────────────────────────────
function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 10_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  if (n >= 1_000) return n.toLocaleString('en-US')
  return String(n)
}

function formatDate(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
}

interface ArtworkViewOverlayProps {
  artwork: Artwork
  onClose: () => void
  onNavigate?: (direction: 'prev' | 'next') => void
}

export default function ArtworkViewOverlay({ artwork, onClose, onNavigate }: ArtworkViewOverlayProps) {
    const [activeAssetIndex, setActiveAssetIndex] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [selectedVariantOptionId, setSelectedVariantOptionId] = useState<string | null>(null)

    const [isLiked, setIsLiked] = useState(artwork.is_liked ?? false)
    const [likeCount, setLikeCount] = useState(artwork.like_count ?? 0)
    const [isLiking, setIsLiking] = useState(false)

    const [isFollowing, setIsFollowing] = useState(artwork.creator?.is_following ?? false)
    const [isFollowLoading, setIsFollowLoading] = useState(false)

    const [isAddingToCart, setIsAddingToCart] = useState(false)
    const [cartError, setCartError] = useState<string | null>(null)
    const [shareOpen, setShareOpen] = useState(false)

    const { addItem } = useCartStore()

  // ── Fetch artwork ────────────────────────────────────────────────────────
//   useEffect(() => {
//     let cancelled = false
//     const fetchArtwork = async () => {
//       try {
//         setIsLoading(true)
//         setError(null)
//         const res = await artworkService.getBySlug(slug)
//         if (cancelled) return
//         if (res && res.data) {
//           setArtwork(res.data)
//           setIsLiked(res.data.is_liked ?? false)
//           setLikeCount(res.data.like_count ?? 0)
//           setIsFollowing(res.data.creator?.is_following ?? false)
//         } else {
//           setError('Failed to load artwork.')
//         }
//       } catch (err: any) {
//         if (!cancelled) setError(err?.message ?? 'Failed to load artwork.')
//       } finally {
//         if (!cancelled) setIsLoading(false)
//       }
//     }
//     fetchArtwork()
//     return () => { cancelled = true }
//   }, [slug])

  // ── Derived data ─────────────────────────────────────────────────────────
  const assets: ArtworkAsset[] = artwork?.assets ?? []
  const activeAsset = assets[activeAssetIndex]
  const mainImageSrc = activeAsset?.optimized_url || activeAsset?.original_url || null

  const displayTitle = artwork?.title ?? ''
  const displayFormat = artwork?.artwork_format === 'PHYSICAL' ? 'Physical Artwork' : 'Digital Artwork'
  const currencySymbol = artwork?.currency === 'USD' ? '$' : (artwork?.currency ?? '$')
  const price = artwork?.price != null ? `${currencySymbol}${artwork.price.toLocaleString('en-US')}` : '—'
  const availableQty = artwork?.physical_details?.available_quantity
  const maxQty = artwork?.max_purchase_quantity ?? 1
  const variants: Variant[] = artwork?.variants ?? []
  const isAvailableInRegion = true // TODO: wire to real region availability check

  const selectedVariant = variants.find(v => v.options.some(o => o.id === selectedVariantOptionId))

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handlePrevAsset = () => setActiveAssetIndex(prev => Math.max(0, prev - 1))
  const handleNextAsset = () => setActiveAssetIndex(prev => Math.min(assets.length - 1, prev + 1))

  const decreaseQty = () => setQuantity(prev => Math.max(1, prev - 1))
  const increaseQty = () => setQuantity(prev => Math.min(maxQty, prev + 1))

  const handleLike = async () => {
    if (!artwork || isLiking) return
    setIsLiking(true)
    const wasLiked = isLiked
    // Optimistic update
    setIsLiked(!wasLiked)
    setLikeCount(prev => wasLiked ? prev - 1 : prev + 1)
    try {
      if (wasLiked) {
        await artworkService.unlike(artwork.id)
      } else {
        await artworkService.like(artwork.id)
      }
    } catch (err) {
      // Roll back on failure
      setIsLiked(wasLiked)
      setLikeCount(prev => wasLiked ? prev + 1 : prev - 1)
    } finally {
      setIsLiking(false)
    }
  }

  const handleFollow = async () => {
    if (!artwork?.creator?.id || isFollowLoading) return
    setIsFollowLoading(true)
    const wasFollowing = isFollowing
    setIsFollowing(!wasFollowing)
    try {
      if (wasFollowing) {
        await followService.unfollow(artwork.creator.id)
      } else {
        await followService.follow(artwork.creator.id)
      }
    } catch (err) {
      // Backend endpoint may not exist yet — keep optimistic state for now
      // but roll back if you'd rather fail loudly:
      // setIsFollowing(wasFollowing)
    } finally {
      setIsFollowLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!artwork || isAddingToCart) return

    if (artwork.has_variants && !selectedVariantOptionId) {
      setCartError('Please select a type before adding to cart.')
      return
    }

    setIsAddingToCart(true)
    setCartError(null)
    try {
      await addItem({
        artwork_id: artwork.id,
        quantity,
        ...(selectedVariantOptionId ? { variant_option_id: selectedVariantOptionId } : {}),
      })
    } catch (err: any) {
      setCartError(err?.message ?? 'Could not add to cart.')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const shareUrl = artwork ? `${typeof window !== 'undefined' ? window.location.origin : ''}/marketplace/${artwork.slug}` : ''

  const handleShare = (platform: 'whatsapp' | 'copy' | 'dribbble') => {
    if (platform === 'copy') {
      navigator.clipboard.writeText(shareUrl)
    } else if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareUrl)}`, '_blank')
    } else if (platform === 'dribbble') {
      window.open(`https://dribbble.com/shots/new?url=${encodeURIComponent(shareUrl)}`, '_blank')
    }
    setShareOpen(false)
  }

 
  return (
    <div className="fixed inset-0 z-50 flex w-full h-full items-center justify-center bg-black/40 p-4">
        <div className="relative flex overflow-hidden rounded-2xl bg-white" style={{ width: '80%', height: '90%' }}>

            {/* Global pagination arrows */}
            {/* {onNavigate && (
            <>
                <button
                onClick={() => onNavigate('prev')}
                aria-label="Previous artwork"
                className="absolute left-4 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-gray-50 bg-white text-gray-600 shadow-[0_5px_15px_rgba(0,0,0,0.1)] transition-transform hover:scale-105"
                >
                <ChevronLeft size={24} />
                </button>
                <button
                onClick={() => onNavigate('next')}
                aria-label="Next artwork"
                className="absolute right-4 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-gray-50 bg-white text-gray-600 shadow-[0_5px_15px_rgba(0,0,0,0.1)] transition-transform hover:scale-105"
                >
                <ChevronRight size={24} />
                </button>
            </>
            )} */}

            {/* ================= LEFT COLUMN: IMAGES ================= */}
            <div className="flex w-2/3 h-full overflow-y-auto flex-col">

                {/* Main Display Area */}
                <div className="relative flex h-3/5 flex-1 items-center justify-center overflow-hidden bg-secondary-100">
                    {/* <div className="absolute left-0 right-0 top-1/2 z-20 flex -translate-y-1/2 items-center justify-between mx-4">
                    <button
                        onClick={handlePrevAsset}
                        disabled={activeAssetIndex === 0 || assets.length === 0}
                        className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-gray-50 bg-white text-gray-600 transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={handleNextAsset}
                        disabled={activeAssetIndex === assets.length - 1 || assets.length === 0}
                        className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-primary-500 text-white transition-colors hover:bg-primary-600 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ChevronRight size={20} strokeWidth={3} />
                    </button>
                    </div> */}

                    <div className="relative h-full w-full">
                        {mainImageSrc ? (
                            <Image
                                src={mainImageSrc}
                                alt={displayTitle}
                                fill
                                className="object-cover object-center"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center font-poppins text-gray-400">
                                No image available
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Carousel */}
                {assets.length > 1 && (
                    <div className="relative flex h-2/5 items-center justify-center gap-6 bg-gray-50 px-20 py-6">
                    <button
                        onClick={handlePrevAsset}
                        disabled={activeAssetIndex === 0}
                        className="absolute left-8 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-white shadow-md transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ChevronLeft size={20} strokeWidth={3} />
                    </button>

                    {assets.map((asset, idx) => {
                        const thumbSrc = asset.optimized_url || asset.original_url
                        const isActive = idx === activeAssetIndex
                        return (
                        <button
                            key={asset.id}
                            onClick={() => setActiveAssetIndex(idx)}
                            className={`relative h-[220px] w-[180px] shrink-0 overflow-hidden rounded-[24px] bg-secondary-100 transition-transform hover:-translate-y-2 ${isActive ? 'ring-2 ring-primary-500' : ''}`}
                        >
                            <Image
                            src={thumbSrc}
                            alt={`Asset ${idx + 1}`}
                            fill
                            className="object-contain p-2"
                            />
                        </button>
                        )
                    })}

                    <button
                        onClick={handleNextAsset}
                        disabled={activeAssetIndex === assets.length - 1}
                        className="absolute right-8 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-white shadow-md transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ChevronRight size={20} strokeWidth={3} />
                    </button>
                    </div>
                )}
            </div>

            {/* ================= RIGHT COLUMN: DETAILS ================= */}
            <div className="relative flex w-1/3 flex-col overflow-y-auto px-6 py-8">

                {/* Close button */}
                <button
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute right-6 top-8 flex h-10 w-10 p-2 items-center justify-center rounded-full border-2 border-gray-50 transition-colors hover:bg-gray-50 cursor-pointer"
                >
                    <Image src='/icons/cancel.svg' width={20} height={20} alt='cancel icon' />
                </button>

                {/* Profile Header */}
                <div className="mb-6 flex items-center gap-2 pr-8">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-gray-100">
                        <Image
                            src={artwork.creator?.profile?.avatar_url || '/images/image-avatar.svg'}
                            alt={artwork.creator?.username ?? 'Creator'}
                            fill
                            className="object-cover"
                        />
                    </div>

                    <div className="flex flex-col min-w-0">
                        <span className="truncate font-poppins font-medium text-body-m leading-6 text-primary-500 tracking-wide">
                            {artwork.creator?.profile?.display_name || artwork.creator?.username || 'Unknown Artist'}
                        </span>
                        <span className="truncate font-poppins font-light text-body-xs leading-4 tracking-wide text-body">
                            {artwork.categories[0]?.toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Like / Follow */}
                <div className="mb-6 flex gap-3">
                    <button
                        onClick={handleLike}
                        disabled={isLiking}
                        className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full p-3 font-poppins text-body-s font-medium transition-colors disabled:opacity-60 ${
                            isLiked
                            ? 'bg-primary-500 text-white hover:bg-primary-600'
                            : 'bg-primary-500 text-white hover:bg-primary-600'
                        }`}
                    >
                        <Heart size={20} fill='#fff' />
                        Like
                    </button>

                    <button
                        onClick={handleFollow}
                        disabled={isFollowLoading}
                        className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border p-3 font-poppins text-[15px] font-semibold transition-colors disabled:opacity-60 ${
                            isFollowing
                            ? 'border-primary-500 bg-primary-50 text-primary-500'
                            : 'border-primary-500 text-primary-500 hover:bg-primary-50'
                        }`}
                    >
                        {isFollowing ? <Check size={20} /> : <UserPlus size={20} />}
                        {isFollowing ? 'Following' : 'Follow'}
                    </button>
                </div>

                {/* Artwork Info */}
                <div className="mb-4 flex flex-col items-start gap-y-2 border-t border-gray-50 pt-4 text-center">
                    <h4 className="font-poppins font-medium text-body-m leading-6 tracking-wide text-heading">
                        {displayTitle}
                    </h4>
                    <span className="font-poppins font-light text-body-xs leading-4 tracking-wide text-info-500">
                        {displayFormat}
                    </span>
                    <span className="font-poppins font-light text-body-xs leading-4 tracking-wide text-text-disabled">
                        Published: {formatDate(artwork.created_at)}
                    </span>

                    {/* Stats */}
                    {artwork.show_engagement_stats !== false && (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Heart size={24} className="text-primary-500" fill="currentColor" />
                                <span className="font-poppins text-body-s leading-6 tracking-wide text-body">
                                    {formatCount(likeCount)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Image src='/icons/eye-red.svg' width={24} height={24} alt='eye icon' />
                                <span className="font-poppins text-body-s leading-6 tracking-wide text-body">
                                    {formatCount(artwork.view_count)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Image src='/icons/chat-round-red.svg' width={24} height={24} alt='chat icon'  />
                                <span className="font-poppins text-body-s leading-6 tracking-wide text-body">
                                    {formatCount(artwork.comment_count)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Purchasing Details */}
                <div className="flex flex-col gap-y-2 pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-x-2">
                        <Globe size={14} className='text-body' />
                        <p className={`font-poppins font-light text-body-xs leading-4 tracking-wide ${isAvailableInRegion ? 'text-info-500' : 'text-gray-400'}`}>
                            {isAvailableInRegion ? 'Available in your Region' : 'This artwork is not available in your region'}
                        </p>
                    </div>

                    {artwork.artwork_format === 'PHYSICAL' && availableQty != null && (
                        <div className="font-poppins font-light text-body-xs leading-4 tracking-wide text-body">
                            Available quantity: <span className="ml-2 text-primary-500">{availableQty}</span>
                        </div>
                    )}

                    <div className="font-poppins font-medium text-body-m leading-6 tracking-wide text-body">
                        Price: <span className="ml-2 text-primary-500">{price}</span>
                    </div>
                </div>

               {/* Form Controls */}
                <div className="mt-4 flex flex-col gap-5">
                    {/* Variant select */}
                    {artwork.has_variants && variants.length > 0 && (
                        <Dropdown 
                            options={variants.map((variant) => ({
                                id: variant.id,
                                label: variant.name,
                                originalVariant: variant 
                            }))}
                            onChange={(selectedOption) => {
                                console.log("Selected:", selectedOption);
                                setSelectedVariantOptionId(selectedOption.id.toString()); // You likely want this here eventually
                            }}
                        />
                    )}
                    
                    {/* Quantity adjuster */}
                    {artwork.artwork_format === 'PHYSICAL' && (
                        <div className="mt-1 flex items-center justify-between">
                            <div className="flex w-[150px] items-center justify-between rounded-full border-2 border-gray-100 px-1 py-1">
                                <button
                                    onClick={decreaseQty}
                                    className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800"
                                >
                                    <ChevronLeft size={18} strokeWidth={3} />
                                </button>
                                <span className="w-8 text-center text-lg font-bold text-primary-500">
                                    {quantity.toString().padStart(2, '0')}
                                </span>
                                <button
                                    onClick={increaseQty}
                                    className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800"
                                >
                                    <ChevronRight size={18} strokeWidth={3} />
                                </button>
                            </div>

                            <div className="flex items-center gap-1.5 text-[14px] font-semibold text-gray-400">
                                Max Qty <span className="text-primary-500">( {maxQty} )</span>
                            </div>
                        </div>
                    )}

                    {/* Add to Cart */}
                    <button
                        onClick={handleAddToCart}
                        disabled={isAddingToCart}
                        className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary-500 py-4 text-[16px] font-bold text-white transition-colors hover:bg-primary-600 disabled:opacity-60"
                    >
                        <ShoppingCart size={20} strokeWidth={2.5} />
                        {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                    </button>

                    {cartError && (
                        <p className="text-center font-poppins text-[13px] text-red-500">{cartError}</p>
                    )}
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Footer Icons */}
                <div className="relative mt-8 flex items-center gap-4">
                    <button
                    aria-label="Add to moodboard"
                    className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#F3F4F6] text-[#9CA3AF] transition-colors hover:bg-gray-200 hover:text-gray-600"
                    >
                    <FolderPlus size={20} strokeWidth={2.5} />
                    </button>

                    <div className="relative">
                    <button
                        onClick={() => setShareOpen((v) => !v)}
                        aria-label="Share"
                        className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#F3F4F6] text-[#9CA3AF] transition-colors hover:bg-gray-200 hover:text-gray-600"
                    >
                        <Share2 size={20} strokeWidth={2.5} />
                    </button>

                    {shareOpen && (
                        <div className="absolute bottom-full left-0 mb-2 w-[180px] rounded-[16px] border border-gray-100 bg-white p-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                        <button
                            onClick={() => handleShare('whatsapp')}
                            className="flex w-full items-center rounded-[10px] px-3 py-2 text-left font-poppins text-[14px] text-gray-700 hover:bg-gray-50"
                        >
                            WhatsApp
                        </button>
                        <button
                            onClick={() => handleShare('copy')}
                            className="flex w-full items-center rounded-[10px] px-3 py-2 text-left font-poppins text-[14px] text-gray-700 hover:bg-gray-50"
                        >
                            Copy link
                        </button>
                        <button
                            onClick={() => handleShare('dribbble')}
                            className="flex w-full items-center rounded-[10px] px-3 py-2 text-left font-poppins text-[14px] text-gray-700 hover:bg-gray-50"
                        >
                            Dribbble
                        </button>
                        </div>
                    )}
                    </div>

                    <button
                    aria-label="Flag artwork"
                    className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#F3F4F6] text-[#9CA3AF] transition-colors hover:bg-gray-200 hover:text-gray-600"
                    >
                    <Flag size={20} strokeWidth={2.5} />
                    </button>
                </div>
            </div>
        </div>
    </div>
  )
}