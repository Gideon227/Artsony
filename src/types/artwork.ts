// src/types/artwork.ts
// Mirrors the backend artwork.types.ts exactly.
// Import from here on the frontend — never duplicate these shapes.

import { User } from "."

export type ListingType = 'MARKETPLACE' | 'PORTFOLIO'
export type ArtworkFormat = 'DIGITAL' | 'PHYSICAL'
export type ArtworkMediaType = 'IMAGE' | 'VIDEO' | 'THREE_D' | 'EXTERNAL_LINK'
export type ArtworkVisibility = 'PUBLIC' | 'PRIVATE' | 'UNLISTED'
export type ArtworkStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'UNDER_REVIEW'
export type ModerationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED'
export type UploadFlowType = 'SHARE' | 'PHYSICAL_ART' | 'DIGITAL_ART'

export type ArtworkAsset = {
  id: string
  original_url: string
  optimized_url: string | null
  thumbnail_url: string | null
  media_type: ArtworkMediaType
  width: number | null
  height: number | null
  duration_secs: number | null
  mime_type: string
  file_size_bytes: number
  ordering_index: number
}

export type PhysicalDetails = {
  length: number
  width: number
  height: number
  unit: 'cm' | 'in'
  available_quantity: number
  shipping_regions: string[]
  ships_worldwide: boolean
}

export type VariantOption = {
  id: string
  label: string
  price_modifier: number
  sku: string | null
  stock: number | null
  is_available: boolean
}

export type Variant = {
  id: string
  type: 'SIZE' | 'COLOR' | 'MATERIAL' | 'FRAMING' | 'EDITION'
  name: string
  options: VariantOption[]
}

export type Artwork = {
  id: string
  listing_type: ListingType
  artwork_format: ArtworkFormat
  title: string
  description: string
  slug: string
  categories: string[]
  keywords: string[]
  creator_id: string
  creator: Partial<User>
  collaborator_ids: string[]
  tools_used: string[]
  assets: ArtworkAsset[]
  visibility: ArtworkVisibility
  allow_moodboard_save: boolean
  allow_comments: boolean
  allow_likes: boolean
  show_engagement_stats: boolean
  status: ArtworkStatus
  is_flagged: boolean
  moderation_status: ModerationStatus
  reviewed_by: string | null
  review_notes: string | null
  price: number | null
  currency: string
  max_purchase_quantity: number | null
  physical_details: PhysicalDetails | null
  has_variants: boolean
  variants: Variant[]
  view_count: number
  like_count: number
  save_count: number
  comment_count: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// ── DTOs ──────────────────────────────────────────────────────────────────────

export type CreateArtworkPayload = {
  id: string
  listing_type: ListingType
  artwork_format: ArtworkFormat
  title: string
  description: string
  categories?: string[]
  created_at?: Date
  keywords?: string[]
  collaborator_ids?: string[]
  tools_used?: string[]
  assets: Omit<ArtworkAsset, 'id'>[]
  visibility?: ArtworkVisibility
  allow_moodboard_save?: boolean
  allow_comments?: boolean
  allow_likes?: boolean
  view_count: number
  like_count: number
  save_count: number
  comment_count: number
  show_engagement_stats?:boolean
  price?: number
  currency?: string
  max_purchase_quantity?:number
  physical_details?: PhysicalDetails
  has_variants: boolean
  variants?: Omit<Variant, 'id'>[]
}

export type UpdateArtworkPayload = Partial<Omit<
  CreateArtworkPayload,
  'listing_type' | 'artwork_format'
>>

export type ArtworkFilters = {
  page?:           number
  limit?:          number
  sort_by?:        'created_at' | 'like_count' | 'view_count' | 'price'
  sort_order?:     'asc' | 'desc'
  listing_type?:   ListingType
  artwork_format?: ArtworkFormat
  status?:         ArtworkStatus
  visibility?:     ArtworkVisibility
  creator_id?:     string
  search?:         string
  categories?:     string[]
  min_price?:      number
  max_price?:      number
}

export type PaginatedArtworksResponse = {
  success:     boolean
  data:        Artwork[]
  total:       number
  page:        number
  limit:       number
  total_pages: number
  has_next:    boolean
  has_prev:    boolean
}
