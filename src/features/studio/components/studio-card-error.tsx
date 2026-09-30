'use client'

import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { studioErrorMessage } from '@/lib/studio/query'
import { cn } from '@/lib/utils'

type StudioCardErrorProps = {
  error: unknown
  onRetry: () => void
  isRetrying?: boolean
  className?: string
}

export function StudioCardError({ error, onRetry, isRetrying = false, className }: StudioCardErrorProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-1 flex-col items-center justify-center gap-y-3 rounded-2xl border border-gray-50 bg-white p-5 text-center',
        className,
      )}
    >
      <AlertCircle className="h-5 w-5 text-error-500" strokeWidth={1.75} aria-hidden="true" />
      <p className="text-body-s text-body">{studioErrorMessage(error)}</p>
      <Button type="button" size="sm" variant="outline" isLoading={isRetrying} onClick={onRetry} aria-label="Retry loading">
        Retry
      </Button>
    </div>
  )
}
