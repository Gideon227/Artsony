export type MediaKind = 'IMAGE' | 'VIDEO' | 'THREE_D' | 'PDF'

const MB = 1024 * 1024

export interface MediaRule {
  maxBytes: number
  extensions: readonly string[]
  typeLabel: string
  maxDurationSecs?: number
  minShortSidePx?: number
}

// Mirrors MEDIA_RULES in the backend upload module, which enforces the same
// limits against Cloudinary's own record of the stored file. Keep in sync.
export const MEDIA_RULES: Record<MediaKind, MediaRule> = {
  IMAGE: {
    maxBytes: 50 * MB,
    extensions: ['jpg', 'jpeg', 'png', 'tif', 'tiff'],
    typeLabel: 'JPG, PNG, or TIFF',
  },
  VIDEO: {
    maxBytes: 500 * MB,
    extensions: ['mp4', 'mov', 'avi', 'mkv'],
    typeLabel: 'MP4, MOV, AVI, or MKV',
    maxDurationSecs: 10 * 60,
    minShortSidePx: 720,
  },
  THREE_D: {
    maxBytes: 500 * MB,
    extensions: ['gltf', 'glb', 'obj', 'fbx'],
    typeLabel: 'GLTF, GLB, OBJ, or FBX',
  },
  PDF: {
    maxBytes: 50 * MB,
    extensions: ['pdf'],
    typeLabel: 'PDF',
  },
}

export function fileExtension(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot === -1 ? '' : name.slice(dot + 1).toLowerCase()
}

export function mediaKindForFile(file: File): MediaKind | null {
  const ext = fileExtension(file.name)
  const kinds = Object.keys(MEDIA_RULES) as MediaKind[]
  return kinds.find((kind) => MEDIA_RULES[kind].extensions.includes(ext)) ?? null
}

export function formatBytes(bytes: number): string {
  if (bytes < MB) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / MB).toFixed(1)} MB`
}

// The extension decides the type: `file.type` is empty or inconsistent across
// operating systems for .mkv, .avi, .tif and 3D formats.
export function validateMediaFile(file: File, kind: MediaKind): string | null {
  const rule = MEDIA_RULES[kind]
  if (!rule.extensions.includes(fileExtension(file.name))) {
    return `Invalid file type. Please upload ${rule.typeLabel}.`
  }
  if (file.size > rule.maxBytes) {
    return `File too large. Maximum is ${Math.round(rule.maxBytes / MB)} MB (your file: ${formatBytes(file.size)}).`
  }
  return null
}
