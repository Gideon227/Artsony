import type { TrendDirection } from '@/types/wallet'

// Signed, as in the design ("+5% Up"); a decline reads "-10% Down".
export function formatTrendPercent(changePercent: number): string {
  const rounded = Number(changePercent.toFixed(2))
  if (rounded === 0) return '0%'
  return `${rounded > 0 ? '+' : '-'}${Math.abs(rounded)}%`
}

export const TREND_LABEL: Record<TrendDirection, string> = {
  UP: 'Up',
  DOWN: 'Down',
  FLAT: 'No change',
}

export const TREND_TEXT_CLASS: Record<TrendDirection, string> = {
  UP: 'text-successful-500',
  DOWN: 'text-error-500',
  FLAT: 'text-body',
}
