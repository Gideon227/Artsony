// Mirrors GET /api/moodboards (list-mine) response — MoodboardSummary on the
// backend. Kept snake_case to match the actual API payload rather than
// inventing a camelCase transform layer that doesn't exist elsewhere here.
export type MoodboardSummary = {
  id: string
  title: string
  artwork_count: number
  created_at: string
  updated_at: string
}

// The backend embeds `artworks(*)` — i.e. full artworks rows, including the
// JSONB `assets` array. Only the fields this feature actually reads are
// typed; the rest passes through untyped rather than guessing at columns
// this feature doesn't use.
export type MoodboardArtworkAsset = {
  thumbnail_url: string | null
  optimized_url: string | null
  original_url: string | null
  ordering_index: number
}

export type MoodboardArtwork = {
  id: string
  title: string
  slug?: string
  assets?: MoodboardArtworkAsset[]
  [key: string]: unknown
}

// Mirrors GET /api/moodboards/:id — the full Moodboard type on the backend.
export type Moodboard = {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
  artworks: MoodboardArtwork[]
}
