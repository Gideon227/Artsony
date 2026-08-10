'use client'

import { useMemo } from 'react'
import { useZodForm } from '@/lib/form'
import { useAuthStore, selectUser } from '@/store'
import { useCheckout } from '@/hooks/use-order'
import type { CartItemWithArtwork } from '@/types/cart'
import type { CheckoutInput, ShippingAddressSnapshot } from '@/types/order'
import {
  shippingInfoSchema,
  type ShippingInfoInput,
} from '../schemas/shipping-info.schema'
import { DELIVERY_OPTIONS } from '../data/countries'
import { CheckoutItemTable } from './checkout-item-table'
import { ShippingInformationForm } from './shipping-information-form'
import { DeliveryOptions } from './delivery-options'
import { CheckoutSummary } from './checkout-summary'

export function CheckoutForm({ items }: { items: CartItemWithArtwork[] }) {
  const user = useAuthStore(selectUser)
  const hasPhysical = items.some((i) => i.artwork.artwork_format === 'PHYSICAL')
  const { mutate: checkout, isPending } = useCheckout()

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useZodForm<ShippingInfoInput>(shippingInfoSchema, {
    defaultValues: {
      full_name: user?.displayName ?? '',
      email: user?.email ?? '',
      phone: '',
      // Address fields are disabled + irrelevant for digital-only orders —
      // pre-filled with harmless placeholders so validation passes without
      // ever surfacing to the buyer or being sent to the backend.
      address_line_1: hasPhysical ? '' : 'N/A',
      address_line_2: '',
      city: hasPhysical ? '' : 'N/A',
      state: hasPhysical ? '' : 'N/A',
      postal_code: hasPhysical ? '' : '00000',
      country_code: 'NG',
      save_address: false,
      delivery_speed: 'STANDARD',
    },
  })

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price_at_add * item.quantity, 0),
    [items],
  )
  const currency = items[0]?.currency_at_add ?? 'USD'

  const deliverySpeed = watch('delivery_speed')
  const shippingFee = hasPhysical
    ? DELIVERY_OPTIONS.find((o) => o.id === deliverySpeed)?.price ?? DELIVERY_OPTIONS[0]!.price
    : null

  const onSubmit = handleSubmit((values) => {
    const shippingAddress: Partial<ShippingAddressSnapshot> = hasPhysical
      ? {
          full_name: values.full_name,
          phone: values.phone,
          address_line_1: values.address_line_1,
          address_line_2: values.address_line_2 || null,
          city: values.city,
          state: values.state,
          postal_code: values.postal_code,
          country_code: values.country_code.toUpperCase(),
        }
      : {
          // Digital orders don't ship — only contact fields are sent so the
          // backend's optional shipping_address.* validators still pass.
          full_name: values.full_name,
          phone: values.phone,
        }

    const selectedOption = DELIVERY_OPTIONS.find((o) => o.id === values.delivery_speed)

    const payload: CheckoutInput = {
      cart_item_ids: items.map((i) => i.id),
      idempotency_key: crypto.randomUUID(),
      shipping_address: shippingAddress as ShippingAddressSnapshot,
      ...(hasPhysical && { save_address: values.save_address ?? false }),
      ...(hasPhysical &&
        selectedOption && {
          notes: `Requested delivery speed: ${selectedOption.label} (${selectedOption.eta})`,
        }),
    }

    checkout(payload)
  })

  return (
    <div className="flex flex-col gap-10 px-8 pb-16">
      <CheckoutItemTable items={items} />

      <div className={hasPhysical ? 'grid grid-cols-1 gap-6 lg:grid-cols-3' : 'grid grid-cols-1 gap-6 lg:grid-cols-2'}>
        <ShippingInformationForm
          register={register}
          control={control}
          errors={errors}
          addressDisabled={!hasPhysical}
        />

        {hasPhysical && <DeliveryOptions control={control} />}

        <CheckoutSummary
          subtotal={subtotal}
          currency={currency}
          shippingFee={shippingFee}
          hasPhysical={hasPhysical}
          isSubmitting={isPending}
          canSubmit={items.length > 0}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  )
}
