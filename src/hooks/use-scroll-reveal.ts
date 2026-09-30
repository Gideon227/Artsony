'use client'

import { useCallback } from 'react'

export const SCROLL_REVEAL_QUERY = '(width < 48rem)'
export const SCROLL_REVEAL_ZONE_RATIO = 0.4
export const SCROLL_REVEAL_FEATHER_PX = 48
const TOP_ACTIONS_MIN_PX = 72
const BOTTOM_INFO_INSET_PX = 24

export type ScrollReveal = {
  end: number
  solid: number
  topActive: boolean
  bottomActive: boolean
}

export function computeScrollReveal(
  cardTop: number,
  cardHeight: number,
  zoneBottom: number,
  feather = SCROLL_REVEAL_FEATHER_PX,
): ScrollReveal {
  if (cardHeight <= 0) return { end: 0, solid: -feather, topActive: false, bottomActive: false }

  const revealed = Math.min(Math.max(zoneBottom - cardTop, 0), cardHeight)
  const end = (revealed * (cardHeight + feather)) / cardHeight

  return {
    end,
    solid: end - feather,
    topActive: revealed >= TOP_ACTIONS_MIN_PX,
    bottomActive: revealed >= cardHeight - BOTTOM_INFO_INSET_PX,
  }
}

const tracked = new Set<HTMLElement>()
const inView = new Set<HTMLElement>()
const applied = new WeakMap<HTMLElement, ScrollReveal>()

let observer: IntersectionObserver | null = null
let media: MediaQueryList | null = null
let frame = 0

function apply(el: HTMLElement, zoneBottom: number, rect: DOMRect) {
  const next = computeScrollReveal(rect.top, rect.height, zoneBottom)
  const prev = applied.get(el)

  if (!prev || Math.abs(prev.end - next.end) >= 0.5) {
    el.style.setProperty('--reveal-end', `${next.end.toFixed(1)}px`)
    el.style.setProperty('--reveal-solid', `${next.solid.toFixed(1)}px`)
  }
  if (!prev || prev.topActive !== next.topActive) el.dataset.revealTop = String(next.topActive)
  if (!prev || prev.bottomActive !== next.bottomActive) el.dataset.revealBottom = String(next.bottomActive)

  applied.set(el, next)
}

function flush() {
  frame = 0
  if (!media?.matches || inView.size === 0) return

  const zoneBottom = window.innerHeight * SCROLL_REVEAL_ZONE_RATIO
  const rects = Array.from(inView, (el) => [el, el.getBoundingClientRect()] as const)
  for (const [el, rect] of rects) apply(el, zoneBottom, rect)
}

function schedule() {
  if (frame) return
  frame = window.requestAnimationFrame(flush)
}

function start() {
  if (observer) return

  media = window.matchMedia(SCROLL_REVEAL_QUERY)
  observer = new IntersectionObserver((entries) => {
    for (const { target, isIntersecting } of entries) {
      if (isIntersecting) inView.add(target as HTMLElement)
      else inView.delete(target as HTMLElement)
    }
    schedule()
  })

  window.addEventListener('scroll', schedule, { passive: true, capture: true })
  window.addEventListener('resize', schedule, { passive: true })
  media.addEventListener('change', schedule)
}

function stop() {
  if (!observer) return

  observer.disconnect()
  observer = null
  window.removeEventListener('scroll', schedule, { capture: true })
  window.removeEventListener('resize', schedule)
  media?.removeEventListener('change', schedule)
  media = null
  if (frame) window.cancelAnimationFrame(frame)
  frame = 0
}

function register(el: HTMLElement) {
  start()
  tracked.add(el)
  observer?.observe(el)

  if (media?.matches) apply(el, window.innerHeight * SCROLL_REVEAL_ZONE_RATIO, el.getBoundingClientRect())
}

function unregister(el: HTMLElement) {
  tracked.delete(el)
  inView.delete(el)
  observer?.unobserve(el)
  if (tracked.size === 0) stop()
}

export function useScrollReveal<T extends HTMLElement>() {
  return useCallback((el: T | null) => {
    if (!el) return
    register(el)
    return () => unregister(el)
  }, [])
}
