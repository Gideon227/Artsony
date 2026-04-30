'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const artworks = [
  {
    id: '1',
    src: "/images/purple-circle.png",
    alt: 'Neon circle',
    artist: { name: 'Amara Obi', avatar: '/images/image-avatar.svg' },
    cell: 'col-start-1 row-start-1',
  },
  {
    id: '2',
    src: "/images/geometric.png",
    alt: 'Abstract geometry',
    artist: { name: 'Tunde Fashola', avatar: '/images/image-avatar.svg' },
    cell: 'col-start-2 row-start-1',
  },
  {
    id: '3',
    src: "/images/mountain.png",
    alt: 'Mountain landscape',
    artist: { name: 'Kemi Adeyemi', avatar: '/images/image-avatar.svg' },
    cell: 'col-span-2 row-start-2', 
  },
  {
    id: '4',
    src: "/images/purple-cloud.png",
    alt: 'Purple cloud',
    artist: { name: 'Uzochukwu', avatar: '/images/image-avatar.svg' },
    cell: 'col-start-1 row-start-3', 
  },
  {
    id: '5',
    src: "/images/abstract-face.png",
    alt: 'Colorful portrait',
    artist: { name: 'Zara Bello', avatar: '/images/image-avatar.svg' },
    cell: 'col-start-2 row-start-3', 
  },
]

function ArtworkCard({ src, alt, artist, cell }: (typeof artworks)[number]) {
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
  return (
    <div className="grid h-full w-full gap-4 grid-cols-2 grid-rows-[1fr_1.2fr_1fr]">
      {artworks.map((art) => (
        <ArtworkCard key={art.id} {...art} />
      ))}
    </div>
  )
}