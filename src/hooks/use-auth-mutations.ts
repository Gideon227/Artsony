'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'
import { useToast } from '@/components/ui/toaster'
import { HttpError } from '@/lib/api-client'
import { QUERY_KEYS, STALE_TIMES } from '@/constants'

// ─── Bootstrap: called once on app load to restore session from RT cookie ─────

export function useSessionBootstrap() {
  const setUser = useAuthStore((s) => s.setUser)
  const setAccessToken = useAuthStore((s) => s.setAccessToken)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  return useQuery({
    queryKey: ['session-bootstrap'],
    queryFn: async () => {
      try {
        const res = await authService.refresh()
        setAccessToken(res.data.accessToken)
        const meRes = await authService.me()
        setUser(meRes.data)
        return meRes.data
      } catch {
        clearAuth()
        return null
      }
    },
    staleTime: Infinity,     // only run once per mount
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  })
}

// ─── /me ─────────────────────────────────────────────────────────────────────

export function useMe() {
  const isAuthenticated = useAuthStore((s) => s.user !== null)
  return useQuery({
    queryKey: QUERY_KEYS.me,
    queryFn: () => authService.me().then((r) => r.data),
    enabled: isAuthenticated,
    staleTime: STALE_TIMES.slow,
  })
}

// ─── Login ────────────────────────────────────────────────────────────────────

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser)
  const setAccessToken = useAuthStore((s) => s.setAccessToken)
  const router = useRouter()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      authService.login(body),
    onSuccess: ({ data }) => {
      setAccessToken(data.accessToken)
      setUser(data.user)
      success('Welcome back!', `Good to see you, ${data.user.displayName ?? data.user.email}`)
      // Onboarding redirect enforced server-side via middleware,
      // but we mirror it client-side for instant UX.
      if (!data.user.onboarded) {
        router.push('/onboarding')
      } else {
        router.push('/')
      }
    },
    onError: (err: Error) => {
      if (err instanceof HttpError) {
        if (err.statusCode === 423) {
          error('Account locked', 'Too many failed attempts. Try again later.')
        } else if (err.statusCode === 401) {
          error('Invalid credentials', 'Check your email and password.')
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
  const setUser = useAuthStore((s) => s.setUser)
  const setAccessToken = useAuthStore((s) => s.setAccessToken)
  const router = useRouter()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (body: {
      email: string
      password: string
      username: string
      displayName: string
    }) => authService.register(body),
    onSuccess: ({ data }) => {
      setAccessToken(data.accessToken)
      setUser(data.user)
      success('Account created!', `Welcome to Artsony!`)
      router.push('/onboarding')
    },
    onError: (err: Error) => {
      if (err instanceof HttpError && err.statusCode === 409) {
        error('Account exists', 'An account with this email or username already exists.')
      } else if (err instanceof HttpError && err.statusCode === 422) {
        error('Invalid details', err.message)
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
  const { success } = useToast()

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      // Always clear client state even if the server call fails
      clearAuth()
      queryClient.clear()
      success('Signed out', 'See you next time!')
      router.push('/login')
    },
  })
}

// ─── Forgot password ──────────────────────────────────────────────────────────

export function useForgotPassword() {
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (body: { email: string }) => authService.forgotPassword(body),
    onSuccess: () =>
      success('Email sent', 'If an account exists, a reset link has been sent.'),
    onError: (err: Error) => {
      if (err instanceof HttpError && err.statusCode === 429) {
        error('Too many requests', 'Please wait before requesting another reset link.')
      } else {
        error('Request failed', 'Please try again.')
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
      if (err instanceof HttpError && err.statusCode === 401) {
        error('Link expired', 'This reset link is invalid or has expired. Request a new one.')
      } else {
        error('Reset failed', 'Something went wrong. Please try again.')
      }
    },
  })
}

// ─── Complete onboarding ──────────────────────────────────────────────────────

export function useCompleteOnboarding() {
  const updateUser = useAuthStore((s) => s.updateUser)
  const queryClient = useQueryClient()
  const router = useRouter()
  const { error } = useToast()

  return useMutation({
    mutationFn: (interests: string[]) =>
      authService.completeOnboarding(interests),
    onSuccess: () => {
      // Mark user as onboarded in local state immediately
      updateUser({ onboarded: true } as never)
      // Invalidate /me so any refetch gets the fresh DB state
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.me })
      router.push('/')
    },
    onError: () => {
      error('Failed to save', 'Your interests could not be saved. Please try again.')
    },
  })
}