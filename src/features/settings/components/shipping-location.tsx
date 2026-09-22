'use client'

import { Button, Input } from '@/components'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@/store'
import { useUpdateProfile } from '@/hooks/use-auth-mutations'
import {
  useShippingAddresses,
  useCreateShippingAddress,
  useUpdateShippingAddress,
  useSetDefaultShippingAddress,
  useDeleteShippingAddress,
} from '@/hooks/use-shipping-addresses'
import { useMySellerRegistration, useUpdateDispatchAddress } from '@/hooks/use-seller'
import type { ShippingAddress, ShippingAddressInput } from '@/services/shipping-address.service'
import { COUNTRIES } from '@/features/checkout/data/countries'

// ── 1. Primary Location ─────────────────────────────────────────────────────
// Same underlying fields as Account Details' Country/State/City
// (profiles.country/state/city) — shown again here since it's also
// relevant to shipping/compliance context, a common pattern in settings
// UIs (e.g. showing "region" in more than one place). Saving here updates
// the same fields either page was opened from.

function LocationSection() {
  const { user } = useAuthStore()
  const { mutate: save, isPending } = useUpdateProfile()
  const [country, setCountry] = useState('')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')

  useEffect(() => {
    if (user) {
      setCountry(user.country ?? '')
      setState(user.state ?? '')
      setCity(user.city ?? '')
    }
  }, [user])

  const handleSave = () => {
    if (!user) return
    const payload: Partial<{ country: string | null; state: string | null; city: string | null }> = {}
    if (country !== (user.country ?? '')) payload.country = country || null
    if (state.trim() !== (user.state ?? '')) payload.state = state.trim() || null
    if (city.trim() !== (user.city ?? '')) payload.city = city.trim() || null
    if (Object.keys(payload).length === 0) return
    save(payload)
  }

  return (
    <div className='flex flex-col gap-y-6'>
      <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>Primary Location</p>
      <div className='bg-secondary-50 p-6 gap-y-4 flex flex-col rounded-xl'>
        <p className='font-poppins text-body-xs text-gray-200 tracking-wide'>
          Your primary country and region on Artsony. Used for compliance and platform features — not for shipping.
        </p>
        <div className='grid grid-cols-3 gap-3'>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger><SelectValue placeholder='Country' /></SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input placeholder='State / Region' value={state} onChange={(e) => setState(e.target.value)} />
          <Input placeholder='City' value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div className='flex justify-end'>
          <Button size='md' onClick={handleSave} isLoading={isPending} loadingText='Saving…'>Save</Button>
        </div>
      </div>
    </div>
  )
}

// ── 2. Delivery Addresses ───────────────────────────────────────────────────

const emptyAddressForm: ShippingAddressInput = {
  label: '',
  full_name: '',
  phone: '',
  address_line_1: '',
  address_line_2: '',
  city: '',
  state: '',
  postal_code: '',
  country_code: '',
}

