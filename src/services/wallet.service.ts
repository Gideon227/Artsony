import { apiClient } from '@/lib/api-client'
import type {
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
//   GET  /api/wallet/ledger?limit=         -> activity feed
//   POST /api/wallet/withdrawals           -> submit withdrawal
//   GET  /api/wallet/balance               -> post-withdrawal balance refresh
//
// This module's job is purely translation: the backend's shapes (see
// common/types/analytics.types.ts, common/types/wallet.types.ts,
// common/types/commerce.types.ts on the backend) don't match this
// frontend's existing WalletSummary/WalletActivity contract 1:1, so each
// function below documents exactly where and why it diverges rather than
// silently reshaping.

const CURRENCY = 'USDT' // single-currency platform — see domain model

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

type BackendWalletLedgerEntry = {
  id: string
  transaction_id: string | null
  category: 'SALE' | 'WITHDRAWAL' | 'REFUND' | 'ADJUSTMENT'
  hold_status: 'PENDING_DELIVERY' | 'ON_HOLD' | 'AVAILABLE'
  amount: number
  description: string
  created_at: string
}

type BackendWalletBalanceSummary = {
  available_balance: number
  pending_balance: number
  hold_balance: number
  total_withdrawn: number
  total_earned: number
  currency: string
}

type BackendWithdrawalRequest = {
  id: string
  amount: number
  currency: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'FAILED' | 'CANCELLED'
  destination_details: { wallet_address?: string }
  created_at: string
}

// direction: backend has a third 'flat' state this frontend's TrendDirection
// doesn't model — 0% change reads the same as 'UP' visually (no arrow
// movement implied by change_percent: 0), so flat collapses into 'UP'.
function toDirection(direction: 'up' | 'down' | 'flat'): 'UP' | 'DOWN' {
  return direction === 'down' ? 'DOWN' : 'UP'
}

function toMetric(trend: BackendMetricTrend): WalletMetric {
  return {
    amount: trend.current,
    currency: CURRENCY,
    change_percent: trend.change_percent,
    direction: toDirection(trend.direction),
  }
}

// available_balance/pending_balance are point-in-time snapshots on the
// backend, not period-comparable trends the way earnings/withdrawals are —
// there's no "previous period balance" concept computed server-side. Shown
// with a neutral (0%, UP) trend rather than fabricating a change figure.
function toBalanceMetric(amount: number): WalletMetric {
  return { amount, currency: CURRENCY, change_percent: 0, direction: 'UP' }
}

const PERIOD_MAP: Record<WalletPeriod, string> = {
  TODAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
  // Backend has no "all time" period option — 'year' is the longest window
  // it supports. Documented gap rather than a silent approximation.
  ALL_TIME: 'year',
}

const LEDGER_STATUS_MAP: Record<BackendWalletLedgerEntry['hold_status'], WalletActivityStatus> = {
  PENDING_DELIVERY: 'HOLD',
  ON_HOLD: 'HOLD',
  AVAILABLE: 'COMPLETED',
}

// ADJUSTMENT has no frontend-side type equivalent (WalletActivityType is
// SALE | WITHDRAWAL | REFUND) — bucketed under REFUND as the closest
// "balance correction" concept rather than silently dropping the entry.
function toActivityType(category: BackendWalletLedgerEntry['category']): WalletActivityType {
  if (category === 'ADJUSTMENT') return 'REFUND'
  return category
}

function toActivity(entry: BackendWalletLedgerEntry): WalletActivity {
  return {
    id: entry.id,
    type: toActivityType(entry.category),
    description: entry.description,
    amount: entry.amount,
    currency: CURRENCY,
    status: LEDGER_STATUS_MAP[entry.hold_status],
    transaction_id: entry.transaction_id ?? entry.id,
    // Withdrawal destination address lives on the linked withdrawal_request,
    // not embedded in the ledger row itself — not available without an
    // additional join the backend doesn't currently do. Left null rather
    // than fabricated.
    wallet_address: null,
    created_at: entry.created_at,
  }
}

const WITHDRAWAL_STATUS_MAP: Record<BackendWithdrawalRequest['status'], WalletActivityStatus> = {
  PENDING: 'PENDING',
  PROCESSING: 'PENDING',
  COMPLETED: 'COMPLETED',
  REJECTED: 'CANCELED',
  FAILED: 'CANCELED',
  CANCELLED: 'CANCELED',
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
      pending_balance: toBalanceMetric(data.pending_balance),
      total_withdrawals: toMetric(data.total_withdrawals),
    }
  },

  // Filtering/sorting/pagination stays client-side (see lib/wallet/filters.ts)
  // — this fetches a generous single page rather than implementing
  // pagination-aware fetching, matching the previous mock's flat-list
  // behavior. Fine for the activity volumes an early-stage marketplace
  // will have; revisit if a seller's ledger regularly exceeds 100 entries.
  getActivity: async (): Promise<WalletActivity[]> => {
    const { data } = await apiClient.get<{ success: true; data: BackendWalletLedgerEntry[] }>(
      '/api/wallet/ledger?limit=100',
    )
    return data.map(toActivity)
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
      },
    )

    // The withdrawal response doesn't include a refreshed balance — fetch
    // it explicitly rather than computing it client-side (which is what
    // the previous mock did, and how it could silently drift from the
    // real ledger).
    const { data: balance } = await apiClient.get<{ success: true; data: BackendWalletBalanceSummary }>(
      '/api/wallet/balance',
    )

    const activity: WalletActivity = {
      id: request.id,
      type: 'WITHDRAWAL',
      description: 'Withdrawal',
      amount: request.amount,
      currency: request.currency,
      status: WITHDRAWAL_STATUS_MAP[request.status],
      transaction_id: request.id,
      wallet_address: request.destination_details.wallet_address ?? input.wallet_address,
      created_at: request.created_at,
    }

    return { activity, available_balance: balance.available_balance }
  },
}
