import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { setMemoryToken } from '@/lib/api-client'
import type { User, Nullable } from '@/types'

type AuthState = {
  user: Nullable<User>
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
  isHydrated: false,
}

export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    persist(
      immer((set) => ({
        ...initialState,

        setUser: (user) => set((state) => { state.user = user }),

        setAccessToken: (token) => setMemoryToken(token),

        clearAuth: () => {
          setMemoryToken(null)
          set((state) => {
            state.user = null
          })
        },

        // Called exactly once — by SessionBootstrap.finally — after the
        // refresh attempt settles. Never set this from onRehydrateStorage
        // because the persisted user may have an expired session.
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
        partialize: (state) => ({ user: state.user }),
        // Do NOT call setHydrated here. The persisted user may be stale.
        // SessionBootstrap owns hydration timing.
      }
    ),
    { name: 'AuthStore', enabled: process.env.NODE_ENV === 'development' }
  )
)

export const selectUser = (s: AuthState & AuthActions) => s.user
export const selectIsAuthenticated = (s: AuthState & AuthActions) => s.user !== null
export const selectIsHydrated = (s: AuthState & AuthActions) => s.isHydrated