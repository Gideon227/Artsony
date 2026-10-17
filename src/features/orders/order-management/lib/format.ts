const CURRENCY_SYMBOLS: Record<string, string> = { USD: '$', USDT: '$' }

export function formatMoney(amount: number, currency = 'USD'): string {
  const symbol = CURRENCY_SYMBOLS[currency.toUpperCase()] ?? currency.toUpperCase()
  const value = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
  return `${symbol} ${value}`
}

export function formatCount(count: number): string {
  if (count > 99) return '99+'
  return String(Math.max(0, count)).padStart(2, '0')
}
