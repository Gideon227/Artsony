'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components'
import { CloseButton } from './close-button'

const REASONS = [
  'I ordered by mistake',
  'The wrong artwork was selected',
  'I changed my mind',
  'I found a problem with the listing',
  'Other',
]

interface Props {
  onClose: () => void
  onContinue: (reason: string) => void
}

export function CancelReason({ onClose, onContinue }: Props) {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="py-16 px-10 rounded-2xl border border-gray-50 relative bg-white flex flex-col gap-y-12">
      <CloseButton onClose={onClose} />

      <h4 className="font-raleway font-medium text-h4 text-[#333333] leading-10 tracking-wide text-center">Cancel Order</h4>

      <div className="flex flex-col items-center justify-center gap-y-6">
        <p className="font-poppins text-body-xs leading-4 text-body tracking-wide text-center px-4">
          You&apos;re about to cancel this order. <br />
          Cancellations are only available until the seller activates shipping. <br />
          Your payment, excluding transaction fees, will be refunded once the cancellation is processed. <br />
          Refunds are typically completed within 2–3 business days.
        </p>

        <div className="flex flex-col w-full" role="radiogroup" aria-label="Cancellation reason">
          {REASONS.map((text) => {
            const isSelected = selected === text
            return (
              <button
                key={text}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelected(text)}
                className={`py-3 px-6 flex items-center gap-x-3 w-full text-left transition-colors ${
                  isSelected ? 'bg-action' : 'bg-white border-b border-gray-50'
                }`}
              >
                <span className={`flex-1 font-poppins font-medium text-body-xs tracking-wide ${isSelected ? 'text-white' : 'text-body'}`}>
                  {text}
                </span>
                <span className={`w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 ${isSelected ? '' : 'border-2 border-gray-50'}`}>
                  {isSelected && <Check color="#F25B38" size={16} />}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <Button
        rightIcon="/icons/alt-arrow-right-double.svg"
        className="mx-auto"
        disabled={!selected}
        onClick={() => selected && onContinue(selected)}
      >
        Continue
      </Button>
    </div>
  )
}