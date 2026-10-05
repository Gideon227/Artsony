'use client'

import { Controller, type Control } from 'react-hook-form'
import { Check } from 'lucide-react'
import { cn } from '@/utils'
import { DynamicTooltip } from '@/components/ui/dynamic-tooltip'
import { DELIVERY_OPTIONS } from '../data/countries'
import type { CheckoutInfoInput } from '../schemas/shipping-info.schema'

export function DeliveryOptions({ control }: { control: Control<CheckoutInfoInput> }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-50 p-5 lg:p-6">
      <div className="flex items-center gap-2">
        <h2 className="font-raleway text-h6 font-semibold text-heading">Delivery Options</h2>
        <DynamicTooltip content="Delivery times are estimated and may vary by carrier." />
      </div>

      <p className="font-poppins text-body-xxs leading-4 tracking-wide text-gray-200 lg:text-body-xs lg:leading-5">
        Shipments are fulfilled by trusted third-party couriers (e.g., DHL, UPS, FedEx) through
        Artsony&apos;s logistics partners. Delivery times are estimated and may vary by carrier.
        Learn more by visiting{' '}
        <a href="/shipping-policy" className="font-medium text-primary-500 underline">
          Artsony Shipping Policy
        </a>
        .
      </p>

      <Controller
        control={control}
        name="delivery_speed"
        render={({ field }) => (
          <div role="radiogroup" aria-label="Delivery speed" className="flex flex-col gap-3">
            {DELIVERY_OPTIONS.map((option) => {
              const selected = field.value === option.id
              return (
                <button
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  key={option.id}
                  onClick={() => field.onChange(option.id)}
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-3 rounded-full border px-3 py-3 text-left transition-colors',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
                    selected
                      ? 'border-primary-500 ring-1 ring-primary-500'
                      : 'border-gray-50 hover:border-gray-100',
                  )}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                        selected ? 'border-primary-500 bg-primary-500' : 'border-gray-100 bg-white',
                      )}
                    >
                      {selected && <Check className="h-3.5 w-3.5 text-white" strokeWidth={4} />}
                    </span>
                    <span className="font-poppins text-body-xs font-medium text-body">
                      {option.label}
                    </span>
                    <span className="font-poppins text-body-xxs leading-4 text-gray-200">
                      ({option.range}) business days
                    </span>
                  </span>
                  <span className="shrink-0 font-poppins text-body-xs font-medium text-primary-500">
                    $ {option.price.toLocaleString('en-US')} USD
                  </span>
                </button>
              )
            })}
          </div>
        )}
      />
    </div>
  )
}
