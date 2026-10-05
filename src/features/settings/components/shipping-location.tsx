'use client'

import React, { useEffect, useState } from 'react'
import { Button, Input } from '@/components'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2 } from 'lucide-react'
import { useAuthStore } from '@/store'
import { useUpdateProfile } from '@/hooks/use-auth-mutations'
import {
  useShippingAddresses,
  useCreateShippingAddress,
  useUpdateShippingAddress,
  useDeleteShippingAddress,
} from '@/hooks/use-shipping-addresses'
import { useMySellerRegistration, useUpdateDispatchAddress } from '@/hooks/use-seller'

interface CountryOption {
  name: string
  code: string
}

interface StateOption {
  name: string
  code: string
}

// ── Custom Hooks for API Fetching ──────────────────────────────────────────

function useCountries() {
  const [countries, setCountries] = useState<CountryOption[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchCountries = async () => {
      setIsLoading(true)
      try {
        const res = await fetch('https://countriesnow.space/api/v0.1/countries')
        const data = await res.json()
        if (!data.error && data.data) {
          const formatted = data.data.map((c: any) => ({
            name: c.country,
            code: c.iso2 || c.country,
          }))
          setCountries(formatted)
        }
      } catch (err) {
        console.error('Failed to load countries:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCountries()
  }, [])

  return { countries, isLoadingCountries: isLoading }
}

function useStates(selectedCountryVal: string, countriesList: CountryOption[]) {
  const [states, setStates] = useState<StateOption[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!selectedCountryVal) {
      setStates([])
      return
    }

    // Determine country name (handles ISO code or full country name)
    const matchedCountry = countriesList.find(
      (c) =>
        c.code.toLowerCase() === selectedCountryVal.toLowerCase() ||
        c.name.toLowerCase() === selectedCountryVal.toLowerCase()
    )
    const countryName = matchedCountry ? matchedCountry.name : selectedCountryVal

    const fetchStates = async () => {
      setIsLoading(true)
      try {
        const res = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country: countryName }),
        })
        const data = await res.json()

        if (!data.error && data.data?.states) {
          const formatted = data.data.states.map((s: any) => ({
            name: s.name,
            code: s.state_code || s.name,
          }))
          setStates(formatted)
        } else {
          setStates([])
        }
      } catch (err) {
        console.error('Failed to load states:', err)
        setStates([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchStates()
  }, [selectedCountryVal, countriesList])

  return { states, isLoadingStates: isLoading }
}

// ── Main Page Component ─────────────────────────────────────────────────────

