import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { CheckoutResult } from '@/types/order'

type OrderState = {
  activeCheckout: CheckoutResult | null
  checkoutStep: 'CART' | 'PAYMENT' | 'COMPLETE'
  _hasHydrated: boolean 
}

type OrderActions = {
  setActiveCheckout: (checkout: CheckoutResult | null) => void
  setCheckoutStep: (step: OrderState['checkoutStep']) => void
  clearCheckoutSession: () => void
  setHasHydrated: (state: boolean) => void
}

export const useOrderStore = create<OrderState & OrderActions>()(
  devtools(
    persist(
      immer((set) => ({
        activeCheckout: null,
        checkoutStep: 'CART',
        _hasHydrated: false,

        setActiveCheckout: (checkout) =>
          set((s) => {
            s.activeCheckout = checkout
          }),

        setCheckoutStep: (step) =>
          set((s) => {
            s.checkoutStep = step
          }),

        clearCheckoutSession: () =>
          set((s) => {
            s.activeCheckout = null
            s.checkoutStep = 'CART'
          }),
          
        setHasHydrated: (state) => 
          set((s) => {
            s._hasHydrated = state
          })
      })),
      {
        name: 'commerce-session',
        // NEVER persist the hydration flag
        partialize: (state) => ({
          activeCheckout: state.activeCheckout,
          checkoutStep: state.checkoutStep,
        }),
        onRehydrateStorage: () => (state) => {
          if (state) state.setHasHydrated(true)
        },
      },
    ),
    { name: 'OrderStore', enabled: process.env.NODE_ENV === 'development' },
  ),
)