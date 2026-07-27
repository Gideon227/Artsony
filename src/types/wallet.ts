import type { WalletNetwork } from './order'

export type { WalletNetwork }

export type WalletActivityType = 'SALE' | 'WITHDRAWAL' | 'REFUND'

export type WalletActivityStatus = 'HOLD' | 'PENDING' | 'CANCELED' | 'COMPLETED'

export type WalletPeriod = 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'ALL_TIME'

export type WalletActivity = {
  id: string
  type: WalletActivityType
  description: string
  amount: number
  currency: string
  status: WalletActivityStatus
  transaction_id: string
  wallet_address: string | null
  created_at: string
}

export type TrendDirection = 'UP' | 'DOWN'

export type WalletMetric = {
  amount: number
  currency: string
  change_percent: number
  direction: TrendDirection
}

export type WalletSummary = {
  period: WalletPeriod
  total_earnings: WalletMetric
  available_balance: WalletMetric
  pending_balance: WalletMetric
  total_withdrawals: WalletMetric
}

export type WithdrawInput = {
  amount: number
  network: WalletNetwork
  wallet_address: string
}

export type WithdrawResult = {
  activity: WalletActivity
  available_balance: number
}
