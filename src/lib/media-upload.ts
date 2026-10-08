import { apiClient, HttpError } from '@/lib/api-client'
import { MEDIA_RULES, validateMediaFile, type MediaKind } from '@/lib/media-rules'

export interface UploadedMedia {
  public_id: string
  media_type: MediaKind
  original_url: string
  optimized_url: string | null
  thumbnail_url: string | null
  mime_type: string
  file_size_bytes: number
  width: number | null
  height: number | null
  duration_secs: number | null
}

export interface UploadOptions {
  onProgress?: (percent: number) => void
  signal?: AbortSignal
}

interface UploadSignature {
  upload_url: string
  fields: Record<string, string>
  public_id: string
  chunk_bytes: number
}

interface ApiData<T> {
  success: boolean
  data: T
}

const PART_ATTEMPTS = 4
const API_ATTEMPTS = 3
const RETRY_DELAYS_MS = [800, 2_000, 5_000]
// Progress stops short of 100 until the server has verified the upload.
const UPLOAD_PROGRESS_CEILING = 98

class UploadPartError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly retryable: boolean,
  ) {
    super(message)
    this.name = 'UploadPartError'
  }
}

function abortError(): DOMException {
  return new DOMException('Upload cancelled', 'AbortError')
}

function isAbort(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError'
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(abortError())
    const timer = setTimeout(() => { signal?.removeEventListener('abort', onAbort); resolve() }, ms)
    const onAbort = () => { clearTimeout(timer); reject(abortError()) }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

async function withRetry<T>(
  attempts: number,
  isRetryable: (err: unknown) => boolean,
  signal: AbortSignal | undefined,
  task: () => Promise<T>,
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await task()
    } catch (err) {
      if (isAbort(err) || attempt >= attempts - 1 || !isRetryable(err)) throw err
      await sleep(RETRY_DELAYS_MS[Math.min(attempt, RETRY_DELAYS_MS.length - 1)]!, signal)
    }
  }
}

function sendPart(
  url: string,
  fields: Record<string, string>,
  blob: Blob,
  filename: string,
  headers: Record<string, string>,
  onLoaded: (bytes: number) => void,
  signal?: AbortSignal,
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(abortError())

    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    for (const [name, value] of Object.entries(headers)) xhr.setRequestHeader(name, value)

    const onAbort = () => xhr.abort()
    signal?.addEventListener('abort', onAbort, { once: true })
    const done = () => signal?.removeEventListener('abort', onAbort)

    xhr.upload.onprogress = (e) => onLoaded(e.loaded)
    xhr.onload = () => {
      done()
      let body: { error?: { message?: string } } & Record<string, unknown> = {}
      try { body = JSON.parse(xhr.responseText) } catch { /* non-JSON error page */ }
      if (xhr.status >= 200 && xhr.status < 300) return resolve(body)
      const retryable = xhr.status === 429 || xhr.status >= 500
      reject(new UploadPartError(body.error?.message ?? 'Upload failed. Please try again.', xhr.status, retryable))
    }
    xhr.onerror = () => { done(); reject(new UploadPartError('Network error during upload. Check your connection and try again.', 0, true)) }
    xhr.ontimeout = () => { done(); reject(new UploadPartError('Upload timed out. Please try again.', 0, true)) }
    xhr.onabort = () => { done(); reject(abortError()) }

    const form = new FormData()
    for (const [name, value] of Object.entries(fields)) form.append(name, value)
    form.append('file', blob, filename)
    xhr.send(form)
  })
}

// Cloudinary chunked upload: every chunk goes to the same URL with the same
// signed fields, an `X-Unique-Upload-Id` shared by the whole file and a
// `Content-Range`. A failed chunk is retried on its own, so a dropped
// connection costs one chunk and not the whole file. The last chunk's
// response is the finished asset.
async function uploadToCloudinary(
  file: File,
  signature: UploadSignature,
  opts: UploadOptions,
): Promise<Record<string, unknown>> {
  const total = file.size
  const chunked = total > signature.chunk_bytes
  const chunkSize = chunked ? signature.chunk_bytes : total
  const uploadId = crypto.randomUUID()
  let confirmed = 0
  let last: Record<string, unknown> = {}

  const report = (inFlight: number) => {
    const pct = Math.min(UPLOAD_PROGRESS_CEILING, Math.floor(((confirmed + inFlight) / total) * 100))
    opts.onProgress?.(pct)
  }

  for (let start = 0; start < total; start += chunkSize) {
    const end = Math.min(start + chunkSize, total)
    const part = file.slice(start, end)
    const headers: Record<string, string> = chunked
      ? { 'X-Unique-Upload-Id': uploadId, 'Content-Range': `bytes ${start}-${end - 1}/${total}` }
      : {}

    last = await withRetry(
      PART_ATTEMPTS,
      (err) => err instanceof UploadPartError && err.retryable,
      opts.signal,
      () => sendPart(signature.upload_url, signature.fields, part, file.name, headers, report, opts.signal),
    )
    confirmed = end
    report(0)
  }
  return last
}

