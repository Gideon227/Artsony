'use client'

import { formatNgn, formatUsdCurrency } from '@/lib/wallet/exchange-rate'
import { formatUsd } from '@/lib/wallet/format'
import type { WithdrawCurrency } from '@/lib/wallet/withdraw-amount'
import { cn } from '@/utils'
import { CurrencyToggle } from './currency-toggle'
import { MoonpayIcon } from './moonpay-icon'
import { WithdrawFrame } from './withdraw-frame'

export type WithdrawAmountViewProps = {
  availableBalance: number
  rate: number
  currency: WithdrawCurrency
  rawInput: string
  usdAmount: number
  error: string | null
  canSubmit: boolean
  onCurrencyChange: (currency: WithdrawCurrency) => void
  onInputChange: (raw: string) => void
  onContinue: () => void
}

function previewLabel(currency: WithdrawCurrency, usdAmount: number, rate: number): string {
  if (currency === 'USDT') return `~${usdAmount > 0 ? formatNgn(usdAmount * rate) : '₦00.00'}`
  return `~${usdAmount > 0 ? formatUsdCurrency(usdAmount) : '$00.00'}`
}

export function WithdrawAmountView({
  availableBalance,
  rate,
  currency,
  rawInput,
  usdAmount,
  error,
  canSubmit,
  onCurrencyChange,
  onInputChange,
  onContinue,
}: WithdrawAmountViewProps) {
  const symbol = currency === 'USDT' ? '$' : '₦'

  return (
    <WithdrawFrame title="Withdrawal" description={`Available balance: $${formatUsd(availableBalance)}`} decor>
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center gap-y-10 px-4 pt-10 lg:gap-y-12 lg:px-10 lg:pt-4">
          <p className="font-poppins text-body-s tracking-wide text-body">
            Available Balance: <span className="font-medium text-heading">${formatUsd(availableBalance)}</span>
          </p>

          <CurrencyToggle value={currency} onChange={onCurrencyChange} />

          <div className="flex flex-col items-center gap-y-4">
            <label className="flex items-baseline justify-center gap-x-3 font-raleway text-[40px] leading-none text-heading lg:text-[48px]">
              <span aria-hidden="true" className={cn(!rawInput && 'text-gray-400')}>
                {symbol}
              </span>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                aria-label={`Amount in ${currency}`}
                aria-invalid={error ? true : undefined}
                placeholder="00.00"
                value={rawInput}
                onChange={(e) => onInputChange(e.target.value)}
                style={{ width: `${Math.max(rawInput.length, 5)}ch` }}
                className="max-w-full bg-transparent text-center outline-none placeholder:text-gray-400"
              />
            </label>

            <p className="font-poppins text-body-m text-heading">{previewLabel(currency, usdAmount, rate)}</p>

            {error && (
              <p role="alert" className="max-w-xs text-center text-xs font-semibold text-error-500">
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center gap-x-4 font-poppins text-body-s tracking-wide">
            <span className="text-heading">Exchange Rate</span>
            <span className="rounded-full bg-secondary-100 px-4 py-2 text-body">
              $1 usdt = {formatNgn(rate)}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-50 px-6 pb-10 pt-8 lg:mx-10 lg:px-0 lg:pb-14">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={onContinue}
            className="mx-auto flex h-14 w-full max-w-[320px] cursor-pointer items-center justify-center gap-x-4 rounded-full border-2 border-[#7F00FF] bg-white font-poppins text-body-m font-medium text-[#7F00FF] transition-colors hover:bg-[#7F00FF]/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7F00FF] disabled:pointer-events-none disabled:opacity-50"
          >
            <MoonpayIcon />
            Withdraw with Moonpay
          </button>
        </div>
      </div>
    </WithdrawFrame>
  )
}