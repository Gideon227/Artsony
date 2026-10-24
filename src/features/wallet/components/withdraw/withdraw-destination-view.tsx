'use client'

import { Controller, type UseFormReturn } from 'react-hook-form'
import { ArrowUpRight } from 'lucide-react'
import { Button, Input } from '@/components'
import { Dropdown } from '@/components/ui/dropdown'
import { formatNgn, formatUsdCurrency } from '@/lib/wallet/exchange-rate'
import { WITHDRAW_NETWORK_OPTIONS, type WithdrawDestinationValues } from '@/lib/wallet/withdraw-schema'
import { WithdrawFrame } from './withdraw-frame'

const FIELD_LABEL = 'font-poppins text-body-s font-medium tracking-wide text-heading'

export type WithdrawDestinationViewProps = {
  form: UseFormReturn<WithdrawDestinationValues>
  usdAmount: number
  rate: number
  formError: string | null
  onBack: () => void
  onSubmit: React.FormEventHandler<HTMLFormElement>
}

export function WithdrawDestinationView({ form, usdAmount, rate, formError, onBack, onSubmit }: WithdrawDestinationViewProps) {
  const {
    register,
    control,
    formState: { errors, isValid },
  } = form

  return (
    <WithdrawFrame title="Withdrawal" description="Choose where to receive your funds" decor>
      <form onSubmit={onSubmit} className="relative z-10 flex flex-1 flex-col gap-y-5 px-4 pb-8 pt-8 lg:px-10 lg:pb-14 lg:pt-6">
        <div className="flex flex-col items-center gap-y-1 text-center font-poppins">
          <p className="text-body-s text-body">You&apos;re withdrawing</p>
          <p className="text-h6 font-semibold text-heading">{formatUsdCurrency(usdAmount)} USDT</p>
          <p className="text-body-s text-body">~{formatNgn(usdAmount * rate)}</p>
        </div>

        <div className="flex flex-col gap-y-2">
          <label className={FIELD_LABEL}>Network</label>
          <Controller
            name="network"
            control={control}
            render={({ field }) => (
              <Dropdown
                options={WITHDRAW_NETWORK_OPTIONS}
                value={WITHDRAW_NETWORK_OPTIONS.find((opt) => opt.id === field.value)}
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

        <div className="mt-auto flex flex-col gap-3 pt-2 lg:flex-row-reverse lg:justify-between">
          <Button type="submit" size="lg" disabled={!isValid} className="gap-2 max-lg:w-full">
            <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
            Confirm Withdrawal
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={onBack} className="max-lg:w-full">
            Back
          </Button>
        </div>
      </form>
    </WithdrawFrame>
  )
}