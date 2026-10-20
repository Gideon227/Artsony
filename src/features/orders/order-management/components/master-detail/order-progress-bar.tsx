import { Bus, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SellerStatus } from '@/types/seller-sales'

type Props = { status: Exclude<SellerStatus, 'PENDING'>; progress: number; className?: string }

const TONE = {
  LIVE: { fill: 'bg-info-500', dot: 'bg-info-500' },
  COMPLETED: { fill: 'bg-successful-500', dot: 'bg-successful-500' },
  CANCELLED: { fill: 'bg-error-500', dot: 'bg-error-500' },
} as const

export function OrderProgressBar({ status, progress, className }: Props) {
  const tone = TONE[status]
  const percent = status === 'LIVE' ? Math.min(Math.max(progress, 0.08), 0.92) * 100 : 100

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
      className={cn('relative flex h-6 w-full items-center', className)}
    >
      <span className={cn('absolute left-0 h-3 w-3 rounded-full', tone.dot)} />
      <span className="absolute left-3 right-3 h-[2px] rounded-full bg-gray-50" />
      <span
        className={cn('absolute left-3 h-[2px] rounded-full transition-[width] duration-300', tone.fill)}
        style={{ width: `calc(${percent}% - 12px)` }}
      />

      {status === 'LIVE' && (
        <>
          <span
            className="absolute flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full bg-info-500 text-white"
            style={{ left: `${percent}%` }}
          >
            <Bus className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span className="absolute right-0 h-3 w-3 rounded-full bg-gray-400" />
        </>
      )}
      {status === 'COMPLETED' && (
        <span className="absolute right-0 flex h-5 w-5 items-center justify-center rounded-full bg-successful-500 text-white">
          <Check className="h-3 w-3" aria-hidden="true" />
        </span>
      )}
      {status === 'CANCELLED' && (
        <span className="absolute right-0 flex h-5 w-5 items-center justify-center rounded-full bg-error-500 text-white">
          <X className="h-3 w-3" aria-hidden="true" />
        </span>
      )}
    </div>
  )
}
