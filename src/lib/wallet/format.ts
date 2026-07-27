import type { WalletActivity } from '@/types/wallet'

/**
 * Design shows dd.mm.yyyy hh:mm AM/PM (e.g. "13.11.2025 06:20 PM") — distinct
 * from the orders feature's dd/mm/yyyy format, so this is intentionally separate
 * rather than reusing lib/orders/format.ts.
 */
const walletDateFmt = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})
const walletTimeFmt = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
})

export function formatWalletTimestamp(isoDate: string): string {
  const date = new Date(isoDate)
  return `${walletDateFmt.format(date).replace(/\//g, '.')} ${walletTimeFmt.format(date)}`
}

export function formatWalletAmount(amount: number, currency = 'USD'): string {
  const sign = amount < 0 ? '-' : '+'
  const value = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    Math.abs(amount)
  )
  const symbol = currency === 'USDT' ? '$' : '$'
  return `${sign}${symbol} ${value}`
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: amount % 1 === 0 ? 0 : 2 }).format(amount)
}

export function maskWalletAddress(address: string): string {
  if (address.length <= 10) return address
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export function getActivityDisplayDescription(activity: WalletActivity): string {
  if (activity.type === 'WITHDRAWAL' && activity.wallet_address) {
    return `Wallet ${maskWalletAddress(activity.wallet_address)}`
  }
  return activity.description
}
