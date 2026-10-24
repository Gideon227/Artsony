'use client'

import * as React from 'react'
import {
  fromUsd,
  parseAmountInput,
  sanitizeAmountInput,
  toUsd,
  validateWithdrawAmount,
  type WithdrawCurrency,
} from '@/lib/wallet/withdraw-amount'

type Options = {
  availableBalance: number
  rate: number
}

/** State + derived values for the amount screen (currency toggle, input, USD value). */
export function useWithdrawAmount({ availableBalance, rate }: Options) {
  const [currency, setCurrency] = React.useState<WithdrawCurrency>('USDT')
  const [rawInput, setRawInput] = React.useState('')

  const usdAmount = toUsd(parseAmountInput(rawInput), currency, rate)
  const hasInput = rawInput !== ''
  const error = hasInput ? validateWithdrawAmount(usdAmount, availableBalance) : null
  const canSubmit = hasInput && error === null

  const changeInput = React.useCallback((raw: string) => {
    const cleaned = sanitizeAmountInput(raw)
    if (cleaned !== null) setRawInput(cleaned)
  }, [])

  // Switching currency keeps the same money amount, re-expressed in the new currency.
  const changeCurrency = React.useCallback(
    (next: WithdrawCurrency) => {
      if (next === currency) return
      setRawInput(usdAmount > 0 ? String(fromUsd(usdAmount, next, rate)) : '')
      setCurrency(next)
    },
    [currency, rate, usdAmount],
  )

  const reset = React.useCallback(() => setRawInput(''), [])

  return { currency, rawInput, usdAmount, error, canSubmit, changeInput, changeCurrency, reset }
}