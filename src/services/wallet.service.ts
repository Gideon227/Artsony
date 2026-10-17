import { apiClient } from '@/lib/api-client'
import type {
  TrendDirection,
  WalletActivity,
  WalletActivityStatus,
  WalletActivityType,
  WalletMetric,
  WalletPeriod,
  WalletSummary,
  WithdrawInput,
  WithdrawResult,
} from '@/types/wallet'

// Wired to the real backend. Endpoints:
//   GET  /api/analytics/overview?period=   -> earnings/withdrawals trend + balance snapshot
//   GET  /api/wallet/ledger?limit=&page=   -> activity feed (all pages are fetched)
//   POST /api/wallet/withdrawals           -> submit withdrawal (idempotent per key)
//
// This module translates the backend's shapes (see common/types/analytics.types.ts
// and common/types/wallet.types.ts on the backend) into the frontend's
// WalletSummary / WalletActivity contract.

const CURRENCY = 'USDT' // single-currency platform — see domain model
const LEDGER_PAGE_SIZE = 100
const LEDGER_MAX_PAGES = 50

type BackendMetricTrend = {
  current: number
  previous: number
  change_percent: number
  direction: 'up' | 'down' | 'flat'
}

type BackendAnalyticsOverview = {
  total_earnings: BackendMetricTrend
  available_balance: number
  pending_balance: number
  hold_balance: number
  total_withdrawals: BackendMetricTrend
  total_sales: BackendMetricTrend
  total_views: BackendMetricTrend
  total_likes: BackendMetricTrend
  period: string
}

type BackendWithdrawalStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'FAILED' | 'CANCELLED'

export type BackendWalletLedgerEntry = {
  id: string
  transaction_id: string | null
  type: 'CREDIT' | 'DEBIT'
  category: 'SALE' | 'WITHDRAWAL' | 'REFUND' | 'ADJUSTMENT'
  hold_status: 'PENDING_DELIVERY' | 'ON_HOLD' | 'AVAILABLE'
  available_at: string | null
  amount: number
  description: string
  created_at: string
  withdrawal: {
    status: BackendWithdrawalStatus
    destination_details: { wallet_address?: string }
  } | null
}

type BackendLedgerPage = {
  success: true
  data: BackendWalletLedgerEntry[]
  has_next: boolean
}

type BackendWithdrawalRequest = {
  id: string
  amount: number
  currency: string
  status: BackendWithdrawalStatus
  destination_details: { wallet_address?: string }
  created_at: string
}

const DIRECTION_MAP: Record<BackendMetricTrend['direction'], TrendDirection> = {
  up: 'UP',
  down: 'DOWN',
  flat: 'FLAT',
}

function toMetric(trend: BackendMetricTrend): WalletMetric {
  return {
    amount: trend.current,
    currency: CURRENCY,
    change_percent: trend.change_percent,
    direction: DIRECTION_MAP[trend.direction],
  }
}

// Balances are point-in-time snapshots: the backend has no "previous period
// balance", so they carry a neutral trend rather than a fabricated change.
function toBalanceMetric(amount: number): WalletMetric {
  return { amount, currency: CURRENCY, change_percent: 0, direction: 'FLAT' }
}

const roundCents = (value: number): number => Math.round(value * 100) / 100

const PERIOD_MAP: Record<WalletPeriod, string> = {
  TODAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
  ALL_TIME: 'all',
}

const WITHDRAWAL_STATUS_MAP: Record<BackendWithdrawalStatus, WalletActivityStatus> = {
  PENDING: 'PENDING',
  PROCESSING: 'PENDING',
  COMPLETED: 'COMPLETED',
  REJECTED: 'CANCELED',
  FAILED: 'CANCELED',
  CANCELLED: 'CANCELED',
}

