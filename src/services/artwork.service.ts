import { apiClient } from '@/lib/api-client'
import { deleteUploadedMedia, uploadMedia, type UploadedMedia, type UploadOptions } from '@/lib/media-upload'
import type { MediaKind } from '@/lib/media-rules'
import type {
  Artwork,
  ArtworkFilters,
  CreateArtworkPayload,
  UpdateArtworkPayload,
  PaginatedArtworksResponse,
  ModerationStatus,
  ListingType,
} from '@/types/artwork'
import type { ApiResponse } from '@/types'
import { HeroArtwork } from '@/features/home/types'

// ── Helpers ───────────────────────────────────────────────────────────────────

// Converts ArtworkFilters to a params object apiClient understands.
// Arrays (categories) are serialised as repeated query params:
//   categories=painting&categories=digital
function filtersToParams(
  filters: ArtworkFilters,
): Record<string, string | number | boolean | undefined | null> {
  const { categories, ...rest } = filters
  // apiClient.get only accepts flat params — categories is handled separately
  // in the URL builder below.
  return rest as Record<string, string | number | boolean | undefined | null>
}

function buildListUrl(filters: ArtworkFilters): string {
  const base = '/api/artworks'
  const params = new URLSearchParams()

  Object.entries(filtersToParams(filters)).forEach(([k, v]) => {
    if (v !== undefined && v !== null) params.append(k, String(v))
  })

  filters.categories?.forEach((c) => params.append('categories', c))

  const qs = params.toString()
  return qs ? `${base}?${qs}` : base
}

// ── Service ───────────────────────────────────────────────────────────────────

