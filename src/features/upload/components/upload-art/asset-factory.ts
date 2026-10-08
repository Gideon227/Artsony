import type { DraftAsset, UploadedFile } from './types'

export function assetFromUpload(
  file: UploadedFile,
  mediaType: 'IMAGE' | 'VIDEO' | 'PDF' | 'THREE_D',
): DraftAsset | null {
  const uploaded = file.uploadedAsset
  if (!uploaded) return null

  return {
    public_id:       uploaded.public_id,
    original_url:    uploaded.original_url,
    optimized_url:   uploaded.optimized_url,
    thumbnail_url:   uploaded.thumbnail_url,
    media_type:      mediaType,
    mime_type:       uploaded.mime_type,
    file_size_bytes: uploaded.file_size_bytes,
    width:           uploaded.width,
    height:          uploaded.height,
    duration_secs:   mediaType === 'VIDEO' ? uploaded.duration_secs : null,
    ordering_index:  0,
  }
}

export function assetFromLink(url: string): DraftAsset {
  return {
    original_url:    url,
    optimized_url:   null,
    thumbnail_url:   null,
    media_type:      'EXTERNAL_LINK',
    mime_type:       'text/html',
    file_size_bytes: 0,
    width:           null,
    height:          null,
    duration_secs:   null,
    ordering_index:  0,
  }
}
