'use client'

import { useEffect } from 'react'

export function useHideMobileNav() {
  useEffect(() => {
    document.body.classList.add('hide-mobile-nav')
    return () => document.body.classList.remove('hide-mobile-nav')
  }, [])
}