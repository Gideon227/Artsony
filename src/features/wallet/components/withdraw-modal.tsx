'use client'

import * as React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowUpRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button, Input } from '@/components'
import { Dropdown, type DropdownOption } from '@/components/ui/dropdown'
import { useWithdraw } from '@/hooks/queries/use-wallet'
import { formatUsd } from '@/lib/wallet/format'
import type { WalletNetwork } from '@/types/wallet'

const NETWORK_OPTIONS: DropdownOption[] = [
  { id: 'TRON', label: 'TRON (TRC-20)' },
  { id: 'ETHEREUM', label: 'Ethereum (ERC-20)' },
  { id: 'BSC', label: 'BNB Smart Chain (BEP-20)' },
]

const ADDRESS_PATTERNS: Record<WalletNetwork, RegExp> = {
  TRON: /^T[a-zA-Z0-9]{20,}$/,
  ETHEREUM: /^0x[a-fA-F0-9]{40}$/,
  BSC: /^0x[a-fA-F0-9]{40}$/,
}

function createWithdrawSchema(availableBalance: number) {
  return z
    .object({
      amount: z.coerce
        .number({ error: 'Enter an amount' })
        .positive('Enter an amount greater than zero')
        .max(availableBalance, `Amount can't exceed your available balance of $${formatUsd(availableBalance)}`),
      network: z.enum(['TRON', 'ETHEREUM', 'BSC'], { error: 'Select a network' }),
      wallet_address: z.string().min(1, 'Enter a destination wallet address'),
    })
    .refine((data) => ADDRESS_PATTERNS[data.network].test(data.wallet_address), {
      message: 'This address doesn\u2019t look valid for the selected network',
      path: ['wallet_address'],
    })
}

type WithdrawFormValues = z.infer<ReturnType<typeof createWithdrawSchema>>

export type WithdrawModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableBalance: number
}

export function WithdrawModal({ open, onOpenChange, availableBalance }: WithdrawModalProps) {
  const withdraw = useWithdraw()
  const schema = React.useMemo(() => createWithdrawSchema(availableBalance), [availableBalance])

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isValid },
  } = useForm<WithdrawFormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { network: 'TRON', wallet_address: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await withdraw.mutateAsync(values)
      reset()
      onOpenChange(false)
    } catch {
      // Toast already surfaced by useWithdraw's onError; keep the modal open so
      // the person can correct the amount/address without retyping everything.
    }
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!withdraw.isPending) onOpenChange(next)
      }}
    >
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Withdraw funds</DialogTitle>
          <DialogDescription>
            Available balance: <span className="font-semibold text-heading">${formatUsd(availableBalance)}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-y-4">
          <div className="flex flex-col gap-y-2">
            <label className="font-poppins text-body-s font-medium tracking-wide text-heading">Amount (USDT)</label>
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
            <label className="font-poppins text-body-s font-medium tracking-wide text-heading">Network</label>
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
            <label className="font-poppins text-body-s font-medium tracking-wide text-heading">Wallet Address</label>
            <Input
              type="text"
              placeholder="Paste destination wallet address"
              error={errors.wallet_address?.message}
              {...register('wallet_address')}
            />
          </div>

          <DialogFooter className="mt-1">
            <Button type="button" variant="outline" size="lg" onClick={() => onOpenChange(false)} disabled={withdraw.isPending}>
              Cancel
            </Button>
            <Button type="submit" size="lg" isLoading={withdraw.isPending} disabled={!isValid} className="gap-2">
              <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
              Confirm Withdrawal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
