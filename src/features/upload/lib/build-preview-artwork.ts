import type { User } from '@/types'
import type { Artwork } from '@/types/artwork'
import type { ArtworkDraft } from '@/store/artwork.store'

export const PREVIEW_ARTWORK_ID = 'preview'

/**
 * Turns the in-progress upload draft into the same `Artwork` shape the real
 * viewer overlays receive, so the preview looks exactly like a published piece.
 * Nothing here is persisted — it only exists in memory while previewing.
 */
export function buildPreviewArtwork(draft: ArtworkDraft, user: User | null): Artwork {
  const now = new Date().toISOString()

  return {
    id: PREVIEW_ARTWORK_ID,
    slug: PREVIEW_ARTWORK_ID,
    listing_type: draft.listing_type ?? 'PORTFOLIO',
    artwork_format: draft.artwork_format ?? 'DIGITAL',
    title: draft.title || 'Untitled Artwork',
    description: draft.description ?? '',
    categories: draft.categories ?? [],
    keywords: draft.keywords ?? [],
    creator_id: user?.id ?? '',
    is_liked: false,
    creator: user
      ? {
          id: user.id,
          username: user.username,
          role: user.role,
          is_following: false,
          profile: {
            display_name: user.username,
            avatar_url: user.avatarUrl ?? null,
            followers_count: user.followersCount ?? 0,
            following_count: user.followingCount ?? 0,
            artworks_count: 0,
            sales_count: 0,
          },
        }
      : undefined,
    collaborator_ids: (draft.collaborator_ids ?? []).map(String),
    tools_used: draft.tools_used ?? [],
    assets: (draft.assets ?? []).map((asset, index) => ({
      ...asset,
      id: `preview-asset-${index}`,
      ordering_index: asset.ordering_index ?? index,
    })),
    visibility: draft.visibility ?? 'PUBLIC',
    allow_moodboard_save: draft.allow_moodboard_save ?? true,
    allow_comments: draft.allow_comments ?? true,
    allow_likes: draft.allow_likes ?? true,
    show_engagement_stats: draft.show_engagement_stats ?? true,
    status: 'DRAFT',
    is_flagged: false,
    is_saved: false,
    moderation_status: 'PENDING',
    reviewed_by: null,
    review_notes: null,
    price: draft.price ?? null,
    currency: draft.currency ?? 'USD',
    max_purchase_quantity: draft.max_purchase_quantity ?? null,
    physical_details: draft.physical_details ?? null,
    has_variants: draft.has_variants ?? false,
    variants: (draft.variants ?? []).map((variant, index) => ({
      ...variant,
      id: `preview-variant-${index}`,
    })),
    view_count: 0,
    like_count: 0,
    save_count: 0,
    comment_count: 0,
    created_at: draft.created_at ? new Date(draft.created_at).toISOString() : now,
    updated_at: now,
    deleted_at: null,
    license_type: draft.license_type ?? null,
    license: null,
  }
}