import { cn } from '@/lib/utils'
import { WALLET_STATUS_META } from '@/lib/wallet/status'
import type { WalletActivityStatus } from '@/types/wallet'

const textClassByVariant: Record<string, string> = {
  warning: 'bg-warning-50 text-warning-700',
  info: 'bg-info-50 text-info-700',
  error: 'bg-error-50 text-error-700',
  success: 'bg-success-50 text-success-700',
}

export function WalletStatusBadge({ status }: { status: WalletActivityStatus }) {
  const meta = WALLET_STATUS_META[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-xl px-3 py-1 text-body-xxs font-medium whitespace-nowrap',
        textClassByVariant[meta.variant]
      )}
    >
      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', meta.dotClassName)} />
      {meta.label}
    </span>
  )
}
