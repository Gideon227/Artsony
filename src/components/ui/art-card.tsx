'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { Heart, ShoppingCart, Play, Trash2, FolderPlus, Eye, UserPlus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils'
import Link from 'next/link'
import { AvatarGroup } from './avatar-group'

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
  image: string
  title: string
  artist: Artist[]
  stats?: {
    likes: string
    views: string
  }
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
}

// Hover Profile Component (Functional layout, no container styling overrides needed)
function ArtistHoverProfile({ artists }: { artists: Artist[] }) {
  if (!artists || artists.length === 0) return null;
  const isSingle = artists.length === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="w-[280px] sm:w-[300px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-[24px] rounded-tl-sm p-5 font-poppins cursor-default"
      onClick={(e) => e.stopPropagation()} 
    >
      {isSingle ? (
        <div className="flex flex-col">
          <div className="flex items-start justify-between">
            <div className="flex gap-3 items-center">
              <div className="relative h-12 w-12 rounded-full overflow-hidden shrink-0 bg-slate-100">
                <Image src={artists[0]?.avatarUrl!} alt={artists[0]?.name!} fill className="object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-semibold text-[#F15A2B] leading-tight truncate max-w-[140px]">
                  {artists[0]?.name}
                </span>
                <span className="text-[12px] font-medium text-slate-500 truncate max-w-[140px] mt-0.5">
                  {artists[0]?.role || 'Artist'}
                </span>
              </div>
            </div>
            <button className="h-9 w-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors shrink-0">
              <UserPlus size={16} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex items-center justify-between w-full mt-5 mb-4 px-2">
            <div className="flex flex-col items-center flex-1">
              <span className="text-[13px] font-semibold text-[#F15A2B]">{artists[0]?.stats?.followers || '0'}</span>
              <span className="text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-wide">Followers</span>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="flex flex-col items-center flex-1">
              <span className="text-[13px] font-semibold text-[#F15A2B]">{artists[0]?.stats?.likes || '0'}</span>
              <span className="text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-wide">Likes</span>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="flex flex-col items-center flex-1">
              <span className="text-[13px] font-semibold text-[#F15A2B]">{artists[0]?.stats?.following || '0'}</span>
              <span className="text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-wide">Following</span>
            </div>
          </div>

          <div className="flex gap-2 w-full justify-between">
            {(artists[0]?.recentArtworks || [artists[0]?.avatarUrl, artists[0]?.avatarUrl, artists[0]?.avatarUrl]).slice(0, 3).map((art, idx) => (
              <div key={idx} className="relative w-full aspect-square rounded-[16px] overflow-hidden bg-slate-100">
                <Image src={art!} alt="Artwork" fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {artists.map((artist) => (
            <div key={artist.id} className="flex items-center justify-between w-full">
              <div className="flex gap-3 items-center min-w-0">
                <div className="relative h-10 w-10 rounded-full overflow-hidden shrink-0 bg-slate-100">
                  <Image src={artist.avatarUrl} alt={artist.name} fill className="object-cover" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[14px] font-semibold text-[#F15A2B] leading-tight truncate">
                    {artist.name}
                  </span>
                  <span className="text-[12px] font-medium text-slate-500 truncate mt-0.5">
                    {artist.role || 'Placeholder'}
                  </span>
                </div>
              </div>
              <button className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors shrink-0 ml-2">
                <UserPlus size={15} strokeWidth={2.5} />
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export function ArtCard({ 
  image, 
  title, 
  artist, 
  stats, 
  cardLink,
  onCardClick,
  showCart = false,
  showHeart = false,
  showVideo = false,
  showTrash = false,
  showCat = true,
  variant = 'standard',
  onAction, 
  alternate= false
}: ArtCardProps) {
  // SAFETY CHECKS ADDED HERE
  const primaryArtist = artist?.[0]
  const artistImages = artist?.map((a) => a.avatarUrl) || []
  const artistCount = artist?.length || 0

  // HOVER STATE LOGIC
  const [isHoveringArtist, setIsHoveringArtist] = useState(false)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    setIsHoveringArtist(true)
  }

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHoveringArtist(false)
    }, 150)
  }

  const CardWrapper = onCardClick
  ? ({ children }: { children: React.ReactNode }) => (
      <div
        onClick={onCardClick}
        className="relative max-h-[376px] max-w-[332px] gap-y-4 cursor-pointer block"
      >
        {children}
      </div>
    )
  : ({ children }: { children: React.ReactNode }) => (
      <Link href={cardLink ?? '/404'} className="relative max-h-[376px] max-w-[332px] gap-y-4 cursor-pointer block">
        {children}
      </Link>
    )

  return (
    <CardWrapper>
      {/* --- Image Container --- */}
      <div className="relative group aspect-square overflow-hidden rounded-[40px] bg-neutral-100">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* --- Hover/Active Overlay --- */}
        <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Top Actions (Visible on Hover) */}
        <div className="absolute left-6 top-6 flex gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100">
          {showCat && <IconButton icon='/icons/folder.svg' onClick={() => onAction?.('collect')} />}
          {showHeart && <IconButton icon='/icons/heart.svg' onClick={() => onAction?.('like')} />}
          {showCart && <IconButton icon='/icons/cart.svg' onClick={() => onAction?.('cart')} />}
          {showVideo && <IconButton icon='/icons/play-icon.svg' onClick={() => onAction?.('play')} />}
          {showTrash && <IconButton icon='/icons/trash.svg' onClick={() => onAction?.('delete')} />}
        </div>

        {/* Sale Badge (For Discover Variant) */}
        {variant === 'discover' && (
          <button className="absolute left-6 top-6 rounded-full border border-white px-4 py-2 text-[14px] font-medium text-white backdrop-blur-md">
            Sale
          </button>
        )}

        {/* Bottom Title/Overlay Info */}
        <div className="absolute bottom-6 left-6 right-6 opacity-0 group-hover:opacity-100">
          <div className="space-y-2">
            <div className='flex items-center justify-between '>
              <h3 className="text-[14px] font-medium font-poppins tracking-wide leading-6 text-white ">{title}</h3>

              <IconButton 
                icon='/icons/heart.svg'
                onClick={() => onAction?.('like')}
              />
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
                    <span className="text-[12px] leading-4 tracking-wide font-poppins font-medium text-white">{stats?.likes}</span>
                  </div>

                  <div className='flex gap-x-1'>
                    <Image src='/icons/eye-red.svg' alt='heart icon' width={16} height={16} className="object-contain" />
                    <span className="text-[12px] leading-4 tracking-wide font-poppins font-medium text-white">{stats?.views}</span>
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
                  <AvatarGroup images={artistImages}  />
                </div>
                  <span className="text-[12px] truncate leading-4 tracking-wide font-poppins font-medium text-white">{primaryArtist?.name} {artistCount > 1 && `+ ${artistCount - 1}`}</span>
              </div>
            )}
          </div>

          
        </div>
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

          {stats && (
            <div className='flex gap-x-2'>
              <div className='flex gap-x-1'>
                <Image src='/icons/heart-red.svg' alt='heart icon' width={16} height={16} className="object-contain" />
                <span className="text-[12px] leading-4 tracking-wide font-poppins font-medium text-gray-400">{stats?.likes}</span>
              </div>

              <div className='flex gap-x-1'>
                <Image src='/icons/eye-red.svg' alt='heart icon' width={16} height={16} className="object-contain" />
                <span className="text-[12px] leading-4 tracking-wide font-poppins font-medium text-gray-400">{stats?.views}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Global Hover Profile Wrapper: Safely placed at the bottom so it isn't clipped by the footer's overflow-hidden styling */}
      <AnimatePresence>
        {isHoveringArtist && artistCount > 0 && (
          <div 
            className="absolute z-50 left-2"
            style={{ bottom: variant === 'standard' ? '65px' : '90px' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={(e) => e.preventDefault()}
          >
            <ArtistHoverProfile artists={artist} />
          </div>
        )}
      </AnimatePresence>
    </CardWrapper>
  )
}

function IconButton({ icon, onClick, className }: { icon: string; onClick?: () => void; className?: string }) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick?.()
      }}
      className={cn(
        "flex h-10 w-10 relative rounded-full border border-white bg-transparent backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer",
        className
      )}
    >
      <Image src={icon} width={18} height={18} alt='icon' className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ' />
    </button>
  )
}