// 404 UPLOAD_NOT_FOUND is retried too: Cloudinary's admin lookup can briefly
// lag behind a just-finished upload.
function isRetryableApiError(err: unknown): boolean {
  if (err instanceof HttpError) {
    return err.statusCode === 429 || err.statusCode >= 500 || err.code === 'UPLOAD_NOT_FOUND'
  }
  return err instanceof TypeError
}

// Best-effort: an upload that never makes it into a draft or profile should
// not linger in storage. Failure is reported, not hidden, but never blocks.
export async function deleteUploadedMedia(kind: MediaKind, publicId: string): Promise<void> {
  try {
    await apiClient.post('/api/upload/delete', { kind, public_id: publicId })
  } catch (err) {
    console.error('[media-upload] Could not remove unused upload:', publicId, err)
  }
}

async function precheckVideo(file: File): Promise<string | null> {
  if (typeof document === 'undefined') return null
  const rule = MEDIA_RULES.VIDEO

  const meta = await new Promise<{ duration: number; width: number; height: number } | null>((resolve) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    const finish = (value: { duration: number; width: number; height: number } | null) => {
      clearTimeout(timer)
      URL.revokeObjectURL(url)
      video.removeAttribute('src')
      resolve(value)
    }
    // Containers the browser cannot decode (often .mkv/.avi) never fire
    // loadedmetadata; the server checks those after upload.
    const timer = setTimeout(() => finish(null), 5_000)
    video.preload = 'metadata'
    video.onloadedmetadata = () => finish({ duration: video.duration, width: video.videoWidth, height: video.videoHeight })
    video.onerror = () => finish(null)
    video.src = url
  })

  if (!meta) return null
  if (Number.isFinite(meta.duration) && rule.maxDurationSecs && meta.duration > rule.maxDurationSecs) {
    return `Video must be no longer than ${rule.maxDurationSecs / 60} minutes.`
  }
  if (meta.width && meta.height && rule.minShortSidePx && Math.min(meta.width, meta.height) < rule.minShortSidePx) {
    return `Video resolution must be at least ${rule.minShortSidePx}p.`
  }
  return null
}

export async function uploadMedia(file: File, kind: MediaKind, opts: UploadOptions = {}): Promise<UploadedMedia> {
  if (file.size === 0) throw new Error('This file is empty.')
  const invalid = validateMediaFile(file, kind)
  if (invalid) throw new Error(invalid)

  if (kind === 'VIDEO') {
    const videoIssue = await precheckVideo(file)
    if (videoIssue) throw new Error(videoIssue)
  }

  opts.onProgress?.(0)

  const { data: signature } = await apiClient.post<ApiData<UploadSignature>>(
    '/api/upload/sign',
    { kind, filename: file.name, file_size_bytes: file.size },
    { signal: opts.signal },
  )

  const stored = await uploadToCloudinary(file, signature, opts)
  if (stored['public_id'] !== signature.public_id) {
    throw new Error('Upload could not be confirmed. Please try again.')
  }

  try {
    const { data } = await withRetry(
      API_ATTEMPTS,
      isRetryableApiError,
      opts.signal,
      () => apiClient.post<ApiData<UploadedMedia>>(
        '/api/upload/complete',
        { kind, public_id: signature.public_id },
        { signal: opts.signal },
      ),
    )
    opts.onProgress?.(100)
    return data
  } catch (err) {
    // A rule violation (413/422) already removed the asset server-side; for
    // anything else the file is stored but unusable to the caller.
    const ruleViolation = err instanceof HttpError && (err.statusCode === 413 || err.statusCode === 422)
    if (!ruleViolation) void deleteUploadedMedia(kind, signature.public_id)
    throw err
  }
}
