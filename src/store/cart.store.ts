import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { cartService } from '@/services/cart.service'
import type { Cart, AddToCartInput } from '@/types/cart'

type CartState = {
  cart: Cart | null
  isLoading: boolean
  error: string | null
}

type CartActions = {
  fetchCart: () => Promise<void>
  addItem: (input: AddToCartInput) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  itemCount: () => number
}

export const useCartStore = create<CartState & CartActions>()(
  devtools(
    (set, get) => ({
      cart: null,
      isLoading: false,
      error: null,

      fetchCart: async () => {
        set({ isLoading: true, error: null })
        try {
          const res = await cartService.getCart()
          set({ cart: res.data, isLoading: false })
        } catch (err: any) {
          set({ error: err?.message ?? 'Failed to load cart', isLoading: false })
        }
      },

      addItem: async (input) => {
        set({ isLoading: true, error: null })
        try {
          const res = await cartService.addItem(input)
          set({ cart: res.data, isLoading: false })
        } catch (err: any) {
          set({ error: err?.message ?? 'Failed to add item', isLoading: false })
          throw err
        }
      },

      updateQuantity: async (itemId, quantity) => {
        const prevCart = get().cart
        // Optimistic update
        if (prevCart) {
          set({
            cart: {
              ...prevCart,
              items: prevCart.items.map((i) =>
                i.id === itemId ? { ...i, quantity } : i
              ),
            },
          })
        }
        try {
          const res = await cartService.updateItem(itemId, { quantity })
          set({ cart: res.data })
        } catch (err: any) {
          // Roll back on failure
          set({ cart: prevCart, error: err?.message ?? 'Failed to update quantity' })
          throw err
        }
      },

      removeItem: async (itemId) => {
        const prevCart = get().cart
        if (prevCart) {
          set({
            cart: {
              ...prevCart,
              items: prevCart.items.filter((i) => i.id !== itemId),
              item_count: prevCart.item_count - 1,
            },
          })
        }
        try {
          const res = await cartService.removeItem(itemId)
          set({ cart: res.data })
        } catch (err: any) {
          set({ cart: prevCart, error: err?.message ?? 'Failed to remove item' })
          throw err
        }
      },

      clearCart: async () => {
        set({ isLoading: true, error: null })
        try {
          await cartService.clearCart()
          set({ cart: null, isLoading: false })
        } catch (err: any) {
          set({ error: err?.message ?? 'Failed to clear cart', isLoading: false })
          throw err
        }
      },

      itemCount: () => get().cart?.item_count ?? 0,
    }),
    { name: 'CartStore', enabled: process.env.NODE_ENV === 'development' }
  )
)