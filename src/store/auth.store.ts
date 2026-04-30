import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { User, Nullable } from '@/types'

type AuthState = {
  user: Nullable<User>
  accessToken: Nullable<string>
  isHydrated: boolean
}

type AuthActions = {
  setUser: (user: User) => void
  setAccessToken: (token: string) => void
  clearAuth: () => void
  setHydrated: () => void
  updateUser: (partial: Partial<User>) => void
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isHydrated: false,
}

export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    persist(
      immer((set) => ({
        ...initialState,
        setUser: (user) =>
          set((state) => {
            state.user = user
          }),
        setAccessToken: (token) =>
          set((state) => {
            state.accessToken = token
          }),
        clearAuth: () =>
          set((state) => {
            state.user = null
            state.accessToken = null
          }),
        setHydrated: () =>
          set((state) => {
            state.isHydrated = true
          }),
        updateUser: (partial) =>
          set((state) => {
            if (state.user) Object.assign(state.user, partial)
          }),
      })),
      {
        name: 'artsony-auth',
        partialize: (state) => ({
          user: state.user,
          accessToken: state.accessToken,
        }),
        onRehydrateStorage: () => (state) => {
          state?.setHydrated()
        },
      }
    ),
    { name: 'AuthStore', enabled: process.env.NODE_ENV === 'development' }
  )
)

// Selectors
export const selectUser = (state: AuthState & AuthActions) => state.user
export const selectIsAuthenticated = (state: AuthState & AuthActions) => state.user !== null
export const selectAccessToken = (state: AuthState & AuthActions) => state.accessToken
