'use client'
import Image from 'next/image'
import { Heart, ShoppingCart, Play, Trash2, FolderPlus, Eye } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils'

interface ArtCardProps {
  image: string
  title: string
  artist: {
    name: string
    avatar: string
  }
  stats?: {
    likes: string
    views: string
  }
  variant?: 'standard' | 'discover'
  onAction?: (action: string) => void
}

export function ArtCard({ 
  image, 
  title, 
  artist, 
  stats, 
  variant = 'standard',
  onAction 
}: ArtCardProps) {
  return (
    <div className="group relative h-[304px] w-[332px]">
      {/* --- Image Container --- */}
      <div className="relative aspect-square overflow-hidden rounded-[40px] bg-neutral-100">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* --- Hover/Active Overlay --- */}
        <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Top Actions (Visible on Hover) */}
        <div className="absolute left-4 top-4 flex gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100">
          <IconButton icon={<FolderPlus size={18} />} onClick={() => onAction?.('collect')} />
          <IconButton icon={<Heart size={18} />} onClick={() => onAction?.('like')} />
          <IconButton icon={<ShoppingCart size={18} />} onClick={() => onAction?.('cart')} />
          <IconButton icon={<Play size={18} />} onClick={() => onAction?.('play')} />
          <IconButton icon={<Trash2 size={18} />} onClick={() => onAction?.('delete')} />
        </div>

        {/* Sale Badge (For Discover Variant) */}
        {variant === 'discover' && (
          <button className="absolute right-4 top-4 rounded-full border border-white/40 bg-black/20 px-5 py-2 text-sm font-medium text-white backdrop-blur-md">
            Sale
          </button>
        )}

        {/* Bottom Title/Overlay Info */}
        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white drop-shadow-md">{title}</h3>
            
            {/* Inline Artist (Discover Variant Only) */}
            {variant === 'discover' && (
              <div className="flex items-center gap-2">
                <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/20">
                  <Image src={artist.avatar} alt={artist.name} fill className="object-cover" />
                </div>
                <span className="text-sm font-medium text-white">{artist.name}</span>
              </div>
            )}
          </div>

          <IconButton 
            icon={<Heart size={20} fill="currentColor" />} 
            className="bg-white text-black hover:bg-neutral-200"
            onClick={() => onAction?.('like')}
          />
        </div>
      </div>

      {/* --- External Footer (Standard Variant & Mobile) --- */}
      {variant === 'standard' && (
        <div className="mt-4 flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-primary-100">
              <Image src={artist.avatar} alt={artist.name} fill className="object-cover" />
            </div>
            <span className="font-medium text-neutral-700">{artist.name}</span>
          </div>

          {stats && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-neutral-500">
                <Heart size={16} className="text-primary-500" fill="currentColor" />
                <span className="text-sm font-semibold">{stats.likes}</span>
              </div>
              <div className="flex items-center gap-1 text-neutral-500">
                <Eye size={16} className="text-orange-500" />
                <span className="text-sm font-semibold">{stats.views}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function IconButton({ icon, onClick, className }: { icon: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-black/20 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white hover:text-black active:scale-95",
        className
      )}
    >
      {icon}
    </button>
  )
}