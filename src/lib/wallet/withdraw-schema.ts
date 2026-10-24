import { z } from 'zod'
import type { WalletNetwork } from '@/types/wallet'

export const WITHDRAW_NETWORK_OPTIONS = [
  { id: 'TRON', label: 'TRON (TRC-20)' },
  { id: 'ETHEREUM', label: 'Ethereum (ERC-20)' },
  { id: 'BSC', label: 'BNB Smart Chain (BEP-20)' },
]

const ADDRESS_PATTERNS: Record<WalletNetwork, RegExp> = {
  TRON: /^T[1-9A-HJ-NP-Za-km-z]{33}$/,
  ETHEREUM: /^0x[a-fA-F0-9]{40}$/,
  BSC: /^0x[a-fA-F0-9]{40}$/,
}

// The amount is validated separately (see withdraw-amount.ts) because it is
// entered on its own screen; this schema covers the destination step only.
export const withdrawDestinationSchema = z
  .object({
    network: z.enum(['TRON', 'ETHEREUM', 'BSC'], { error: 'Select a network' }),
    wallet_address: z.string().trim().min(1, 'Enter a destination wallet address'),
  })
  .refine((data) => ADDRESS_PATTERNS[data.network].test(data.wallet_address), {
    message: 'This address doesn\u2019t look valid for the selected network',
    path: ['wallet_address'],
  })

export type WithdrawDestinationValues = z.infer<typeof withdrawDestinationSchema>