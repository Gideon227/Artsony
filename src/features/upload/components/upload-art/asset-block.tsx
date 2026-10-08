'use client'

import React, { memo, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Box, Code2, FileText } from 'lucide-react'
import { cn } from '@/utils'
import { AssetToolbar } from './asset-toolbar'
import type { DraftAsset } from './types'

const TOOLBAR_VISIBILITY =
  'opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100'

const IMAGE_SIZES = '(min-width: 1280px) 60vw, 100vw'

function aspectRatioOf(asset: DraftAsset): string | undefined {
  return asset.width && asset.height ? `${asset.width} / ${asset.height}` : undefined
}

function MediaFallback({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 bg-gray-50 font-poppins text-body-s text-gray-400">
      <p>Preview unavailable</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="cursor-pointer rounded-full border border-primary-500 px-4 py-1.5 text-body-xs font-medium text-primary-500 transition-colors hover:bg-primary-50"
        >
          Retry
        </button>
      )}
    </div>
  )
}

function PreviewImage({ src, alt, aspectRatio }: { src: string; alt: string; aspectRatio?: string }) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const img = imgRef.current
    if (img?.complete) setStatus(img.naturalWidth > 0 ? 'loaded' : 'error')
  }, [attempt])

  const handleRetry = () => {
    setStatus('loading')
    setAttempt((n) => n + 1)
  }

  if (status === 'error') return <MediaFallback onRetry={handleRetry} />

  return (
    <div
      className={cn('relative w-full bg-gray-50', status === 'loading' && 'animate-pulse')}
      style={{ aspectRatio: aspectRatio ?? '4 / 3' }}
    >
      <Image
        key={attempt}
        ref={imgRef}
        src={src}
        alt={alt}
        fill
        sizes={IMAGE_SIZES}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        className={cn(
          'object-contain transition-opacity duration-200',
          status === 'loaded' ? 'opacity-100' : 'opacity-0',
        )}
      />
    </div>
  )
}

function VideoMedia({ asset }: { asset: DraftAsset }) {
  const [failed, setFailed] = useState(false)

  if (failed) return <MediaFallback onRetry={() => setFailed(false)} />

  return (
    <video
      src={asset.original_url}
      poster={asset.thumbnail_url ?? undefined}
      controls
      playsInline
      preload="metadata"
      onError={() => setFailed(true)}
      className="block h-auto w-full bg-gray-900"
      style={{ aspectRatio: aspectRatioOf(asset) ?? '16 / 9' }}
    />
  )
}

function FileCard({ icon: Icon, label, detail }: { icon: typeof Box; label: string; detail: string }) {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 bg-gray-50 px-6">
      <Icon size={40} className="text-gray-300" aria-hidden />
      <p className="font-poppins text-body-s font-medium text-gray-500">{label}</p>
      <p className="max-w-full truncate font-poppins text-body-xs text-gray-400">{detail}</p>
    </div>
  )
}

function PdfMedia({ asset, alt }: { asset: DraftAsset; alt: string }) {
  return (
    <div className="relative">
      {asset.thumbnail_url ? (
        <PreviewImage src={asset.thumbnail_url} alt={alt} aspectRatio={aspectRatioOf(asset)} />
      ) : (
        <FileCard icon={FileText} label="PDF document" detail={asset.original_url} />
      )}
      <span className="absolute right-4 top-4 rounded-full bg-black/50 px-3 py-1 font-poppins text-body-xs font-medium text-white backdrop-blur-sm">
        PDF
      </span>
      <a
        href={asset.original_url}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-4 right-4 rounded-full bg-black/60 px-4 py-2 font-poppins text-body-s font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-white"
      >
        Open PDF
      </a>
    </div>
  )
}

interface AssetBlockProps {
  asset:       DraftAsset
  index:       number
  isFirst:     boolean
  isLast:      boolean
  onMove:      (from: number, to: number) => void
  onEditAsset?: (index: number) => void
  onDeleteAsset: (index: number) => void
}

export const AssetBlock = memo(function AssetBlock({
  asset, index, isFirst, isLast, onMove, onEditAsset, onDeleteAsset,
}: AssetBlockProps) {
  const alt = `Artwork media ${index + 1}`

  return (
    <div className="group relative w-full overflow-hidden rounded-2xl border border-gray-50 bg-white shadow-sm">
      {asset.media_type === 'IMAGE' && (
        <PreviewImage src={asset.optimized_url ?? asset.original_url} alt={alt} aspectRatio={aspectRatioOf(asset)} />
      )}
      {asset.media_type === 'PDF' && <PdfMedia asset={asset} alt={alt} />}
      {asset.media_type === 'VIDEO' && <VideoMedia asset={asset} />}
      {asset.media_type === 'THREE_D' && (
        <FileCard icon={Box} label="3D model" detail={asset.original_url} />
      )}
      {asset.media_type === 'EXTERNAL_LINK' && (
        <FileCard icon={Code2} label="Embedded content" detail={asset.original_url} />
      )}

      <AssetToolbar
        className={TOOLBAR_VISIBILITY}
        onEdit={onEditAsset ? () => onEditAsset(index) : undefined}
        onMoveUp={isFirst ? undefined : () => onMove(index, index - 1)}
        onMoveDown={isLast ? undefined : () => onMove(index, index + 1)}
        onDelete={() => onDeleteAsset(index)}
      />
    </div>
  )
})
