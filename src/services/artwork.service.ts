import { apiClient, getMemoryToken } from '@/lib/api-client'
import type {
  Artwork,
  ArtworkFilters,
  CreateArtworkPayload,
  UpdateArtworkPayload,
  PaginatedArtworksResponse,
  ModerationStatus,
} from '@/types/artwork'
import type { ApiResponse } from '@/types'

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

  getBySlug: (slug: string): Promise<ApiResponse<Artwork>> =>
    apiClient.get<ApiResponse<Artwork>>(`/api/artworks/by-slug/${slug}`),

  // ── Feed (convenience wrapper used by the existing feed section) ────────────

  getFeed: (params: {
    page?: number
    perPage?: number
    category?: string
    sort?: 'newest' | 'trending' | 'recommended'
  } = {}): Promise<PaginatedArtworksResponse> => {
    const sortMap: Record<string, ArtworkFilters['sort_by']> = {
      newest:      'created_at',
      trending:    'like_count',
      recommended: 'like_count',  // placeholder until recommendation engine ships
    }

    return artworkService.list({
      page:       params.page ?? 1,
      limit:      params.perPage ?? 12,
      sort_by:    params.sort ? sortMap[params.sort] : 'created_at',
      sort_order: 'desc',
      categories: params.category ? [params.category] : undefined,
      visibility: 'PUBLIC',
      status:     'PUBLISHED',
    })
  },

  search: (query: string, filters?: Omit<ArtworkFilters, 'search'>):
    Promise<PaginatedArtworksResponse> =>
      artworkService.list({ ...filters, search: query }),

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

  like: (id: string): Promise<ApiResponse<Artwork>> =>
    apiClient.post<ApiResponse<Artwork>>(`/api/artworks/${id}/like`),

  unlike: (id: string): Promise<ApiResponse<Artwork>> =>
    apiClient.delete<ApiResponse<Artwork>>(`/api/artworks/${id}/like`),

  save: (id: string): Promise<void> =>
    apiClient.post<void>(`/api/artworks/${id}/save`),

  unsave: (id: string): Promise<void> =>
    apiClient.delete<void>(`/api/artworks/${id}/save`),

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

  // ── Image upload (multipart — bypasses apiClient JSON default) ──────────────

  uploadAsset: async (file: File): Promise<{
    original_url:    string
    optimized_url:   string | null
    thumbnail_url:   string | null
    mime_type:       string
    file_size_bytes: number
    width:           number | null
    height:          number | null
  }> => {
    const uploadUrl = `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/upload/artwork`

    // ── DEV FALLBACK ────────────────────────────────────────────────────────────
    if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_API_URL) {
      console.warn(
        '[UploadArt] NEXT_PUBLIC_API_URL is not set — using local blob URL fallback.',
        '\nSet it in .env.local to point at your real API.',
      )

      let width: number | null  = null
      let height: number | null = null
      if (file.type.startsWith('image/')) {
        try {
          const bitmap = await createImageBitmap(file)
          width  = bitmap.width
          height = bitmap.height
          bitmap.close()
        } catch { /* non-critical */ }
      }

      const blobUrl = URL.createObjectURL(file)
      return {
        original_url:    blobUrl,
        optimized_url:   blobUrl,
        thumbnail_url:   blobUrl,
        mime_type:       file.type,
        file_size_bytes: file.size,
        width,
        height,
      }
    }
    // ── END DEV FALLBACK ────────────────────────────────────────────────────────

    const form = new FormData()
    form.append('file', file)

    return apiClient.post('/api/upload/artwork', form)

    // Grab the active token from the application's memory layer
    // const token = getMemoryToken()
    // const authHeaders: Record<string, string> = token
    //   ? { Authorization: `Bearer ${token}` }
    //   : {}

    // let res: Response
    // try {
    //   res = await fetch(uploadUrl, {
    //     method:      'POST',
    //     body:        form,
    //     credentials: 'include',
    //     headers: {
    //       ...authHeaders,
    //       // CRITICAL: Do NOT explicitly set 'Content-Type': 'multipart/form-data'.
    //       // Leaving it blank lets the browser inject the form boundaries dynamically.
    //     },
    //   })
    // } catch (networkErr) {
    //   const detail = networkErr instanceof Error ? networkErr.message : String(networkErr)
    //   console.error('[UploadArt] Network error calling', uploadUrl, detail)
    //   throw new Error(
    //     `Cannot reach the upload server at ${uploadUrl}. ` +
    //     `Check that NEXT_PUBLIC_API_URL is correct and the server is running. (${detail})`
    //   )
    // }

    // if (!res.ok) {
    //   let serverMessage = `Upload failed — ${res.status} ${res.statusText}`
    //   try {
    //     const body = await res.json()
    //     serverMessage = body.message ?? body.error ?? body.detail ?? serverMessage
    //   } catch {
    //     // Body wasn't JSON status message fallback
    //   }
    //   console.error('[UploadArt] Server error from', uploadUrl, serverMessage)
    //   throw new Error(serverMessage)
    // }

    // return res.json()
  },

  
}