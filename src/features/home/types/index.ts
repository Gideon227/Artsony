import type { Artwork } from '@/types'

export type HeroArtworkCreator = {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  role: 'USER' | 'ARTIST' | 'MODERATOR' | 'ADMIN'
}

export type HeroArtwork = {
  id: string
  slug: string
  title: string
  description: string
  thumbnail_url: string | null
  view_count: number
  like_count: number
  purchase_count: number
  creator: HeroArtworkCreator
}

// 'following' and 'newbies' have no backend support yet (no follow-graph
// query on the feed, no "new artist" flag) — they're wired to sensible
// fallbacks in getFeed() until that ships. 'for_you' has no recommendation
// engine yet either, so it currently == the default feed order.
export type FeedSort = 'for_you' | 'following' | 'new' | 'trending' | 'newbies'

export type FeedTab = {
  label: string
  value: FeedSort
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
  { label: 'For you',  value: 'for_you' },
  { label: 'Following', value: 'following' },
  { label: 'New',       value: 'new' },
  { label: 'Trending',  value: 'trending' },
  { label: 'Newbies',   value: 'newbies' },
]