function AddressForm({
  initial,
  onCancel,
  onSubmit,
  isPending,
}: {
  initial?: ShippingAddress
  onCancel: () => void
  onSubmit: (input: ShippingAddressInput) => void
  isPending: boolean
}) {
  const [form, setForm] = useState<ShippingAddressInput>(
    initial
      ? {
          label: initial.label ?? '',
          full_name: initial.full_name,
          phone: initial.phone,
          address_line_1: initial.address_line_1,
          address_line_2: initial.address_line_2 ?? '',
          city: initial.city,
          state: initial.state,
          postal_code: initial.postal_code,
          country_code: initial.country_code,
        }
      : emptyAddressForm,
  )

  const setField = <K extends keyof ShippingAddressInput>(key: K, value: ShippingAddressInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const isValid =
    form.full_name.trim() && form.phone.trim() && form.address_line_1.trim() &&
    form.city.trim() && form.state.trim() && form.postal_code.trim() && form.country_code

  return (
    <div className='bg-white border border-gray-50 rounded-xl p-4 flex flex-col gap-y-3'>
      <Input placeholder='Label (e.g. Home, Studio)' value={form.label ?? ''} onChange={(e) => setField('label', e.target.value)} />
      <div className='grid grid-cols-2 gap-3'>
        <Input placeholder='Full Name' value={form.full_name} onChange={(e) => setField('full_name', e.target.value)} />
        <Input placeholder='Phone Number' value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
      </div>
      <Input placeholder='Address Line 1' value={form.address_line_1} onChange={(e) => setField('address_line_1', e.target.value)} />
      <Input placeholder='Address Line 2 (optional)' value={form.address_line_2 ?? ''} onChange={(e) => setField('address_line_2', e.target.value)} />
      <div className='grid grid-cols-2 gap-3'>
        <Input placeholder='City' value={form.city} onChange={(e) => setField('city', e.target.value)} />
        <Input placeholder='State / Region' value={form.state} onChange={(e) => setField('state', e.target.value)} />
      </div>
      <div className='grid grid-cols-2 gap-3'>
        <Input placeholder='Postal Code' value={form.postal_code} onChange={(e) => setField('postal_code', e.target.value)} />
        <Select value={form.country_code} onValueChange={(v) => setField('country_code', v)}>
          <SelectTrigger><SelectValue placeholder='Country' /></SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((c) => (
              <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className='flex items-center justify-end gap-x-3 pt-2'>
        <Button variant='outline' size='sm' onClick={onCancel} disabled={isPending}>Cancel</Button>
        <Button
          size='sm'
          disabled={!isValid}
          isLoading={isPending}
          loadingText='Saving…'
          onClick={() => onSubmit(form)}
        >
          Save Address
        </Button>
      </div>
    </div>
  )
}

function DeliveryAddressesSection() {
  const { data: addresses, isLoading } = useShippingAddresses()
  const { mutate: create, isPending: isCreating } = useCreateShippingAddress()
  const { mutate: update, isPending: isUpdating } = useUpdateShippingAddress()
  const { mutate: setDefault } = useSetDefaultShippingAddress()
  const { mutate: remove, isPending: isDeleting, variables: deletingId } = useDeleteShippingAddress()

  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <div className='flex flex-col gap-y-6'>
      <div className='flex items-center justify-between'>
        <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>Delivery Addresses</p>
        {!isAdding && (
          <Button variant='outline' size='sm' onClick={() => setIsAdding(true)}>
            <Plus size={16} className='mr-1' /> Add Address
          </Button>
        )}
      </div>

      <div className='bg-secondary-50 p-6 rounded-xl flex flex-col gap-y-3'>
        {isLoading && <p className='font-poppins text-body-s text-gray-200 text-center py-4'>Loading…</p>}

        {!isLoading && addresses?.length === 0 && !isAdding && (
          <div className='flex flex-col items-center gap-y-2 py-8'>
            <MapPin size={32} className='text-gray-200' />
            <p className='font-poppins text-body-s text-body'>No saved delivery addresses yet</p>
          </div>
        )}

        {addresses?.map((addr) =>
          editingId === addr.id ? (
            <AddressForm
              key={addr.id}
              initial={addr}
              isPending={isUpdating}
              onCancel={() => setEditingId(null)}
              onSubmit={(input) => update({ id: addr.id, input }, { onSuccess: () => setEditingId(null) })}
            />
          ) : (
            <div key={addr.id} className='bg-white rounded-xl p-4 border border-gray-50 flex items-start justify-between gap-x-4'>
              <div className='min-w-0'>
                <div className='flex items-center gap-x-2 mb-1'>
                  <p className='font-poppins font-medium text-body-s text-heading truncate'>
                    {addr.label || addr.full_name}
                  </p>
                  {addr.is_default && (
                    <span className='font-poppins text-body-xxs text-primary-500 bg-primary-50 px-2 py-0.5 rounded-full'>Default</span>
                  )}
                </div>
                <p className='font-poppins text-body-xs text-gray-200'>
                  {addr.full_name} · {addr.phone}
                </p>
                <p className='font-poppins text-body-xs text-gray-200'>
                  {addr.address_line_1}{addr.address_line_2 ? `, ${addr.address_line_2}` : ''}, {addr.city}, {addr.state} {addr.postal_code}, {addr.country_code}
                </p>
              </div>
              <div className='flex items-center gap-x-2 shrink-0'>
                {!addr.is_default && (
                  <button
                    type='button'
                    aria-label='Set as default'
                    onClick={() => setDefault(addr.id)}
                    className='w-9 h-9 border border-gray-50 rounded-full flex items-center justify-center hover:bg-primary-50'
                  >
                    <Star size={16} className='text-gray-200' />
                  </button>
                )}
                <button
                  type='button'
                  aria-label='Edit address'
                  onClick={() => setEditingId(addr.id)}
                  className='w-9 h-9 border border-gray-50 rounded-full flex items-center justify-center hover:bg-primary-50'
                >
                  <Pencil size={16} className='text-gray-200' />
                </button>
                <button
                  type='button'
                  aria-label='Delete address'
                  disabled={isDeleting && deletingId === addr.id}
                  onClick={() => remove(addr.id)}
                  className='w-9 h-9 border border-gray-50 rounded-full flex items-center justify-center hover:bg-error-50 disabled:opacity-50'
                >
                  <Trash2 size={16} className='text-error-500' />
                </button>
              </div>
            </div>
          ),
        )}

        {isAdding && (
          <AddressForm
            isPending={isCreating}
            onCancel={() => setIsAdding(false)}
            onSubmit={(input) => create(input, { onSuccess: () => setIsAdding(false) })}
          />
        )}
      </div>
    </div>
  )
}

// ── 3. Seller Dispatch Address ──────────────────────────────────────────────
// Only shown for an APPROVED seller — the backend endpoint this saves to is
// scoped the same way, so this section simply doesn't render for anyone
// else rather than showing a form that would always fail to save.

function DispatchAddressSection() {
  const { data: registration } = useMySellerRegistration()
  const { mutate: save, isPending } = useUpdateDispatchAddress()

  const [form, setForm] = useState({
    phone_number: '',
    address: '',
    state: '',
    country: '',
    postal_code: '',
  })

  useEffect(() => {
    if (registration) {
      setForm({
        phone_number: registration.phone_number,
        address: registration.address,
        state: registration.state,
        country: registration.country,
        postal_code: registration.postal_code ?? '',
      })
    }
  }, [registration])

  if (!registration || registration.status !== 'APPROVED') return null

  const setField = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const handleSave = () => {
    const changed: Partial<typeof form> = {}
    for (const key of Object.keys(form) as (keyof typeof form)[]) {
      const original = key === 'postal_code' ? (registration.postal_code ?? '') : registration[key]
      if (form[key] !== original) changed[key] = form[key]
    }
    if (Object.keys(changed).length === 0) return
    save(changed)
  }

  return (
    <div className='flex flex-col gap-y-6'>
      <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>Seller Dispatch Address</p>
      <div className='bg-secondary-50 p-6 gap-y-4 flex flex-col rounded-xl'>
        <p className='font-poppins text-body-xs text-gray-200 tracking-wide'>
          Where your physical inventory ships from. This is shown to couriers, not to buyers.
        </p>

        <div className='grid grid-cols-2 gap-3'>
          <Input placeholder='Phone Number' value={form.phone_number} onChange={(e) => setField('phone_number', e.target.value)} />
          <Input placeholder='Postal Code' value={form.postal_code} onChange={(e) => setField('postal_code', e.target.value)} />
        </div>
        <Input placeholder='Address' value={form.address} onChange={(e) => setField('address', e.target.value)} />
        <div className='grid grid-cols-2 gap-3'>
          <Input placeholder='State / Region' value={form.state} onChange={(e) => setField('state', e.target.value)} />
          <Select value={form.country} onValueChange={(v) => setField('country', v)}>
            <SelectTrigger><SelectValue placeholder='Country' /></SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex justify-end pt-2'>
          <Button size='sm' onClick={handleSave} isLoading={isPending} loadingText='Saving…'>Save</Button>
        </div>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

const ShippingLocation = () => {
  return (
    <div className='border border-gray-50 rounded-2xl bg-white w-full pb-8'>
      <div className='px-8 py-4 flex justify-between items-center border-b border-gray-50 '>
        <h5 className='font-raleway font-semibold text-h5 text-primary-500 leading-10 tracking-wide'>Shipping & Location</h5>
      </div>

      <div className='pt-12 px-8 overflow-y-scroll gap-y-16 flex flex-col' style={{ gap: 64 }}>
        <LocationSection />
        <DeliveryAddressesSection />
        <DispatchAddressSection />
      </div>
    </div>
  )
}

export default ShippingLocation