// A WITHDRAWAL ledger row only reserves the balance; its real state is the
// linked withdrawal request's. Sale proceeds move PENDING_DELIVERY → ON_HOLD
// (until available_at) → AVAILABLE, and a row whose hold has elapsed is already
// counted as available by the balance summary, so it reads as completed.
export function resolveActivityStatus(entry: BackendWalletLedgerEntry, now = Date.now()): WalletActivityStatus {
  if (entry.withdrawal) return WITHDRAWAL_STATUS_MAP[entry.withdrawal.status]
  if (entry.hold_status === 'PENDING_DELIVERY') return 'PENDING'
  if (entry.hold_status === 'ON_HOLD' && entry.available_at && Date.parse(entry.available_at) > now) return 'HOLD'
  return 'COMPLETED'
}

// ADJUSTMENT has no frontend-side type equivalent (WalletActivityType is
// SALE | WITHDRAWAL | REFUND) — bucketed under REFUND as the closest
// "balance correction" concept rather than silently dropping the entry.
function toActivityType(category: BackendWalletLedgerEntry['category']): WalletActivityType {
  if (category === 'ADJUSTMENT') return 'REFUND'
  return category
}

// The backend stores amounts as positive numbers and distinguishes money in
// from money out by `type`; the UI renders the sign from the amount itself.
export function toActivity(entry: BackendWalletLedgerEntry, now = Date.now()): WalletActivity {
  return {
    id: entry.id,
    type: toActivityType(entry.category),
    description: entry.description,
    amount: entry.type === 'DEBIT' ? -entry.amount : entry.amount,
    currency: CURRENCY,
    status: resolveActivityStatus(entry, now),
    transaction_id: entry.transaction_id ?? entry.id,
    wallet_address: entry.withdrawal?.destination_details.wallet_address ?? null,
    created_at: entry.created_at,
  }
}

export const walletService = {
  getSummary: async (period: WalletPeriod = 'WEEK'): Promise<WalletSummary> => {
    const { data } = await apiClient.get<{ success: true; data: BackendAnalyticsOverview }>(
      `/api/analytics/overview?period=${PERIOD_MAP[period]}`,
    )

    return {
      period,
      total_earnings: toMetric(data.total_earnings),
      available_balance: toBalanceMetric(data.available_balance),
      // Everything not yet withdrawable: awaiting delivery plus inside the hold
      // window. Showing only the first would leave held funds in no card at all.
      pending_balance: toBalanceMetric(roundCents(data.pending_balance + data.hold_balance)),
      total_withdrawals: toMetric(data.total_withdrawals),
    }
  },

  // Filtering/sorting/pagination stays client-side (see lib/wallet/filters.ts),
  // so every page of the ledger is fetched. Ids are de-duplicated because
  // newest-first offset paging can repeat a row if one is inserted mid-fetch.
  getActivity: async (): Promise<WalletActivity[]> => {
    const entries = new Map<string, BackendWalletLedgerEntry>()

    for (let page = 1; page <= LEDGER_MAX_PAGES; page++) {
      const res = await apiClient.get<BackendLedgerPage>(
        `/api/wallet/ledger?limit=${LEDGER_PAGE_SIZE}&page=${page}`,
      )
      for (const entry of res.data) entries.set(entry.id, entry)
      if (!res.has_next) break
    }

    const now = Date.now()
    return Array.from(entries.values()).map((entry) => toActivity(entry, now))
  },

  withdraw: async (input: WithdrawInput): Promise<WithdrawResult> => {
    const { data: request } = await apiClient.post<{ success: true; data: BackendWithdrawalRequest }>(
      '/api/wallet/withdrawals',
      {
        amount: input.amount,
        destination_type: 'WALLET_ADDRESS',
        destination_details: {
          network: input.network,
          wallet_address: input.wallet_address,
        },
        idempotency_key: input.idempotency_key,
      },
    )

    const activity: WalletActivity = {
      id: request.id,
      type: 'WITHDRAWAL',
      description: 'Withdrawal',
      amount: -request.amount,
      currency: request.currency,
      status: WITHDRAWAL_STATUS_MAP[request.status],
      transaction_id: request.id,
      wallet_address: request.destination_details.wallet_address ?? input.wallet_address,
      created_at: request.created_at,
    }

    return { activity }
  },
}
