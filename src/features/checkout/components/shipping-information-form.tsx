'use client'

import { useCallback } from 'react'
import {
  Controller,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
} from 'react-hook-form'
import { Input, Checkbox } from '@/components'
import { CountryField, StateField } from '@/components/forms/location-fields'
import { PhoneInput } from '@/components/ui/phone-input'
import type { CheckoutInfoInput } from '../schemas/shipping-info.schema'

type Props = {
  register: UseFormRegister<CheckoutInfoInput>
  control: Control<CheckoutInfoInput>
  errors: FieldErrors<CheckoutInfoInput>
  setValue: UseFormSetValue<CheckoutInfoInput>
  requiresShipping: boolean
}

export function ShippingInformationForm({
  register,
  control,
  errors,
  setValue,
  requiresShipping,
}: Props) {
  const country = useWatch({ control, name: 'country_code' }) ?? ''

  const handleDialCodeChange = useCallback(
    (dialCode: string) => setValue('phone_dial_code', dialCode),
    [setValue],
  )

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-gray-50 p-5 lg:p-6">
      <h2 className="font-raleway text-h6 font-semibold text-body lg:text-h5">
        {requiresShipping ? 'Shipping Information' : 'Information'}
      </h2>

      <div className="flex flex-col gap-y-4">
        <Input
          placeholder="Full name"
          autoComplete="name"
          {...register('full_name')}
          error={errors.full_name?.message}
        />
        <Input
          type="email"
          placeholder="Email Address"
          autoComplete="email"
          {...register('email')}
          error={errors.email?.message}
        />
        <div className="flex flex-col gap-1.5">
          <PhoneInput
            placeholder="Phone number"
            autoComplete="tel-national"
            onDialCodeChange={handleDialCodeChange}
            {...register('phone')}
          />
          {errors.phone?.message && (
            <p className="pl-4 text-xs font-semibold text-error-500">{errors.phone.message}</p>
          )}
        </div>

        {requiresShipping && (
          <>
            <Input
              placeholder="Address"
              autoComplete="address-line1"
              {...register('address_line_1')}
              error={errors.address_line_1?.message}
            />

            {/* Country + state share the same data source as Settings,
                seller registration and the shop filters (use-location-data). */}
            <Controller
              control={control}
              name="country_code"
              render={({ field }) => (
                <CountryField
                  arrow="triangle"
                  value={field.value ?? ''}
                  error={errors.country_code?.message}
                  onChange={(code) => {
                    field.onChange(code)
                    // A state belongs to one country — never carry it across.
                    setValue('state', '', { shouldValidate: false })
                  }}
                />
              )}
            />

            <Input
              placeholder="City"
              autoComplete="address-level2"
              {...register('city')}
              error={errors.city?.message}
            />

            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="min-w-0 flex-1">
                <Controller
                  control={control}
                  name="state"
                  render={({ field }) => (
                    <StateField
                      arrow="triangle"
                      country={country}
                      value={field.value ?? ''}
                      error={errors.state?.message}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
              <div className="min-w-0 flex-1">
                <Input
                  placeholder="Postal Code"
                  autoComplete="postal-code"
                  {...register('postal_code')}
                  error={errors.postal_code?.message}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {requiresShipping && (
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