import type { Artwork, ArtworkAsset, ArtworkMediaType } from '@/types/artwork'
import type { ArtworkDraft } from '@/store/artwork.store'

const MEDIA_TYPES: ArtworkMediaType[] = ['IMAGE', 'VIDEO', 'THREE_D', 'EXTERNAL_LINK', 'PDF']

const toInt = (value: unknown): number | undefined => {
  const n = Math.round(Number(value))
  return Number.isFinite(n) && n > 0 ? n : undefined
}

export function sanitizeAssets(assets: unknown): Omit<ArtworkAsset, 'id'>[] {
  if (!Array.isArray(assets)) return []

  return assets.map((asset: Partial<ArtworkAsset>, index) => {
    const mediaType = MEDIA_TYPES.includes(asset.media_type as ArtworkMediaType)
      ? (asset.media_type as ArtworkMediaType)
      : 'IMAGE'

    const width = toInt(asset.width)
    const height = toInt(asset.height)
    const duration = Number(asset.duration_secs)

    return {
      original_url: asset.original_url as string,
      media_type: mediaType,
      mime_type: asset.mime_type || 'image/jpeg',
      file_size_bytes: Math.max(0, Math.round(Number(asset.file_size_bytes) || 0)),
      ordering_index: index,
      ...(asset.public_id ? { public_id: asset.public_id } : {}),
      ...(asset.optimized_url ? { optimized_url: asset.optimized_url } : {}),
      ...(asset.thumbnail_url ? { thumbnail_url: asset.thumbnail_url } : {}),
      ...(width ? { width } : {}),
      ...(height ? { height } : {}),
      ...(mediaType === 'VIDEO' && Number.isFinite(duration) && duration > 0
        ? { duration_secs: Math.round(duration * 100) / 100 }
        : {}),
    } as Omit<ArtworkAsset, 'id'>
  })
}

// ApiError carries the backend's per-field messages in `fields`; showing only
// `message` would reduce "add a keyword" to "Validation failed".
export function describeSaveError(error: unknown, fallback: string): string {
  const fields = (error as { fields?: unknown } | null)?.fields
  if (fields && typeof fields === 'object' && !Array.isArray(fields)) {
    const messages = Object.values(fields).filter((v): v is string => typeof v === 'string')
    if (messages.length > 0) return messages.join('\n')
  }
  return error instanceof Error && error.message ? error.message : fallback
}

export function draftFromArtwork(artwork: Artwork): ArtworkDraft {
  const assets = [...artwork.assets]
    .sort((a, b) => a.ordering_index - b.ordering_index)
    .map(({ id: _id, ...asset }) => asset)

  return {
    id: artwork.id,
    listing_type: artwork.listing_type,
    artwork_format: artwork.artwork_format,
    title: artwork.title,
    description: artwork.description,
    categories: artwork.categories,
    keywords: artwork.keywords,
    collaborator_ids: artwork.collaborator_ids,
    tools_used: artwork.tools_used,
    assets,
    visibility: artwork.visibility,
    allow_moodboard_save: artwork.allow_moodboard_save,
    allow_comments: artwork.allow_comments,
    allow_likes: artwork.allow_likes,
    show_engagement_stats: artwork.show_engagement_stats,
    has_variants: artwork.has_variants,
    variants: artwork.variants,
    ...(artwork.price !== null ? { price: artwork.price } : {}),
    ...(artwork.currency ? { currency: artwork.currency } : {}),
    ...(artwork.max_purchase_quantity !== null ? { max_purchase_quantity: artwork.max_purchase_quantity } : {}),
    ...(artwork.physical_details ? { physical_details: artwork.physical_details } : {}),
    ...(artwork.license_type ? { license_type: artwork.license_type } : {}),
  }
}

export function draftRoute(artwork: Pick<Artwork, 'id' | 'listing_type' | 'artwork_format'>): string {
  if (artwork.listing_type === 'MARKETPLACE') {
    return `/artworks/upload/${artwork.id}/sell/${artwork.artwork_format.toLowerCase()}`
  }
  return `/artworks/upload/${artwork.id}/share`
}
