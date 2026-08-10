import { useState, useCallback } from 'react'
import { useCartStore } from '@/store/cart.store'
import { useToast } from '@/components/ui/toaster'
import type { Artwork } from '@/types/artwork'

// ArtCard's hover "cart" quick-action only has an artwork to work with — no
// variant/quantity picker. It only makes sense for artworks that don't
// require a variant selection; anything else needs the full purchase panel
// (ArtworkViewOverlay), so we point the user there instead of guessing.
export function useQuickAddToCart() {
  const addItem = useCartStore((s) => s.addItem)
  const { success, error, info } = useToast()
  const [pendingId, setPendingId] = useState<string | null>(null)

  const quickAdd = useCallback(
    async (artwork: Pick<Artwork, 'id' | 'title' | 'has_variants' | 'listing_type'>) => {
      if (artwork.listing_type !== 'MARKETPLACE') {
        info('Not for sale', 'This piece isn\u2019t listed in the marketplace.')
        return
      }
      if (artwork.has_variants) {
        info('Choose an option first', 'Open the artwork to pick a type before adding it to your cart.')
        return
      }
      if (pendingId) return

      setPendingId(artwork.id)
      try {
        await addItem({ artwork_id: artwork.id, quantity: 1 })
        success('Added to cart', `${artwork.title} is in your cart.`)
      } catch (err) {
        error('Could not add to cart', err instanceof Error ? err.message : undefined)
      } finally {
        setPendingId(null)
      }
    },
    [addItem, success, error, info, pendingId],
  )

  return { quickAdd, pendingId }
}
