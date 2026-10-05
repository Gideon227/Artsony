'use client'

import { useMemo } from 'react'
import { useZodForm } from '@/lib/form'
import { useAuthStore, selectUser } from '@/store'
import { useCheckout } from '@/hooks/use-order'
import type { CartItemWithArtwork } from '@/types/cart'
import type { CheckoutInput, ShippingAddressSnapshot } from '@/types/order'
import { createCheckoutInfoSchema, type CheckoutInfoInput } from '../schemas/shipping-info.schema'
import { DELIVERY_OPTIONS } from '../data/countries'
import { CheckoutItemTable } from './checkout-item-table'
import { CheckoutItemList } from './checkout-item-list'
import { ShippingInformationForm } from './shipping-information-form'
import { DeliveryOptions } from './delivery-options'
import { CheckoutSummary } from './checkout-summary'

export function CheckoutForm({ items }: { items: CartItemWithArtwork[] }) {
  const user = useAuthStore(selectUser)
  const hasPhysical = items.some((i) => i.artwork.artwork_format === 'PHYSICAL')
  const { mutate: checkout, isPending } = useCheckout()

  const schema = useMemo(() => createCheckoutInfoSchema(hasPhysical), [hasPhysical])

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useZodForm<CheckoutInfoInput>(schema, {
    defaultValues: {
      full_name: user?.displayName ?? '',
      email: user?.email ?? '',
      phone_dial_code: '',
      phone: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      postal_code: '',
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
    ? (DELIVERY_OPTIONS.find((o) => o.id === deliverySpeed) ?? DELIVERY_OPTIONS[0]!).price
    : null

  const onSubmit = handleSubmit((values) => {
    const phone = [values.phone_dial_code, values.phone].filter(Boolean).join(' ').slice(0, 30)

    const shippingAddress: Partial<ShippingAddressSnapshot> = hasPhysical
      ? {
          full_name: values.full_name,
          phone,
          address_line_1: values.address_line_1 ?? '',
          address_line_2: values.address_line_2 || null,
          city: values.city ?? '',
          state: values.state ?? '',
          postal_code: values.postal_code ?? '',
          country_code: (values.country_code ?? '').toUpperCase(),
        }
      : { full_name: values.full_name, phone }

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
    <div className="flex flex-col gap-6 px-4 pb-10 lg:gap-10 lg:px-8 lg:pb-16">
      <CheckoutItemList items={items} className="lg:hidden" />
      <CheckoutItemTable items={items} className="hidden lg:flex" />

      <div
        className={
          hasPhysical
            ? 'grid grid-cols-1 gap-6 lg:grid-cols-3'
            : 'grid grid-cols-1 gap-6 lg:grid-cols-2'
        }
      >
        <ShippingInformationForm
          register={register}
          control={control}
          errors={errors}
          setValue={setValue}
          requiresShipping={hasPhysical}
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
