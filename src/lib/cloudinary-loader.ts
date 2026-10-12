// Custom `next/image` loader (see images.loaderFile in next.config.ts).
//
// Cloudinary images are delivered straight from Cloudinary's CDN at the exact
// width the browser asked for, with automatic format (AVIF / WebP / JPEG per
// browser) and quality.
//
// A custom loader disables Next.js's built-in /_next/image optimizer (the
// route answers 404 whenever images.loader is not "default"), so every other
// source - local files, other hosts - is returned as it is, unoptimized.
//
// Requires Cloudinary's "Strict transformations" setting to allow these
// on-the-fly transformations. If it cannot be relaxed, set
// NEXT_PUBLIC_MEDIA_TRANSFORMS=off to deliver the stored Cloudinary URL as it
// is instead.

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

// Serves the source untouched. The inert `?w=` makes the loader's output differ
// from `src`, because Next warns in development when a loader ignores width.
function passthroughUrl({ src, width }: LoaderParams): string {
  return `${src}${src.includes('?') ? '&' : '?'}w=${width}`
}

export default function cloudinaryLoader(params: LoaderParams): string {
  if (SVG_SOURCE.test(params.src)) return passthroughUrl(params)

  const match = CLOUDINARY_IMAGE.exec(params.src)
  if (!match || process.env.NEXT_PUBLIC_MEDIA_TRANSFORMS === 'off') return passthroughUrl(params)

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