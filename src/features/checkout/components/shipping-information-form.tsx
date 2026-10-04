'use client'

import { Controller, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form'
import { Input, Checkbox } from '@/components'
import { Dropdown } from '@/components/ui/dropdown'
import { PhoneInput } from '@/components/ui/phone-input'
import { COUNTRIES } from '../data/countries'
import type { ShippingInfoInput } from '../schemas/shipping-info.schema'

type Props = {
  register: UseFormRegister<ShippingInfoInput>
  control: Control<ShippingInfoInput>
  errors: FieldErrors<ShippingInfoInput>
  /** True for pure-digital orders — address subfields are shown but inert. */
  addressDisabled: boolean
}

const countryOptions = COUNTRIES.map((c) => ({ id: c.code, label: c.name }))

export function ShippingInformationForm({ register, control, errors, addressDisabled }: Props) {
  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-gray-50 p-6">
      <h2 className="font-raleway text-h5 font-semibold text-body">Shipping Information</h2>

      <div className='flex flex-col gap-y-4'>
        <Input placeholder="Full name" {...register('full_name')} error={errors.full_name?.message} />
        <Input
          type="email"
          placeholder="Email Address"
          {...register('email')}
          error={errors.email?.message}
        />
        <PhoneInput placeholder="Phone number" {...register('phone')} />
        {errors.phone?.message && (
          <p className="-mt-2 pl-4 text-xs font-medium text-error-600">{errors.phone.message}</p>
        )}

        <Input
          placeholder="Address"
          disabled={addressDisabled}
          {...register('address_line_1')}
          error={errors.address_line_1?.message}
        />

        <Controller
          control={control}
          name="country_code"
          render={({ field }) => (
            <Dropdown
              options={countryOptions}
              value={countryOptions.find((o) => o.id === field.value)}
              onChange={(opt) => field.onChange(opt.id)}
              placeholder="Country"
              disabled={addressDisabled}
              indicator="none"
            />
          )}
        />

        <div className="flex gap-4">
          <Input
            placeholder="City"
            disabled={addressDisabled}
            {...register('city')}
            error={errors.city?.message}
          />
          <Input
            placeholder="State/Province"
            disabled={addressDisabled}
            {...register('state')}
            error={errors.state?.message}
          />
        </div>

        <Input
          placeholder="Postal Code"
          disabled={addressDisabled}
          {...register('postal_code')}
          error={errors.postal_code?.message}
        />
      </div>

      {!addressDisabled && (
        <Controller
          control={control}
          name="save_address"
          render={({ field }) => (
            <Checkbox
              label="Save this address for future deliveries"
              checked={field.value ?? false}
              onChange={field.onChange}
            />
          )}
        />
      )}
    </div>
  )
}
