import { apiClient } from '@/lib/api-client'
import type { User, ApiResponse } from '@/types'
import type { LoginInput, RegisterInput, ForgotPasswordInput, ResetPasswordInput } from '@/schemas'

type AuthResponse = {
  user: User
  accessToken: string
}

export const authService = {
  login: (body: Omit<LoginInput, 'rememberMe'>) =>
    apiClient.post<ApiResponse<AuthResponse>>('/api/auth/login', body),

  register: (body: Omit<RegisterInput, 'confirmPassword' | 'agreeToTerms'>) =>
    apiClient.post<ApiResponse<AuthResponse>>('/api/auth/register', body),

  forgotPassword: (body: ForgotPasswordInput) =>
    apiClient.post<ApiResponse<{ message: string }>>('/api/auth/forgot-password', body),

  resetPassword: (body: ResetPasswordInput & { token: string }) =>
    apiClient.post<ApiResponse<{ message: string }>>('/api/auth/reset-password', body),

  logout: () => apiClient.post('/api/auth/logout'),

  me: () => apiClient.get<ApiResponse<User>>('/api/auth/me'),

  refreshToken: () =>
    apiClient.post<ApiResponse<{ accessToken: string }>>('/api/auth/refresh'),
}
