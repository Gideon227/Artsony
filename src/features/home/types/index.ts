import type { Artwork } from '@/types'

export type FeedSort = 'trending' | 'newest' | 'recommended'

export type FeedTab = {
  label: string
  value: FeedSort | 'all'
}

export type FeaturedArtwork = {
  id: string
  imageUrl: string
  title: string
  artistName: string
  artistAvatar: string
}

export type SpotlightArtist = {
  id: string
  name: string
  avatarUrl: string
  quote: string
  artworks: Pick<Artwork, 'id' | 'imageUrl' | 'title'>[]
}

export const FEED_TABS: FeedTab[] = [
  { label: 'All', value: 'all' },
  { label: 'Trending', value: 'trending' },
  { label: 'Newest', value: 'newest' },
  { label: 'For You', value: 'recommended' },
]