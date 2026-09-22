import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { setMemoryToken } from '@/lib/api-client'
import type { User, Nullable, PrivacySettings } from '@/types'

type AuthState = {
  user: Nullable<User>
  isHydrated: boolean
  // Who is allowed to message/comment on/purchase from the signed-in user.
  // Fetched separately from `user` (see usePrivacySettings) since it lives
  // on a dedicated /me/privacy endpoint, not the main profile payload.
  privacySettings: Nullable<PrivacySettings>
}

type AuthActions = {
  setUser: (user: User) => void
  setAccessToken: (token: string) => void
  clearAuth: () => void
  setHydrated: () => void
  updateUser: (partial: Partial<User>) => void
  setPrivacySettings: (settings: PrivacySettings) => void
  updatePrivacySettings: (partial: Partial<PrivacySettings>) => void
}

const initialState: AuthState = {
  user: null,
  isHydrated: false,
  privacySettings: null,
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

        setPrivacySettings: (settings) =>
          set((state) => {
            state.privacySettings = settings
          }),

        updatePrivacySettings: (partial) =>
          set((state) => {
            if (state.privacySettings) Object.assign(state.privacySettings, partial)
          }),
      })),
      {
        name: 'artsony-auth',
        partialize: (state) => ({ user: state.user, privacySettings: state.privacySettings }),
        // Do NOT call setHydrated here. The persisted user may be stale.
        // SessionBootstrap owns hydration timing.
      }
    ),
    { name: 'AuthStore', enabled: process.env.NODE_ENV === 'development' }
  )
)

export const selectUser = (s: AuthState & AuthActions) => s.user
export const selectHasSellerAccount = (s: AuthState & AuthActions) => s.user?.role === 'ARTIST'
export const selectIsAuthenticated = (s: AuthState & AuthActions) => s.user !== null
export const selectIsHydrated = (s: AuthState & AuthActions) => s.isHydrated
export const selectPrivacySettings = (s: AuthState & AuthActions) => s.privacySettings