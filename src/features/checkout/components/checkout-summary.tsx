'use client'

import { useState } from 'react'
import { HelpCircle } from 'lucide-react'
import { Button, Checkbox } from '@/components'

// Flat estimated blockchain network fee shown to the buyer ahead of payment.
// Not charged by Artsony — it's the buyer's own on-chain transaction cost,
// which the backend has no way to know in advance since it depends on
// network conditions at broadcast time.
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
    <div className="flex flex-col gap-5 rounded-2xl bg-secondary-50 p-6">
      <h2 className="font-raleway text-[20px] font-semibold text-heading">Summary</h2>

      <div className="flex items-center justify-between">
        <span className="font-poppins text-[14px] text-gray-500">Subtotal</span>
        <span className="font-poppins text-[14px] font-medium text-heading">
          $ {subtotal.toLocaleString('en-US')} {currency}
        </span>
      </div>

      {hasPhysical && (
        <div className="flex items-center justify-between border-t border-secondary-200 pt-4">
          <span className="font-poppins text-[14px] text-gray-500">Shipping</span>
          <span className="font-poppins text-[14px] font-medium text-heading">
            $ {(shippingFee ?? 0).toLocaleString('en-US')} {currency}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-secondary-200 pt-4">
        <span className="flex items-center gap-1.5 font-poppins text-[14px] text-gray-500">
          Fees
          <span title="Estimated blockchain network fee — the exact amount may vary slightly at the time of payment.">
            <HelpCircle size={14} className="text-blue-500" />
          </span>
        </span>
        <span className="font-poppins text-[14px] font-medium text-heading">
          $ {ESTIMATED_NETWORK_FEE.toFixed(2)} {currency}
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-secondary-200 pt-4">
        <span className="font-raleway text-[18px] font-semibold text-heading">Total</span>
        <span className="font-raleway text-[20px] font-semibold text-primary-500">
          $ {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
        </span>
      </div>

      {hasPhysical && (
        <p className="-mt-2 font-poppins text-[11px] leading-4 text-gray-400">
          You&apos;re charged the item subtotal now. Final shipping cost is confirmed with the
          seller once a courier is assigned.
        </p>
      )}

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
        className="bg-[#6C1CD1] hover:bg-[#5B18B0] shadow-[0_0_0_3px_rgba(108,28,209,0.15)]"
      >
        Pay with Moonpay
      </Button>
    </div>
  )
}
