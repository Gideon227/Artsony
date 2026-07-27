import type {
  WalletActivity,
  WalletActivityStatus,
  WalletActivityType,
  WalletPeriod,
  WalletSummary,
  WithdrawInput,
  WithdrawResult,
} from '@/types/wallet'

// TODO(backend): no /api/wallet/* endpoints exist yet. This module simulates
// the contract below (latency + validation + persistence within the session)
// so the Wallet feature is fully interactive today. Once the backend lands,
// replace each function body with the corresponding apiClient call — the
// signatures and return shapes are written to match what orderService already
// does (see services/order/order.service.ts) so hooks/queries/use-wallet.ts
// won't need to change.
//
//   getSummary   -> GET  /api/wallet/summary?period=
//   getActivity  -> GET  /api/wallet/activity?status=&type=&page=&limit=
//   withdraw     -> POST /api/wallet/withdraw

const NETWORK_DELAY_MS = 500

function delay<T>(value: T, ms = NETWORK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

const TYPES: WalletActivityType[] = ['SALE', 'WITHDRAWAL', 'REFUND']
const STATUSES: WalletActivityStatus[] = ['HOLD', 'PENDING', 'CANCELED', 'COMPLETED']
const ARTWORK_TITLES = [
  'Fire Escape Symphony',
  'Candid Street Scene',
  'Grid of the Forgotten',
  'Neon Solitude',
  'Quiet Harbor Study',
  'Concrete Bloom',
]

function seedActivity(): WalletActivity[] {
  const rows: WalletActivity[] = []
  const now = Date.now()

  for (let i = 0; i < 42; i++) {
    const type = TYPES[i % TYPES.length]!
    const status = STATUSES[(i * 3 + 1) % STATUSES.length]!
    const isDebit = type === 'REFUND'
    const amount = Math.round((80 + ((i * 137) % 1900)) * 100) / 100

    rows.push({
      id: `wa_${i.toString().padStart(3, '0')}`,
      type,
      description: type === 'WITHDRAWAL' ? 'Withdrawal' : ARTWORK_TITLES[i % ARTWORK_TITLES.length]!,
      amount: isDebit ? -amount : amount,
      currency: 'USDT',
      status,
      transaction_id: `ART-TXN-WDL-45D1F0${i.toString().padStart(2, '0')}`,
      wallet_address: type === 'WITHDRAWAL' ? `0xD4${(1000 + i * 7).toString(16)}c2` : null,
      created_at: new Date(now - i * 6 * 60 * 60 * 1000).toISOString(),
    })
  }
  return rows
}

let activityStore = seedActivity()
let availableBalance = 15540.2

export const walletService = {
  getSummary: (_period: WalletPeriod = 'WEEK'): Promise<WalletSummary> =>
    delay({
      period: _period,
      total_earnings: { amount: 155240.05, currency: 'USDT', change_percent: 5, direction: 'UP' },
      available_balance: { amount: availableBalance, currency: 'USDT', change_percent: 14, direction: 'UP' },
      pending_balance: { amount: 3330, currency: 'USDT', change_percent: 10, direction: 'DOWN' },
      total_withdrawals: { amount: 75000, currency: 'USDT', change_percent: 12, direction: 'UP' },
    }),

  getActivity: (): Promise<WalletActivity[]> => delay([...activityStore]),

  withdraw: (input: WithdrawInput): Promise<WithdrawResult> => {
    if (input.amount <= 0) return Promise.reject(new Error('Enter an amount greater than zero.'))
    if (input.amount > availableBalance) return Promise.reject(new Error('Amount exceeds your available balance.'))
    if (!/^0x[a-fA-F0-9]{6,}$/.test(input.wallet_address) && !/^T[a-zA-Z0-9]{20,}$/.test(input.wallet_address)) {
      return Promise.reject(new Error('Enter a valid wallet address for the selected network.'))
    }

    availableBalance -= input.amount

    const activity: WalletActivity = {
      id: `wa_${Date.now()}`,
      type: 'WITHDRAWAL',
      description: 'Withdrawal',
      amount: input.amount,
      currency: 'USDT',
      status: 'PENDING',
      transaction_id: `ART-TXN-WDL-${Date.now().toString(36).toUpperCase()}`,
      wallet_address: input.wallet_address,
      created_at: new Date().toISOString(),
    }
    activityStore = [activity, ...activityStore]

    return delay({ activity, available_balance: availableBalance }, 900)
  },
}
