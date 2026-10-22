import { cn } from '@/lib/utils'
import type { SellerStatus } from '@/types/seller-sales'
import { STATUS_LABELS } from '../constants'

const STYLES: Record<SellerStatus, string> = {
  LIVE: 'border-info-400 bg-info-50 text-info-500',
  COMPLETED: 'border-successful-400 bg-successful-50 text-successful-500',
  PENDING: 'border-warning-400 bg-warning-50 text-warning-500',
  CANCELLED: 'border-error-400 bg-error-50 text-error-500',
}

export function SalesStatusPill({ status, className }: { status: SellerStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-6 min-w-[74px] items-center justify-center rounded-[8px] border px-3 py-2',
        'font-poppins text-[10px] font-medium leading-none tracking-wide',
        STYLES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
