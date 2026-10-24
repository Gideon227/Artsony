'use client'

import * as React from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { DialogClose, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/utils'

export type WithdrawFrameProps = {
  /** Always provided for screen readers; only drawn when `showTitle` is true. */
  title: string
  description: string
  showTitle?: boolean
  showClose?: boolean
  /** Corner artwork (desktop only), used on the amount / destination / processing screens. */
  decor?: boolean
  children: React.ReactNode
}

function CornerDecor() {
  return (
    <div aria-hidden="true" className="pointer-events-none max-lg:hidden">
      <div className="absolute top-10 rotate-90" style={{ right: '-60px' }}>
        <Image src="/upload/vector.svg" width={248} height={248} alt="" className="h-auto w-62" />
      </div>
      <div className="absolute -rotate-90" style={{ left: '-60px', bottom: '-60px' }}>
        <Image src="/upload/vector.svg" width={248} height={248} alt="" className="h-auto w-62" />
      </div>
    </div>
  )
}

/**
 * Shared chrome for every withdrawal screen: optional close button + title,
 * decoration, and the Radix title/description every dialog needs for a11y.
 * Mobile: full-screen sheet with a top bar. Desktop: centred card.
 */
export function WithdrawFrame({
  title,
  description,
  showTitle = true,
  showClose = true,
  decor = false,
  children,
}: WithdrawFrameProps) {
  const hasHeader = showClose || showTitle

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      {decor && <CornerDecor />}

      {hasHeader ? (
        <header
          className={cn(
            'relative z-10 flex items-center gap-x-4 px-4 py-4 lg:flex-col lg:px-8',
            showTitle ? 'border-b border-gray-50 lg:border-0 lg:pb-0 lg:pt-16' : 'lg:h-0 lg:py-0',
          )}
        >
          {showClose && (
            <DialogClose
              aria-label="Close withdrawal"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-50 transition-colors hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-50 lg:absolute lg:left-8 lg:top-8"
            >
              <span className="flex size-6 items-center justify-center rounded-full bg-[#525965]">
                <X className="size-3.5 text-white" strokeWidth={3} />
              </span>
            </DialogClose>
          )}
          <DialogTitle
            className={cn(
              showTitle
                ? 'font-raleway text-h6 font-semibold leading-8 tracking-wide text-body lg:text-h4 lg:font-medium lg:text-heading'
                : 'sr-only',
            )}
          >
            {title}
          </DialogTitle>
        </header>
      ) : (
        <DialogTitle className="sr-only">{title}</DialogTitle>
      )}

      <DialogDescription className="sr-only">{description}</DialogDescription>

      {children}
    </div>
  )
}