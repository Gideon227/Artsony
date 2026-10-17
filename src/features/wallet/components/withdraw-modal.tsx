'use client'

import * as React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowUpRight, CircleCheckBig, CircleX, RefreshCw, X } from 'lucide-react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button, Input } from '@/components'
import { Dropdown, type DropdownOption } from '@/components/ui/dropdown'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { useWithdraw } from '@/hooks/queries/use-wallet'
import { isCorrectableWithdrawalError, withdrawalErrorMessage } from '@/lib/wallet/errors'
import { formatUsd } from '@/lib/wallet/format'
import { resolveAttempt, withdrawSignature, type WithdrawAttempt } from '@/lib/wallet/idempotency'
import type { WalletNetwork } from '@/types/wallet'

const NETWORK_OPTIONS: DropdownOption[] = [
  { id: 'TRON', label: 'TRON (TRC-20)' },
  { id: 'ETHEREUM', label: 'Ethereum (ERC-20)' },
  { id: 'BSC', label: 'BNB Smart Chain (BEP-20)' },
]

const ADDRESS_PATTERNS: Record<WalletNetwork, RegExp> = {
  TRON: /^T[1-9A-HJ-NP-Za-km-z]{33}$/,
  ETHEREUM: /^0x[a-fA-F0-9]{40}$/,
  BSC: /^0x[a-fA-F0-9]{40}$/,
}

function createWithdrawSchema(availableBalance: number) {
  return z
    .object({
      amount: z.coerce
        .number({ error: 'Enter an amount' })
        .positive('Enter an amount greater than zero')
        .refine((value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-8, 'Use at most 2 decimal places')
        .max(availableBalance, `Amount can't exceed your available balance of $${formatUsd(availableBalance)}`),
      network: z.enum(['TRON', 'ETHEREUM', 'BSC'], { error: 'Select a network' }),
      wallet_address: z.string().min(1, 'Enter a destination wallet address'),
    })
    .refine((data) => ADDRESS_PATTERNS[data.network].test(data.wallet_address), {
      message: 'This address doesn\u2019t look valid for the selected network',
      path: ['wallet_address'],
    })
}

// We extract the exact output type from the schema
type WithdrawFormValues = z.infer<ReturnType<typeof createWithdrawSchema>>

export type WithdrawModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableBalance: number
}

type WithdrawView = 'form' | 'success' | 'failed'

const FIELD_LABEL = 'font-poppins text-body-s font-medium tracking-wide text-heading'

type ResultViewProps = {
  tone: 'success' | 'error'
  title: string
  description: string
  action: React.ReactNode
}

function ResultView({ tone, title, description, action }: ResultViewProps) {
  const Icon = tone === 'success' ? CircleCheckBig : CircleX
  return (
    <div className="flex flex-1 flex-col items-center justify-between gap-y-8 px-6 pb-6 pt-16 text-center lg:px-0 lg:pb-0 lg:pt-4" role="status">
      <div className="flex flex-col items-center gap-y-12">
        <div className="flex flex-col gap-y-4">
          <h3 className={cn('font-poppins text-body-l', tone === 'success' ? 'text-successful-500' : 'text-error-500')}>{title}</h3>
          <p className="font-poppins text-body-s leading-4 text-body">{description}</p>
        </div>
        {/* Stand-in until the Figma illustrations are exported as assets. */}
        <Icon
          aria-hidden="true"
          strokeWidth={1.25}
          className={cn('h-32 w-32', tone === 'success' ? 'text-successful-500' : 'text-error-500')}
        />
      </div>
      <div className="w-full">{action}</div>
    </div>
  )
}

