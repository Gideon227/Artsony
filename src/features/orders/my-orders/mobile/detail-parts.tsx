'use client'

import { useEffect, type ReactNode } from 'react'
import Image from 'next/image'
import { Check, X } from 'lucide-react'
import { TIMELINE_MILESTONES } from '../constant'
import type { TimelineStatus } from '@/types/physical-order'
import { cn } from '@/lib/utils'

// ── Full-screen detail layer ──────────────────────────────────────────────────
// Sits above the floating bottom nav (z-[350]). Modals that belong to the order
// (cancel flow, review, share, lightbox) are rendered as children so they share
// this layer's stacking context and stay on top of it.

interface ScreenProps {
  title: string
  actions?: ReactNode | undefined
  onClose: () => void
  children: ReactNode
}

export function MobileDetailScreen({ title, actions, onClose, children }: ScreenProps) {
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-[360] flex flex-col bg-white">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-gray-50 bg-white px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close order details"
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-50 active:scale-95"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-400 text-white">
              <X size={14} strokeWidth={3} aria-hidden="true" />
            </span>
          </button>
          <h2 className="truncate font-raleway text-h6 font-semibold tracking-wide text-body">{title}</h2>
        </div>
        {actions}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 pt-6">{children}</div>
      </div>
    </div>
  )
}

// ── Header block: cube + meta lines ───────────────────────────────────────────

export function OrderCube() {
  return (
    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-gray-50 bg-white">
      <Image src="/icons/box.svg" width={32} height={32} alt="" aria-hidden="true" />
    </span>
  )
}

interface MetaProps {
  label: string
  value: ReactNode
  valueClassName?: string | undefined
}

export function MetaLine({ label, value, valueClassName }: MetaProps) {
  return (
    <p className="font-poppins text-body-xs tracking-wide text-gray-200">
      {label} <span className={cn('text-body', valueClassName)}>{value}</span>
    </p>
  )
}

export function DateRow({ label, value, valueClassName }: MetaProps) {
  return (
    <div className="flex items-start justify-between gap-4 font-poppins text-body-xs tracking-wide">
      <span className="shrink-0 text-gray-200">{label}</span>
      <span className={cn('text-right text-body', valueClassName)}>{value}</span>
    </div>
  )
}

export function OrderSummaryHeader({ children, dates }: { children: ReactNode; dates?: ReactNode | undefined }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <OrderCube />
        <div className="flex flex-col gap-2">{children}</div>
      </div>
      {dates ? <div className="flex flex-col gap-3">{dates}</div> : null}
    </div>
  )
}

// ── Sections & fields ─────────────────────────────────────────────────────────

export function DetailSection({ title, aside, children }: { title: string; aside?: ReactNode | undefined; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-raleway text-h6 font-medium tracking-wide text-body">{title}</h3>
        {aside}
      </div>
      {children}
    </section>
  )
}

interface FieldProps {
  label: string
  value: ReactNode
  valueClassName?: string | undefined
  align?: 'left' | 'center'
  className?: string | undefined
}

// Rounded read-only "pill" used for every labelled value in the designs.
export function PillField({ label, value, valueClassName, align = 'left', className }: FieldProps) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-2', className)}>
      <span className="font-poppins text-body-xs tracking-wide text-gray-200">{label}</span>
      <span
        className={cn(
          'flex min-h-12 items-center rounded-[24px] border border-gray-50 px-4 py-2 font-poppins text-body-s tracking-wide text-body [overflow-wrap:anywhere]',
          align === 'center' && 'justify-center text-center',
          valueClassName,
        )}
      >
        {value}
      </span>
    </div>
  )
}

export function PlainField({ label, value, valueClassName, className }: FieldProps) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      <span className="font-poppins text-body-xs tracking-wide text-gray-200">{label}</span>
      <span className={cn('font-poppins text-body-s tracking-wide text-body [overflow-wrap:anywhere]', valueClassName)}>
        {value}
      </span>
    </div>
  )
}

export function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-4">{children}</div>
}

export function ArtworkImage({ src, alt }: { src: string | null | undefined; alt: string }) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-gray-50">
      {src ? (
        <Image src={src} alt={alt} fill sizes="(min-width: 768px) 672px, 100vw" className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-poppins text-body-xs text-gray-200">
          No image
        </div>
      )}
    </div>
  )
}

// ── Vertical shipment timeline ────────────────────────────────────────────────

type StepState = 'done' | 'active' | 'upcoming'

function StepMarker({ state }: { state: StepState }) {
  return (
    <span
      className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 bg-white',
        state === 'done' && 'border-primary-500 bg-primary-500 text-white',
        state === 'active' && 'border-primary-500',
        state === 'upcoming' && 'border-gray-100',
      )}
    >
      {state === 'done' && <Check size={16} strokeWidth={3} aria-hidden="true" />}
    </span>
  )
}

export function VerticalTimeline({ status }: { status: TimelineStatus }) {
  const activeIndex = Math.max(
    TIMELINE_MILESTONES.findIndex((milestone) => milestone.statuses.includes(status)),
    0,
  )
  const last = TIMELINE_MILESTONES.length - 1

  return (
    <ol aria-label="Shipment progress" className="flex flex-col rounded-3xl border border-gray-50 p-4">
      {TIMELINE_MILESTONES.map((milestone, index) => {
        const state: StepState = index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'upcoming'
        return (
          <li key={milestone.title} aria-current={state === 'active' ? 'step' : undefined} className="flex gap-4">
            <div className="flex flex-col items-center">
              <StepMarker state={state} />
              {index < last && (
                <span className={cn('my-1 w-[2px] flex-1', index < activeIndex ? 'bg-primary-500' : 'bg-gray-50')} />
              )}
            </div>
            <div className={cn('flex flex-col gap-1', index < last && 'pb-6')}>
              <p className="font-poppins text-body-s font-medium tracking-wide text-heading">{milestone.title}</p>
              <p className="font-poppins text-body-xs tracking-wide text-gray-200">{milestone.description}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

// ── Loading / error ───────────────────────────────────────────────────────────

export function MobileDetailSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6" aria-busy="true" aria-label="Loading order details">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-gray-50" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-3 w-2/3 rounded bg-gray-50" />
          <div className="h-3 w-1/2 rounded bg-gray-50" />
          <div className="h-3 w-1/3 rounded bg-gray-50" />
        </div>
      </div>
      <div className="aspect-[4/3] w-full rounded-3xl bg-gray-50" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 rounded-[24px] bg-gray-50" />
        ))}
      </div>
    </div>
  )
}
