import { useEffect, useState } from 'react'
import { artworkService } from '@/services/artwork.service'
import type { Artwork } from '@/types/artwork'

export type ShowcaseArtwork = {
  id: string
  src: string
  alt: string
  artist: { name: string; avatar: string }
}

// Fallback set used only if the API call fails or the platform doesn't yet
// have enough distinct-artist public artworks to fill the grid — keeps the
// auth pages looking intentional instead of broken/empty during early days.
const FALLBACK_POOL: ShowcaseArtwork[] = [
  { id: 'fallback-1', src: '/images/masonry-tree.png', alt: 'Tree branches', artist: { name: 'Amara Obi', avatar: '/images/image-avatar.svg' } },
  { id: 'fallback-2', src: '/images/masonry-pottery.png', alt: 'Ceramic pottery', artist: { name: 'Kemi Adeyemi', avatar: '/images/image-avatar.svg' } },
  { id: 'fallback-3', src: '/images/blossom.png', alt: 'Pink blossom trees', artist: { name: 'Tunde Fashola', avatar: '/images/image-avatar.svg' } },
  { id: 'fallback-4', src: '/images/hands.png', alt: 'Painted hands', artist: { name: 'Uzochukwu', avatar: '/images/image-avatar.svg' } },
  { id: 'fallback-5', src: '/images/abstract-face.png', alt: 'Colorful portrait', artist: { name: 'Zara Bello', avatar: '/images/image-avatar.svg' } },
]

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy
}

function toShowcase(artwork: Artwork): ShowcaseArtwork | null {
  const thumb =
    artwork.assets?.[0]?.thumbnail_url ??
    artwork.assets?.[0]?.optimized_url ??
    artwork.assets?.[0]?.original_url ??
    null

  if (!thumb || !artwork.creator) return null

  return {
    id: artwork.id,
    src: thumb,
    alt: artwork.title,
    artist: {
      name: artwork.creator.profile?.display_name || artwork.creator.username || 'Unknown Artist',
      avatar: artwork.creator.profile?.avatar_url || '/images/image-avatar.svg',
    },
  }
}

// Picks `count` artworks, each from a distinct artist, in a fresh random
// order on every mount — i.e. every visit to a login/signup/forgot-password/
// reset-password page gets a different set. There's no random-sort option on
// the backend, so this pulls a decent-sized recent pool and shuffles/dedupes
// client-side rather than relying on the API to randomize.
export function useRandomShowcaseArtworks(count: number): {
  artworks: ShowcaseArtwork[]
  isLoading: boolean
} {
  const [artworks, setArtworks] = useState<ShowcaseArtwork[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const res = await artworkService.list({
          visibility: 'PUBLIC',
          status: 'PUBLISHED',
          sort_by: 'created_at',
          sort_order: 'desc',
          limit: 40,
        })

        const byArtist = new Map<string, ShowcaseArtwork>()
        for (const artwork of res.data) {
          if (byArtist.has(artwork.creator_id)) continue
          const showcase = toShowcase(artwork)
          if (showcase) byArtist.set(artwork.creator_id, showcase)
        }

        let picked = shuffle([...byArtist.values()]).slice(0, count)

        if (picked.length < count) {
          const filler = shuffle(FALLBACK_POOL).slice(0, count - picked.length)
          picked = [...picked, ...filler]
        }

        if (!cancelled) setArtworks(picked)
      } catch {
        if (!cancelled) setArtworks(shuffle(FALLBACK_POOL).slice(0, count))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { artworks, isLoading }
}