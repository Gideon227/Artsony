import { ArtCard } from '@/components/ui/art-card'
import { cn } from '@/lib/utils'
import type { Artwork } from '@/types/artwork'

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
  onArtworkClick: (artwork: Artwork) => void
}

export function MasonryArtworkGrid({ artworks, onArtworkClick }: MasonryArtworkGridProps) {
  return (
    <div className="columns-2 gap-6 px-4 sm:columns-3 md:px-8 lg:columns-4">
      {artworks.map((artwork, i) => {
        const asset = artwork.assets?.[0]
        const image = asset?.thumbnail_url || asset?.optimized_url || asset?.original_url || '/placeholder.png'

        return (
          <div key={artwork.id} className={cn('mb-6 break-inside-avoid', ASPECT_PATTERN[i % ASPECT_PATTERN.length])}>
            <ArtCard
              image={image}
              title={artwork.title}
              onCardClick={() => onArtworkClick(artwork)}
              showCart={artwork.listing_type === 'MARKETPLACE'}
              showVideo={asset?.media_type === 'VIDEO'}
              artist={[
                {
                  id: artwork.creator_id,
                  name: artwork.creator?.profile?.display_name || artwork.creator?.username || 'Artist',
                  avatarUrl: artwork.creator?.profile?.avatar_url ?? '/images/image-avatar.svg',
                },
              ]}
              stats={{ likes: String(artwork.like_count), views: String(artwork.view_count) }}
              variant="discover"
            />
          </div>
        )
      })}
    </div>
  )
}
