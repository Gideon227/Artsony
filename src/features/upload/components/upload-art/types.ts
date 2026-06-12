// upload-art/types.ts
// Local UI-only types — never sent to the API directly.
// The store holds ArtworkAsset shape; these are display/orchestration only.

import type { ArtworkMediaType } from '@/types/artwork'

export type ModalType = 'image' | 'video' | 'embed' | '3d' | null

export interface UploadedFile {
  file: File
  previewUrl: string
  uploadedAsset?: {
    original_url:    string
    optimized_url:   string | null
    thumbnail_url:   string | null
    mime_type:       string
    file_size_bytes: number
    width:           number | null
    height:          number | null
  }
}

// Local preview entry — mirrors draft.assets ordering but holds display-only fields
export interface LocalAsset {
  url:  string
  type: ArtworkMediaType | 'embed' | '3d'
  name: string
}

// ── File validation constants ─────────────────────────────────────────────────

export const ACCEPTED_IMAGE_TYPES      = ['image/jpeg', 'image/png', 'image/tiff']
export const ACCEPTED_IMAGE_EXTENSIONS = '.jpg,.jpeg,.png,.tiff,.tif'
export const ACCEPTED_VIDEO_TYPES      = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska']
export const ACCEPTED_VIDEO_EXTENSIONS = '.mp4,.mov,.avi,.mkv'
export const MAX_IMAGE_SIZE_BYTES      = 50  * 1024 * 1024   // 50 MB
export const MAX_VIDEO_SIZE_BYTES      = 500 * 1024 * 1024   // 500 MB

// ── Helpers ───────────────────────────────────────────────────────────────────

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type))
    return 'Invalid file type. Please upload JPG, PNG, or TIFF.'
  if (file.size > MAX_IMAGE_SIZE_BYTES)
    return `File too large. Maximum is 50 MB (your file: ${formatBytes(file.size)}).`
  return null
}

export function validateVideoFile(file: File): string | null {
  if (!ACCEPTED_VIDEO_TYPES.includes(file.type))
    return 'Invalid file type. Please upload MP4, MOV, AVI, or MKV.'
  if (file.size > MAX_VIDEO_SIZE_BYTES)
    return `File too large. Maximum is 500 MB (your file: ${formatBytes(file.size)}).`
  return null
}