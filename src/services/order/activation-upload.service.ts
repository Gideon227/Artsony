import type { CommerceApiSuccess } from '@/types/order'
import type { ActivationUploadContext, ActivationUploadSignature } from '@/types/seller-sales'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

export class ActivationUploadError extends Error {
  constructor(
    readonly status: number,
    readonly code: string | undefined,
    message: string,
  ) {
    super(message)
    this.name = 'ActivationUploadError'
  }
}

// These calls are made from a phone that is not signed in. The one-time token
// in the path is the only credential, so no cookies or bearer token are sent.
async function call<T>(path: string, init: RequestInit = {}, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_URL}/api/activation-uploads${path}`, {
    ...init,
    ...(signal && { signal }),
    credentials: 'omit',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!response.ok) {
    let body: { code?: string; message?: string } = {}
    try {
      body = (await response.json()) as typeof body
    } catch {
      /* non-JSON error body */
    }
    throw new ActivationUploadError(response.status, body.code, body.message ?? 'Something went wrong. Please try again.')
  }
  return response.json() as Promise<T>
}

export const activationUploadService = {
  context: (token: string, signal?: AbortSignal) =>
    call<CommerceApiSuccess<ActivationUploadContext>>(`/${encodeURIComponent(token)}`, {}, signal),

  sign: (token: string, file: { name: string; size: number }, signal?: AbortSignal) =>
    call<CommerceApiSuccess<ActivationUploadSignature>>(
      `/${encodeURIComponent(token)}/sign`,
      { method: 'POST', body: JSON.stringify({ filename: file.name, file_size_bytes: file.size }) },
      signal,
    ),

  complete: (token: string, publicIds: string[], signal?: AbortSignal) =>
    call<CommerceApiSuccess<{ status: 'COMPLETED' }>>(
      `/${encodeURIComponent(token)}/complete`,
      { method: 'POST', body: JSON.stringify({ public_ids: publicIds }) },
      signal,
    ),

  // Files go straight to Cloudinary with the signature the server issued.
  async uploadToCloudinary(signature: ActivationUploadSignature, file: File, signal?: AbortSignal): Promise<string> {
    const form = new FormData()
    Object.entries(signature.fields).forEach(([key, value]) => form.append(key, value))
    form.append('file', file)

    const response = await fetch(signature.upload_url, { method: 'POST', body: form, ...(signal && { signal }) })
    if (!response.ok) throw new ActivationUploadError(response.status, undefined, 'The photo could not be uploaded')
    const result = (await response.json()) as { public_id?: string }
    if (!result.public_id) throw new ActivationUploadError(502, undefined, 'The photo could not be uploaded')
    return result.public_id
  },
}
