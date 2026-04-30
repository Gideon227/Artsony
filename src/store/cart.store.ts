import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { CartItem, ID } from '@/types'

type CartState = {
  items: CartItem[]
}

type CartActions = {
  addItem: (item: CartItem) => void
  removeItem: (artworkId: ID) => void
  clearCart: () => void
  itemCount: () => number
  total: () => number
  hasItem: (artworkId: ID) => boolean
}

export const useCartStore = create<CartState & CartActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        items: [],

        addItem: (item) =>
          set((state) => {
            const existing = state.items.find((i) => i.artwork.id === item.artwork.id)
            if (!existing) state.items.push(item)
          }),

        removeItem: (artworkId) =>
          set((state) => {
            state.items = state.items.filter((i) => i.artwork.id !== artworkId)
          }),

        clearCart: () =>
          set((state) => {
            state.items = []
          }),

        itemCount: () => get().items.length,

        total: () =>
          get().items.reduce((sum, item) => sum + (item.artwork.price ?? 0) * item.quantity, 0),

        hasItem: (artworkId) => get().items.some((i) => i.artwork.id === artworkId),
      })),
      {
        name: 'artsony-cart',
        partialize: (state) => ({ items: state.items }),
      }
    ),
    { name: 'CartStore', enabled: process.env.NODE_ENV === 'development' }
  )
)
