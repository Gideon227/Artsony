'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'

export interface PriceRangeSliderProps {
  min?: number
  max?: number
  step?: number
  /** Controlled value. Omit to let the component manage its own state. */
  value?: [number, number]
  defaultValue?: [number, number]
  /** Fires continuously — every drag tick and every committed input change. */
  onChange?: (value: [number, number]) => void
  /** Fires once, at the end of a drag or when an input is committed (blur/Enter) — the right hook for triggering an API call without spamming it on every pixel of drag. */
  onChangeCommitted?: (value: [number, number]) => void
  currency?: string
  className?: string
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(Math.max(n, lo), hi)
}

function formatCurrency(n: number, currency: string) {
  return `${currency} ${n.toLocaleString('en-US')}`
}

export function PriceRangeSlider({
  min = 0,
  max = 10000,
  step = 1,
  value,
  defaultValue,
  onChange,
  onChangeCommitted,
  currency = '$',
  className,
}: PriceRangeSliderProps) {
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = useState<[number, number]>(
    defaultValue ?? [min, max]
  )
  const current = isControlled ? value! : internalValue
  const currentRef = useRef(current)
  currentRef.current = current

  const [minText, setMinText] = useState(String(current[0]))
  const [maxText, setMaxText] = useState(String(current[1]))
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null)
  const [focused, setFocused] = useState<'min' | 'max' | null>(null)

  const trackRef = useRef<HTMLDivElement>(null)

  // Keep the text inputs mirroring the slider, except while the user is
  // actively typing in that specific input (don't fight their keystrokes).
  useEffect(() => {
    if (focused !== 'min') setMinText(String(current[0]))
    if (focused !== 'max') setMaxText(String(current[1]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current[0], current[1], focused])

  const commit = useCallback((next: [number, number], isCommit: boolean) => {
    if (!isControlled) setInternalValue(next)
    onChange?.(next)
    if (isCommit) onChangeCommitted?.(next)
  }, [isControlled, onChange, onChangeCommitted])

  const percentFor = (v: number) => ((v - min) / (max - min)) * 100

  const valueFromClientX = useCallback((clientX: number) => {
    const track = trackRef.current
    if (!track) return min
    const rect = track.getBoundingClientRect()
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1)
    const raw = min + ratio * (max - min)
    return clamp(Math.round(raw / step) * step, min, max)
  }, [min, max, step])

  // ── Drag handling — attached once per drag (via ref), not re-subscribed
  // on every value tick, so pointer tracking stays perfectly 1:1 with the
  // cursor even at high move-event frequency. ─────────────────────────────
  useEffect(() => {
    if (!dragging) return

    const handleMove = (e: PointerEvent) => {
      const v = valueFromClientX(e.clientX)
      const [lo, hi] = currentRef.current
      const next: [number, number] = dragging === 'min'
        ? [clamp(v, min, hi), hi]
        : [lo, clamp(v, lo, max)]
      commit(next, false)
    }
    const handleUp = () => {
      setDragging(null)
      commit(currentRef.current, true)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [dragging, valueFromClientX, min, max, commit])

  const startDrag = (handle: 'min' | 'max') => (e: React.PointerEvent) => {
    e.preventDefault()
    setDragging(handle)
  }

  // Clicking directly on the track jumps the nearer handle to that point.
  const handleTrackClick = (e: React.MouseEvent) => {
    if (dragging) return
    const v = valueFromClientX(e.clientX)
    const [lo, hi] = current
    const distToMin = Math.abs(v - lo)
    const distToMax = Math.abs(v - hi)
    const next: [number, number] = distToMin <= distToMax
      ? [clamp(v, min, hi), hi]
      : [lo, clamp(v, lo, max)]
    commit(next, true)
  }

  const commitMinText = () => {
    setFocused(null)
    const parsed = parseInt(minText.replace(/[^0-9-]/g, ''), 10)
    const next: [number, number] = Number.isFinite(parsed)
      ? [clamp(parsed, min, current[1]), current[1]]
      : current
    commit(next, true)
  }

  const commitMaxText = () => {
    setFocused(null)
    const parsed = parseInt(maxText.replace(/[^0-9-]/g, ''), 10)
    const next: [number, number] = Number.isFinite(parsed)
      ? [current[0], clamp(parsed, current[0], max)]
      : current
    commit(next, true)
  }

  const minPct = percentFor(current[0])
  const maxPct = percentFor(current[1])
  const noTransition = dragging !== null

  return (
    <div className={cn('w-full', className)}>
      <span className="font-poppins text-sm text-neutral-400 block mb-6">Price</span>

      {/* ── Track + handles + tooltips ──────────────────────────────────── */}
      <div className="relative pt-9 pb-3 px-3">
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          className="relative h-[3px] rounded-full bg-neutral-200 cursor-pointer"
        >
          {/* Active range fill */}
          <div
            className={cn(
              'absolute top-0 h-full rounded-full bg-secondary-800',
              !noTransition && 'transition-all duration-200 ease-out'
            )}
            style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
          />

          {/* ── Min handle ──────────────────────────────────────────────── */}
          <Handle
            percent={minPct}
            label={formatCurrency(current[0], currency)}
            active={dragging === 'min'}
            noTransition={noTransition}
            onPointerDown={startDrag('min')}
            ariaLabel="Minimum price"
            ariaValue={current[0]}
            min={min}
            max={current[1]}
            onKeyStep={(delta) => commit([clamp(current[0] + delta, min, current[1]), current[1]], true)}
          />

          {/* ── Max handle ──────────────────────────────────────────────── */}
          <Handle
            percent={maxPct}
            label={formatCurrency(current[1], currency)}
            active={dragging === 'max'}
            noTransition={noTransition}
            onPointerDown={startDrag('max')}
            ariaLabel="Maximum price"
            ariaValue={current[1]}
            min={current[0]}
            max={max}
            onKeyStep={(delta) => commit([current[0], clamp(current[1] + delta, current[0], max)], true)}
          />
        </div>
      </div>

      {/* ── Min / Max inputs ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mt-6">
        <input
          type="text"
          inputMode="numeric"
          value={minText}
          onChange={(e) => setMinText(e.target.value)}
          onFocus={() => setFocused('min')}
          onBlur={commitMinText}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          placeholder="min"
          aria-label="Minimum price"
          className="w-full h-12 rounded-full border border-neutral-200 bg-white px-6 text-sm text-neutral-700 placeholder:text-neutral-400 outline-none transition-colors focus:border-neutral-300 focus:ring-2 focus:ring-secondary-800/15"
        />
        <input
          type="text"
          inputMode="numeric"
          value={maxText}
          onChange={(e) => setMaxText(e.target.value)}
          onFocus={() => setFocused('max')}
          onBlur={commitMaxText}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          placeholder="max"
          aria-label="Maximum price"
          className="w-full h-12 rounded-full border border-neutral-200 bg-white px-6 text-sm text-neutral-700 placeholder:text-neutral-400 outline-none transition-colors focus:border-neutral-300 focus:ring-2 focus:ring-secondary-800/15"
        />
      </div>
    </div>
  )
}

// ─── Handle (draggable circle + tooltip pill) ────────────────────────────────

interface HandleProps {
  percent: number
  label: string
  active: boolean
  noTransition: boolean
  onPointerDown: (e: React.PointerEvent) => void
  ariaLabel: string
  ariaValue: number
  min: number
  max: number
  onKeyStep: (delta: number) => void
}

function Handle({
  percent, label, active, noTransition, onPointerDown,
  ariaLabel, ariaValue, min, max, onKeyStep,
}: HandleProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp')   { e.preventDefault(); onKeyStep(1) }
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowDown')  { e.preventDefault(); onKeyStep(-1) }
  }

  return (
    <div
      className={cn(
        'absolute top-1/2 -translate-y-1/2 -translate-x-1/2',
        !noTransition && 'transition-[left] duration-200 ease-out'
      )}
      style={{ left: `${percent}%` }}
    >
      {/* Tooltip pill */}
      <div
        className={cn(
          'absolute bottom-[calc(100%+14px)] left-1/2 -translate-x-1/2 whitespace-nowrap',
          'bg-secondary-800 text-white text-sm font-medium rounded-full px-4 py-2',
          'transition-transform duration-150 ease-out',
          active && 'scale-105'
        )}
      >
        {label}
        {/* Triangle pointer */}
        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0
                         border-l-[6px] border-l-transparent
                         border-r-[6px] border-r-transparent
                         border-t-[7px] border-t-secondary-800" />
      </div>

      {/* Draggable handle — visual circle sits inside a larger invisible hit target */}
      <div
        role="slider"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-valuenow={ariaValue}
        aria-valuemin={min}
        aria-valuemax={max}
        onPointerDown={onPointerDown}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative w-6 h-6 -m-2.5 flex items-center justify-center cursor-grab touch-none',
          'focus:outline-none',
          active && 'cursor-grabbing'
        )}
      >
        <div
          className={cn(
            'w-4 h-4 rounded-full bg-secondary-800 ring-4 ring-transparent transition-shadow duration-150',
            active && 'ring-secondary-800/20'
          )}
        />
      </div>
    </div>
  )
}