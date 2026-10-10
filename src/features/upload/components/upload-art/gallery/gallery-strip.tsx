'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Box, Code2, FileText, Plus, Video, type LucideIcon } from 'lucide-react'
import { cn } from '@/utils'
import type { ArtworkMediaType } from '@/types/artwork'
import type { DraftAsset } from '../types'
import type { GallerySelection, StripItem } from './slots'

const TILE = 'h-40 w-40 sm:h-[188px] sm:w-[188px]'
const SELECTED_RING = 'ring-2 ring-primary-500 ring-offset-2'
const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500'

const FALLBACK_ICONS: Record<ArtworkMediaType, LucideIcon> = {
  IMAGE: FileText,
  VIDEO: Video,
  PDF: FileText,
  THREE_D: Box,
  EXTERNAL_LINK: Code2,
}

function thumbnailSource(asset: DraftAsset): string | null {
  if (asset.media_type === 'IMAGE') return asset.thumbnail_url ?? asset.optimized_url ?? asset.original_url
  if (asset.media_type === 'VIDEO' || asset.media_type === 'PDF') return asset.thumbnail_url ?? null
  return null
}

function FallbackIcon({ mediaType }: { mediaType: ArtworkMediaType }) {
  const Icon = FALLBACK_ICONS[mediaType]
  return (
    <span className="absolute inset-0 flex items-center justify-center bg-gray-50">
      <Icon size={36} className="text-gray-300" aria-hidden />
    </span>
  )
}

function ThumbnailImage({ src, mediaType }: { src: string; mediaType: ArtworkMediaType }) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const img = imgRef.current
    if (img?.complete) setStatus(img.naturalWidth > 0 ? 'loaded' : 'error')
  }, [])

  if (status === 'error') return <FallbackIcon mediaType={mediaType} />

  return (
    <>
      {status === 'loading' && <span className="absolute inset-0 animate-pulse bg-gray-50" aria-hidden />}
      <Image
        ref={imgRef}
        src={src}
        alt=""
        fill
        sizes="188px"
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        className={cn('object-cover transition-opacity duration-200', status === 'loaded' ? 'opacity-100' : 'opacity-0')}
      />
    </>
  )
}

function RemoveBadge({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'absolute left-3 top-3 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white shadow-sm transition-transform hover:scale-110',
        'before:absolute before:-inset-1.5 before:content-[""]',
        FOCUS,
      )}
    >
      <Image src="/icons/cancel.svg" width={14} height={14} alt="" aria-hidden />
    </button>
  )
}

function ScrollButton({ direction, disabled, onClick }: { direction: 'prev' | 'next'; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={direction === 'prev' ? 'Show previous media' : 'Show next media'}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors',
        disabled
          ? 'cursor-not-allowed border-2 border-gray-300 text-gray-500'
          : 'cursor-pointer bg-primary-500 text-white hover:opacity-90',
        FOCUS,
      )}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d={direction === 'prev' ? 'M16 5v14L5 12z' : 'M8 5v14l11-7z'} />
      </svg>
    </button>
  )
}

interface GalleryStripProps {
  assets:        DraftAsset[]
  assetKeys:     string[]
  items:         StripItem[]
  selection:     GallerySelection
  onSelect:      (selection: GallerySelection) => void
  onDeleteAsset: (index: number) => void
  onDismissSlot: (id: string) => void
}

export function GalleryStrip({ assets, assetKeys, items, selection, onSelect, onDeleteAsset, onDismissSlot }: GalleryStripProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ atStart: true, atEnd: true })

  const syncEdges = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    setEdges({
      atStart: el.scrollLeft <= 1,
      atEnd: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1,
    })
  }, [])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    syncEdges()
    const observer = new ResizeObserver(syncEdges)
    observer.observe(el)
    return () => observer.disconnect()
  }, [syncEdges, items.length])

  const selectedKey =
    selection.kind === 'asset' ? `asset-${selection.index}` : selection.kind === 'empty' ? `empty-${selection.id}` : 'add'

  useEffect(() => {
    const el = scrollerRef.current?.querySelector<HTMLElement>('[data-selected="true"]')
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [selectedKey, items.length])

  const scrollByPage = (direction: 1 | -1) => {
    const el = scrollerRef.current
    if (!el) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  return (
    <section aria-label="Artwork media" className="flex w-full items-center gap-3">
      <ScrollButton direction="prev" disabled={edges.atStart} onClick={() => scrollByPage(-1)} />

      <div ref={scrollerRef} onScroll={syncEdges} className="min-w-0 flex-1 overflow-x-auto scrollbar-hide">
        <ul className="flex w-max items-center gap-4 p-2">
          {items.map((item) => {
            if (item.kind === 'empty') {
              const selected = selection.kind === 'empty' && selection.id === item.slot.id
              return (
                <li key={`empty-${item.slot.id}`} data-selected={selected} className="relative shrink-0">
                  <button
                    type="button"
                    aria-label="Empty slot. Choose a media type to fill it"
                    aria-pressed={selected}
                    onClick={() => onSelect({ kind: 'empty', id: item.slot.id })}
                    className={cn('block cursor-pointer rounded-2xl bg-gray-300/40 transition-colors hover:bg-gray-300/60', TILE, selected && SELECTED_RING, FOCUS)}
                  />
                  <RemoveBadge label="Remove empty slot" onClick={() => onDismissSlot(item.slot.id)} />
                </li>
              )
            }

            const asset = assets[item.index]
            if (!asset) return null
            const selected = selection.kind === 'asset' && selection.index === item.index
            const source = thumbnailSource(asset)

            return (
              <li key={assetKeys[item.index]} data-selected={selected} className="relative shrink-0">
                <button
                  type="button"
                  aria-label={`Show media ${item.index + 1} of ${assets.length}`}
                  aria-pressed={selected}
                  onClick={() => onSelect({ kind: 'asset', index: item.index })}
                  className={cn('relative block cursor-pointer overflow-hidden rounded-2xl bg-gray-50', TILE, selected && SELECTED_RING, FOCUS)}
                >
                  {source ? (
                    <ThumbnailImage src={source} mediaType={asset.media_type} />
                  ) : (
                    <FallbackIcon mediaType={asset.media_type} />
                  )}
                </button>
                <RemoveBadge label={`Delete media ${item.index + 1}`} onClick={() => onDeleteAsset(item.index)} />
              </li>
            )
          })}

          <li data-selected={selection.kind === 'add'} className="shrink-0">
            <button
              type="button"
              aria-label="Add media"
              aria-pressed={selection.kind === 'add'}
              onClick={() => onSelect({ kind: 'add' })}
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary-500 bg-white transition-colors hover:bg-primary-50',
                TILE,
                FOCUS,
              )}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500">
                <Plus size={20} color="#fff" aria-hidden />
              </span>
              <span className="font-poppins text-body-s text-gray-500">Add</span>
            </button>
          </li>
        </ul>
      </div>

      <ScrollButton direction="next" disabled={edges.atEnd} onClick={() => scrollByPage(1)} />
    </section>
  )
}
