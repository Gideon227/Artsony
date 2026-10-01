'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { UserPlus, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, formatNumber } from '@/utils'
import { AvatarGroup } from './avatar-group'
import { MoodboardPickerSheet } from './moodboard-picker-sheet'
import { DeleteConfirmSheet } from './delete-confirm-sheet'
import { useAuthStore } from '@/store'
import { useIsFollowing, useToggleFollow } from '@/hooks/use-follow'
import { useUsersByIds } from '@/hooks/use-user'
import { useLikeArtwork } from '@/hooks/use-artwork'
import { useQuickAddToCart } from '@/hooks/use-cart-actions'
import { useOpenArtwork } from '@/hooks/use-artwork-viewer'
import { useScrollReveal } from '@/hooks/use-scroll-reveal'
import type { Artwork } from '@/types/artwork'

export interface Artist {
  id: string
  name: string
  avatarUrl: string
  role?: string
  stats?: {
    followers: string
    likes: string
    following: string
  }
  recentArtworks?: string[]
}

interface ArtCardProps {
  /**
   * Preferred way to use ArtCard. When set, image/title/artist/stats are all
   * derived from it, and every action (like, cart, save-to-moodboard,
   * delete, follow, play video, click-to-view) is wired up internally —
   * nothing extra to plug in at the call site. `showCart`/`showHeart`/
   * `showVideo`/`showTrash` are also auto-computed from the artwork when
   * this is set (marketplace-only for cart, has-a-video-asset for the video
   * button, owned-by-viewer for trash) unless explicitly overridden.
   */
  artwork?: Artwork
  // Legacy props — still supported for call sites not yet passing `artwork`.
  // With `artwork` set, these are only used as display fallbacks.
  image?: string
  title?: string
  artist?: Artist[]
  stats?: {
    likes: string
    views: string
  }
  /** When set, the standard-variant footer shows this price instead of stats. */
  price?: string
  cardLink?: string;
  onCardClick?: () => void;
  showCart?: boolean;
  showHeart?: boolean;
  showVideo?: boolean;
  showTrash?: boolean
  showCat?: boolean
  variant?: 'standard' | 'discover' | 'bland' | 'shop'
  onAction?: (action: string) => void
  alternate?: boolean;
  /** Fills the parent's box (width + height) instead of the default fixed-cap/aspect-square sizing — used by masonry-style grids that control the card's dimensions externally. */
  fillContainer?: boolean;
  /** Discover variant's "Sale" pill — opt-in per usage rather than implied by variant. */
  showSaleBadge?: boolean;
}

// Small icon-only follow button, backed by the same hooks as the pill-style
// <FollowButton> elsewhere in the app — just styled to match the circular
// buttons in the hover card design instead of a full pill.
function FollowIconButton({ userId, size = 'md' }: { userId: string; size?: 'md' | 'sm' }) {
  const currentUserId = useAuthStore((s) => s.user?.id)
  const { data: isFollowing, isLoading } = useIsFollowing(userId)
  const { mutate: toggle, isPending } = useToggleFollow(userId)

  if (!currentUserId || currentUserId === userId) return null

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle()
      }}
      disabled={isLoading || isPending}
      aria-pressed={Boolean(isFollowing)}
      aria-label={isFollowing ? 'Unfollow' : 'Follow'}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full border transition-colors disabled:opacity-50',
        size === 'md' ? 'h-9 w-9' : 'h-8 w-8',
        isFollowing
          ? 'border-primary-200 bg-primary-50 text-primary-500'
          : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
      )}
    >
      {isLoading || isPending
        ? <Loader2 size={14} className="animate-spin" />
        : <UserPlus size={14} strokeWidth={2.5} />}
    </button>
  )
}

