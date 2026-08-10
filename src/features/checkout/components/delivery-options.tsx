'use client'

import { Controller, type Control } from 'react-hook-form'
import { HelpCircle } from 'lucide-react'
import { cn } from '@/utils'
import { DELIVERY_OPTIONS } from '../data/countries'
import type { ShippingInfoInput } from '../schemas/shipping-info.schema'

export function DeliveryOptions({ control }: { control: Control<ShippingInfoInput> }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-50 p-6">
      <div className="flex items-center gap-2">
        <h2 className="font-raleway text-[20px] font-semibold text-gray-900">Delivery Options</h2>
        <HelpCircle size={16} className="text-blue-500" />
      </div>

      <p className="font-poppins text-[12px] leading-5 text-gray-400">
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
          <div className="flex flex-col gap-3">
            {DELIVERY_OPTIONS.map((option) => {
              const selected = field.value === option.id
              return (
                <button
                  type="button"
                  key={option.id}
                  onClick={() => field.onChange(option.id)}
                  className={cn(
                    'flex items-center justify-between rounded-full border px-5 py-3 text-left transition-colors',
                    selected ? 'border-primary-500 ring-1 ring-primary-500' : 'border-gray-100 hover:border-gray-200',
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                        selected ? 'border-primary-500 bg-primary-500' : 'border-gray-200',
                      )}
                    >
                      {selected && <span className="h-2 w-2 rounded-full bg-white" />}
                    </span>
                    <span className="font-poppins text-[14px] font-medium text-gray-800">
                      {option.label}
                      <span className="ml-1.5 font-normal text-gray-400">({option.eta})</span>
                    </span>
                  </span>
                  <span className="font-poppins text-[14px] font-semibold text-primary-500">
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
