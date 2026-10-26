'use client'

import { useSyncExternalStore } from 'react'

// Same breakpoint the rest of the app treats as "desktop" (Tailwind `lg`).
const DESKTOP_QUERY = '(min-width: 1024px)'

export type LayoutMode = 'desktop' | 'mobile'

function subscribe(onChange: () => void) {
  const media = window.matchMedia(DESKTOP_QUERY)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

// `null` is only ever returned while hydrating server-rendered HTML, so neither
// layout flashes for a frame before the real one is known. On a client-only
// render the real value is returned straight away.
export function useLayoutMode(): LayoutMode | null {
  return useSyncExternalStore<LayoutMode | null>(
    subscribe,
    () => (window.matchMedia(DESKTOP_QUERY).matches ? 'desktop' : 'mobile'),
    () => null,
  )
}
