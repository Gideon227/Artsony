'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'
import { useToast } from '@/components/ui/toaster'
import { HttpError } from '@/lib/api-client'
import { QUERY_KEYS, STALE_TIMES } from '@/constants'

// ─── /me ─────────────────────────────────────────────────────────────────────

export function useMe() {
  const isAuthenticated = useAuthStore((s) => s.user !== null)
  return useQuery({
    queryKey: QUERY_KEYS.me,
    queryFn:  () => authService.me().then((r) => r.data),
    enabled:  isAuthenticated,
    staleTime: STALE_TIMES.slow,
  })
}

// ─── Login ────────────────────────────────────────────────────────────────────

export function useLogin() {
  const { setUser, setAccessToken } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      authService.login(body),

    onSuccess: ({ data }) => {
      setAccessToken(data.accessToken)
      setUser(data.user)
      success('Welcome back!', data.user.username
        ? `Good to see you, ${data.user.username}`
        : 'You are now signed in.')

      if (!data.user.onboarded) {
        router.push('/onboarding')
        return
      }

      // Honour the ?next= param so deep links work after login
      const next = searchParams.get('next')
      router.push(next && next.startsWith('/') ? next : '/home')
    },

    onError: (err: Error) => {
      if (err instanceof HttpError) {
        if (err.statusCode === 423) {
          error('Account locked', 'Too many failed attempts. Try again later.')
        } else if (err.statusCode === 401) {
          error('Invalid credentials', 'Check your email and password.')
        } else if (err.statusCode === 429) {
          error('Too many attempts', 'Slow down and try again in a moment.')
        } else {
          error('Sign in failed', err.message)
        }
      } else {
        error('Sign in failed', 'Something went wrong. Please try again.')
      }
    },
  })
}

// ─── Register ─────────────────────────────────────────────────────────────────

export function useRegister() {
  const { setUser, setAccessToken } = useAuthStore()
  const router = useRouter()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (body: {
      email: string
      password: string
      username: string
    }) => authService.register(body),

    onSuccess: ({ data }) => {
      setAccessToken(data.accessToken)
      setUser(data.user)
      success('Account created!', 'Welcome to Artsony!')
      router.push('/onboarding')
    },

    onError: (err: Error) => {
      if (err instanceof HttpError) {
        if (err.statusCode === 409) {
          error('Account exists', 'An account with this email or username already exists.')
        } else if (err.statusCode === 422) {
          error('Invalid details', err.message)
        } else if (err.statusCode === 429) {
          error('Too many attempts', 'Please wait before trying again.')
        } else {
          error('Sign up failed', err.message)
        }
      } else {
        error('Sign up failed', 'Something went wrong. Please try again.')
      }
    },
  })
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const router = useRouter()
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: () => authService.logout(),

    onSuccess: () => {
      success('Signed out', 'See you next time!')
    },

    onError: () => {
      // Still sign out locally even if the server call fails
      error('Session ended', 'You have been signed out.')
    },

    onSettled: () => {
      // Always clear regardless of server response
      clearAuth()
      queryClient.clear()

      // Clear the onboarded cookie so middleware re-evaluates on next visit.
      // The artsony_visited cookie is intentionally kept — returning users
      // should still go to /login rather than /signup.
      document.cookie = 'artsony_onboarded=; Max-Age=0; path=/'

      router.push('/login')
    },
  })
}

// ─── Forgot password ──────────────────────────────────────────────────────────

export function useForgotPassword() {
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (body: { email: string }) => authService.forgotPassword(body),

    onSuccess: () => {
      success(
        'Reset link sent',
        'If an account with that email exists, a reset link is on its way.'
      )
    },

    onError: (err: Error) => {
      if (err instanceof HttpError && err.statusCode === 429) {
        error('Too many requests', 'Wait a moment before requesting another reset link.')
      } else {
        error('Request failed', 'Something went wrong. Please try again.')
      }
    },
  })
}

// ─── Reset password ───────────────────────────────────────────────────────────

export function useResetPassword() {
  const router = useRouter()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (body: { token: string; email: string; newPassword: string }) =>
      authService.resetPassword(body),

    onSuccess: () => {
      success('Password updated', 'You can now sign in with your new password.')
      router.push('/login')
    },

    onError: (err: Error) => {
      if (err instanceof HttpError) {
        if (err.statusCode === 401) {
          error('Link expired', 'This reset link is invalid or has expired. Request a new one.')
        } else if (err.statusCode === 429) {
          error('Too many attempts', 'Too many failed attempts on this link.')
        } else {
          error('Reset failed', err.message)
        }
      } else {
        error('Reset failed', 'Something went wrong. Please try again.')
      }
    },
  })
}

// ─── Complete onboarding ──────────────────────────────────────────────────────

export function useCompleteOnboarding() {
  const updateUser   = useAuthStore((s) => s.updateUser)
  const queryClient  = useQueryClient()
  const router       = useRouter()
  const { error }    = useToast()

  return useMutation({
    mutationFn: (interests: string[]) => authService.completeOnboarding(interests),

    onSuccess: () => {
      updateUser({ onboarded: true } as never)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.me })
      // Set the cookie client-side so middleware immediately allows /home
      document.cookie = 'artsony_onboarded=1; Max-Age=31536000; path=/; SameSite=Strict'
      router.push('/home')
    },

    onError: () => {
      error('Failed to save', 'Your interests could not be saved. Please try again.')
    },
  })
}