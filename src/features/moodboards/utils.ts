import type { MoodboardArtwork } from './types'

// Mirrors artwork.repository.ts#pickThumbnail on the backend — same
// ordering_index -> thumbnail_url -> optimized_url -> original_url fallback,
// applied to the artworks embedded in a moodboard response.
export function pickMoodboardThumbnail(artwork: MoodboardArtwork): string | null {
  const assets = artwork.assets
  if (!assets || assets.length === 0) return null
  const primary = [...assets].sort((a, b) => a.ordering_index - b.ordering_index)[0]
  return primary?.thumbnail_url ?? primary?.optimized_url ?? primary?.original_url ?? null
}
