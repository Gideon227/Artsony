import { apiClient } from '@/lib/api-client'
import type { User, ApiResponse } from '@/types'

type AuthResponse = { user: User; accessToken: string }

export const authService = {
  login: (body: { email: string; password: string }) =>
    apiClient.post<ApiResponse<AuthResponse>>('/api/auth/login', body),

  register: (body: { email: string; password: string; username: string; }) =>
    apiClient.post<ApiResponse<AuthResponse>>('/api/auth/register', body),

  logout: () =>
    apiClient.post<void>('/api/auth/logout'),

  forgotPassword: (body: { email: string }) =>
    apiClient.post<ApiResponse<{ message: string }>>('/api/auth/forgot-password', body),

  resetPassword: (body: { token: string; email: string; newPassword: string }) =>
    apiClient.post<ApiResponse<{ message: string }>>('/api/auth/reset-password', body),

  me: () =>
    apiClient.get<ApiResponse<User>>('/api/auth/me'),

  // Called on app boot — uses the httpOnly RT cookie to silently get a
  // fresh access token. Returns null if no session exists (guest).
  refresh: () =>
    apiClient.post<ApiResponse<{ accessToken: string }>>('/api/auth/refresh'),

  completeOnboarding: (interests: string[]) =>
    apiClient.post<ApiResponse<User>>('/api/users/onboarding', { interests }),
}