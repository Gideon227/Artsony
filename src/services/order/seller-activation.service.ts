import { apiClient, getMemoryToken, refreshAccessToken } from '@/lib/api-client'
import type { CommerceApiSuccess } from '@/types/order'
import type {
  ActivationSessionResult,
  ActivationSessionState,
  SaveShippingInput,
} from '@/types/seller-sales'

const BASE = '/api/orders/sales/lines'
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

async function authorizedFetch(path: string, token: string | null): Promise<Response> {
  return fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

export const sellerActivationService = {
  saveShipping: (orderItemId: string, input: SaveShippingInput) =>
    apiClient.patch<{ success: true }>(`${BASE}/${encodeURIComponent(orderItemId)}/shipping`, input),

  createSession: (orderItemId: string) =>
    apiClient.post<CommerceApiSuccess<ActivationSessionResult>>(
      `${BASE}/${encodeURIComponent(orderItemId)}/activation/session`,
    ),

  sessionState: (orderItemId: string, sessionId: string, signal?: AbortSignal) =>
    apiClient.get<CommerceApiSuccess<ActivationSessionState>>(
      `${BASE}/${encodeURIComponent(orderItemId)}/activation/session/${encodeURIComponent(sessionId)}`,
      { ...(signal && { signal }) },
    ),

  // The label is a PDF, which the JSON api client cannot return, so it is
  // fetched here with the same bearer token and a single refresh retry.
  async labelUrl(orderItemId: string): Promise<string> {
    const path = `${BASE}/${encodeURIComponent(orderItemId)}/label`
    let response = await authorizedFetch(path, getMemoryToken())
    if (response.status === 401) response = await authorizedFetch(path, await refreshAccessToken())

    if (!response.ok) {
      let message = 'Could not load the shipping label'
      try {
        message = ((await response.json()) as { message?: string }).message ?? message
      } catch {
        /* non-JSON error body */
      }
      throw new Error(message)
    }
    return URL.createObjectURL(await response.blob())
  },
}
