import type { BadgeVariant } from '@/components/ui/badge'
import type { WalletActivityStatus, WalletActivityType } from '@/types/wallet'

export type StatusMeta = {
  label: string
  variant: BadgeVariant
  dotClassName: string
}

export const WALLET_STATUS_META: Record<WalletActivityStatus, StatusMeta> = {
  HOLD: { label: 'Hold', variant: 'warning', dotClassName: 'bg-warning-500' },
  PENDING: { label: 'Pending', variant: 'info', dotClassName: 'bg-info-500' },
  CANCELED: { label: 'Canceled', variant: 'error', dotClassName: 'bg-error-500' },
  COMPLETED: { label: 'Completed', variant: 'success', dotClassName: 'bg-success-500' },
}

export const WALLET_STATUS_VALUES: WalletActivityStatus[] = ['HOLD', 'PENDING', 'CANCELED', 'COMPLETED']

export const WALLET_TYPE_META: Record<WalletActivityType, { label: string }> = {
  SALE: { label: 'Sale' },
  WITHDRAWAL: { label: 'Withdrawal' },
  REFUND: { label: 'Refund' },
}

export const WALLET_TYPE_VALUES: WalletActivityType[] = ['SALE', 'WITHDRAWAL', 'REFUND']
