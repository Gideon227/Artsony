'use client'

import { useState } from 'react'
import { Button, Checkbox } from '@/components'
import { DynamicTooltip } from '@/components/ui/dynamic-tooltip'

// Estimated blockchain network fee shown ahead of payment. It is the buyer's
// own on-chain transaction cost, which the backend cannot know in advance.
const ESTIMATED_NETWORK_FEE = 2.2

type Props = {
  subtotal: number
  currency: string
  shippingFee: number | null
  hasPhysical: boolean
  isSubmitting: boolean
  canSubmit: boolean
  onSubmit: () => void
}

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 first:pt-0">
      <span className="font-poppins text-body-xs text-body lg:text-body-s">{label}</span>
      <span className="flex items-center gap-2 font-poppins text-body-xs font-medium text-heading lg:text-body-s">
        {children}
      </span>
    </div>
  )
}

export function CheckoutSummary({
  subtotal,
  currency,
  shippingFee,
  hasPhysical,
  isSubmitting,
  canSubmit,
  onSubmit,
}: Props) {
  const [acknowledged, setAcknowledged] = useState(false)

  const total = subtotal + (shippingFee ?? 0) + ESTIMATED_NETWORK_FEE

  return (
    <div className="flex flex-col gap-5 lg:rounded-2xl lg:bg-secondary-50 lg:p-6">
      <div className="flex min-h-[320px] flex-col justify-between rounded-2xl bg-secondary-50 p-5 lg:min-h-0 lg:flex-1 lg:gap-5 lg:rounded-none lg:bg-transparent lg:p-0">
        <div className="flex flex-col gap-5">
          <h2 className="font-raleway text-h6 font-semibold text-heading">Summary</h2>

          <div className="flex flex-col divide-y divide-gray-50">
            <SummaryRow label="Subtotal">
              $ {subtotal.toLocaleString('en-US')} {currency}
            </SummaryRow>

            {hasPhysical && (
              <SummaryRow label="Shipping">
                $ {(shippingFee ?? 0).toLocaleString('en-US')} {currency}
              </SummaryRow>
            )}

            <SummaryRow label="Fees">
              $ {ESTIMATED_NETWORK_FEE.toFixed(2)} {currency}
              <DynamicTooltip
                content="Estimated blockchain network fee — the exact amount may vary slightly at the time of payment."
                className="-translate-x-4/5"
              />
            </SummaryRow>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-raleway text-body-m font-semibold text-heading lg:text-body-l">
              Total
            </span>
            <span className="font-raleway text-body-m font-semibold text-primary-500 lg:text-body-xl">
              ${' '}
              {total.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              {currency}
            </span>
          </div>

          {hasPhysical && (
            <p className="font-poppins text-body-xxs leading-4 text-gray-200">
              You&apos;re charged the item subtotal now. Final shipping cost is confirmed with the
              seller once a courier is assigned.
            </p>
          )}
        </div>
      </div>

      <Checkbox
        checked={acknowledged}
        onChange={setAcknowledged}
        label="I acknowledge that all provided information and order details are correct and final."
      />

      <Button
        type="button"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isSubmitting}
        loadingText="Placing order…"
        disabled={!acknowledged || !canSubmit}
        onClick={onSubmit}
        aria-label="Pay with Moonpay"
        leftIcon="/socials/moonpay.svg"
        className="bg-moonpay [&_img]:brightness-0 [&_img]:invert ring-2 ring-moonpay ring-offset-2 ring-offset-white hover:bg-moonpay-hover disabled:bg-moonpay"
      >
        Pay with Moonpay
      </Button>
    </div>
  )
}
