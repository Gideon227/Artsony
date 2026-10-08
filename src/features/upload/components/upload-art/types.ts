// upload-art/types.ts
// Local UI-only types — never sent to the API directly.
// The store holds ArtworkAsset shape; these are display/orchestration only.

import type { ArtworkAsset } from '@/types/artwork'
import type { UploadedMedia } from '@/lib/media-upload'
import { MEDIA_RULES, formatBytes, validateMediaFile } from '@/lib/media-rules'

export type ModalType = 'image' | 'video' | 'embed' | '3d' | 'pdf' | null
export type ModalKind = Exclude<ModalType, null>
export type DraftAsset = Omit<ArtworkAsset, 'id'>

export interface UploadedFile {
  file: File
  previewUrl: string
  uploadedAsset?: UploadedMedia
}

// ── File validation ───────────────────────────────────────────────────────────
// Limits and accepted formats live in @/lib/media-rules (shared with the
// upload client); these are the UI-facing names the modals already use.

export const ACCEPTED_IMAGE_EXTENSIONS = '.jpg,.jpeg,.png,.tiff,.tif'
export const ACCEPTED_VIDEO_EXTENSIONS = '.mp4,.mov,.avi,.mkv'
export const ACCEPTED_PDF_EXTENSIONS   = MEDIA_RULES.PDF.extensions.map((ext) => `.${ext}`).join(',')
export const ACCEPTED_3D_EXTENSIONS    = MEDIA_RULES.THREE_D.extensions.map((ext) => `.${ext}`).join(',')
export const MAX_IMAGE_SIZE_BYTES      = MEDIA_RULES.IMAGE.maxBytes
export const MAX_VIDEO_SIZE_BYTES      = MEDIA_RULES.VIDEO.maxBytes

export { formatBytes }

export function validateImageFile(file: File): string | null {
  return validateMediaFile(file, 'IMAGE')
}

export function validateVideoFile(file: File): string | null {
  return validateMediaFile(file, 'VIDEO')
}