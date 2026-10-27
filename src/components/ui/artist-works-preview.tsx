'use client'

import * as React from 'react'
import Image from 'next/image'
import { useCreatorArtworks } from '@/hooks/use-artwork'
import type { ArtworkAsset } from '@/types/artwork'

// Always show this many of the artist's works — fewer only when the artist has fewer.
const PREVIEW_COUNT = 3
// Fetch a few spare in case some artworks have no usable media.
const FETCH_LIMIT = PREVIEW_COUNT * 2

type Preview = { id: string; src: string; isVideo: boolean }

function toPreview(id: string, asset?: Pick<ArtworkAsset, 'thumbnail_url' | 'optimized_url' | 'original_url' | 'media_type'>): Preview | null {
  const src = asset?.thumbnail_url || asset?.optimized_url || asset?.original_url
  return src ? { id, src, isVideo: asset?.media_type === 'VIDEO' } : null
}

const isPreview = (p: Preview | null): p is Preview => p !== null

function PreviewGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid w-full grid-cols-3 gap-2">{children}</div>
}

type ArtistWorksPreviewProps = {
  creatorId: string
  /** Hovered artwork's own media — only used if the artist's works can't be loaded. */
  fallbackAssets?: ArtworkAsset[]
}

/**
 * The 3-up strip in the artist hover profile: the artist's latest published
 * works, whatever their listing type (for sale or portfolio).
 */
export function ArtistWorksPreview({ creatorId, fallbackAssets = [] }: ArtistWorksPreviewProps) {
  const { data, isLoading } = useCreatorArtworks(creatorId, true, FETCH_LIMIT)

  if (isLoading) {
    return (
      <PreviewGrid>
        {Array.from({ length: PREVIEW_COUNT }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-[16px] bg-slate-100" />
        ))}
      </PreviewGrid>
    )
  }

  const artistWorks = (data?.data ?? []).map((work) => toPreview(work.id, work.assets?.[0])).filter(isPreview)
  const previews = (
    artistWorks.length > 0
      ? artistWorks
      : fallbackAssets.map((asset) => toPreview(asset.id, asset)).filter(isPreview)
  ).slice(0, PREVIEW_COUNT)

  if (previews.length === 0) return null

  return (
    <PreviewGrid>
      {previews.map((preview) => (
        <div key={preview.id} className="relative aspect-square overflow-hidden rounded-[16px] bg-slate-100">
          <Image src={preview.src} alt="Artwork" fill sizes="100px" className="object-cover" />
          {preview.isVideo && (
            <span className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white">
              <Image src="/icons/play-icon.svg" width={9} height={9} alt="Video" />
            </span>
          )}
        </div>
      ))}
    </PreviewGrid>
  )
}