// Hover Profile Component — shows the primary creator's stats + this
// artwork's own media (not the creator's other/recent work), plus a
// separate contributors card when the artwork has collaborators.
function ArtistHoverProfile({
  artwork,
  primaryArtist,
  onViewArtwork,
}: {
  artwork?: Artwork
  primaryArtist: Artist
  onViewArtwork: () => void
}) {
  const contributorIds = (artwork?.collaborator_ids ?? []).filter((id) => id !== artwork?.creator_id)
  const { data: contributorProfiles } = useUsersByIds(contributorIds)
  const contributors = contributorIds.map((id) => {
    const p = contributorProfiles?.find((cp) => cp.id === id)
    return {
      id,
      name: p?.profile?.display_name || p?.username || 'Loading…',
      avatarUrl: p?.profile?.avatar_url || '/images/image-avatar.svg',
    }
  })

  const previewAssets = (artwork?.assets ?? []).slice(0, 3)

  return (
    <div className="flex flex-col gap-3">
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-[280px] sm:w-[300px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-[24px] rounded-tl-sm p-5 font-poppins cursor-pointer"
        onClick={(e) => { e.stopPropagation(); onViewArtwork() }}
      >
        <div className="flex flex-col">
          <div className="flex items-start justify-between">
            <div className="flex gap-3 items-center min-w-0">
              <div className="relative h-12 w-12 rounded-full overflow-hidden shrink-0 bg-slate-100">
                <Image src={primaryArtist.avatarUrl} alt={primaryArtist.name} fill className="object-cover" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[15px] font-semibold text-[#F15A2B] leading-tight truncate max-w-[140px]">
                  {primaryArtist.name}
                </span>
                <span className="text-[12px] font-medium text-slate-500 truncate max-w-[140px] mt-0.5">
                  {primaryArtist.role || 'Artist'}
                </span>
              </div>
            </div>
            <FollowIconButton userId={primaryArtist.id} size="md" />
          </div>

          <div className="flex items-center justify-between w-full mt-5 mb-4 px-2">
            <div className="flex flex-col items-center flex-1">
              <span className="text-[13px] font-semibold text-[#F15A2B]">{primaryArtist.stats?.followers || '0'}</span>
              <span className="text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-wide">Followers</span>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="flex flex-col items-center flex-1">
              <span className="text-[13px] font-semibold text-[#F15A2B]">{primaryArtist.stats?.likes || '0'}</span>
              <span className="text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-wide">Likes</span>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="flex flex-col items-center flex-1">
              <span className="text-[13px] font-semibold text-[#F15A2B]">{primaryArtist.stats?.following || '0'}</span>
              <span className="text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-wide">Following</span>
            </div>
          </div>

          <div className="flex gap-2 w-full justify-between">
            {(previewAssets.length > 0 ? previewAssets : [null, null, null]).map((asset, idx) => {
              const src = asset?.thumbnail_url || asset?.optimized_url || asset?.original_url
              const isVideo = asset?.media_type === 'VIDEO'
              return (
                <div key={asset?.id ?? idx} className="relative w-full aspect-square rounded-[16px] overflow-hidden bg-slate-100">
                  {src && <Image src={src} alt="Artwork" fill className="object-cover" />}
                  {isVideo && (
                    <span className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white">
                      <Image src="/icons/play-icon.svg" width={9} height={9} alt="Video" />
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {contributors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut", delay: 0.03 }}
          className="w-[280px] sm:w-[300px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-[24px] p-5 font-poppins cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-4">
            {contributors.map((c) => (
              <div key={c.id} className="flex items-center justify-between w-full">
                <div className="flex gap-3 items-center min-w-0">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden shrink-0 bg-slate-100">
                    <Image src={c.avatarUrl} alt={c.name} fill className="object-cover" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[14px] font-semibold text-[#F15A2B] leading-tight truncate">
                      {c.name}
                    </span>
                    <span className="text-[12px] font-medium text-slate-500 truncate mt-0.5">
                      Contributor
                    </span>
                  </div>
                </div>
                <FollowIconButton userId={c.id} size="sm" />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export function ArtCard({
  artwork,
  image,
  title,
  artist,
  stats,
  price,
  cardLink,
  onCardClick,
  showCart,
  showHeart,
  showVideo,
  showTrash,
  showCat,
  variant = 'standard',
  onAction,
  alternate = false,
  fillContainer = false,
  showSaleBadge = false,
}: ArtCardProps) {
  const currentUserId = useAuthStore((s) => s.user?.id)

  // ── Derive display data — artwork (preferred) or legacy explicit props ──
  const primaryAsset = artwork?.assets?.[0]
  const derivedImage = artwork
    ? primaryAsset?.optimized_url || primaryAsset?.original_url || primaryAsset?.thumbnail_url || image
    : image
  const derivedTitle = artwork?.title ?? title ?? ''
  const derivedPrice = artwork
    ? (artwork.listing_type === 'MARKETPLACE' && artwork.price != null ? `$${artwork.price}` : price)
    : price
  const derivedStats = artwork
    ? { likes: formatNumber(artwork.like_count), views: formatNumber(artwork.view_count) }
    : stats

  const derivedArtist: Artist[] = artwork
    ? [{
        id: artwork.creator_id,
        name: artwork.creator?.profile?.display_name || artwork.creator?.username || 'Unknown Artist',
        avatarUrl: artwork.creator?.profile?.avatar_url || '/images/image-avatar.svg',
        role: 'Artist',
        stats: {
          followers: formatNumber(artwork.creator?.profile?.followers_count ?? 0),
          likes: formatNumber(artwork.like_count),
          following: formatNumber(artwork.creator?.profile?.following_count ?? 0),
        },
      }]
    : (artist ?? [])

  const hasVideoAsset = Boolean(artwork?.assets?.some((a) => a.media_type === 'VIDEO'))
  const isOwner = Boolean(artwork && currentUserId && artwork.creator_id === currentUserId)

  const effectiveShowCat   = artwork ? (artwork.allow_moodboard_save ?? true) : (showCat ?? true)
  const effectiveShowHeart = artwork ? true : (showHeart ?? false)
  const effectiveShowCart  = artwork ? artwork.listing_type === 'MARKETPLACE' : (showCart ?? false)
  const effectiveShowVideo = artwork ? hasVideoAsset : (showVideo ?? false)
  const effectiveShowTrash = artwork ? isOwner : (showTrash ?? false)

  const primaryArtist = derivedArtist?.[0]
  const artistImages = derivedArtist?.map((a) => a.avatarUrl) || []
  const artistCount = derivedArtist?.length || 0

  // ── Hover state ──
  const [isHoveringArtist, setIsHoveringArtist] = useState(false)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    setIsHoveringArtist(true)
  }
  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => setIsHoveringArtist(false), 150)
  }

  // ── Action state (only meaningful when `artwork` is provided) ──
  const [isPlayingVideo, setIsPlayingVideo] = useState(false)
  const [moodboardSheetOpen, setMoodboardSheetOpen] = useState(false)
  const [deleteSheetOpen, setDeleteSheetOpen] = useState(false)
  const openArtwork = useOpenArtwork()
  const revealRef = useScrollReveal<HTMLDivElement>()

  const { mutate: toggleLike, isPending: isLiking } = useLikeArtwork()
  const { quickAdd, pendingId } = useQuickAddToCart()

  const handleAction = (action: string) => {
    if (!artwork) {
      onAction?.(action)
      return
    }
    switch (action) {
      case 'collect':
        setMoodboardSheetOpen(true)
        break
      case 'like':
        toggleLike({ id: artwork.id, isLiked: artwork.is_liked ?? false })
        break
      case 'cart':
        void quickAdd(artwork)
        break
      case 'play':
        setIsPlayingVideo((v) => !v)
        break
      case 'delete':
        setDeleteSheetOpen(true)
        break
      default:
        onAction?.(action)
    }
  }

  const videoAsset = artwork?.assets?.find((a) => a.media_type === 'VIDEO')
  const videoSrc = videoAsset?.optimized_url || videoAsset?.original_url

  const wrapperSizing = fillContainer
    ? 'h-full w-full'
    : 'w-full max-w-[376px]'

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick()
      return
    }
    if (artwork) openArtwork(artwork)
  }

  const handleViewArtwork = () => {
    if (onCardClick) {
      onCardClick()
      return
    }
    if (artwork) openArtwork(artwork)
  }

  const CardWrapper = (onCardClick || artwork)
    ? ({ children }: { children: React.ReactNode }) => (
        <div
          onClick={handleCardClick}
          className={cn('relative gap-y-4 cursor-pointer block', wrapperSizing)}
        >
          {children}
        </div>
      )
    : ({ children }: { children: React.ReactNode }) => (
        <Link href={cardLink ?? '/404'} className={cn('relative gap-y-4 cursor-pointer block', wrapperSizing)}>
          {children}
        </Link>
      )

  return (
    <>
      <CardWrapper>
        {/* --- Image Container --- */}
        <div ref={revealRef} className={cn(
          'relative group overflow-hidden rounded-2xl bg-neutral-100 w-full',
          fillContainer ? 'h-full' : 'aspect-square'
        )}>
          {isPlayingVideo && videoSrc ? (
            <video
              src={videoSrc}
              autoPlay
              muted
              loop
              playsInline
              controls
              className="h-full w-full object-cover"
              onClick={(e) => e.stopPropagation()}
            />
          ) : derivedImage ? (
            <Image
              src={derivedImage}
              alt={derivedTitle}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-400 font-poppins text-sm">
              No image
            </div>
          )}

          {/* Hover state layer: masked by scroll position on mobile */}
          <div className="art-card-reveal absolute inset-0">
            {/* --- Hover/Active Overlay --- */}
            <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 max-md:opacity-100 group-hover:opacity-100" />

            {/* Top Actions (Visible on Hover) */}
            <div className="absolute left-6 top-6 flex gap-2 opacity-0 transition-all duration-300 max-md:pointer-events-none max-md:opacity-100 max-md:group-data-[reveal-top=true]:pointer-events-auto group-hover:opacity-100">
              {effectiveShowCat && <IconButton icon='/icons/folder.svg' onClick={() => handleAction('collect')} />}
              {effectiveShowHeart && (
                <IconButton
                  icon='/icons/heart.svg'
                  onClick={() => handleAction('like')}
                  active={artwork?.is_liked}
                  loading={isLiking}
                />
              )}
              {effectiveShowCart && (
                <IconButton
                  icon='/icons/cart.svg'
                  onClick={() => handleAction('cart')}
                  loading={artwork ? pendingId === artwork.id : false}
                />
              )}
              {effectiveShowVideo && (
                <IconButton icon='/icons/play-icon.svg' onClick={() => handleAction('play')} active={isPlayingVideo} />
              )}
              {effectiveShowTrash && <IconButton icon='/icons/trash.svg' onClick={() => handleAction('delete')} />}
            </div>

            {/* Bottom Title/Overlay Info */}
            <div className="absolute bottom-6 left-6 right-6 opacity-0 max-md:pointer-events-none max-md:opacity-100 max-md:group-data-[reveal-bottom=true]:pointer-events-auto group-hover:opacity-100">
              <div className="space-y-2">
                <div className='flex items-center justify-between '>
                  <h3 className="text-[14px] font-medium font-poppins tracking-wide leading-6 text-white ">{derivedTitle}</h3>

                  {!effectiveShowHeart && (
                    <IconButton
                      icon='/icons/heart.svg'
                      onClick={() => handleAction('like')}
                      active={artwork?.is_liked}
                      loading={isLiking}
                    />
                  )}
                </div>

                {alternate && (
                  <div className='flex items-center justify-between w-full'>
                    <div
                      className='flex gap-2 items-center min-w-0 flex-1 mr-1'
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="shrink-0">
                        <AvatarGroup images={artistImages} />
                      </div>
                      <span className="text-[12px] truncate leading-4 tracking-wide font-poppins font-medium text-white">{primaryArtist?.name} {artistCount > 1 && `+ ${artistCount - 1}`}</span>
                    </div>

                    <div className='flex gap-x-2'>
                      <div className='flex gap-x-1'>
                        <Image src='/icons/heart-red.svg' alt='heart icon' width={16} height={16} className="object-contain" />
                        <span className="text-[12px] leading-4 tracking-wide font-poppins font-medium text-white">{derivedStats?.likes}</span>
                      </div>

                      <div className='flex gap-x-1'>
                        <Image src='/icons/eye-red.svg' alt='heart icon' width={16} height={16} className="object-contain" />
                        <span className="text-[12px] leading-4 tracking-wide font-poppins font-medium text-white">{derivedStats?.views}</span>
                      </div>
                    </div>
                  </div>

                )}

                {/* Inline Artist (Discover Variant Only) */}
                {variant === 'discover' && (
                  <div
                    className="flex items-center gap-2"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/20">
                      <AvatarGroup images={artistImages} />
                    </div>
                      <span className="text-[12px] truncate leading-4 tracking-wide font-poppins font-medium text-white">{primaryArtist?.name} {artistCount > 1 && `+ ${artistCount - 1}`}</span>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Sale Badge (For Discover Variant) */}
          {variant === 'discover' && showSaleBadge && (
            <button className="absolute left-6 top-6 rounded-full border border-white px-4 py-2 text-[14px] font-medium text-white backdrop-blur-md">
              Sale
            </button>
          )}

        </div>

        {/* --- External Footer (Standard Variant & Mobile) --- */}
        {variant === 'standard' && (
          <div className="mt-4 flex items-center justify-between w-full overflow-hidden py-2 pl-2 pr-4 bg-white gap-x-4 border border-gray-50 rounded-full">
            <div
              className="flex items-center gap-2 flex-1 min-w-0"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <AvatarGroup images={artistImages} width={40} height={40} />
              <span className="text-[12px] truncate leading-4 tracking-wide font-poppins font-medium text-gray-400">{primaryArtist?.name} {artistCount > 1 && `+ ${artistCount - 1}`}</span>
            </div>

            {derivedPrice ? (
              <span className="shrink-0 font-poppins text-[13px] font-semibold text-primary-500">
                {derivedPrice}
              </span>
            ) : (
              derivedStats && (
                <div className='flex gap-x-2'>
                  <div className='flex gap-x-1'>
                    <Image src='/icons/heart-red.svg' alt='heart icon' width={16} height={16} className="object-contain" />
                    <span className="text-[12px] leading-4 tracking-wide font-poppins font-medium text-gray-400">{derivedStats?.likes}</span>
                  </div>

                  <div className='flex gap-x-1'>
                    <Image src='/icons/eye-red.svg' alt='heart icon' width={16} height={16} className="object-contain" />
                    <span className="text-[12px] leading-4 tracking-wide font-poppins font-medium text-gray-400">{derivedStats?.views}</span>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* Global Hover Profile Wrapper */}
        <AnimatePresence>
          {isHoveringArtist && artistCount > 0 && primaryArtist && (
            <div
              className="absolute z-50 left-2"
              style={{ bottom: variant === 'standard' ? '65px' : '90px' }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={(e) => e.preventDefault()}
            >
              <ArtistHoverProfile
                artwork={artwork}
                primaryArtist={primaryArtist}
                onViewArtwork={handleViewArtwork}
              />
            </div>
          )}
        </AnimatePresence>
      </CardWrapper>

      {artwork && moodboardSheetOpen && (
        <MoodboardPickerSheet
          artworkId={artwork.id}
          open={moodboardSheetOpen}
          onOpenChange={setMoodboardSheetOpen}
        />
      )}

      {artwork && deleteSheetOpen && (
        <DeleteConfirmSheet
          artworkId={artwork.id}
          artworkTitle={artwork.title}
          open={deleteSheetOpen}
          onOpenChange={setDeleteSheetOpen}
        />
      )}
    </>
  )
}

function IconButton({
  icon,
  onClick,
  className,
  active,
  loading,
}: {
  icon: string
  onClick?: () => void
  className?: string
  active?: boolean
  loading?: boolean
}) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!loading) onClick?.()
      }}
      disabled={loading}
      className={cn(
        "flex h-10 w-10 relative rounded-full border border-white bg-transparent backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer disabled:cursor-wait",
        active && "bg-primary-500/80",
        className
      )}
    >
      {loading
        ? <Loader2 className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 animate-spin text-white" />
        : <Image src={icon} width={18} height={18} alt='icon' className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ' />}
    </button>
  )
}