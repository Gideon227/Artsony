'use client'

import * as React from 'react'
import { BadgeCheck, ClipboardList, Loader2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components'
import { IllustrationSlot } from '../illustration-slot'

function Screen({ children, className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...rest} className={cn('flex min-h-[420px] flex-col items-center justify-center gap-6 px-6 py-10 text-center', className)}>
      {children}
    </div>
  )
}

export function ProcessingScreen() {
  return (
    <Screen aria-live="polite" role="status">
      <h2 className="font-raleway text-h5 font-medium tracking-wide text-primary-500 lg:text-h4">
        Hang Tight — We&apos;re Checking Your Upload
      </h2>
      <p className="max-w-[420px] font-poppins text-body-xs leading-5 tracking-wide text-gray-400">
        Please wait while we securely upload and verify your packaging photos. This may take a few seconds — do not close this page
        until the upload is complete.
      </p>
      <Loader2 className="h-12 w-12 animate-spin text-primary-500" aria-label="Uploading" />
    </Screen>
  )
}

type FailedProps = { message?: string | null; onBack: () => void; onRetry?: (() => void) | undefined }

export function FailedScreen({ message, onBack, onRetry }: FailedProps) {
  return (
    <Screen role="alert">
      <div className="flex items-center gap-3">
        <XCircle className="h-9 w-9 text-error-500" aria-hidden="true" />
        <h2 className="font-raleway text-h5 font-medium tracking-wide text-error-500 lg:text-h4">Upload Failed</h2>
      </div>
      <div className="flex max-w-[460px] flex-col gap-3 font-poppins text-body-xs leading-5 tracking-wide text-gray-400">
        <p>We couldn&apos;t verify your packaging photos. Please check your connection and try again.</p>
        <p>Make sure all 3 required shots are clear and show your packaging properly before resubmitting.</p>
        {message && <p className="text-error-500">{message}</p>}
      </div>
      <IllustrationSlot src={null} alt="Upload failed" className="h-40 w-56 rounded-[16px]" />
      <div className="flex w-full max-w-[420px] items-center justify-center gap-3">
        <Button variant="outline" leftIcon="/icons/alt-arrow-left-double-red.svg" onClick={onBack} className="flex-1">
          Back
        </Button>
        {onRetry && (
          <Button onClick={onRetry} className="flex-1">
            Retry
          </Button>
        )}
      </div>
    </Screen>
  )
}

type SuccessProps = {
  onDone?: (() => void) | undefined
  onDownloadLabel?: (() => void) | undefined
  isDownloading?: boolean
  labelHint?: string
}

export function SuccessScreen({ onDone, onDownloadLabel, isDownloading = false, labelHint }: SuccessProps) {
  return (
    <Screen role="status">
      <div className="flex items-center gap-3">
        <BadgeCheck className="h-9 w-9 text-successful-500" aria-hidden="true" />
        <h2 className="font-raleway text-h5 font-medium tracking-wide text-successful-500 lg:text-h4">Order Activated</h2>
      </div>
      <div className="flex max-w-[460px] flex-col gap-3 font-poppins text-body-xs leading-5 tracking-wide text-gray-400">
        <p>Your Order Activation is complete.</p>
        <p>You can now download your shipping label and attach it securely to your package.</p>
        <p>
          A courier will be scheduled to pick up your package shortly, and you can track its journey in the &ldquo;Live Orders&rdquo;
          tab under Order Management.
        </p>
      </div>

      {onDownloadLabel ? (
        <button
          type="button"
          onClick={onDownloadLabel}
          disabled={isDownloading}
          className="inline-flex cursor-pointer items-center gap-2 font-poppins text-body-s tracking-wide text-info-500 underline disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ClipboardList className="h-4 w-4" aria-hidden="true" />}
          Download Shipping Label
        </button>
      ) : (
        labelHint && <p className="font-poppins text-body-xs text-gray-300">{labelHint}</p>
      )}

      <IllustrationSlot src={null} alt="Order activated" className="h-40 w-56 rounded-[16px]" />
      {onDone && (
        <Button onClick={onDone} className="w-full max-w-[220px]">
          Done
        </Button>
      )}
    </Screen>
  )
}
