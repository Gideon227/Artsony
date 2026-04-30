import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { authService } from '@/services'
import { useAuthStore } from '@/store'
import { useToast } from '@/components/ui/toaster'
import { QUERY_KEYS, ROUTES, STALE_TIMES } from '@/constants'
import type { LoginInput, RegisterInput, ForgotPasswordInput, ResetPasswordInput } from '@/schemas'

export function useMe() {
  const isAuthenticated = useAuthStore((s) => s.user !== null)
  return useQuery({
    queryKey: QUERY_KEYS.me,
    queryFn: () => authService.me().then((r) => r.data),
    enabled: isAuthenticated,
    staleTime: STALE_TIMES.slow,
  })
}

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser)
  const setAccessToken = useAuthStore((s) => s.setAccessToken)
  const router = useRouter()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (body: Omit<LoginInput, 'rememberMe'>) => authService.login(body),
    onSuccess: ({ data }) => {
      setUser(data.user)
      setAccessToken(data.accessToken)
      success('Welcome back!', data.user.displayName)
      router.push(ROUTES.home)
    },
    onError: (err: Error) => {
      error('Sign in failed', err.message)
    },
  })
}

export function useRegister() {
  const setUser = useAuthStore((s) => s.setUser)
  const setAccessToken = useAuthStore((s) => s.setAccessToken)
  const router = useRouter()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (body: Omit<RegisterInput, 'confirmPassword' | 'agreeToTerms'>) =>
      authService.register(body),
    onSuccess: ({ data }) => {
      setUser(data.user)
      setAccessToken(data.accessToken)
      success('Account created!', `Welcome to Artsony, ${data.user.displayName}`)
      router.push(ROUTES.home)
    },
    onError: (err: Error) => {
      error('Registration failed', err.message)
    },
  })
}

export function useForgotPassword() {
  const { success, error } = useToast()
  return useMutation({
    mutationFn: (body: ForgotPasswordInput) => authService.forgotPassword(body),
    onSuccess: () => success('Email sent', 'Check your inbox for reset instructions.'),
    onError: () => error('Request failed', 'Please try again.'),
  })
}

export function useResetPassword() {
  const router = useRouter()
  const { success, error } = useToast()
  return useMutation({
    mutationFn: (body: ResetPasswordInput & { token: string }) => authService.resetPassword(body),
    onSuccess: () => {
      success('Password updated')
      router.push(ROUTES.auth.login)
    },
    onError: () => error('Reset failed', 'Link may have expired.'),
  })
}
