'use client'
import Image from 'next/image'
import { Heart, ShoppingCart, Play, Trash2, FolderPlus, Eye } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils'
import Link from 'next/link'
import { AvatarGroup } from './avatar-group'

interface Artist {
  id: string
  name: string
  avatarUrl: string
}

interface ArtCardProps {
  image: string
  title: string
  artist: Artist[]
  stats?: {
    likes: string
    views: string
  }
  cardLink?: string
  showCart?: boolean;
  showHeart?: boolean;
  showVideo?: boolean;
  showTrash?: boolean
  showCat?: boolean
  variant?: 'standard' | 'discover'
  onAction?: (action: string) => void
  alternate?: boolean;
}

export function ArtCard({ 
  image, 
  title, 
  artist, 
  stats, 
  cardLink,
  showCart = false,
  showHeart = false,
  showVideo = false,
  showTrash = false,
  showCat = true,
  variant = 'standard',
  onAction, 
  alternate= false
}: ArtCardProps) {
  const primaryArtist = artist[0]
  const artistImages = artist?.map((a) => a.avatarUrl)

  return (
    <Link href={cardLink ?? '/404'} className=" relative max-h-[376px] max-w-[332px] gap-y-4 cursor-pointer">
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
          <IconButton icon='/icons/folder.svg' onClick={() => onAction?.('collect')} />
          <IconButton icon='/icons/heart.svg' onClick={() => onAction?.('like')} />
          <IconButton icon='/icons/cart.svg' onClick={() => onAction?.('cart')} />
          <IconButton icon='/icons/play-icon.svg' onClick={() => onAction?.('play')} />
          <IconButton icon='/icons/trash.svg' onClick={() => onAction?.('delete')} />
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
                <div className='flex gap-2 items-center min-w-0 flex-1 mr-1'>
                  <div className="shrink-0">
                    <AvatarGroup images={artistImages} />
                  </div>
                  <span className="text-[12px] truncate leading-4 tracking-wide font-poppins font-medium text-white">{primaryArtist?.name} {artist.length > 1 && `+ ${artist.length - 1}`}</span>
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
              <div className="flex items-center gap-2">
                <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/20">
                  <AvatarGroup images={artistImages}  />
                </div>
                  <span className="text-[12px] truncate leading-4 tracking-wide font-poppins font-medium text-white">{primaryArtist?.name} {artist.length > 1 && `+ ${artist.length - 1}`}</span>
              </div>
            )}
          </div>

          
        </div>
      </div>

      {/* --- External Footer (Standard Variant & Mobile) --- */}
      {variant === 'standard' && (
        <div className="mt-4 flex items-center justify-between w-full overflow-hidden py-2 pl-2 pr-4 bg-white gap-x-4 border border-gray-50 rounded-full">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <AvatarGroup images={artistImages} width={40} height={40} />
            <span className="text-[12px] truncate leading-4 tracking-wide font-poppins font-medium text-gray-400">{primaryArtist?.name} {artist.length > 1 && `+ ${artist.length - 1}`}</span>
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
    </Link>
  )
}

function IconButton({ icon, onClick, className }: { icon: string; onClick?: () => void; className?: string }) {
  return (
    <button
      onClick={(e) => {
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