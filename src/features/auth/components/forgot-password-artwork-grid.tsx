'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useRandomShowcaseArtworks, type ShowcaseArtwork } from '@/features/auth/hooks/use-random-showcase-artworks'

const CELLS = [
  'col-start-1 row-start-1',
  'col-start-2 row-start-1',
  'col-span-2 row-start-2',
  'col-start-1 row-start-3',
  'col-start-2 row-start-3',
]

function ArtworkCard({ src, alt, artist, cell }: ShowcaseArtwork & { cell: string }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={cn('group relative overflow-hidden rounded-[32px] bg-gray-100 w-full h-full', cell)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className={cn(
          'object-cover transition-transform duration-700 ease-out',
          hovered ? 'scale-110' : 'scale-100'
        )}
        sizes="(max-width: 1024px) 100vw, 50vw"
      />

      <div className={cn(
        'absolute inset-0 bg-black/40 transition-opacity duration-300',
        hovered ? 'opacity-100' : 'opacity-0'
      )} />

      <div className={cn(
        'absolute bottom-6 left-6 flex items-center gap-3 transition-all duration-500',
        hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}>
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-white/50">
          <Image src={artist.avatar} alt={artist.name} fill className="object-cover" />
        </div>
        <div className="flex flex-col">
          <span className="text-white text-sm font-semibold leading-none">{artist.name}</span>
          <span className="text-white/70 text-[10px] uppercase tracking-wider mt-1 font-bold">Artist</span>
        </div>
      </div>
    </div>
  )
}

export function ForgotPasswordArtworkGrid() {
  const { artworks, isLoading } = useRandomShowcaseArtworks(CELLS.length)

  return (
    <div className="grid h-full w-full gap-4 grid-cols-2 grid-rows-[1fr_1.2fr_1fr]">
      {isLoading
        ? CELLS.map((cell, i) => (
            <div key={i} className={cn('rounded-[32px] bg-gray-100 animate-pulse w-full h-full', cell)} />
          ))
        : artworks.map((art, i) => (
            <ArtworkCard key={art.id} {...art} cell={CELLS[i] ?? ''} />
          ))
      }
    </div>
  )
}