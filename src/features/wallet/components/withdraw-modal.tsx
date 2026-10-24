'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RefreshCw } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components'
import { useWithdraw } from '@/hooks/queries/use-wallet'
import { isCorrectableWithdrawalError, withdrawalErrorMessage } from '@/lib/wallet/errors'
import { USDT_NGN_RATE } from '@/lib/wallet/exchange-rate'
import { resolveAttempt, withdrawSignature, type WithdrawAttempt } from '@/lib/wallet/idempotency'
import { withdrawDestinationSchema, type WithdrawDestinationValues } from '@/lib/wallet/withdraw-schema'
import { useWithdrawAmount } from '@/hooks/use-withdraw-amount'
import { WithdrawAmountView } from './withdraw/withdraw-amount-view'
import { WithdrawDestinationView } from './withdraw/withdraw-destination-view'
import { WithdrawProcessingView } from './withdraw/withdraw-processing-view'
import { WithdrawResultView } from './withdraw/withdraw-result-view'

// Export these from Figma into /public/illustrations/ (the "Success" paper-plane
// and "Failed" figure screens).
const SUCCESS_ILLUSTRATION = '/illustrations/withdraw-success.svg'
const FAILED_ILLUSTRATION = '/illustrations/withdraw-failed.svg'

export type WithdrawModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableBalance: number
}

type WithdrawView = 'amount' | 'destination' | 'success' | 'failed'

export function WithdrawModal({ open, onOpenChange, availableBalance }: WithdrawModalProps) {
  const withdraw = useWithdraw()
  const amount = useWithdrawAmount({ availableBalance, rate: USDT_NGN_RATE })
  const [view, setView] = React.useState<WithdrawView>('amount')
  const [formError, setFormError] = React.useState<string | null>(null)
  // One key per distinct submission: a retry of the same values (e.g. after a
  // timeout where the request may have reached the server) reuses the key and
  // can never create a second withdrawal; changed values get a fresh key.
  const attempt = React.useRef<WithdrawAttempt | null>(null)

  const destinationForm = useForm<WithdrawDestinationValues>({
    resolver: zodResolver(withdrawDestinationSchema),
    mode: 'onChange',
    defaultValues: { network: 'TRON', wallet_address: '' },
  })

  const handleOpenChange = (next: boolean) => {
    if (withdraw.isPending) return
    if (!next) {
      setView('amount')
      setFormError(null)
    }
    onOpenChange(next)
  }

  const handleContinue = () => {
    if (amount.canSubmit) setView('destination')
  }

  const handleSubmit = destinationForm.handleSubmit(async (values) => {
    if (!amount.canSubmit) {
      setView('amount')
      return
    }

    setFormError(null)
    try {
      attempt.current = resolveAttempt(
        attempt.current,
        withdrawSignature(amount.usdAmount, values.network, values.wallet_address),
        () => crypto.randomUUID(),
      )
      await withdraw.mutateAsync({
        amount: amount.usdAmount,
        network: values.network,
        wallet_address: values.wallet_address,
        idempotency_key: attempt.current.key,
      })
      attempt.current = null
      destinationForm.reset()
      amount.reset()
      setView('success')
    } catch (err) {
      // Something the person can correct stays on the destination step with the
      // reason; anything else is a failed attempt, retried via the Retry screen.
      if (isCorrectableWithdrawalError(err)) setFormError(withdrawalErrorMessage(err))
      else setView('failed')
    }
  })

  const renderView = () => {
    if (withdraw.isPending) return <WithdrawProcessingView />

    switch (view) {
      case 'amount':
        return (
          <WithdrawAmountView
            availableBalance={availableBalance}
            rate={USDT_NGN_RATE}
            currency={amount.currency}
            rawInput={amount.rawInput}
            usdAmount={amount.usdAmount}
            error={amount.error}
            canSubmit={amount.canSubmit}
            onCurrencyChange={amount.changeCurrency}
            onInputChange={amount.changeInput}
            onContinue={handleContinue}
          />
        )
      case 'destination':
        return (
          <WithdrawDestinationView
            form={destinationForm}
            usdAmount={amount.usdAmount}
            rate={USDT_NGN_RATE}
            formError={formError}
            onBack={() => setView('amount')}
            onSubmit={handleSubmit}
          />
        )
      case 'success':
        return (
          <WithdrawResultView
            tone="success"
            title="Withdrawal Request Successful"
            description="We’ve received your withdrawal request successfully. Processing may take up to 3 working days depending on your payment provider."
            imageSrc={SUCCESS_ILLUSTRATION}
            action={
              <Button type="button" size="lg" fullWidth onClick={() => handleOpenChange(false)}>
                Finish
              </Button>
            }
          />
        )
      case 'failed':
        return (
          <WithdrawResultView
            tone="error"
            title="Withdrawal Request Failed"
            description="We couldn’t process your withdrawal request at this time. Please try again or review your payment details before submitting another request."
            imageSrc={FAILED_ILLUSTRATION}
            showClose
            action={
              // Back to the destination step with the same values, so a retry
              // reuses the idempotency key.
              <Button type="button" size="lg" fullWidth className="gap-2" onClick={() => setView('destination')}>
                <RefreshCw className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
                Retry
              </Button>
            }
          />
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        size="lg"
        showClose={false}
        className="flex flex-col gap-0 p-0 max-lg:left-0 max-lg:top-0 max-lg:h-dvh max-lg:w-screen max-lg:max-w-none max-lg:translate-x-0 max-lg:translate-y-0 max-lg:rounded-none lg:h-[min(788px,calc(100dvh-2rem))] lg:max-w-[564px] lg:overflow-hidden lg:rounded-3xl"
      >
        {renderView()}
      </DialogContent>
    </Dialog>
  )
}