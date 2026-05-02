import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { setMemoryToken } from '@/lib/api-client'
import type { User, Nullable } from '@/types'

type AuthState = {
  user: Nullable<User>
  // accessToken lives in memory only (via api-client), NOT in this store.
  // Persisting the token in localStorage is an XSS vector.
  // We persist only the user object for UI hydration; the actual token
  // is re-issued silently via the httpOnly refresh cookie on page load.
  isHydrated: boolean
}

type AuthActions = {
  setUser: (user: User) => void
  setAccessToken: (token: string) => void  // writes to memory, not store
  clearAuth: () => void
  setHydrated: () => void
  updateUser: (partial: Partial<User>) => void
}

const initialState: AuthState = {
  user: null,
  isHydrated: false,
}

export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    persist(
      immer((set) => ({
        ...initialState,

        setUser: (user) => set((state) => { state.user = user }),

        // Writes token to the in-memory store in api-client, not Zustand.
        // This keeps the token out of localStorage entirely.
        setAccessToken: (token) => setMemoryToken(token),

        clearAuth: () => {
          setMemoryToken(null)
          set((state) => { state.user = null })
        },

        setHydrated: () => set((state) => { state.isHydrated = true }),

        updateUser: (partial) =>
          set((state) => {
            if (state.user) Object.assign(state.user, partial)
          }),
      })),
      {
        name: 'artsony-auth',
        // Only persist the user object — never the token
        partialize: (state) => ({ user: state.user }),
        onRehydrateStorage: () => (state) => {
          state?.setHydrated()
        },
      }
    ),
    { name: 'AuthStore', enabled: process.env.NODE_ENV === 'development' }
  )
)

export const selectUser = (s: AuthState & AuthActions) => s.user
export const selectIsAuthenticated = (s: AuthState & AuthActions) => s.user !== null