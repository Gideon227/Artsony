import { useEffect, useState } from 'react'
import { artworkService } from '@/services'
import { useArtworkStore } from '@/store/artwork.store'
import { describeSaveError, draftFromArtwork } from '../lib/artwork-draft'

export type DraftHydration =
  | { status: 'loading' }
  | { status: 'ready' }
  | { status: 'error'; message: string }

// The wizard URL carries the artwork id. A brand new draft already lives in the
// store under that id; a draft opened from the profile does not, so it is
// loaded from the server and replaces whatever the store held.
export function useDraftHydration(artworkId: string): DraftHydration {
  const loadDraft = useArtworkStore((s) => s.loadDraft)
  const [state, setState] = useState<DraftHydration>({ status: 'loading' })

  useEffect(() => {
    if (useArtworkStore.getState().draft.id === artworkId) {
      setState({ status: 'ready' })
      return
    }

    let cancelled = false
    setState({ status: 'loading' })

    artworkService
      .getById(artworkId)
      .then(({ data: artwork }) => {
        if (cancelled) return
        if (artwork.status !== 'DRAFT') {
          setState({ status: 'error', message: 'This artwork is already published and cannot be edited here.' })
          return
        }
        loadDraft(draftFromArtwork(artwork))
        setState({ status: 'ready' })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setState({ status: 'error', message: describeSaveError(error, 'We could not load this draft.') })
      })

    return () => { cancelled = true }
  }, [artworkId, loadDraft])

  return state
}
