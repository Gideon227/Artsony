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
import { useToast } from '@/components/ui/toaster'
import { useViewArtwork } from '@/hooks/use-artwork'
import { cn } from '@/lib/utils'
import type { Artwork, ArtworkAsset, Variant } from '@/types/artwork'
import { Dropdown } from '@/components/ui/dropdown'
import { SaveToMoodboardDialog } from '@/features/moodboards/components/save-to-moodboard-dialog'
import { ArtworkCreatorWorks } from './artwork-creator-works'
import { ArtworkComments } from '../shop/artwork-comments'
import Link from 'next/link'
import { ShareModal } from '../../modals/share-modal'
import ReportModal from '../../modals/report-modal'

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
  onSwapArtwork?: (artwork: Artwork) => void
}

export default function ArtworkViewOverlay({ artwork: artworkProp, onClose, onNavigate, onSwapArtwork }: ArtworkViewOverlayProps) {
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
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)

  // Fixed-size centered dialog on desktop (90% viewport width, 90vh tall) —
  // the left and right columns each scroll independently inside it. Mobile
  // stays a genuine full-screen page that scrolls as a whole (see the
  // backdrop's overflow-y-auto below).
  const [isClosing, setIsClosing] = useState(false)

  const { addItem } = useCartStore()
  const { success: toastSuccess, error: toastError } = useToast()
  const backdropRef = useRef<HTMLDivElement>(null)
  const { mutate: trackView } = useViewArtwork()
  const leftColRef = useRef<HTMLDivElement>(null)
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
    leftColRef.current?.scrollTo({ top: 0, behavior: 'auto' })
  }, [artwork.id])

  // Same reasoning as the shop overlay: this component gets `artwork` as a
  // prop from an already-loaded feed query, so GET /:id (and its automatic
  // view-tracking side effect) never runs. Record the view explicitly.
  useEffect(() => {
    trackView(artwork.id)
  }, [artwork.id, trackView])

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
  const categories = artwork.categories ?? []
  const isForSale = artwork.listing_type === 'MARKETPLACE'

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handlePrevAsset = () => setActiveAssetIndex((prev) => Math.max(0, prev - 1))
  const handleNextAsset = () => setActiveAssetIndex((prev) => Math.min(assets.length - 1, prev + 1))

  const decreaseQty = () => setQuantity((prev) => Math.max(1, prev - 1))
  const increaseQty = () => setQuantity((prev) => Math.min(maxQty, prev + 1))

  const handleLike = async () => {
    if (isLiking) return
    setIsLiking(true)
    const previousLiked = isLiked
    const previousCount = likeCount
    // Same reasoning as the shop overlay: the backend is a pure toggle, and
    // `previousLiked` is only a local guess that can be stale, so the flip
    // below is provisional and gets corrected from the server's actual
    // returned state.
    setIsLiked(!previousLiked)
    setLikeCount((prev) => (previousLiked ? prev - 1 : prev + 1))
    try {
      const { data } = await artworkService.toggleLike(artwork.id)
      setIsLiked(data.liked)
      setLikeCount(data.like_count)
    } catch {
      setIsLiked(previousLiked)
      setLikeCount(previousCount)
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
      toastSuccess('Added to cart', `${displayTitle} is in your cart.`)
      setQuantity(1)
    } catch (err: any) {
      const message = err?.message ?? 'Could not add to cart.'
      setCartError(message)
      toastError('Could not add to cart', message)
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
          {categories[0]}
        </span>
      </div>
    </div>
  )

  const likeFollowRow = (
    <div className={`flex gap-2 ${isForSale ? 'flex-row' : 'flex-col'}`}>
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
        {isFollowing ? <Check size={20} /> 
          : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="6" r="4" fill="#F25B38"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M16.5 22C14.8501 22 14.0251 22 13.5126 21.4874C13 20.9749 13 20.1499 13 18.5C13 16.8501 13 16.0251 13.5126 15.5126C14.0251 15 14.8501 15 16.5 15C18.1499 15 18.9749 15 19.4874 15.5126C20 16.0251 20 16.8501 20 18.5C20 20.1499 20 20.9749 19.4874 21.4874C18.9749 22 18.1499 22 16.5 22ZM17.0833 16.9444C17.0833 16.6223 16.8222 16.3611 16.5 16.3611C16.1778 16.3611 15.9167 16.6223 15.9167 16.9444V17.9167H14.9444C14.6223 17.9167 14.3611 18.1778 14.3611 18.5C14.3611 18.8222 14.6223 19.0833 14.9444 19.0833H15.9167V20.0556C15.9167 20.3777 16.1778 20.6389 16.5 20.6389C16.8222 20.6389 17.0833 20.3777 17.0833 20.0556V19.0833H18.0556C18.3777 19.0833 18.6389 18.8222 18.6389 18.5C18.6389 18.1778 18.3777 17.9167 18.0556 17.9167H17.0833V16.9444Z" fill="#F25B38"/>
              <path d="M15.6782 13.5028C15.2051 13.5085 14.7642 13.5258 14.3799 13.5774C13.737 13.6639 13.0334 13.8705 12.4519 14.4519C11.8705 15.0333 11.6639 15.737 11.5775 16.3799C11.4998 16.9576 11.4999 17.6635 11.5 18.414V18.586C11.4999 19.3365 11.4998 20.0424 11.5775 20.6201C11.6381 21.0712 11.7579 21.5522 12.0249 22C12.0166 22 12.0083 22 12 22C4 22 4 19.9853 4 17.5C4 15.0147 7.58172 13 12 13C13.3262 13 14.577 13.1815 15.6782 13.5028Z" fill="#F25B38"/>
            </svg>
        }
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  )

  const artworkInfoStats = (
    <div className="flex flex-col items-start gap-y-2 border-t border-gray-50 pt-4">
      <h4 className="font-poppins font-medium text-body-m leading-6 tracking-wide text-heading">{displayTitle}</h4>
      {isForSale && (
        <span className="font-poppins font-light text-body-xs leading-4 tracking-wide text-info-500">{displayFormat}</span>
      )}
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

  const purchasingDetails = (
    <div className="flex flex-col gap-y-2 border-t border-gray-50 pt-4">
      <div className="flex items-center gap-x-2">
        <Globe size={16} className="text-body" />
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
        Price: <span className="ml-2 text-primary-500">{Number(price) * quantity }</span>
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

  // Folder/share/flag row — folder opens the save-to-moodboard dialog, share
  // already works (copy link / WhatsApp / Dribbble); flag (report) is
  // stubbed pending the dedicated report modal.
  const footerIcons = (
    <div className="relative flex items-center gap-4">
      <button
        onClick={() => setSaveDialogOpen(true)}
        aria-label="Save to moodboard"
        className="flex cursor-pointer h-[46px] w-[46px] items-center justify-center rounded-full border-gray-50 border-2 transition-colors hover:bg-gray-100"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M2.06935 5.00839C2 5.37595 2 5.81722 2 6.69975V13.75C2 17.5212 2 19.4069 3.17157 20.5784C4.34315 21.75 6.22876 21.75 10 21.75H14C17.7712 21.75 19.6569 21.75 20.8284 20.5784C22 19.4069 22 17.5212 22 13.75V11.5479C22 8.91554 22 7.59935 21.2305 6.74383C21.1598 6.66514 21.0849 6.59024 21.0062 6.51946C20.1506 5.75 18.8345 5.75 16.2021 5.75H15.8284C14.6747 5.75 14.0979 5.75 13.5604 5.59678C13.2651 5.5126 12.9804 5.39471 12.7121 5.24543C12.2237 4.97367 11.8158 4.56578 11 3.75L10.4497 3.19975C10.1763 2.92633 10.0396 2.78961 9.89594 2.67051C9.27652 2.15704 8.51665 1.84229 7.71557 1.76738C7.52976 1.75 7.33642 1.75 6.94975 1.75C6.06722 1.75 5.62595 1.75 5.25839 1.81935C3.64031 2.12464 2.37464 3.39031 2.06935 5.00839ZM12 11C12.4142 11 12.75 11.3358 12.75 11.75V13H14C14.4142 13 14.75 13.3358 14.75 13.75C14.75 14.1642 14.4142 14.5 14 14.5H12.75V15.75C12.75 16.1642 12.4142 16.5 12 16.5C11.5858 16.5 11.25 16.1642 11.25 15.75V14.5H10C9.58579 14.5 9.25 14.1642 9.25 13.75C9.25 13.3358 9.58579 13 10 13H11.25V11.75C11.25 11.3358 11.5858 11 12 11Z" fill="#525965"/>
        </svg>
      </button>

      <div className="relative">
        <button
          onClick={() => {
            setShareOpen(true)
          }}
          aria-label="Share"
          className="flex cursor-pointer h-[46px] w-[46px] items-center justify-center rounded-full border-gray-50 border-2 transition-colors hover:bg-gray-100"
        >
          <svg width="17" height="20" viewBox="0 0 17 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M10.303 3.33333C10.303 1.49238 11.8022 0 13.6515 0C15.5008 0 17 1.49238 17 3.33333C17 5.17428 15.5008 6.66667 13.6515 6.66667C12.7177 6.66667 11.8738 6.28596 11.2671 5.67347L6.63167 8.82955C6.67452 9.04248 6.69697 9.26245 6.69697 9.48718C6.69697 9.93221 6.60904 10.3576 6.44959 10.7464L11.5323 14.0858C12.1092 13.6161 12.8473 13.3333 13.6515 13.3333C15.5008 13.3333 17 14.8257 17 16.6667C17 18.5076 15.5008 20 13.6515 20C11.8022 20 10.303 18.5076 10.303 16.6667C10.303 16.1845 10.4062 15.7255 10.5917 15.3111L5.55007 11.9987C4.96196 12.5098 4.1916 12.8205 3.34848 12.8205C1.49917 12.8205 0 11.3281 0 9.48718C0 7.64623 1.49917 6.15385 3.34848 6.15385C4.4119 6.15385 5.35853 6.64725 5.97145 7.41518L10.4639 4.35642C10.3594 4.03359 10.303 3.6896 10.303 3.33333Z" fill="#525965"/>
          </svg>
        </button>

        {shareOpen && <ShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)} />}

      </div>

      <button
        aria-label="Report artwork"
        onClick={() => setReportDialogOpen(true)}
        className="flex cursor-pointer h-[46px] w-[46px] items-center justify-center rounded-full border-gray-50 border-2 transition-colors hover:bg-gray-100"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.75 1C6.16421 1 6.5 1.33579 6.5 1.75V3.6L8.22067 3.25587C9.8712 2.92576 11.5821 3.08284 13.1449 3.70797L13.3486 3.78943C14.9097 4.41389 16.628 4.53051 18.2592 4.1227C19.0165 3.93339 19.75 4.50613 19.75 5.28669V12.6537C19.75 13.298 19.3115 13.8596 18.6864 14.0159L18.472 14.0695C16.7024 14.5119 14.8385 14.3854 13.1449 13.708C11.5821 13.0828 9.8712 12.9258 8.22067 13.2559L6.5 13.6V21.75C6.5 22.1642 6.16421 22.5 5.75 22.5C5.33579 22.5 5 22.1642 5 21.75V1.75C5 1.33579 5.33579 1 5.75 1Z" fill="#525965"/>
        </svg>
      </button>
    </div>
  )

  // Platform share row — same icon set and `href="#"` placeholder convention
  // used in digital-art-preview.tsx / footer.tsx; not wired to real per-artist
  // social URLs since that field doesn't exist on the artwork/creator contract yet.
  const socialLinks = (
    <div className="flex items-center gap-4">
      <a href="#" aria-label="Instagram" className="bg-[525965] transition-opacity hover:opacity-80">
        <Image src="/socials/instagram-grey.svg" width={32} height={32} alt="Instagram" />
      </a>
      <a href="#" aria-label="Facebook" className="bg-[525965] transition-opacity hover:opacity-80">
        <Image src="/socials/facebook-grey.svg" width={32} height={32} alt="Facebook" />
      </a>
      <a href="#" aria-label="LinkedIn" className="bg-[525965] transition-opacity hover:opacity-80">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C24.8366 0 32 7.16344 32 16C32 24.8366 24.8366 32 16 32C7.16344 32 0 24.8366 0 16C2.57703e-07 7.16344 7.16344 2.5772e-07 16 0ZM7.68066 24.1465H11.3066V13.252H7.68066V24.1465ZM20.209 12.9961C18.2841 12.9961 17.4217 14.0531 16.9404 14.7949V13.252H13.3145C13.3621 14.2717 13.3147 24.0982 13.3145 24.1465H16.9404V18.0625C16.9404 17.7369 16.9637 17.4118 17.0596 17.1787C17.3216 16.5283 17.9184 15.8547 18.9199 15.8545C20.2324 15.8545 20.7577 16.8536 20.7578 18.3174V24.1465H24.3838V17.8994C24.3836 14.5535 22.5948 12.9962 20.209 12.9961ZM9.51758 8C8.27741 8.00019 7.4668 8.81377 7.4668 9.88184C7.46682 10.9278 8.25354 11.7645 9.4707 11.7646H9.49414C10.7584 11.7646 11.5459 10.9279 11.5459 9.88184C11.5224 8.81364 10.758 8 9.51758 8Z" fill="#525965"/>
        </svg>
      </a>
      <a href="#" aria-label="Twitter" className="bg-[525965] transition-opacity hover:opacity-80">
        <Image src="/socials/twitter-grey.svg" width={32} height={32} alt="Twitter" />
      </a>
    </div>
  )

  const descriptionSection = (
    <div className="py-12">
      <h3 className="mb-5 font-raleway text-h3 font-semibold text-black">Description</h3>
      <p className="whitespace-pre-line font-poppins text-body-s leading-6 text-[#333333]">{artwork.description}</p>
      {artwork.creator && (
        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          {/* <div className="relative h-16 w-16 overflow-hidden rounded-full bg-gray-100">
            <Image src={artwork.creator.profile?.avatar_url || '/images/image-avatar.svg'} alt={creatorName} fill className="object-cover" />
          </div> */}
          <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
            <Image
              src="/home/profile-ring.svg"
              alt="Profile Ring"
              width={144}
              height={144}
              className="absolute object-contain"
              priority
            />
            
            {/* The actual User Avatar */}
            <div className="relative w-26 h-26 rounded-full overflow-hidden z-10 bg-gray-50">
              <Image
                src={artwork.creator.profile?.avatar_url || '/images/image-avatar.svg'}
                alt={artwork.creator?.username ? `${artwork.creator.username}'s profile` : 'User avatar'}
                width={104}
                height={104}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <span className="font-raleway text-h6 font-medium text-black tracking-wide">{creatorName}</span>
        </div>

      )}
    </div>
  )

  const categoriesTagsLicense = (
    <div className="flex flex-col justify-between h-full border border-border p-6 rounded-xl">
      <div className='flex flex-col gap-6'>
        {categories.length > 0 && (
          <div>
            <h4 className="mb-3 font-poppins text-[15px] font-semibold text-gray-800">Categories</h4>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
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
          License type: {artwork.license?.type ?? 'All rights reserved'}
        </p>
      </div>
    </div>
  )

  const heroMediaMarketplace = (
    <div className="flex flex-col">
      <div className="relative flex h-[70vh] max-h-[640px] items-center justify-center overflow-hidden bg-secondary-100 lg:h-[60vh]">
        {mainImageSrc ? (
          activeAsset?.media_type === 'VIDEO' ? (
            <video
              key={mainImageSrc}
              src={mainImageSrc}
              poster={activeAsset.thumbnail_url ?? undefined}
              autoPlay
              muted
              loop
              playsInline
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
            className="absolute left-2 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-primary-500 text-white shadow-md transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50 lg:left-8 lg:h-10 lg:w-10"
          >
            <ChevronLeft size={20} strokeWidth={3} />
          </button>

          <div
            ref={thumbStripRef}
            className="flex w-full py-4 items-center gap-4 overflow-x-auto scroll-smooth px-10 scrollbar-hide lg:gap-6 lg:px-12"
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
                    'relative cursor-pointer h-[140px] w-[110px] shrink-0 overflow-hidden rounded-[18px] transition-transform hover:-translate-y-1 lg:h-[220px] lg:w-[180px] lg:rounded-[24px] lg:hover:-translate-y-2',
                    isActive && 'ring-2 ring-primary-500'
                  )}
                >
                  <Image src={thumbSrc} alt={`Asset ${idx + 1}`} fill className="object-cover rounded-xl" />
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
            className="absolute right-2 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-primary-500 text-white shadow-md transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50 lg:right-8 lg:h-10 lg:w-10"
          >
            <ChevronRight size={20} strokeWidth={3} />
          </button>
        </div>
      )}
    </div>
  )

  // PORTFOLIO (non-sale) posts show every asset stacked full-bleed, one after
  // another — the whole left column scrolls through them, there's no
  // thumbnail strip or per-asset prev/next. Matches Image 1; the marketplace
  // hero+strip pattern above matches Image 2.
  const heroMediaPortfolio = (
    <div className="flex flex-col">
      {assets.length > 0 ? (
        assets.map((asset, idx) => {
          const src = asset.optimized_url || asset.original_url
          const isVideo = asset.media_type === 'VIDEO'
          return (
            <div key={asset.id} className="relative h-[70vh] max-h-[640px] w-full overflow-hidden bg-secondary-100 lg:h-[60vh]">
              {isVideo && src ? (
                <video
                  src={src}
                  poster={asset.thumbnail_url ?? undefined}
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  className="h-full w-full object-cover object-center"
                />
              ) : src ? (
                <Image src={src} alt={`${displayTitle} ${idx + 1}`} fill className="object-cover object-center" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-poppins text-gray-400">No image available</div>
              )}
              {isVideo && (
                <span className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm">
                  <Image src="/icons/play-icon.svg" width={16} height={16} alt="Video" />
                </span>
              )}
            </div>
          )
        })
      ) : (
        <div className="flex h-[70vh] max-h-[640px] w-full items-center justify-center bg-secondary-100 font-poppins text-gray-400 lg:h-[60vh]">
          No image available
        </div>
      )}
    </div>
  )

  const heroMedia = isForSale ? heroMediaMarketplace : heroMediaPortfolio

  return (
    <>
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 lg:overflow-hidden"
    >
      {/* Global prev/next artwork arrows — fixed to the viewport so they stay
          reachable regardless of which column's scrollbar is in use. */}
      {onNavigate && (
        <>
          <button
            onClick={() => onNavigate('prev')}
            aria-label="Previous artwork"
            className="fixed cursor-pointer left-4 top-1/2 z-[60] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-50 text-gray-400 transition-transform hover:scale-105 lg:flex"
          >
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.164852 7.37041L6.79533 13.8001C7.20906 14.2013 8 13.9581 8 13.4297L8 0.570303C8 0.0418882 7.20906 -0.201306 6.79533 0.199896L0.164852 6.62959C-0.0549501 6.84274 -0.0549501 7.15726 0.164852 7.37041Z" fill="#525965"/>
            </svg>
          </button>
          <button
            onClick={() => onNavigate('next')}
            aria-label="Next artwork"
            className="fixed cursor-pointer right-4 top-1/2 z-[60] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-50 text-gray-400 transition-transform hover:scale-105 lg:flex"
          >
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.83515 7.37041L1.20467 13.8001C0.790939 14.2013 5.852e-07 13.9581 5.62102e-07 13.4297L0 0.570304C-2.30978e-08 0.0418892 0.790938 -0.201306 1.20467 0.199897L7.83515 6.62959C8.05495 6.84274 8.05495 7.15726 7.83515 7.37041Z" fill="#525965"/>
            </svg>
          </button>
        </>
      )}

      <div className="flex min-h-full flex-col items-stretch lg:h-screen lg:flex-row lg:items-center lg:justify-center">
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: isClosing ? '100%' : 0 }}
          transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          onAnimationComplete={() => { if (isClosing) onClose() }}
          className="relative flex min-h-screen w-full flex-col rounded-none bg-white lg:mt-auto lg:h-[90vh] lg:min-h-0 lg:w-[90%] lg:max-w-[1600px] lg:flex-row lg:overflow-hidden lg:rounded-t-2xl"
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
              <span className="truncate font-poppins text-[14px] font-medium text-gray-500">
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

          {/* LEFT: scrolls independently of the right panel */}
          <div ref={leftColRef} className="flex flex-col pt-14 lg:h-full lg:w-full flex-1 lg:overflow-y-auto lg:pt-0">
            {heroMedia}

            <div className=" pb-20 lg:pb-0">
              {/* Mobile-only: Description, then price/cart, then profile — matches the mobile mockup order */}
              <div className="lg:hidden px-6 lg:px-8">
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
              <div className="hidden lg:block px-6 lg:px-8">{descriptionSection}</div>

              {artwork.creator?.id && (
                <>
                  <div className='bg-secondary-100'>
                    <ArtworkCreatorWorks
                      title="Also by "
                      creatorId={artwork.creator.id}
                      creatorName={creatorName}
                      excludeArtworkId={artwork.id}
                      scope="all"
                      onSelectArtwork={(work) => (onSwapArtwork ? onSwapArtwork(work) : setViewOverride(work))}
                    />
                  </div>
                  <ArtworkCreatorWorks
                    title="For sale by "
                    creatorId={artwork.creator.id}
                    creatorName={creatorName}
                    excludeArtworkId={artwork.id}
                    scope="marketplace"
                    onSelectArtwork={(work) => (onSwapArtwork ? onSwapArtwork(work) : setViewOverride(work))}
                  />
                </>
              )}

              <div className="grid grid-cols-1 gap-8 px-6 border-t border-gray-50 py-12 lg:grid-cols-[1fr_240px]">
                <ArtworkComments
                  artworkId={artwork.id}
                  creatorId={artwork.creator_id}
                  allowComments={artwork.allow_comments ?? true}
                />
                {categoriesTagsLicense}
              </div>
            </div>
          </div>

          {/* ================= RIGHT: details panel, content-height (desktop only) === */}
          <div className="hidden h-full lg:flex lg:w-[348px] lg:flex-col lg:self-start lg:border-l lg:border-gray-50 lg:px-6 lg:py-8">
            <div className="mb-6 pr-8">{profileHeader}</div>
            <div className="mb-6">{likeFollowRow}</div>
            <div className="mb-4">{artworkInfoStats}</div>
            {isForSale && (
              <>
                <div className="mt-2">{purchasingDetails}</div>
                {formControls}
              </>
            )}
            <div className="mt-4">
              {footerIcons}
            </div>
            <div className='mt-auto'>
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
    
      <SaveToMoodboardDialog artworkId={artwork.id} open={saveDialogOpen} onOpenChange={setSaveDialogOpen} />
      <ReportModal artworkId={artwork.id} open={reportDialogOpen} onOpenChange={setReportDialogOpen} />
    </>
  )
}