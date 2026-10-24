import { formatUsd } from './format'

export type WithdrawCurrency = 'USDT' | 'NGN'

// Digits with at most 2 decimals — the API rejects finer precision.
const AMOUNT_INPUT = /^\d*\.?\d{0,2}$/

export const roundCents = (value: number): number => Math.round(value * 100) / 100

/** Returns the cleaned input, or null when the keystroke should be ignored. */
export function sanitizeAmountInput(raw: string): string | null {
  const cleaned = raw.replace(/,/g, '')
  return AMOUNT_INPUT.test(cleaned) ? cleaned : null
}

export function parseAmountInput(raw: string): number {
  const value = Number(raw)
  return Number.isFinite(value) ? value : 0
}

/** The API works in USDT; NGN input is converted at the preview rate. */
export function toUsd(value: number, currency: WithdrawCurrency, rate: number): number {
  return roundCents(currency === 'NGN' ? value / rate : value)
}

export function fromUsd(usd: number, currency: WithdrawCurrency, rate: number): number {
  return roundCents(currency === 'NGN' ? usd * rate : usd)
}

export function validateWithdrawAmount(usdAmount: number, availableBalance: number): string | null {
  if (!(usdAmount > 0)) return 'Enter an amount greater than zero'
  if (usdAmount > availableBalance) {
    return `Amount can't exceed your available balance of $${formatUsd(availableBalance)}`
  }
  return null
}