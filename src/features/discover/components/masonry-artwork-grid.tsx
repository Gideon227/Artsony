import { ArtCard } from '@/components/ui/art-card'
import { cn } from '@/lib/utils'
import { useQuickAddToCart } from '@/hooks/use-cart-actions'
import type { Artwork } from '@/types/artwork'

type CellSpan = 'single' | 'tall' | 'wide'

const DESKTOP_PATTERN: CellSpan[] = [
  'tall', 'single', 'single', 'single',
  'single', 'wide',
  'wide', 'tall', 'single',
  'single', 'tall', 'single',
  'single', 'wide',
]

const MOBILE_PATTERN: CellSpan[] = [
  'single', 'tall', 'single', 'single',
  'single', 'single', 'single', 'tall',
]

const MOBILE_SPAN: Record<CellSpan, string> = {
  single: 'row-span-1',
  tall: 'row-span-2',
  wide: 'row-span-1',
}

const DESKTOP_SPAN: Record<CellSpan, string> = {
  single: 'sm:row-span-1',
  tall: 'sm:row-span-2',
  wide: 'sm:row-span-1 sm:col-span-2',
}

const ROW_HEIGHT =
  'calc((100cqw - (var(--cols) - 1) * var(--gap)) / var(--cols) * var(--ratio))'

type MasonryArtworkGridProps = {
  artworks: Artwork[]
  onArtworkClick: (artwork: Artwork) => void
}

export function MasonryArtworkGrid({ artworks, onArtworkClick }: MasonryArtworkGridProps) {
  const { quickAdd } = useQuickAddToCart()

  return (
    <div
      className="mx-auto w-full max-w-[1440px] px-4 py-12 md:px-8"
      style={{ containerType: 'inline-size' }}
    >
      <div
        className="grid grid-cols-1 gap-[var(--gap)] [--cols:1] [--gap:1rem] [--ratio:0.8803] sm:grid-cols-2 sm:[--cols:2] sm:[--ratio:0.9157] lg:grid-cols-4 lg:[--cols:4]"
        style={{ gridAutoRows: ROW_HEIGHT }}
      >
        {artworks.map((artwork, i) => {
          const asset = artwork.assets?.[0]
          const image =
            asset?.thumbnail_url || asset?.optimized_url || asset?.original_url || '/placeholder.png'
          const mobileSpan = MOBILE_PATTERN[i % MOBILE_PATTERN.length]!
          const desktopSpan = DESKTOP_PATTERN[i % DESKTOP_PATTERN.length]!

          return (
            <div
              key={artwork.id}
              className={cn('min-h-0 min-w-0', MOBILE_SPAN[mobileSpan], DESKTOP_SPAN[desktopSpan])}
            >
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
                    name:
                      artwork.creator?.profile?.display_name || artwork.creator?.username || 'Artist',
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