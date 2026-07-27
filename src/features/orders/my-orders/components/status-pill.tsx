import { STATUS_PILL } from '../constant';
import type { DeliveryStatus } from '@/types/order'
import { cn } from '@/lib/utils'

export function StatusPill({ status, className }: { status: DeliveryStatus; className?: string }) {
  const config = STATUS_PILL[status]
  return (
    <span
      className={cn(
        'px-3 py-1 rounded-s font-poppins text-body-s font-medium tracking-wide',
        config.bg,
        config.text,
        className,
      )}
    >
      {config.label}
    </span>
  )
}