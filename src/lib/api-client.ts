import type { ApiError } from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string | undefined,
    message: string
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

type RequestOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined | null>
  _retry?: boolean
}

type QueueEntry = {
  resolve: (token: string) => void
  reject: (err: unknown) => void
}

let isRefreshing = false
let refreshQueue: QueueEntry[] = []

function processRefreshQueue(token: string | null, err: unknown = null) {
  refreshQueue.forEach((entry) => {
    if (token) entry.resolve(token)
    else entry.reject(err)
  })
  refreshQueue = []
}

async function getNewAccessToken(): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include', // sends httpOnly refresh cookie
  })
  if (!res.ok) throw new HttpError(res.status, 'REFRESH_FAILED', 'Session expired')
  const body = (await res.json()) as { data: { accessToken: string } }
  return body.data.accessToken
}

// ─── Access token store (in-memory, never localStorage for security) ──────────

let _memoryAccessToken: string | null = null

export function setMemoryToken(token: string | null) {
  _memoryAccessToken = token
}

export function getMemoryToken(): string | null {
  return _memoryAccessToken
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
    if (isRefreshing) {
      // Wait for the in-flight refresh to complete, then replay
      return new Promise<T>((resolve, reject) => {
        refreshQueue.push({
          resolve: (newToken) => {
            resolve(request<T>(path, { ...options, _retry: true,
              headers: { ...headers, Authorization: `Bearer ${newToken}` }
            }))
          },
          reject,
        })
      })
    }

    isRefreshing = true
    try {
      const newToken = await getNewAccessToken()
      setMemoryToken(newToken)
      // Notify waiting requests
      processRefreshQueue(newToken)
      // Replay original request with new token
      return request<T>(path, { ...options, _retry: true,
        headers: { ...headers, Authorization: `Bearer ${newToken}` }
      })
    } catch (err) {
      processRefreshQueue(null, err)
      setMemoryToken(null)
      // Import dynamically to avoid circular dep with store
      const { useAuthStore } = await import('@/store/auth.store')
      useAuthStore.getState().clearAuth()
      // Only hard-redirect to /login if the user was previously authenticated
      // (they had an access token that expired). Do NOT redirect guests — they
      // have no token and the middleware already handles routing them to /signup
      // or /login. Redirecting guests here causes an infinite reload loop.
      if (typeof window !== 'undefined' && token) {
        window.location.href = '/login'
      }
      throw err
    } finally {
      isRefreshing = false
    }
  }

  if (!response.ok) {
    let errorBody: Partial<ApiError> = {}
    try {
      errorBody = (await response.json()) as Partial<ApiError>
    } catch { /* non-JSON */ }

    // Redirect to onboarding if the server says the user hasn't completed it.
    // Uses window.location (not Next router) because api-client has no React context.
    if (
      response.status === 403 &&
      errorBody.code === 'ONBOARDING_REQUIRED' &&
      typeof window !== 'undefined'
    ) {
      window.location.href = '/auth/interests'
      // Throw anyway so the calling mutation's onError doesn't also fire
      throw new HttpError(403, errorBody.code, 'Onboarding required')
    }

    throw new HttpError(
      response.status,
      errorBody.code,
      errorBody.message ?? `Request failed with status ${response.status}`
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