export const artworkService = {
  // ── Reads ───────────────────────────────────────────────────────────────────

  list: (filters: ArtworkFilters = {}): Promise<PaginatedArtworksResponse> =>
    apiClient.get<PaginatedArtworksResponse>(buildListUrl(filters)),

  getById: (id: string): Promise<ApiResponse<Artwork>> =>
    apiClient.get<ApiResponse<Artwork>>(`/api/artworks/${id}`),

  getFeatured: (limit = 5) =>
    apiClient.get<ApiResponse<HeroArtwork[]>>('/api/artworks/featured', { params: { limit } }),

  getBySlug: (slug: string): Promise<ApiResponse<Artwork>> =>
    apiClient.get<ApiResponse<Artwork>>(`/api/artworks/by-slug/${slug}`),

  // ── Feed (convenience wrapper used by the existing feed section) ────────────

  getFeed: (params: {
    page?: number
    perPage?: number
    categories?: string[]
    country?: string
    state?: string
    city?: string
    size_label?: string
    sort?: 'for_you' | 'following' | 'new' | 'trending' | 'newbies'
    listingType?: ListingType
    format?: 'DIGITAL' | 'PHYSICAL'
  } = {}): Promise<PaginatedArtworksResponse> => {
    const searchParams = new URLSearchParams()
    searchParams.set('mode', params.sort ?? 'new')
    searchParams.set('page', String(params.page ?? 1))
    searchParams.set('limit', String(params.perPage ?? 12))
    params.categories?.forEach((c) => searchParams.append('categories', c))
    if (params.country)     searchParams.set('country', params.country)
    if (params.state)       searchParams.set('state', params.state)
    if (params.city)        searchParams.set('city', params.city)
    if (params.size_label)  searchParams.set('size_label', params.size_label)
    if (params.listingType) searchParams.set('listing_type', params.listingType)
    if (params.format)      searchParams.set('artwork_format', params.format)

    return apiClient.get<PaginatedArtworksResponse>(`/api/artworks/feed?${searchParams.toString()}`)
  },

  search: (query: string, filters?: Omit<ArtworkFilters, 'search'>):
    Promise<PaginatedArtworksResponse> =>
      artworkService.list({ ...filters, search: query }),

  getTopPicks: (
    limit = 8,
    period: 'all' | 'week' = 'all',
    listingType?: ListingType,
  ): Promise<ApiResponse<Artwork[]>> => {
    const params = new URLSearchParams({ limit: String(limit), period })
    if (listingType) params.set('listingType', listingType)
    return apiClient.get(`/api/artworks/top-picks?${params.toString()}`)
  },

  // "Trending regardless of upload date" — see getTrendingArtworks in the
  // backend's artwork.service.ts. Distinct from getTopPicks(period='week'),
  // which only considers artworks uploaded within the window.
  getTrending: (
    limit = 8,
    windowDays = 7,
    listingType?: ListingType,
  ): Promise<ApiResponse<Artwork[]>> => {
    const params = new URLSearchParams({ limit: String(limit), windowDays: String(windowDays) })
    if (listingType) params.set('listingType', listingType)
    return apiClient.get(`/api/artworks/trending?${params.toString()}`)
  },

  // level: which field to return distinct values for. country/state scope
  // results to a parent selection (e.g. only show states with artists
  // within the already-selected country) — omit for the top-level list.
  getLocations: (
    level: 'country' | 'state' | 'city',
    parent?: { country?: string; state?: string },
  ): Promise<ApiResponse<{ label: string; artwork_count: number }[]>> => {
    const params = new URLSearchParams({ level })
    if (parent?.country) params.set('country', parent.country)
    if (parent?.state)   params.set('state', parent.state)
    return apiClient.get(`/api/artworks/locations?${params.toString()}`)
  },

  getSizeLabels: (): Promise<ApiResponse<{ label: string; artwork_count: number }[]>> =>
    apiClient.get('/api/artworks/size-labels'),

  // ── Writes ──────────────────────────────────────────────────────────────────

  create: (payload: CreateArtworkPayload): Promise<ApiResponse<Artwork>> =>
    apiClient.post<ApiResponse<Artwork>>('/api/artworks', payload),

  update: (id: string, payload: UpdateArtworkPayload): Promise<ApiResponse<Artwork>> =>
    apiClient.patch<ApiResponse<Artwork>>(`/api/artworks/${id}`, payload),

  // ── Status transitions ──────────────────────────────────────────────────────

  publish: (id: string): Promise<ApiResponse<Artwork>> =>
    apiClient.post<ApiResponse<Artwork>>(`/api/artworks/${id}/publish`),

  archive: (id: string): Promise<ApiResponse<Artwork>> =>
    apiClient.post<ApiResponse<Artwork>>(`/api/artworks/${id}/archive`),

  delete: (id: string): Promise<void> =>
    apiClient.delete<void>(`/api/artworks/${id}`),

  // ── Engagement ──────────────────────────────────────────────────────────────

  // toggle_artwork_like is a genuine toggle server-side (POST flips current
  // state, there's no separate "add"/"remove" endpoint — no DELETE route
  // exists for this path). Always trust the returned {liked, like_count}
  // rather than assuming which direction the toggle went.
  toggleLike: (id: string): Promise<ApiResponse<{ liked: boolean; like_count: number }>> =>
    apiClient.post<ApiResponse<{ liked: boolean; like_count: number }>>(`/api/artworks/${id}/like`),

  view: (id: string): Promise<ApiResponse<void>> =>
    apiClient.post(`/api/artworks/${id}/view`),

  // save: (id: string): Promise<void> =>
  //   apiClient.post<void>(`/api/artworks/${id}/save`),

  // unsave: (id: string): Promise<void> =>
  //   apiClient.delete<void>(`/api/artworks/${id}/save`),

  toggleSave: (id: string): Promise<ApiResponse<{ saved: boolean; save_count: number }>> =>
    apiClient.post(`/api/artworks/${id}/save`),

  report: (id: string, reason: string, notes?: string): Promise<ApiResponse<void>> =>
    apiClient.post(`/api/artworks/${id}/report`, { reason, notes }),

  // ── Moderation (MODERATOR / ADMIN only) ─────────────────────────────────────

  flag: (
    id: string,
    notes: string,
    moderationStatus: Exclude<ModerationStatus, 'PENDING'>,
  ): Promise<ApiResponse<Artwork>> =>
    apiClient.post<ApiResponse<Artwork>>(`/api/artworks/${id}/flag`, {
      notes,
      moderation_status: moderationStatus,
    }),

  // ── Media upload (direct to Cloudinary with a server-issued signature) ──────

  uploadAsset: (file: File, kind: MediaKind, options?: UploadOptions): Promise<UploadedMedia> =>
    uploadMedia(file, kind, options),

  deleteUploadedAsset: (kind: MediaKind, publicId: string): Promise<void> =>
    deleteUploadedMedia(kind, publicId),
}