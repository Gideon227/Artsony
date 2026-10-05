'use client'

import { useCallback } from 'react'
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
} from 'react-hook-form'
import { Input, Checkbox } from '@/components'
import { Dropdown } from '@/components/ui/dropdown'
import { PhoneInput } from '@/components/ui/phone-input'
import { COUNTRIES } from '../data/countries'
import type { CheckoutInfoInput } from '../schemas/shipping-info.schema'

type Props = {
  register: UseFormRegister<CheckoutInfoInput>
  control: Control<CheckoutInfoInput>
  errors: FieldErrors<CheckoutInfoInput>
  setValue: UseFormSetValue<CheckoutInfoInput>
  requiresShipping: boolean
}

const countryOptions = COUNTRIES.map((c) => ({ id: c.code, label: c.name }))

export function ShippingInformationForm({
  register,
  control,
  errors,
  setValue,
  requiresShipping,
}: Props) {
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

            <Controller
              control={control}
              name="country_code"
              render={({ field }) => (
                <div className="flex flex-col gap-1.5">
                  <Dropdown
                    options={countryOptions}
                    value={countryOptions.find((o) => o.id === field.value)}
                    onChange={(opt) => field.onChange(opt.id)}
                    placeholder="Country"
                    variant={errors.country_code ? 'error' : 'default'}
                    indicator="none"
                  />
                  {errors.country_code?.message && (
                    <p className="pl-4 text-xs font-semibold text-error-500">
                      {errors.country_code.message}
                    </p>
                  )}
                </div>
              )}
            />

            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="order-2 w-full lg:order-1">
                <Input
                  placeholder="City"
                  autoComplete="address-level2"
                  {...register('city')}
                  error={errors.city?.message}
                />
              </div>
              <div className="order-1 w-full lg:order-2">
                <Input
                  placeholder="State/Province"
                  autoComplete="address-level1"
                  {...register('state')}
                  error={errors.state?.message}
                />
              </div>
            </div>

            <Input
              placeholder="Postal Code"
              autoComplete="postal-code"
              {...register('postal_code')}
              error={errors.postal_code?.message}
            />
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
