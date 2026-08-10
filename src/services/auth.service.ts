import { apiClient } from '@/lib/api-client'
import type { User, ApiResponse, Artwork } from '@/types'

type AuthResponse = { user: User; accessToken: string }

// ── Raw backend shape ───────────────────────────────────────────────────────
// The backend returns snake_case fields (users + profiles joined — see
// userRepository.findByIdWithProfile on the backend). apiClient does no
// runtime transformation, so without this mapping layer every field below
// would come through as `undefined` at runtime despite being typed as
// present — that was the actual bug behind the profile page rendering
// nothing real. This is the single place that translation happens; every
// function below that returns a User goes through toFrontendUser().

type BackendUser = {
  id: string
  email: string
  username: string
  role: User['role']
  onboarded: boolean
  interests: string[]
  created_at: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  background_url: string | null
  website_url: string | null
  behance_url: string | null
  pinterest_url: string | null
  twitter_url: string | null
  linkedin_url: string | null
  followers_count: number
  following_count: number
  artworks_count: number
  is_email_verified: boolean
}

function toFrontendUser(raw: BackendUser): User {
  return {
    id: raw.id,
    email: raw.email,
    username: raw.username,
    displayName: raw.display_name ?? raw.username,
    role: raw.role,
    avatarUrl: raw.avatar_url,
    bio: raw.bio,
    // Not populated by any current endpoint — nothing reads this field yet.
    artworks: [] as unknown as Artwork,
    website: raw.website_url,
    // No backend column for these two — kept null rather than guessed.
    instagramLink: null,
    facebookLink: null,
    twitterLink: raw.twitter_url,
    behanceLink: raw.behance_url,
    pinterestLink: raw.pinterest_url,
    linkedinLink: raw.linkedin_url,
    backgroundUrl: raw.background_url,
    followersCount: raw.followers_count,
    followingCount: raw.following_count,
    // No per-user aggregate endpoint for these yet (artwork-level view/like
    // counts exist but aren't summed to the user) — 0 rather than fabricated.
    likesCount: 0,
    viewsCount: 0,
    artworksCount: raw.artworks_count,
    isVerified: raw.is_email_verified,
    onboarded: raw.onboarded,
    interests: raw.interests,
    createdAt: raw.created_at,
    updatedAt: raw.created_at,
    created_at: raw.created_at,
  }
}

export type UpdateProfileInput = {
  username?: string
  display_name?: string | null
  bio?: string | null
  interests?: string[]
  avatar_url?: string | null
  background_url?: string | null
  website_url?: string | null
  behance_url?: string | null
  pinterest_url?: string | null
  twitter_url?: string | null
  linkedin_url?: string | null
}

export const authService = {
  login: async (body: { email: string; password: string }): Promise<ApiResponse<AuthResponse>> => {
    const res = await apiClient.post<ApiResponse<{ user: BackendUser; accessToken: string }>>(
      '/api/auth/login',
      body,
    )
    return { ...res, data: { user: toFrontendUser(res.data.user), accessToken: res.data.accessToken } }
  },

  register: async (
    body: { email: string; password: string; username: string },
  ): Promise<ApiResponse<AuthResponse>> => {
    const res = await apiClient.post<ApiResponse<{ user: BackendUser; accessToken: string }>>(
      '/api/auth/register',
      body,
    )
    return { ...res, data: { user: toFrontendUser(res.data.user), accessToken: res.data.accessToken } }
  },

  logout: () =>
    apiClient.post<void>('/api/auth/logout'),

  forgotPassword: (body: { email: string }) =>
    apiClient.post<ApiResponse<{ message: string }>>('/api/auth/forgot-password', body),

  resetPassword: (body: { token: string; email: string; newPassword: string }) =>
    apiClient.post<ApiResponse<{ message: string }>>('/api/auth/reset-password', body),

  me: async (): Promise<ApiResponse<User>> => {
    const res = await apiClient.get<ApiResponse<BackendUser>>('/api/auth/me')
    return { ...res, data: toFrontendUser(res.data) }
  },

  // Called on app boot — uses the httpOnly RT cookie to silently get a
  // fresh access token. Returns null if no session exists (guest).
  refresh: () =>
    apiClient.post<ApiResponse<{ accessToken: string }>>('/api/auth/refresh'),

  completeOnboarding: async (interests: string[]): Promise<ApiResponse<User>> => {
    const res = await apiClient.post<ApiResponse<BackendUser>>('/api/users/onboarding', { interests })
    return { ...res, data: toFrontendUser(res.data) }
  },

  updateProfile: async (input: UpdateProfileInput): Promise<ApiResponse<User>> => {
    const res = await apiClient.patch<ApiResponse<BackendUser>>('/api/users/me', input)
    return { ...res, data: toFrontendUser(res.data) }
  },
}
