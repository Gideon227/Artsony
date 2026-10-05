import type { ApiError } from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string | undefined,
    message: string,
    public readonly fields?: Record<string, string> | any[]
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

type RequestOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined | null>
  _retry?: boolean
}

// ─── Access token store (in-memory, never localStorage for security) ──────────

let _memoryAccessToken: string | null = null

export function setMemoryToken(token: string | null) {
  _memoryAccessToken = token
}

export function getMemoryToken(): string | null {
  return _memoryAccessToken
}

// ─── Session refresh ──────────────────────────────────────────────────────────
// Every caller that needs a fresh access token (the page-load bootstrap and
// the 401 interceptor) goes through refreshAccessToken(), which shares one
// in-flight request. The refresh token rotates on use, so two parallel refresh
// requests from the same page would race each other on the server.

const REFRESH_PATH = '/api/auth/refresh'

let refreshInFlight: Promise<string> | null = null

// Only a 401 from the refresh endpoint means the refresh token is missing,
// expired or revoked. Anything else (429, 5xx, a dropped connection) says
// nothing about the session, which is still valid once the server or network
// recovers.
export function isSessionEndedError(err: unknown): boolean {
  return err instanceof HttpError && err.statusCode === 401
}

async function requestNewAccessToken(): Promise<string> {
  const res = await fetch(`${BASE_URL}${REFRESH_PATH}`, {
    method: 'POST',
    credentials: 'include', // sends httpOnly refresh cookie
  })

  if (!res.ok) {
    let code: string | undefined
    try {
      code = ((await res.json()) as { code?: string }).code
    } catch {
      // non-JSON error body (gateway/proxy page) — status alone decides
    }
    throw new HttpError(res.status, code ?? 'REFRESH_FAILED', 'Unable to refresh session')
  }

  const body = (await res.json()) as { data: { accessToken: string } }
  return body.data.accessToken
}

async function endSession(): Promise<void> {
  setMemoryToken(null)
  // Dynamic import avoids a circular dependency with the auth store
  const { useAuthStore } = await import('@/store/auth.store')
  useAuthStore.getState().clearAuth()
  // Keep the proxy in sync so a gated route bounces to /login on the next
  // navigation without force-navigating the user away from where they are.
  if (typeof document !== 'undefined') {
    document.cookie = 'artsony_session=; max-age=0; path=/; SameSite=Strict'
  }
}

export function refreshAccessToken(): Promise<string> {
  refreshInFlight ??= (async () => {
    try {
      const token = await requestNewAccessToken()
      setMemoryToken(token)
      return token
    } catch (err) {
      if (isSessionEndedError(err)) await endSession()
      throw err
    } finally {
      refreshInFlight = null
    }
  })()

  return refreshInFlight
}

// ─── URL builder ──────────────────────────────────────────────────────────────

function buildUrl(path: string, params?: RequestOptions['params']): string {
  const base = `${BASE_URL}${path}`
  if (!params) return base
  const url = new URL(base, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
  Object.entries(params).forEach(([k, v]) => {
    if (v != null) url.searchParams.set(k, String(v))
  })
  return url.toString()
}

// ─── Core request with auto-refresh ──────────────────────────────────────────

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, _retry, ...init } = options

  // A refresh is already restoring the token (page load) — wait for it instead
  // of sending a guaranteed 401. Its failure is handled by whoever started it.
  if (!getMemoryToken() && refreshInFlight) {
    await refreshInFlight.catch(() => undefined)
  }

  const token = getMemoryToken()
  const authHeaders: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {}

  // NEW: Check if the body is FormData so we don't force JSON headers
  const isFormData = init.body instanceof FormData
  const defaultHeaders: Record<string, string> = { ...authHeaders }
  
  if (!isFormData) {
    defaultHeaders['Content-Type'] = 'application/json'
  }

  const response = await fetch(buildUrl(path, params), {
    ...init,
    credentials: 'include',
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  })

  // ── Silent token refresh on 401 ──────────────────────────────────────────
  if (response.status === 401 && !_retry) {
    const currentToken = getMemoryToken()
    const newToken = currentToken && currentToken !== token
      ? currentToken
      : await refreshAccessToken()
    return request<T>(path, { ...options, _retry: true,
      headers: { ...headers, Authorization: `Bearer ${newToken}` }
    })
  }

  if (!response.ok) {
    let errorBody: Partial<ApiError & { fields?: any }> = {}
    try {
      errorBody = (await response.json()) as Partial<ApiError & { fields?: any }>
    } catch { /* non-JSON */ }

    if (
      response.status === 403 &&
      errorBody.code === 'ONBOARDING_REQUIRED' &&
      typeof window !== 'undefined'
    ) {
      window.location.href = '/onboarding'
      throw new HttpError(403, errorBody.code, 'Onboarding required')
    }

    throw new HttpError(
      response.status,
      errorBody.code,
      errorBody.message ?? `Request failed with status ${response.status}`,
      errorBody.fields
    )
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

// export const apiClient = {
//   get:    <T>(path: string, options?: RequestOptions) =>
//             request<T>(path, { ...options, method: 'GET' }),
//   post:   <T>(path: string, body?: unknown, options?: RequestOptions) =>
//             request<T>(path, { ...options, method: 'POST',
//               body: body != null ? JSON.stringify(body) : undefined }),
//   put:    <T>(path: string, body?: unknown, options?: RequestOptions) =>
//             request<T>(path, { ...options, method: 'PUT',
//               body: body != null ? JSON.stringify(body) : undefined }),
//   patch:  <T>(path: string, body?: unknown, options?: RequestOptions) =>
//             request<T>(path, { ...options, method: 'PATCH',
//               body: body != null ? JSON.stringify(body) : undefined }),
//   delete: <T>(path: string, options?: RequestOptions) =>
//             request<T>(path, { ...options, method: 'DELETE' }),
// }

export const apiClient = {
  get:    <T>(path: string, options?: RequestOptions) =>
            request<T>(path, { ...options, method: 'GET' }),
            
  post:   <T>(path: string, body?: unknown, options?: RequestOptions) => {
            const isForm = body instanceof FormData
            return request<T>(path, { ...options, method: 'POST',
              body: isForm ? (body as FormData) : (body != null ? JSON.stringify(body) : undefined) })
          },
          
  put:    <T>(path: string, body?: unknown, options?: RequestOptions) => {
            const isForm = body instanceof FormData
            return request<T>(path, { ...options, method: 'PUT',
              body: isForm ? (body as FormData) : (body != null ? JSON.stringify(body) : undefined) })
          },
          
  patch:  <T>(path: string, body?: unknown, options?: RequestOptions) => {
            const isForm = body instanceof FormData
            return request<T>(path, { ...options, method: 'PATCH',
              body: isForm ? (body as FormData) : (body != null ? JSON.stringify(body) : undefined) })
          },
          
  delete: <T>(path: string, options?: RequestOptions) =>
            request<T>(path, { ...options, method: 'DELETE' }),
}