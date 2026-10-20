'use client'

import * as React from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ImageOff, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  title: string
  images: { id: string; url: string }[]
  startIndex: number
  open: boolean
  onClose: () => void
}

export function ProofLightbox({ title, images, startIndex, open, onClose }: Props) {
  const [index, setIndex] = React.useState(startIndex)
  const [failed, setFailed] = React.useState<Record<string, true>>({})
  const closeRef = React.useRef<HTMLButtonElement>(null)
  const total = images.length

  React.useEffect(() => {
    if (open) setIndex(Math.min(Math.max(startIndex, 0), Math.max(total - 1, 0)))
  }, [open, startIndex, total])

  const go = React.useCallback(
    (delta: number) => setIndex((current) => Math.min(Math.max(current + delta, 0), Math.max(total - 1, 0))),
    [total],
  )

  React.useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') go(1)
      if (event.key === 'ArrowLeft') go(-1)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose, go])

  if (!open) return null
  const current = images[index]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(event) => event.target === event.currentTarget && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div className="relative flex w-full max-w-[640px] flex-col gap-6 rounded-[32px] border border-gray-50 bg-white px-4 pb-8 pt-4 sm:px-8">
        <div className="relative flex items-center justify-center py-2">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute left-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-50 hover:bg-secondary-50 active:scale-95"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-400 text-white">
              <X className="h-4 w-4" aria-hidden="true" />
            </span>
          </button>
          <h2 className="font-raleway text-h5 font-medium tracking-wide text-gray-500 sm:text-h4">{title}</h2>
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[24px] bg-black">
          {current && !failed[current.id] ? (
            <Image
              key={current.id}
              src={current.url}
              alt={`${title} ${index + 1} of ${total}`}
              fill
              sizes="(min-width: 640px) 576px, 100vw"
              onError={() => setFailed((state) => ({ ...state, [current.id]: true }))}
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/70">
              <ImageOff className="h-8 w-8" aria-hidden="true" />
              <p className="font-poppins text-body-s">This image could not be loaded.</p>
            </div>
          )}

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                disabled={index === 0}
                aria-label="Previous image"
                className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/70 text-white transition-opacity hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                disabled={index === total - 1}
                aria-label="Next image"
                className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-primary-500 text-white transition-opacity hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        {total > 1 && (
          <div role="tablist" aria-label="Image position" className="flex items-center justify-center gap-2">
            {images.map((image, position) => (
              <button
                key={image.id}
                type="button"
                role="tab"
                aria-selected={position === index}
                aria-label={`Go to image ${position + 1}`}
                onClick={() => setIndex(position)}
                className={cn(
                  'h-2 cursor-pointer rounded-full transition-all',
                  position === index ? 'w-8 bg-primary-500' : 'w-2 bg-gray-50 hover:bg-gray-100',
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
