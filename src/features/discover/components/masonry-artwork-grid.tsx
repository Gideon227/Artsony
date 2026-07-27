import { ArtCard } from '@/components/ui/art-card'
import type { Artwork } from '@/types'

// Cycled per item to produce the varied-height Pinterest-style rhythm from
// the reference. This is a presentational approximation, not a literal
// reproduction of the mockup's exact tile spans — a real infinite-scroll
// feed can't be hand-laid-out the way a static comp can, since the number
// and order of items isn't fixed. CSS multi-column (below) auto-flows each
// card into whichever column is currently shortest, so this holds up
// correctly across pagination instead of only looking right for the first
// screen's worth of items.
const ASPECT_PATTERN = [
  'aspect-square',
  'aspect-[3/4]',
  'aspect-[4/5]',
  'aspect-square',
  'aspect-[4/3]',
  'aspect-[3/4]',
  'aspect-square',
  'aspect-[4/5]',
]

type MasonryArtworkGridProps = {
  artworks: Artwork[]
}

export function MasonryArtworkGrid({ artworks }: MasonryArtworkGridProps) {
  return (
    <div className="columns-2 gap-6 px-4 sm:columns-3 md:px-8 lg:columns-4">
      {artworks.map((artwork, i) => (
        <div key={artwork.id} className="mb-6 break-inside-avoid">
          <ArtCard
            image={artwork.imageUrl}
            title={artwork.title}
            cardLink={`/artwork/${artwork.id}`}
            artist={[
              {
                id: artwork.artist.id,
                name: artwork.artist.displayName,
                avatarUrl: artwork.artist.avatarUrl ?? '/images/image-avatar.svg',
              },
            ]}
            stats={{ likes: String(artwork.likesCount), views: String(artwork.viewsCount) }}
            variant="discover"
            showSaleBadge={artwork.availability === 'for-sale'}
            aspectClassName={ASPECT_PATTERN[i % ASPECT_PATTERN.length]}
          />
        </div>
      ))}
    </div>
  )
}