export default function ShippingLocation() {
  const { user } = useAuthStore()
  const { countries, isLoadingCountries } = useCountries()

  // ── 1. Primary Location State ──────────────────────────────────────────────
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile()
  const [primaryCountry, setPrimaryCountry] = useState('')
  const [primaryState, setPrimaryState] = useState('')

  const { states: primaryStates, isLoadingStates: isLoadingPrimaryStates } = useStates(
    primaryCountry,
    countries
  )

  useEffect(() => {
    if (user) {
      setPrimaryCountry(user.country ?? '')
      setPrimaryState(user.state ?? '')
    }
  }, [user])

  // Reset state if primary country changes manually
  const handlePrimaryCountryChange = (val: string) => {
    setPrimaryCountry(val)
    setPrimaryState('')
  }

  // ── 2. Delivery Address State ─────────────────────────────────────────────
  const { data: addresses } = useShippingAddresses()
  const { mutate: createAddress, isPending: isCreatingAddress } = useCreateShippingAddress()
  const { mutate: updateAddress, isPending: isUpdatingAddress } = useUpdateShippingAddress()
  const { mutate: deleteAddress, isPending: isDeletingAddress } = useDeleteShippingAddress()

  const defaultDelivery = addresses?.[0]

  const [deliveryForm, setDeliveryForm] = useState({
    address: '',
    country: '',
    city: '',
    state: '',
    postalCode: '',
  })

  const { states: deliveryStates, isLoadingStates: isLoadingDeliveryStates } = useStates(
    deliveryForm.country,
    countries
  )

  useEffect(() => {
    if (defaultDelivery) {
      setDeliveryForm({
        address: defaultDelivery.address_line_1 ?? '',
        country: defaultDelivery.country_code ?? '',
        city: defaultDelivery.city ?? '',
        state: defaultDelivery.state ?? '',
        postalCode: defaultDelivery.postal_code ?? '',
      })
    }
  }, [defaultDelivery])

  const setDeliveryField = (field: keyof typeof deliveryForm, value: string) => {
    setDeliveryForm((prev) => {
      const updated = { ...prev, [field]: value }
      if (field === 'country') updated.state = '' // Reset state on country change
      return updated
    })
  }

  const handleClearDeliveryAddress = () => {
    if (defaultDelivery?.id) {
      deleteAddress(defaultDelivery.id)
    }
    setDeliveryForm({
      address: '',
      country: '',
      city: '',
      state: '',
      postalCode: '',
    })
  }

  // ── 3. Shipping Address (Seller Dispatch) State ───────────────────────────
  const { data: registration } = useMySellerRegistration()
  const { mutate: updateDispatch, isPending: isUpdatingDispatch } = useUpdateDispatchAddress()

  const [isAutoLocation, setIsAutoLocation] = useState(false)
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)
  const [shippingForm, setShippingForm] = useState({
    address: '',
    country: '',
    city: '',
    state: '',
    postalCode: '',
  })

  const { states: shippingStates, isLoadingStates: isLoadingShippingStates } = useStates(
    shippingForm.country,
    countries
  )

  useEffect(() => {
    if (registration) {
      setShippingForm({
        address: registration.address ?? '',
        country: registration.country ?? '',
        city: registration.city ?? '',
        state: registration.state ?? '',
        postalCode: registration.postal_code ?? '',
      })
    }
  }, [registration])

  const setShippingField = (field: keyof typeof shippingForm, value: string) => {
    setShippingForm((prev) => {
      const updated = { ...prev, [field]: value }
      if (field === 'country') updated.state = ''
      return updated
    })
  }

  const handleToggleAutoLocation = async () => {
    const nextVal = !isAutoLocation
    setIsAutoLocation(nextVal)

    if (nextVal) {
      setIsDetectingLocation(true)
      try {
        const res = await fetch('https://ipapi.co/json/')
        const data = await res.json()
        if (data && !data.error) {
          setShippingForm({
            address: data.city ? `${data.city}` : '',
            country: data.country_name || data.country_code || '',
            city: data.city || '',
            state: data.region || '',
            postalCode: data.postal || '',
          })
        }
      } catch (err) {
        console.error('Failed to detect auto location:', err)
      } finally {
        setIsDetectingLocation(false)
      }
    }
  }

  // ── Global Save Handler ───────────────────────────────────────────────────
  const isSaving = isUpdatingProfile || isCreatingAddress || isUpdatingAddress || isUpdatingDispatch

  const handleSaveAll = () => {
    // 1. Primary Location
    if (user && (primaryCountry !== user.country || primaryState !== user.state)) {
      updateProfile({ country: primaryCountry || null, state: primaryState || null })
    }

    // 2. Delivery Address
    if (deliveryForm.address && deliveryForm.country) {
      const payload = {
        full_name: user?.username || 'Primary User',
        phone: '',
        address_line_1: deliveryForm.address,
        city: deliveryForm.city,
        state: deliveryForm.state,
        postal_code: deliveryForm.postalCode,
        country_code: deliveryForm.country,
      }

      if (defaultDelivery?.id) {
        updateAddress({ id: defaultDelivery.id, input: payload })
      } else {
        createAddress(payload)
      }
    }

    // 3. Seller Dispatch Address
    if (registration?.status === 'APPROVED') {
      updateDispatch({
        address: shippingForm.address,
        country: shippingForm.country,
        state: shippingForm.state,
        postal_code: shippingForm.postalCode,
      })
    }
  }

  return (
    <div className='border border-gray-50 rounded-2xl bg-white w-full pb-8 shadow-sm'>
      {/* Header */}
      <div className='px-8 py-5 flex justify-between items-center border-b border-gray-50'>
        <h5 className='font-raleway font-semibold text-h5 text-primary-500 leading-10 tracking-wide'>
          Shipping & Location
        </h5>
        <Button
          size='md'
          onClick={handleSaveAll}
          isLoading={isSaving}
          loadingText='Saving...'
          className='px-6 rounded-full bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors'
        >
          Save
        </Button>
      </div>

      <div className='pt-8 px-8 flex flex-col gap-y-12'>
        {/* ── 1. Primary Location ─────────────────────────────────────── */}
        <div className='flex flex-col gap-y-4'>
          <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>
            Location
          </p>
          <p className='font-poppins text-body-xs text-gray-200 tracking-wide'>
            This is your primary country and region on Artsony. It's used for compliance, payouts, and platform features — not for shipping.
          </p>
          <div className='bg-secondary-50 p-6 flex flex-col gap-y-4 rounded-xl'>
            {/* Dynamic Country Select */}
            <Select value={primaryCountry} onValueChange={handlePrimaryCountryChange}>
              <SelectTrigger className='h-12 bg-white rounded-xl border-gray-100'>
                <SelectValue placeholder={isLoadingCountries ? 'Loading countries...' : 'Country'} />
              </SelectTrigger>
              <SelectContent className='max-h-60 overflow-y-auto'>
                {countries.map((c) => (
                  <SelectItem key={c.code || c.name} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Dynamic State Select */}
            <Select
              value={primaryState}
              onValueChange={setPrimaryState}
              disabled={!primaryCountry || isLoadingPrimaryStates}
            >
              <SelectTrigger className='h-12 bg-white rounded-xl border-gray-100 disabled:opacity-60'>
                <SelectValue
                  placeholder={
                    isLoadingPrimaryStates
                      ? 'Loading states...'
                      : !primaryCountry
                      ? 'Select country first'
                      : 'State/Province'
                  }
                />
              </SelectTrigger>
              <SelectContent className='max-h-60 overflow-y-auto'>
                {primaryStates.length > 0 ? (
                  primaryStates.map((s) => (
                    <SelectItem key={s.code || s.name} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value='none' disabled>
                    No states found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── 2. Delivery Address ─────────────────────────────────────── */}
        <div className='flex flex-col gap-y-4'>
          <div className='flex items-center justify-between'>
            <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>
              Delivery Address
            </p>
            <button
              type='button'
              aria-label='Delete address'
              onClick={handleClearDeliveryAddress}
              disabled={isDeletingAddress}
              className='p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors'
            >
              <Trash2 size={20} />
            </button>
          </div>
          <p className='font-poppins text-body-xs text-gray-200 tracking-wide'>
            Used only for delivering physical artworks. You can save and manage addresses anytime.
          </p>

          <div className='bg-secondary-50 p-6 flex flex-col gap-y-4 rounded-xl'>
            <Input
              placeholder='Address'
              value={deliveryForm.address}
              onChange={(e) => setDeliveryField('address', e.target.value)}
              className='h-12 bg-white rounded-xl border-gray-100'
            />

            {/* Dynamic Country Select */}
            <Select
              value={deliveryForm.country}
              onValueChange={(v) => setDeliveryField('country', v)}
            >
              <SelectTrigger className='h-12 bg-white rounded-xl border-gray-100'>
                <SelectValue placeholder={isLoadingCountries ? 'Loading countries...' : 'Country'} />
              </SelectTrigger>
              <SelectContent className='max-h-60 overflow-y-auto'>
                {countries.map((c) => (
                  <SelectItem key={c.code || c.name} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder='City/Town'
              value={deliveryForm.city}
              onChange={(e) => setDeliveryField('city', e.target.value)}
              className='h-12 bg-white rounded-xl border-gray-100'
            />

            <div className='grid grid-cols-[1fr_192px] gap-4 w-full'>
              {/* Dynamic State Select */}
              <Select
                value={deliveryForm.state}
                onValueChange={(v) => setDeliveryField('state', v)}
                disabled={!deliveryForm.country || isLoadingDeliveryStates}
              >
                <SelectTrigger className='h-12 bg-white rounded-xl border-gray-100 disabled:opacity-60'>
                  <SelectValue
                    placeholder={
                      isLoadingDeliveryStates
                        ? 'Loading states...'
                        : !deliveryForm.country
                        ? 'Select country first'
                        : 'State/Province'
                    }
                  />
                </SelectTrigger>
                <SelectContent className='max-h-60 overflow-y-auto'>
                  {deliveryStates.length > 0 ? (
                    deliveryStates.map((s) => (
                      <SelectItem key={s.code || s.name} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value='none' disabled>
                      No states found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>

              <Input
                placeholder='Postal Code'
                value={deliveryForm.postalCode}
                onChange={(e) => setDeliveryField('postalCode', e.target.value)}
                className='h-12 bg-white rounded-xl border-gray-100'
              />
            </div>
          </div>
        </div>

        {/* ── 3. Shipping Address (Seller Dispatch) ──────────────────── */}
        <div className='flex flex-col gap-y-4'>
          <div className='flex items-center justify-between'>
            <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>
              Shipping Address
            </p>
            <div className='flex items-center gap-x-3'>
              <span className='font-poppins text-body-xs text-gray-400'>
                {isDetectingLocation ? 'Detecting location...' : 'Set Automatically by location'}
              </span>
              <button
                type='button'
                onClick={handleToggleAutoLocation}
                disabled={isDetectingLocation}
                className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none ${
                  isAutoLocation ? 'bg-primary-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                    isAutoLocation ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          <p className='font-poppins text-body-xs text-gray-200 tracking-wide'>
            Make sure this address matches where your artworks are stored, it's used to generate shipping labels and pickup requests.
          </p>

          <div className='bg-secondary-50 p-6 flex flex-col gap-y-4 rounded-xl'>
            <Input
              placeholder='Address'
              value={shippingForm.address}
              disabled={isAutoLocation || isDetectingLocation}
              onChange={(e) => setShippingField('address', e.target.value)}
              className='h-12 bg-white rounded-xl border-gray-100 disabled:opacity-60'
            />

            {/* Dynamic Country Select */}
            <Select
              value={shippingForm.country}
              disabled={isAutoLocation || isDetectingLocation}
              onValueChange={(v) => setShippingField('country', v)}
            >
              <SelectTrigger className='h-12 bg-white rounded-xl border-gray-100 disabled:opacity-60'>
                <SelectValue placeholder={isLoadingCountries ? 'Loading countries...' : 'Country'} />
              </SelectTrigger>
              <SelectContent className='max-h-60 overflow-y-auto'>
                {countries.map((c) => (
                  <SelectItem key={c.code || c.name} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder='City/Town'
              value={shippingForm.city}
              disabled={isAutoLocation || isDetectingLocation}
              onChange={(e) => setShippingField('city', e.target.value)}
              className='h-12 bg-white rounded-xl border-gray-100 disabled:opacity-60'
            />

            <div className='grid grid-cols-[1fr_192px] gap-4 w-full'>
              {/* Dynamic State Select */}
              <Select
                value={shippingForm.state}
                disabled={isAutoLocation || !shippingForm.country || isLoadingShippingStates || isDetectingLocation}
                onValueChange={(v) => setShippingField('state', v)}
              >
                <SelectTrigger className='h-12 bg-white rounded-xl border-gray-100 disabled:opacity-60'>
                  <SelectValue
                    placeholder={
                      isLoadingShippingStates
                        ? 'Loading states...'
                        : !shippingForm.country
                        ? 'Select country first'
                        : 'State/Province'
                    }
                  />
                </SelectTrigger>
                <SelectContent className='max-h-60 overflow-y-auto'>
                  {shippingStates.length > 0 ? (
                    shippingStates.map((s) => (
                      <SelectItem key={s.code || s.name} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value='none' disabled>
                      No states found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>

              <Input
                placeholder='Postal Code'
                value={shippingForm.postalCode}
                disabled={isAutoLocation || isDetectingLocation}
                onChange={(e) => setShippingField('postalCode', e.target.value)}
                className='h-12 bg-white rounded-xl border-gray-100 disabled:opacity-60'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}