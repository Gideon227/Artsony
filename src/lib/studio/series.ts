import type { TrendDirection } from '@/types/wallet'
import type { MiniStatPeriod, MiniStatSeriesPoint } from '@/types/stats'

export type DailySeriesPoint = {
  day: string
  amount: number
  sales_count: number
  views: number
  likes: number
}

export type MiniStatMetric = 'CR' | 'AOV'

const DAY_MS = 86_400_000
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// All dates are YYYY-MM-DD strings in UTC — the same day boundaries the
// backend aggregates on. Parsing is done by hand rather than via
// `new Date('YYYY-MM-DD').getMonth()`, which reads the UTC midnight in the
// browser's local zone and lands on the previous day west of UTC.

export function utcToday(now = new Date()): string {
  return now.toISOString().slice(0, 10)
}

export function parseDay(day: string): { year: number; month: number; date: number } {
  return { year: Number(day.slice(0, 4)), month: Number(day.slice(5, 7)), date: Number(day.slice(8, 10)) }
}

function toTime(day: string): number {
  const { year, month, date } = parseDay(day)
  return Date.UTC(year, month - 1, date)
}

export function addDays(day: string, delta: number): string {
  return new Date(toTime(day) + delta * DAY_MS).toISOString().slice(0, 10)
}

function addMonths(day: string, delta: number): string {
  const { year, month } = parseDay(day)
  return new Date(Date.UTC(year, month - 1 + delta, 1)).toISOString().slice(0, 10)
}

export function monthIndex(day: string): number {
  return parseDay(day).month - 1
}

function shortDate(day: string): string {
  const { month, date } = parseDay(day)
  return `${MONTHS[month - 1]} ${date}`
}

// ── Mini-stat windows ─────────────────────────────────────────────────────────

const WEEK_DAYS = 7
const MONTH_DAYS = 30
const MONTH_BUCKET_DAYS = 5
const YEAR_MONTHS = 12

// The overview windows are rolling (today plus the N-1 days before it), so the
// label spells out the real span instead of a calendar month that wasn't used.
export function dateRangeLabel(period: MiniStatPeriod, today: string): string {
  const { year } = parseDay(today)
  if (period === 'TODAY') return `${shortDate(today)}, ${year}`
  if (period === 'YEAR') {
    const start = addMonths(today, -(YEAR_MONTHS - 1))
    return `${MONTHS[monthIndex(start)]} ${parseDay(start).year} – ${MONTHS[monthIndex(today)]} ${year}`
  }
  const start = addDays(today, -((period === 'WEEK' ? WEEK_DAYS : MONTH_DAYS) - 1))
  const startYear = parseDay(start).year
  return startYear === year
    ? `${shortDate(start)} – ${shortDate(today)}, ${year}`
    : `${shortDate(start)}, ${startYear} – ${shortDate(today)}, ${year}`
}

// Bars always cover recent history ending today: 7 days for Today/Week, 6
// five-day buckets for Month, 12 calendar months for Year.
export function seriesRange(period: MiniStatPeriod, today: string): { from: string; to: string } {
  if (period === 'YEAR') return { from: addMonths(today, -(YEAR_MONTHS - 1)), to: today }
  if (period === 'MONTH') return { from: addDays(today, -(MONTH_DAYS - 1)), to: today }
  return { from: addDays(today, -(WEEK_DAYS - 1)), to: today }
}

type Totals = { amount: number; sales: number; views: number }

function sum(points: DailySeriesPoint[]): Totals {
  return points.reduce<Totals>(
    (acc, p) => ({ amount: acc.amount + p.amount, sales: acc.sales + p.sales_count, views: acc.views + p.views }),
    { amount: 0, sales: 0, views: 0 },
  )
}

const round2 = (value: number): number => Math.round(value * 100) / 100

export function metricValue(metric: MiniStatMetric, totals: Totals): number {
  if (metric === 'CR') return totals.views > 0 ? round2((totals.sales / totals.views) * 100) : 0
  return totals.sales > 0 ? round2(totals.amount / totals.sales) : 0
}

export function buildMiniSeries(
  points: DailySeriesPoint[],
  metric: MiniStatMetric,
  period: MiniStatPeriod,
): MiniStatSeriesPoint[] {
  const sorted = [...points].sort((a, b) => a.day.localeCompare(b.day))

  if (period === 'YEAR') {
    const byMonth = new Map<string, DailySeriesPoint[]>()
    for (const p of sorted) {
      const key = p.day.slice(0, 7)
      byMonth.set(key, [...(byMonth.get(key) ?? []), p])
    }
    return Array.from(byMonth.entries()).map(([key, group]) => ({
      label: MONTHS[Number(key.slice(5, 7)) - 1] ?? key,
      value: metricValue(metric, sum(group)),
    }))
  }

  if (period === 'MONTH') {
    const buckets: MiniStatSeriesPoint[] = []
    for (let i = 0; i < sorted.length; i += MONTH_BUCKET_DAYS) {
      const group = sorted.slice(i, i + MONTH_BUCKET_DAYS)
      const last = group[group.length - 1]
      if (last) buckets.push({ label: shortDate(last.day), value: metricValue(metric, sum(group)) })
    }
    return buckets
  }

  return sorted.map((p) => {
    const weekday = WEEKDAYS[new Date(toTime(p.day)).getUTCDay()] ?? p.day
    return { label: weekday, value: metricValue(metric, sum([p])) }
  })
}

// ── Rate trends ───────────────────────────────────────────────────────────────
// Conversion rate and average order value are ratios, so their trend is the
// change in the ratio — not the change in the sales or earnings count behind
// it. Same convention as the backend: growth from a zero baseline is +100%.

export function changeBetween(current: number, previous: number): { change_percent: number; direction: TrendDirection } {
  if (current === previous) return { change_percent: 0, direction: 'FLAT' }
  if (previous === 0) return { change_percent: 100, direction: 'UP' }
  const change = ((current - previous) / previous) * 100
  return { change_percent: round2(change), direction: change > 0 ? 'UP' : 'DOWN' }
}

export function ratioOf(numerator: number, denominator: number, scale = 1): number {
  return denominator > 0 ? (numerator / denominator) * scale : 0
}

// ── Earnings overview ─────────────────────────────────────────────────────────

export type EarningsPoint = { label: string; value: number }

// `days` is the backend's zero-filled calendar year, including days that have
// not happened yet. Future days are unknown, not zero, so they are dropped.
export function monthlyEarningsPoints(
  days: Array<{ day: string; amount: number }>,
  today: string,
): EarningsPoint[] {
  const monthPrefix = today.slice(0, 7)
  return days
    .filter((p) => p.day.startsWith(monthPrefix) && p.day <= today)
    .map((p) => ({ label: String(parseDay(p.day).date), value: round2(p.amount) }))
}

export function yearlyEarningsPoints(
  days: Array<{ day: string; amount: number }>,
  today: string,
): EarningsPoint[] {
  const totals = new Array<number>(12).fill(0)
  for (const p of days) {
    if (p.day <= today) totals[monthIndex(p.day)] = (totals[monthIndex(p.day)] ?? 0) + p.amount
  }
  return MONTHS.slice(0, monthIndex(today) + 1).map((label, i) => ({ label, value: round2(totals[i] ?? 0) }))
}
