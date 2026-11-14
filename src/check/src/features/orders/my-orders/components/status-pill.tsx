import { STATUS_PILL } from '../constant'
import type { DeliveryStatus } from '@/types/order'
// clsx (not cn/twMerge): twMerge treats the custom `text-body-*` size tokens as colours
// and would drop them next to a `text-<color>` class.
import { clsx } from 'clsx'

export function StatusPill({ status, className }: { status: DeliveryStatus; className?: string }) {
  const config = STATUS_PILL[status]
  return (
    <span
      className={clsx(
        // `rounded-s` is ambiguous in Tailwind v4 (logical start corners), so the 8px radius is explicit.
        // Fixed 74px wide in the design, label centred ("Live" and "Canceled" share one width).
        'inline-flex w-[74px] items-center justify-center rounded-[8px] border border-current px-1 py-1 font-poppins text-body-xxs leading-[14px] tracking-wide',
        config.bg,
        config.text,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
