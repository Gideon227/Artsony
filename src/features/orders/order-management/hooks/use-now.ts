'use client'

import * as React from 'react'

export function useNow(intervalMs = 1000, enabled = true): number {
  const [now, setNow] = React.useState(() => Date.now())

  React.useEffect(() => {
    if (!enabled) return
    setNow(Date.now())
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(timer)
  }, [intervalMs, enabled])

  return now
}
