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

function MediaFallback({ onRetry, fill = false }: { onRetry?: () => void; fill?: boolean }) {
  return (
    <div className={cn('flex w-full flex-col items-center justify-center gap-3 bg-gray-50 font-poppins text-body-s text-gray-400', fill ? 'h-full' : 'aspect-[4/3]')}>
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

function PreviewImage({ src, alt, aspectRatio, fill = false }: { src: string; alt: string; aspectRatio?: string; fill?: boolean }) {
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

  if (status === 'error') return <MediaFallback onRetry={handleRetry} fill={fill} />

  return (
    <div
      className={cn('relative w-full bg-gray-50', fill && 'h-full', status === 'loading' && 'animate-pulse')}
      style={fill ? undefined : { aspectRatio: aspectRatio ?? '4 / 3' }}
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

function VideoMedia({ asset, fill = false }: { asset: DraftAsset; fill?: boolean }) {
  const [failed, setFailed] = useState(false)

  if (failed) return <MediaFallback onRetry={() => setFailed(false)} fill={fill} />

  return (
    <video
      src={asset.original_url}
      poster={asset.thumbnail_url ?? undefined}
      controls
      playsInline
      preload="metadata"
      onError={() => setFailed(true)}
      className={cn('block w-full bg-gray-900', fill ? 'h-full object-contain' : 'h-auto')}
      style={fill ? undefined : { aspectRatio: aspectRatioOf(asset) ?? '16 / 9' }}
    />
  )
}

function FileCard({ icon: Icon, label, detail, fill = false }: { icon: typeof Box; label: string; detail: string; fill?: boolean }) {
  return (
    <div className={cn('flex w-full flex-col items-center justify-center gap-3 bg-gray-50 px-6', fill ? 'h-full' : 'aspect-video')}>
      <Icon size={40} className="text-gray-300" aria-hidden />
      <p className="font-poppins text-body-s font-medium text-gray-500">{label}</p>
      <p className="max-w-full truncate font-poppins text-body-xs text-gray-400">{detail}</p>
    </div>
  )
}

function PdfMedia({ asset, alt, fill = false }: { asset: DraftAsset; alt: string; fill?: boolean }) {
  return (
    <div className={cn('relative', fill && 'h-full')}>
      {asset.thumbnail_url ? (
        <PreviewImage src={asset.thumbnail_url} alt={alt} aspectRatio={aspectRatioOf(asset)} fill={fill} />
      ) : (
        <FileCard icon={FileText} label="PDF document" detail={asset.original_url} fill={fill} />
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

interface AssetMediaProps {
  asset: DraftAsset
  alt:   string
  fill?: boolean
}

export function AssetMedia({ asset, alt, fill = false }: AssetMediaProps) {
  switch (asset.media_type) {
    case 'IMAGE':
      return (
        <PreviewImage
          src={asset.optimized_url ?? asset.original_url}
          alt={alt}
          aspectRatio={aspectRatioOf(asset)}
          fill={fill}
        />
      )
    case 'PDF':
      return <PdfMedia asset={asset} alt={alt} fill={fill} />
    case 'VIDEO':
      return <VideoMedia asset={asset} fill={fill} />
    case 'THREE_D':
      return <FileCard icon={Box} label="3D model" detail={asset.original_url} fill={fill} />
    case 'EXTERNAL_LINK':
      return <FileCard icon={Code2} label="Embedded content" detail={asset.original_url} fill={fill} />
    default:
      return null
  }
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
      <AssetMedia asset={asset} alt={alt} />

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
