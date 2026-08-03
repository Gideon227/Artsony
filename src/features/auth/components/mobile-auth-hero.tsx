'use client'

import Image from 'next/image'
import { MoveLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRandomShowcaseArtworks } from '@/features/auth/hooks/use-random-showcase-artworks'

type MobileAuthHeroProps = {
  /** Omit to hide the back button entirely (e.g. the first screen in a flow). */
  onBack?: () => void
  className?: string
}

export function MobileAuthHero({ onBack, className }: MobileAuthHeroProps) {
  const { artworks, isLoading } = useRandomShowcaseArtworks(1)
  const artwork = artworks[0]

  return (
    <div className={cn('lg:hidden absolute inset-0 min-h-screen w-full z-0', className)}>
      {isLoading || !artwork ? (
        <div className="absolute inset-0 bg-neutral-300 animate-pulse" />
      ) : (
        <Image src={artwork.src} alt={artwork.alt} fill priority className="object-cover" />
      )}
      <div className="absolute inset-0 bg-black/20" />

      <div className={cn(
        'relative z-10 p-6 flex items-center mt-4',
        onBack ? 'justify-between' : 'justify-start'
      )}>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <mask id="path-1-inside-1_7161_27079" fill="white">
                <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z"/>
              </mask>
              <path d="M0 20M40 20M40 20M0 20M20 0M40 20M20 40M0 20M20 40V38C10.0589 38 2 29.9411 2 20H0H-2C-2 32.1503 7.84974 42 20 42V40ZM40 20H38C38 29.9411 29.9411 38 20 38V40V42C32.1503 42 42 32.1503 42 20H40ZM20 0V2C29.9411 2 38 10.0589 38 20H40H42C42 7.84974 32.1503 -2 20 -2V0ZM20 0V-2C7.84974 -2 -2 7.84974 -2 20H0H2C2 10.0589 10.0589 2 20 2V0Z" fill="#E6E8EB" mask="url(#path-1-inside-1_7161_27079)"/>
              <path d="M28 20H12M18 26L12 20L18 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        <div className="flex items-center gap-2 ">
          <div className="w-10 h-10 relative shrink-0">
            {artwork && (
              <Image src={artwork.artist.avatar} alt={artwork.artist.name} fill className="object-cover border border-gray-50 rounded-full" />
            )}
          </div>

          <span className="font-poppins text-white text-xs font-medium truncate">
            {artwork?.artist.name ?? ''}
          </span>
        </div>
      </div>
    </div>
  )
}