'use client'

import { cn } from '@/utils'
import type { WithdrawCurrency } from '@/lib/wallet/withdraw-amount'

const CURRENCIES: WithdrawCurrency[] = ['NGN', 'USDT']

export type CurrencyToggleProps = {
  value: WithdrawCurrency
  onChange: (currency: WithdrawCurrency) => void
}

export function CurrencyToggle({ value, onChange }: CurrencyToggleProps) {
  return (
    <div role="group" aria-label="Withdrawal currency" className="flex items-center gap-x-4">
      {CURRENCIES.map((currency) => {
        const active = currency === value
        return (
          <button
            key={currency}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(currency)}
            className={cn(
              'h-10 w-24 cursor-pointer rounded-full border font-poppins text-body-s font-medium transition-colors',
              active
                ? 'border-primary-500 bg-primary-500 text-white'
                : 'border-gray-50 bg-white text-primary-500 hover:bg-primary-50',
            )}
          >
            {currency}
          </button>
        )
      })}
    </div>
  )
}