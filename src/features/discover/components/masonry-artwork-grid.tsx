import { ArtCard } from '@/components/ui/art-card'
import { cn } from '@/lib/utils'
import { useQuickAddToCart } from '@/hooks/use-cart-actions'
import type { Artwork } from '@/types/artwork'

// ─── Layout pattern ─────────────────────────────────────────────────────────
// Reproduces the reference comp's exact tile rhythm (a 4-col grid where
// select tiles run tall — 2 rows — or wide — 2 cols) using nothing but plain
// CSS Grid auto-placement: every tile below is a single 1×1/1×2/2×1 span,
// laid out in this order, into a `grid-cols-4` container with default
// (sparse, row-major) auto-flow. The browser's own placement algorithm then
// reconstructs the comp's layout exactly — no manual grid-row/col-start
// bookkeeping needed, and it degrades gracefully at 2/3-col breakpoints and
// keeps working correctly as more pages of real feed data are appended.
//
// Ratios below are taken directly off the comp at its reference column
// width: a single cell measures 332×304, so tall = 332×624 (two rows + the
// row gutter) and wide = 680×304 (two columns + the column gutter).
type CellSpan = 'single' | 'tall' | 'wide'

const LAYOUT_PATTERN: CellSpan[] = [
  'tall', 'single', 'single', 'single',
  'single', 'wide',
  'wide', 'tall', 'single',
  'single', 'tall', 'single', 'single',
  'wide',
  'tall', 'single', 'single', 'tall',
  'tall', 'single',
  'single', 'wide',
]

const SPAN_CLASSES: Record<CellSpan, string> = {
  single: 'aspect-[332/304]',
  tall: 'row-span-2 aspect-[332/624]',
  wide: 'col-span-2 aspect-[680/304]',
}

type MasonryArtworkGridProps = {
  artworks: Artwork[]
  onArtworkClick: (artwork: Artwork) => void
}

export function MasonryArtworkGrid({ artworks, onArtworkClick }: MasonryArtworkGridProps) {
  const { quickAdd } = useQuickAddToCart()

  return (
    <div className="py-12 px-4 md:px-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {artworks.map((artwork, i) => {
          const asset = artwork.assets?.[0]
          const image = asset?.thumbnail_url || asset?.optimized_url || asset?.original_url || '/placeholder.png'
          const span = LAYOUT_PATTERN[i % LAYOUT_PATTERN.length]!

          return (
            <div key={artwork.id} className={cn(SPAN_CLASSES[span])}>
              <ArtCard
                image={image}
                title={artwork.title}
                onCardClick={() => onArtworkClick(artwork)}
                showCart={artwork.listing_type === 'MARKETPLACE'}
                showVideo={asset?.media_type === 'VIDEO'}
                onAction={(action) => {
                  if (action === 'cart') quickAdd(artwork)
                }}
                artist={[
                  {
                    id: artwork.creator_id,
                    name: artwork.creator?.profile?.display_name || artwork.creator?.username || 'Artist',
                    avatarUrl: artwork.creator?.profile?.avatar_url ?? '/images/image-avatar.svg',
                  },
                ]}
                stats={{ likes: String(artwork.like_count), views: String(artwork.view_count) }}
                variant="discover"
                fillContainer
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