export function WithdrawModal({ open, onOpenChange, availableBalance }: WithdrawModalProps) {
  const withdraw = useWithdraw()
  const [view, setView] = React.useState<WithdrawView>('form')
  const [formError, setFormError] = React.useState<string | null>(null)
  // One key per distinct submission: a retry of the same values (e.g. after a
  // timeout where the request may have reached the server) reuses the key and
  // can never create a second withdrawal; changed values get a fresh key.
  const attempt = React.useRef<WithdrawAttempt | null>(null)
  const schema = React.useMemo(() => createWithdrawSchema(availableBalance), [availableBalance])

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isValid },
  } = useForm<WithdrawFormValues>({
    // Type assertion here forces the resolver to match our extracted type
    resolver: zodResolver(schema) as any,
    mode: 'onChange',
    defaultValues: { network: 'TRON', wallet_address: '' },
  })

  const handleOpenChange = (next: boolean) => {
    if (withdraw.isPending) return
    if (!next) {
      setView('form')
      setFormError(null)
    }
    onOpenChange(next)
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      attempt.current = resolveAttempt(
        attempt.current,
        withdrawSignature(values.amount, values.network, values.wallet_address),
        () => crypto.randomUUID(),
      )
      await withdraw.mutateAsync({
        amount: values.amount,
        network: values.network,
        wallet_address: values.wallet_address.trim(),
        idempotency_key: attempt.current.key,
      })
      attempt.current = null
      reset()
      setView('success')
    } catch (err) {
      // Something the person can correct stays on the form with the reason;
      // anything else is a failed attempt, retried via the Retry screen.
      if (isCorrectableWithdrawalError(err)) setFormError(withdrawalErrorMessage(err))
      else setView('failed')
    }
  })

  const isProcessing = withdraw.isPending
  const showForm = !isProcessing && view === 'form'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        size="lg"
        showClose={false}
        className="max-lg:left-0 max-lg:top-0 max-lg:flex max-lg:h-dvh max-lg:w-screen max-lg:max-w-none max-lg:translate-x-0 max-lg:translate-y-0 max-lg:flex-col max-lg:rounded-none max-lg:p-0"
      >
        <div className="flex items-center gap-x-4 border-b border-gray-50 px-4 py-4 lg:mb-5 lg:block lg:border-0 lg:p-0">
          <DialogClose
            aria-label="Close withdrawal"
            disabled={isProcessing}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-50 transition-colors hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-50 disabled:pointer-events-none disabled:opacity-50 lg:hidden"
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-[#525965]">
              <X className="size-3.5 text-white" strokeWidth={3} />
            </span>
          </DialogClose>

          <div className="flex flex-col gap-1.5">
            <DialogTitle className="font-raleway text-h6 font-semibold leading-8 tracking-wide text-body lg:font-poppins lg:text-lg lg:leading-tight lg:text-neutral-800">
              <span className="lg:hidden">Withdrawal</span>
              <span className="max-lg:hidden">Withdraw funds</span>
            </DialogTitle>
            <DialogDescription className="max-lg:sr-only">
              Available balance: <span className="font-semibold text-heading">${formatUsd(availableBalance)}</span>
            </DialogDescription>
          </div>

          <DialogClose
            aria-label="Close"
            disabled={isProcessing}
            className="absolute right-4 top-4 rounded-[var(--radius-sm)] p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none max-lg:hidden"
          >
            <X className="h-4 w-4" />
          </DialogClose>
        </div>

        {isProcessing && (
          <div className="flex flex-1 flex-col items-center justify-center gap-y-6 px-6 py-24 text-center" role="status" aria-live="polite">
            <p className="font-poppins text-body-l text-heading">Processing</p>
            <p className="font-poppins text-body-s leading-4 text-body">Your withdrawal request is being processed please wait</p>
            <Spinner size="lg" label="Processing withdrawal" className="h-10 w-10" />
          </div>
        )}

        {!isProcessing && view === 'success' && (
          <ResultView
            tone="success"
            title="Withdrawal Request Successful"
            description="We’ve received your withdrawal request successfully. Processing may take up to 3 working days depending on your payment provider."
            action={
              <Button type="button" size="lg" fullWidth onClick={() => handleOpenChange(false)}>
                Finish
              </Button>
            }
          />
        )}

        {!isProcessing && view === 'failed' && (
          <ResultView
            tone="error"
            title="Withdrawal Request Failed"
            description="We couldn’t process your withdrawal request at this time. Please try again or review your payment details before submitting another request."
            action={
              <Button type="button" size="lg" fullWidth className="gap-2" onClick={() => setView('form')}>
                <RefreshCw className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
                Retry
              </Button>
            }
          />
        )}

        {showForm && (
          <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-y-4 px-4 pb-6 pt-6 lg:p-0">
            <p className="text-center font-poppins text-body-s text-body lg:hidden">
              Available Balance: <span className="font-medium text-heading">${formatUsd(availableBalance)}</span>
            </p>

            <div className="flex flex-col gap-y-2">
              <label className={FIELD_LABEL}>Amount (USDT)</label>
              <Input
                type="number"
                step="0.01"
                inputMode="decimal"
                placeholder="0.00"
                error={errors.amount?.message}
                {...register('amount')}
              />
            </div>

            <div className="flex flex-col gap-y-2">
              <label className={FIELD_LABEL}>Network</label>
              <Controller
                name="network"
                control={control}
                render={({ field }) => (
                  <Dropdown
                    options={NETWORK_OPTIONS}
                    value={NETWORK_OPTIONS.find((opt) => opt.id === field.value)}
                    onChange={(option) => field.onChange(option.id)}
                    variant={errors.network ? 'error' : 'default'}
                  />
                )}
              />
              {errors.network && <p className="text-xs font-semibold text-error-500">{errors.network.message}</p>}
            </div>

            <div className="flex flex-col gap-y-2">
              <label className={FIELD_LABEL}>Wallet Address</label>
              <Input
                type="text"
                placeholder="Paste destination wallet address"
                error={errors.wallet_address?.message}
                {...register('wallet_address')}
              />
            </div>

            {formError && (
              <p role="alert" className="text-xs font-semibold text-error-500">
                {formError}
              </p>
            )}

            <div className="mt-auto flex flex-col gap-3 pt-2 lg:mt-1 lg:flex-row lg:justify-end">
              <Button type="button" variant="outline" size="lg" onClick={() => handleOpenChange(false)} className="max-lg:hidden">
                Cancel
              </Button>
              <Button type="submit" size="lg" disabled={!isValid} className="gap-2 max-lg:w-full">
                <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
                Confirm Withdrawal
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
