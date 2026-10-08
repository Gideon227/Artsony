// Custom `next/image` loader (see images.loaderFile in next.config.ts).
//
// Cloudinary images are delivered straight from Cloudinary's CDN at the exact
// width the browser asked for, with automatic format (AVIF / WebP / JPEG per
// browser) and quality, instead of being proxied through the Next.js image
// optimizer. Anything else (local files, other hosts) keeps going through the
// built-in optimizer exactly as before.
//
// Requires Cloudinary's "Strict transformations" setting to allow these
// on-the-fly transformations. If it cannot be relaxed, set
// NEXT_PUBLIC_MEDIA_TRANSFORMS=off to route Cloudinary images through the
// Next.js optimizer instead.

interface LoaderParams {
  src: string
  width: number
  quality?: number
}

const CLOUDINARY_IMAGE = /^https:\/\/res\.cloudinary\.com\/([^/]+)\/image\/upload\/(.+)$/
const IMAGE_EXTENSION = /\.(jpe?g|png|webp|avif|gif|tiff?|heic|bmp)$/i
const TRANSFORMATION_SEGMENT = /^[a-z]{1,3}_[^/,]+(,[a-z]{1,3}_[^/,]+)*$/
const PAGE_SELECTOR = /(?:^|,)pg_(\d+)(?:,|$)/
const SVG_SOURCE = /\.svg(\?|$)/i
const MAX_DELIVERY_WIDTH = 2560
const DEFAULT_OPTIMIZER_QUALITY = 75

function qualityToken(quality: number | undefined): string {
  if (quality !== undefined && quality >= 90) return 'auto:best'
  if (quality !== undefined && quality <= 50) return 'auto:eco'
  return 'auto:good'
}

// Stored URLs can already carry transformations (`.../upload/f_auto,q_auto/v1/id.jpg`)
// and an extension that would pin the format. Reduce them to `v<version>/<public_id>`
// so the requested rendition is the only one applied and f_auto can pick the format.
function deliveryPath(rest: string): string {
  const segments = rest.split('?')[0]!.split('/')
  const versionAt = segments.findIndex((s) => /^v\d+$/.test(s))
  let idSegments = versionAt === -1
    ? segments.filter((s, i) => !(i < segments.length - 1 && TRANSFORMATION_SEGMENT.test(s)))
    : segments.slice(versionAt)

  const last = idSegments.length - 1
  idSegments = idSegments.map((s, i) => (i === last ? s.replace(IMAGE_EXTENSION, '') : s))
  return idSegments.join('/')
}

// A PDF thumbnail is page N of the document; dropping the stored `pg_N` would
// deliver page 1 for every page-specific rendition.
function storedPage(rest: string): string | null {
  const segments = rest.split('?')[0]!.split('/')
  const versionAt = segments.findIndex((s) => /^v\d+$/.test(s))
  const stored = versionAt === -1 ? segments.slice(0, -1) : segments.slice(0, versionAt)
  for (const segment of stored) {
    const match = PAGE_SELECTOR.exec(segment)
    if (match) return match[1]!
  }
  return null
}

function optimizerUrl({ src, width, quality }: LoaderParams): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality ?? DEFAULT_OPTIMIZER_QUALITY}`
}

// Next.js only skips optimization for .svg sources when its *default* loader
// is in use, and /_next/image refuses SVGs. They are static files, so serve
// them as they are. Local files get an inert `?w=` so the loader's output
// differs from `src` (Next warns in development when a loader ignores width).
function staticAssetUrl({ src, width }: LoaderParams): string {
  if (!src.startsWith('/')) return src
  return `${src}${src.includes('?') ? '&' : '?'}w=${width}`
}

export default function cloudinaryLoader(params: LoaderParams): string {
  if (SVG_SOURCE.test(params.src)) return staticAssetUrl(params)

  const match = CLOUDINARY_IMAGE.exec(params.src)
  if (!match || process.env.NEXT_PUBLIC_MEDIA_TRANSFORMS === 'off') return optimizerUrl(params)

  const [, cloudName, rest] = match
  const width = Math.min(params.width, MAX_DELIVERY_WIDTH)
  const page = storedPage(rest!)
  const transformation = [
    'c_limit',
    'f_auto',
    ...(page ? [`pg_${page}`] : []),
    `q_${qualityToken(params.quality)}`,
    `w_${width}`,
  ].join(',')

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${deliveryPath(rest!)}`
}
