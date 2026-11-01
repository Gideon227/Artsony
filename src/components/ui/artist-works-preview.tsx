'use client'

import * as React from 'react'
import Image from 'next/image'
import { useCreatorArtworks } from '@/hooks/use-artwork'
import type { Artwork, ArtworkAsset } from '@/types/artwork'

// Always try to show this many tiles — fewer only when the artist truly has fewer usable images.
const PREVIEW_COUNT = 3
// Pull plenty of candidates so broken/unpaintable ones can be skipped and replaced.
const FETCH_LIMIT = 8

type Candidate = {
  key: string
  src: string
  /** How to paint it: stills as <img>, videos with no thumbnail as a <video> first frame. */
  kind: 'image' | 'video'
  /** Show the play badge (the underlying asset is a video). */
  isVideo: boolean
}

type PreviewAsset = Pick<ArtworkAsset, 'media_type' | 'thumbnail_url' | 'optimized_url' | 'original_url'>

/**
 * Only returns something a browser can actually paint. For IMAGE assets the
 * optimized/original file works; for VIDEO we can paint a first frame; for
 * PDF / 3D / external links only a generated thumbnail works — without one the
 * asset is skipped (falling back to its file URL is what produced broken tiles).
 */
function toCandidate(key: string, asset: PreviewAsset | undefined): Candidate | null {
  if (!asset) return null
  const isVideo = asset.media_type === 'VIDEO'

  if (asset.thumbnail_url) return { key, src: asset.thumbnail_url, kind: 'image', isVideo }

  const file = asset.optimized_url || asset.original_url
  if (!file) return null
  if (asset.media_type === 'IMAGE') return { key, src: file, kind: 'image', isVideo }
  if (isVideo) return { key, src: file, kind: 'video', isVideo }
  return null
}

/** One per artwork first (newest first), then second assets, and so on — distinct works come before extras. */
function buildCandidates(works: Array<{ id: string; assets?: ArtworkAsset[] | null }>): Candidate[] {
  const depth = Math.max(0, ...works.map((w) => w.assets?.length ?? 0))
  const out: Candidate[] = []
  for (let i = 0; i < depth; i++) {
    for (const work of works) {
      const candidate = toCandidate(`${work.id}:${i}`, work.assets?.[i])
      if (candidate) out.push(candidate)
    }
  }
  return out
}

function PreviewGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid w-full grid-cols-3 gap-2">{children}</div>
}

type ArtistWorksPreviewProps = {
  creatorId: string
  /** Hovered artwork's own media — tops the strip up when the artist's list is short or unavailable. */
  fallbackAssets?: ArtworkAsset[]
}

/**
 * The strip in the artist hover profile: the artist's latest published works
 * (any listing type, for sale or portfolio), always filled to 3 when enough
 * images exist.
 */
export function ArtistWorksPreview({ creatorId, fallbackAssets = [] }: ArtistWorksPreviewProps) {
  const { data, isLoading } = useCreatorArtworks(creatorId, true, FETCH_LIMIT)
  // Tiles whose file failed to load are dropped and replaced by the next candidate.
  const [failedKeys, setFailedKeys] = React.useState<Set<string>>(() => new Set())

  const markFailed = React.useCallback(
    (key: string) => setFailedKeys((prev) => (prev.has(key) ? prev : new Set(prev).add(key))),
    [],
  )

  if (isLoading) {
    return (
      <PreviewGrid>
        {Array.from({ length: PREVIEW_COUNT }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-[16px] bg-slate-100" />
        ))}
      </PreviewGrid>
    )
  }

  const pool = [
    ...buildCandidates((data?.data ?? []) as Array<Pick<Artwork, 'id' | 'assets'>>),
    ...buildCandidates([{ id: 'current', assets: fallbackAssets }]),
  ]

  const seenSrc = new Set<string>()
  const previews = pool
    .filter((c) => {
      if (failedKeys.has(c.key) || seenSrc.has(c.src)) return false
      seenSrc.add(c.src)
      return true
    })
    .slice(0, PREVIEW_COUNT)

  if (previews.length === 0) return null

  return (
    <PreviewGrid>
      {previews.map((preview) => (
        <div key={preview.key} className="relative aspect-square overflow-hidden rounded-[16px] bg-slate-100">
          {preview.kind === 'video' ? (
            <video
              src={`${preview.src}#t=0.1`}
              muted
              playsInline
              preload="metadata"
              onError={() => markFailed(preview.key)}
              className="h-full w-full object-cover"
            />
          ) : (
            <Image
              src={preview.src}
              alt="Artwork"
              fill
              sizes="100px"
              onError={() => markFailed(preview.key)}
              className="object-cover"
            />
          )}
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