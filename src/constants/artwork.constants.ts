// Artwork-specific query keys — extend the existing QUERY_KEYS map
export const ARTWORK_QUERY_KEYS = {
  all:      ['artworks'] as const,
  lists:    () => ['artworks', 'list'] as const,
  list:     (filters: object) => ['artworks', 'list', filters] as const,
  feed:     (params: object) => ['artworks', 'feed', params] as const,
  byId:     (id: string)     => ['artworks', 'detail', id] as const,
  bySlug:   (slug: string)   => ['artworks', 'slug', slug] as const,
  myDrafts: ()               => ['artworks', 'my-drafts'] as const,
  search:   (q: string, f?: object) => ['artworks', 'search', q, f] as const,
} as const

// Listing type display labels
export const LISTING_TYPE_LABELS: Record<string, string> = {
  MARKETPLACE: 'For Sale',
  PORTFOLIO: 'Portfolio Only',
}

// Artwork format display labels
export const ARTWORK_FORMAT_LABELS: Record<string, string> = {
  DIGITAL:  'Digital',
  PHYSICAL: 'Physical',
}

// Media type display labels
export const MEDIA_TYPE_LABELS: Record<string, string> = {
  IMAGE: 'Image',
  VIDEO: 'Video',
  THREE_D: '3D Model',
  EXTERNAL_LINK: 'External Link',
}

// Visibility display labels
export const VISIBILITY_LABELS: Record<string, string> = {
  PUBLIC: 'Public',
  PRIVATE: 'Private',
  UNLISTED: 'Unlisted',
}

// Status display labels + badge variant mapping
export const STATUS_LABELS: Record<string, string> = {
  DRAFT:        'Draft',
  PUBLISHED:    'Published',
  ARCHIVED:     'Archived',
  UNDER_REVIEW: 'Under Review',
}

export const STATUS_BADGE_VARIANT: Record<string, string> = {
  DRAFT: 'default',
  PUBLISHED: 'success',
  ARCHIVED: 'warning',
  UNDER_REVIEW: 'info',
}

// Variant type display labels
export const VARIANT_TYPE_LABELS: Record<string, string> = {
  SIZE: 'Size',
  COLOR: 'Color',
  MATERIAL: 'Material',
  FRAMING: 'Framing',
  EDITION: 'Edition',
}

// Allowed MIME types for upload (client-side pre-validation before hitting the API)
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml',
] as const

export const ALLOWED_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/webm',
] as const

export const ALLOWED_3D_MIME_TYPES = [
  'model/gltf-binary',
  'model/gltf+json',
] as const

export const ALL_ALLOWED_MIME_TYPES = [
  ...ALLOWED_IMAGE_MIME_TYPES,
  ...ALLOWED_VIDEO_MIME_TYPES,
  ...ALLOWED_3D_MIME_TYPES,
] as const

export const MAX_ASSET_SIZE_BYTES = 50 * 1024 * 1024  // 50 MB
export const MAX_ASSETS_PER_ARTWORK = 10
export const MAX_VARIANTS_PER_ARTWORK = 10
export const MAX_OPTIONS_PER_VARIANT = 20
