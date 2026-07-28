'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Globe,
  ShoppingCart,
  FolderPlus,
  Share2,
  Flag,
  UserPlus,
  Check,
  MoreHorizontal,
} from 'lucide-react'
import { artworkService } from '@/services/artwork.service'
import { followService } from '@/services/follow.service'
import { useCartStore } from '@/store/cart.store'
import { cn } from '@/lib/utils'
import type { Artwork, ArtworkAsset, Variant } from '@/types/artwork'
import { Dropdown } from '@/components/ui/dropdown'
import { ArtworkCreatorWorks } from './artwork-creator-works'
import { ArtworkComments } from '../shop/artwork-comments'
import Link from 'next/link'

// ── Formatting ────────────────────────────────────────────────────────────────
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

export default function ArtworkViewOverlay({ artwork: artworkProp, onClose, onNavigate }: ArtworkViewOverlayProps) {
  // Clicking a related work in "Also by" / "For sale by" swaps the displayed
  // artwork in place, without needing a navigation-index prop threaded through
  // every parent (TopPicks, TopArt, ResultsGrid, ArtGrid). Resets whenever the
  // parent actually navigates prev/next (see the artworkProp.id effect below).
  const [viewOverride, setViewOverride] = useState<Artwork | null>(null)
  const artwork = viewOverride ?? artworkProp

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

  // Pinterest/Behance-style docking: opens as a centered floating card,
  // then the first scroll/wheel/touch gesture — even over the backdrop —
  // permanently docks it to full viewport height and reveals everything
  // below the fold.
  const [isDocked, setIsDocked] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const { addItem } = useCartStore()
  const backdropRef = useRef<HTMLDivElement>(null)
  const thumbStripRef = useRef<HTMLDivElement>(null)
  const activeThumbRef = useRef<HTMLButtonElement>(null)

  // Reset per-artwork UI state when navigating prev/next so stale state
  // (liked, quantity, selected variant) from the previous artwork doesn't leak.
  // Parent navigated prev/next → cancel any in-modal drill-in.
  useEffect(() => {
    setViewOverride(null)
  }, [artworkProp.id])

  // Whichever artwork ends up displayed (parent nav or in-modal drill-in),
  // reset the per-artwork UI state so nothing leaks from the previous piece.
  useEffect(() => {
    setActiveAssetIndex(0)
    setQuantity(1)
    setSelectedVariantOptionId(null)
    setIsLiked(artwork.is_liked ?? false)
    setLikeCount(artwork.like_count ?? 0)
    setIsFollowing(artwork.creator?.is_following ?? false)
    setCartError(null)
    backdropRef.current?.scrollTo({ top: 0, behavior: 'auto' })
  }, [artwork.id])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [])

  // Keep the active thumbnail visible when navigating assets — the strip can
  // hold more items than fit in the viewport, so this scrolls it into view
  // instead of leaving the selection off-screen.
  useEffect(() => {
    activeThumbRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [activeAssetIndex])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose()
      if (e.key === 'ArrowLeft' && onNavigate) onNavigate('prev')
      if (e.key === 'ArrowRight' && onNavigate) onNavigate('next')
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onNavigate])

  // ── Derived data ─────────────────────────────────────────────────────────
  const assets: ArtworkAsset[] = artwork.assets ?? []
  const activeAsset = assets[activeAssetIndex]
  const mainImageSrc = activeAsset?.optimized_url || activeAsset?.original_url || null

  const displayTitle = artwork.title
  const displayFormat = artwork.artwork_format === 'PHYSICAL' ? 'Physical Artwork' : 'Digital Artwork'
  const currencySymbol = artwork.currency === 'USD' ? '$' : (artwork.currency ?? '$')
  const price = artwork.price != null ? `${currencySymbol}${artwork.price.toLocaleString('en-US')}` : '—'
  const availableQty = artwork.physical_details?.available_quantity
  const maxQty = artwork.max_purchase_quantity ?? 1
  const variants: Variant[] = artwork.variants ?? []
  const isAvailableInRegion = true // TODO: wire to real region availability check once that exists
  const creatorName = artwork.creator?.profile?.display_name || artwork.creator?.username || 'Unknown Artist'
  const tags = artwork.keywords ?? []

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handlePrevAsset = () => setActiveAssetIndex((prev) => Math.max(0, prev - 1))
  const handleNextAsset = () => setActiveAssetIndex((prev) => Math.min(assets.length - 1, prev + 1))

  const decreaseQty = () => setQuantity((prev) => Math.max(1, prev - 1))
  const increaseQty = () => setQuantity((prev) => Math.min(maxQty, prev + 1))

  const handleLike = async () => {
    if (isLiking) return
    setIsLiking(true)
    const wasLiked = isLiked
    setIsLiked(!wasLiked)
    setLikeCount((prev) => (wasLiked ? prev - 1 : prev + 1))
    try {
      if (wasLiked) await artworkService.unlike(artwork.id)
      else await artworkService.like(artwork.id)
    } catch {
      setIsLiked(wasLiked)
      setLikeCount((prev) => (wasLiked ? prev + 1 : prev - 1))
    } finally {
      setIsLiking(false)
    }
  }

  const handleFollow = async () => {
    if (!artwork.creator?.id || isFollowLoading) return
    setIsFollowLoading(true)
    const wasFollowing = isFollowing
    setIsFollowing(!wasFollowing)
    try {
      await followService.toggle(artwork.creator.id)
    } catch {
      setIsFollowing(wasFollowing)
    } finally {
      setIsFollowLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (isAddingToCart) return
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

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/marketplace/${artwork.slug}`

  const handleShare = (platform: 'whatsapp' | 'copy' | 'dribbble') => {
    if (platform === 'copy') navigator.clipboard.writeText(shareUrl)
    else if (platform === 'whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(shareUrl)}`, '_blank')
    else if (platform === 'dribbble') window.open(`https://dribbble.com/shots/new?url=${encodeURIComponent(shareUrl)}`, '_blank')
    setShareOpen(false)
  }

  const dockOnScrollIntent = () => {
    if (!isDocked) setIsDocked(true)
  }

  const requestClose = () => {
    setIsClosing(true)
  }

  // ── Sub-renders (shared between the desktop sticky panel and the mobile
  //    inline placement, so the two layouts never drift out of sync) ───────

  const profileHeader = (
    <div className="flex items-center gap-2">
      <Link href={`/profile/${artwork.creator_id}`} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-gray-100">
        <Image
          src={artwork.creator?.profile?.avatar_url || '/images/image-avatar.svg'}
          alt={artwork.creator?.username ?? 'Creator'}
          fill
          className="object-cover"
        />
      </Link>
      <div className="flex min-w-0 flex-col">
        <Link href={`/profile/${artwork.creator_id}`} className="truncate font-poppins font-medium text-body-m leading-6 text-primary-500 tracking-wide">
          {creatorName}
        </Link>
        <span className="truncate font-poppins font-light text-body-xs leading-4 tracking-wide text-body">
          {artwork.categories[0]?.toUpperCase()}
        </span>
      </div>
    </div>
  )

  const likeFollowRow = (
    <div className="flex gap-3">
      <button
        onClick={handleLike}
        disabled={isLiking}
        className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-primary-500 p-3 font-poppins text-body-s font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-60"
      >
        <Heart size={20} fill="#fff" />
        Like
      </button>
      <button
        onClick={handleFollow}
        disabled={isFollowLoading}
        className={cn(
          'flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border p-3 font-poppins text-[15px] font-semibold transition-colors disabled:opacity-60',
          isFollowing ? 'border-primary-500 bg-primary-50 text-primary-500' : 'border-primary-500 text-primary-500 hover:bg-primary-50'
        )}
      >
        {isFollowing ? <Check size={20} /> : <UserPlus size={20} />}
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  )

  const artworkInfoStats = (
    <div className="flex flex-col items-start gap-y-2 border-t border-gray-50 pt-4">
      <h4 className="font-poppins font-medium text-body-m leading-6 tracking-wide text-heading">{displayTitle}</h4>
      <span className="font-poppins font-light text-body-xs leading-4 tracking-wide text-info-500">{displayFormat}</span>
      <span className="font-poppins font-light text-body-xs leading-4 tracking-wide text-text-disabled">
        Published: {formatDate(artwork.created_at)}
      </span>

      {artwork.show_engagement_stats !== false && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Heart size={24} className="text-primary-500" fill="currentColor" />
            <span className="font-poppins text-body-s leading-6 tracking-wide text-body">{formatCount(likeCount)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Image src="/icons/eye-red.svg" width={24} height={24} alt="views" />
            <span className="font-poppins text-body-s leading-6 tracking-wide text-body">{formatCount(artwork.view_count)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Image src="/icons/chat-round-red.svg" width={24} height={24} alt="comments" />
            <span className="font-poppins text-body-s leading-6 tracking-wide text-body">{formatCount(artwork.comment_count)}</span>
          </div>
        </div>
      )}
    </div>
  )

  const isForSale = artwork.listing_type === 'MARKETPLACE'

  const purchasingDetails = (
    <div className="flex flex-col gap-y-2 border-t border-gray-50 pt-4">
      <div className="flex items-center gap-x-2">
        <Globe size={14} className="text-body" />
        <p className={cn('font-poppins font-light text-body-xs leading-4 tracking-wide', isAvailableInRegion ? 'text-info-500' : 'text-gray-400')}>
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
  )

  const formControls = (
    <div className="mt-4 flex flex-col gap-5">
      {artwork.has_variants && variants.length > 0 && (
        <Dropdown
          options={variants.map((variant) => ({ id: variant.id, label: variant.name }))}
          placeholder="Select type"
          onChange={(selectedOption) => setSelectedVariantOptionId(String(selectedOption.id))}
        />
      )}

      {artwork.artwork_format === 'PHYSICAL' && (
        <div className="flex items-center justify-between">
          <div className="flex w-[150px] items-center justify-between rounded-full border-2 border-gray-100 px-1 py-1">
            <button onClick={decreaseQty} className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800">
              <ChevronLeft size={18} strokeWidth={3} />
            </button>
            <span className="w-8 text-center text-lg font-bold text-primary-500">{quantity.toString().padStart(2, '0')}</span>
            <button onClick={increaseQty} className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800">
              <ChevronRight size={18} strokeWidth={3} />
            </button>
          </div>
          <div className="flex items-center gap-1.5 text-[14px] font-semibold text-gray-400">
            Max Qty <span className="text-primary-500">( {maxQty} )</span>
          </div>
        </div>
      )}

      <button
        onClick={handleAddToCart}
        disabled={isAddingToCart}
        className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary-500 py-4 text-[16px] font-bold text-white transition-colors hover:bg-primary-600 disabled:opacity-60"
      >
        <ShoppingCart size={20} strokeWidth={2.5} />
        {isAddingToCart ? 'Adding...' : 'Add to Cart'}
      </button>

      {cartError && <p className="text-center font-poppins text-[13px] text-red-500">{cartError}</p>}
    </div>
  )

  // Folder/share/flag row — kept as functional placeholders. Share already
  // works (copy link / WhatsApp / Dribbble); folder (save-to-collection) and
  // flag (report) are stubbed pending the dedicated modals you're building.
  const footerIcons = (
    <div className="relative flex items-center gap-4">
      <button
        aria-label="Save to collection"
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
            <button onClick={() => handleShare('whatsapp')} className="flex w-full items-center rounded-[10px] px-3 py-2 text-left font-poppins text-[14px] text-gray-700 hover:bg-gray-50">WhatsApp</button>
            <button onClick={() => handleShare('copy')} className="flex w-full items-center rounded-[10px] px-3 py-2 text-left font-poppins text-[14px] text-gray-700 hover:bg-gray-50">Copy link</button>
            <button onClick={() => handleShare('dribbble')} className="flex w-full items-center rounded-[10px] px-3 py-2 text-left font-poppins text-[14px] text-gray-700 hover:bg-gray-50">Dribbble</button>
          </div>
        )}
      </div>

      <button
        aria-label="Report artwork"
        className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#F3F4F6] text-[#9CA3AF] transition-colors hover:bg-gray-200 hover:text-gray-600"
      >
        <Flag size={20} strokeWidth={2.5} />
      </button>
    </div>
  )

  // Platform share row — same icon set and `href="#"` placeholder convention
  // used in digital-art-preview.tsx / footer.tsx; not wired to real per-artist
  // social URLs since that field doesn't exist on the artwork/creator contract yet.
  const socialLinks = (
    <div className="flex items-center gap-5">
      <a href="#" aria-label="Instagram" className="opacity-60 transition-opacity hover:opacity-100">
        <Image src="/socials/instagram-grey.svg" width={22} height={22} alt="Instagram" />
      </a>
      <a href="#" aria-label="Facebook" className="opacity-60 transition-opacity hover:opacity-100">
        <Image src="/socials/facebook-grey.svg" width={22} height={22} alt="Facebook" />
      </a>
      <a href="#" aria-label="LinkedIn" className="opacity-60 transition-opacity hover:opacity-100">
        <Image src="/socials/linkedin.svg" width={22} height={22} alt="LinkedIn" className="grayscale" />
      </a>
      <a href="#" aria-label="Twitter" className="opacity-60 transition-opacity hover:opacity-100">
        <Image src="/socials/twitter-grey.svg" width={22} height={22} alt="Twitter" />
      </a>
    </div>
  )

  const descriptionSection = (
    <div className="py-6">
      <h3 className="mb-4 font-poppins text-[22px] font-semibold text-gray-800">Description</h3>
      <p className="whitespace-pre-line font-poppins text-[14px] leading-6 text-gray-500">{artwork.description}</p>
      {artwork.creator && (
        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          <div className="relative h-16 w-16 overflow-hidden rounded-full bg-gray-100">
            <Image src={artwork.creator.profile?.avatar_url || '/images/image-avatar.svg'} alt={creatorName} fill className="object-cover" />
          </div>
          <span className="font-poppins text-[15px] text-gray-800">{creatorName}</span>
        </div>
      )}
    </div>
  )

  const categoriesTagsLicense = (
    <div className="flex flex-col gap-6">
      {artwork.categories.length > 0 && (
        <div>
          <h4 className="mb-3 font-poppins text-[15px] font-semibold text-gray-800">Categories</h4>
          <div className="flex flex-wrap gap-2">
            {artwork.categories.map((category) => (
              <span key={category} className="rounded-full border border-primary-500 px-4 py-1.5 font-poppins text-[13px] text-primary-500">
                {category}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="mb-3 font-poppins text-[15px] font-semibold text-gray-800">Tags</h4>
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-x-2 gap-y-1 font-poppins text-[13px] text-gray-500">
            {tags.map((tag) => <span key={tag}>#{tag}</span>)}
          </div>
        ) : (
          <p className="font-poppins text-[13px] text-gray-300">No tags added yet</p>
        )}
      </div>

      <div>
        <h4 className="mb-3 flex items-center gap-2 font-poppins text-[15px] font-semibold text-gray-800">
          License
          <span
            title="How others may reuse this work"
            className="flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-info-100 text-[10px] font-bold text-info-500"
          >
            ?
          </span>
        </h4>
        <p className="font-poppins text-[13px] text-gray-500">
          License type: {artwork.license?.type ?? 'Attribution ShareAlike (CC BY-SA)'}
        </p>
        {!artwork.license && (
          <p className="mt-1 font-poppins text-[11px] text-gray-300">Placeholder — not yet set by the artist</p>
        )}
      </div>
    </div>
  )

  const heroMedia = (
    <div className="flex flex-col">
      <div className="relative flex h-[70vh] max-h-[640px] items-center justify-center overflow-hidden bg-secondary-100 lg:h-[60vh]">
        {mainImageSrc ? (
          activeAsset?.media_type === 'VIDEO' ? (
            <video
              key={mainImageSrc}
              src={mainImageSrc}
              poster={activeAsset.thumbnail_url ?? undefined}
              controls
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <Image src={mainImageSrc} alt={displayTitle} fill className="object-cover object-center" />
          )
        ) : (
          <div className="flex h-full w-full items-center justify-center font-poppins text-gray-400">No image available</div>
        )}
        {activeAsset?.media_type === 'VIDEO' && (
          <span className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm">
            <Image src="/icons/play-icon.svg" width={16} height={16} alt="Video" />
          </span>
        )}
      </div>

      {assets.length > 1 && (
        <div className="relative flex items-center gap-4 bg-gray-50 px-6 py-6 lg:gap-6 lg:px-20">
          <button
            onClick={handlePrevAsset}
            disabled={activeAssetIndex === 0}
            className="absolute left-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-white shadow-md transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50 lg:left-8 lg:h-10 lg:w-10"
          >
            <ChevronLeft size={20} strokeWidth={3} />
          </button>

          <div
            ref={thumbStripRef}
            className="flex w-full items-center gap-4 overflow-x-auto scroll-smooth px-10 scrollbar-hide lg:gap-6 lg:px-12"
          >
            {assets.map((asset, idx) => {
              const thumbSrc = asset.thumbnail_url || asset.optimized_url || asset.original_url
              const isActive = idx === activeAssetIndex
              const isVideo = asset.media_type === 'VIDEO'
              return (
                <button
                  key={asset.id}
                  ref={isActive ? activeThumbRef : undefined}
                  onClick={() => setActiveAssetIndex(idx)}
                  className={cn(
                    'relative h-[140px] w-[110px] shrink-0 overflow-hidden rounded-[18px] bg-secondary-100 transition-transform hover:-translate-y-1 lg:h-[220px] lg:w-[180px] lg:rounded-[24px] lg:hover:-translate-y-2',
                    isActive && 'ring-2 ring-primary-500'
                  )}
                >
                  <Image src={thumbSrc} alt={`Asset ${idx + 1}`} fill className="object-contain p-2" />
                  {isVideo && (
                    <span className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white">
                      <Image src="/icons/play-icon.svg" width={10} height={10} alt="Video" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <button
            onClick={handleNextAsset}
            disabled={activeAssetIndex === assets.length - 1}
            className="absolute right-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-white shadow-md transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50 lg:right-8 lg:h-10 lg:w-10"
          >
            <ChevronRight size={20} strokeWidth={3} />
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div
      ref={backdropRef}
      onWheel={dockOnScrollIntent}
      onTouchMove={dockOnScrollIntent}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/40"
    >
      {/* Global prev/next artwork arrows — fixed to the viewport so they stay
          reachable regardless of scroll position, not just before docking. */}
      {onNavigate && (
        <>
          <button
            onClick={() => onNavigate('prev')}
            aria-label="Previous artwork"
            className="fixed left-4 top-1/2 z-[60] hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-gray-50 bg-white text-gray-600 shadow-[0_5px_15px_rgba(0,0,0,0.1)] transition-transform hover:scale-105 lg:flex"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => onNavigate('next')}
            aria-label="Next artwork"
            className="fixed right-4 top-1/2 z-[60] hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-gray-50 bg-white text-gray-600 shadow-[0_5px_15px_rgba(0,0,0,0.1)] transition-transform hover:scale-105 lg:flex"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      <div className={cn('flex min-h-full flex-col items-stretch lg:flex-row lg:items-center lg:justify-center', !isDocked && 'lg:py-8')}>
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: isClosing ? '100%' : 0 }}
          transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          onAnimationComplete={() => { if (isClosing) onClose() }}
          className={cn(
            'relative flex min-h-screen w-full flex-col rounded-none bg-white shadow-2xl transition-[border-radius] duration-500 lg:flex-row lg:min-h-0',
            isDocked
              ? 'lg:min-h-screen lg:rounded-none lg:w-full'
              : 'lg:my-auto lg:max-h-[90vh] lg:w-[95%] lg:max-w-[1400px] lg:overflow-hidden lg:rounded-2xl lg:w-[80%]'
          )}
        >
          {/* Fixed mobile header — avatar/name for context while scrolling, options for
              share/report. Desktop uses the sticky right-panel profile header instead. */}
          <div className="fixed inset-x-0 top-0 z-[65] flex items-center justify-between border-b border-gray-100 bg-white/95 px-4 py-3 pr-16 backdrop-blur-sm lg:hidden">
            <Link href={`/profile/${artwork.creator_id}`} className="flex min-w-0 items-center gap-2">
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gray-100">
                <Image
                  src={artwork.creator?.profile?.avatar_url || '/images/image-avatar.svg'}
                  alt={creatorName}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="truncate font-poppins text-[14px] font-medium text-gray-800">
                {artwork.creator?.username ?? creatorName}
              </span>
            </Link>
            <button
              onClick={() => setShareOpen((v) => !v)}
              aria-label="More options"
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-50"
            >
              <MoreHorizontal size={20} strokeWidth={2.5} />
            </button>
          </div>

          {/* Close button */}
          <button
            onClick={requestClose}
            aria-label="Close"
            className="fixed cursor-pointer right-4 top-3 z-[70] flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-50 bg-white transition-colors hover:bg-gray-50 lg:absolute lg:right-6 lg:top-8"
          >
            <Image src="/icons/cancel.svg" width={20} height={20} alt="close" />
          </button>

          {/* ================= LEFT: everything scrollable ================= */}
          <div className="flex flex-col pt-14 lg:w-2/3 lg:pt-0">
            {heroMedia}

            <div className="px-5 pb-20 lg:px-8 lg:pb-0">
              {/* Mobile-only: Description, then price/cart, then profile — matches the mobile mockup order */}
              <div className="lg:hidden">
                {descriptionSection}
                {isForSale && (
                  <div className="border-t border-gray-50 py-6">
                    {purchasingDetails}
                    {formControls}
                  </div>
                )}
                <div className="flex flex-col items-center gap-4 border-t border-gray-50 py-6">
                  {profileHeader}
                  <div className="w-full">{likeFollowRow}</div>
                  {artwork.show_engagement_stats !== false && (
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-2 font-poppins text-body-s text-body">
                        <Heart size={20} className="text-primary-500" fill="currentColor" /> {formatCount(likeCount)}
                      </span>
                      <span className="flex items-center gap-2 font-poppins text-body-s text-body">
                        <Image src="/icons/eye-red.svg" width={20} height={20} alt="views" /> {formatCount(artwork.view_count)}
                      </span>
                      <span className="flex items-center gap-2 font-poppins text-body-s text-body">
                        <Image src="/icons/chat-round-red.svg" width={20} height={20} alt="comments" /> {formatCount(artwork.comment_count)}
                      </span>
                    </div>
                  )}
                  {socialLinks}
                </div>
              </div>

              {/* Desktop-only: Description lives in the main column here */}
              <div className="hidden lg:block">{descriptionSection}</div>

              {artwork.creator?.id && (
                <>
                  <ArtworkCreatorWorks
                    title="Also by "
                    creatorId={artwork.creator.id}
                    creatorName={creatorName}
                    excludeArtworkId={artwork.id}
                    scope="all"
                    onSelectArtwork={(work) => setViewOverride(work)}
                  />
                  <ArtworkCreatorWorks
                    title="For sale by "
                    creatorId={artwork.creator.id}
                    creatorName={creatorName}
                    excludeArtworkId={artwork.id}
                    scope="marketplace"
                    onSelectArtwork={(work) => setViewOverride(work)}
                  />
                </>
              )}

              <div className="grid grid-cols-1 gap-8 border-t border-gray-50 py-6 lg:grid-cols-[1fr_240px]">
                <ArtworkComments artworkId={artwork.id} />
                {categoriesTagsLicense}
              </div>
            </div>
          </div>

          {/* ================= RIGHT: sticky details panel (desktop only) === */}
          <div className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-1/3 lg:flex-col lg:overflow-y-auto lg:px-6 lg:py-8">
            <div className="mb-6 pr-8">{profileHeader}</div>
            <div className="mb-6">{likeFollowRow}</div>
            <div className="mb-4">{artworkInfoStats}</div>
            {isForSale && (
              <>
                <div className="mt-2">{purchasingDetails}</div>
                {formControls}
              </>
            )}
            <div className="flex-1" />
            <div className="mt-8 flex flex-col gap-6">
              {footerIcons}
              {socialLinks}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mobile-only fixed action bar */}
      <div className="fixed inset-x-0 bottom-0 z-[65] flex items-center justify-around border-t border-gray-100 bg-white px-4 py-3 lg:hidden">
        {footerIcons}
        <button
          aria-label="More options"
          className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#F3F4F6] text-[#9CA3AF]"
        >
          <MoreHorizontal size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}
