'use client'

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import { Button, Input } from '@/components'
import { Dropdown, type DropdownOption } from '@/components/ui/dropdown'
import { useToast } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store'
import { useUpdateProfile } from '@/hooks/use-auth-mutations'
import {
  useCreateShippingAddress,
  useDeleteShippingAddress,
  useShippingAddresses,
  useUpdateShippingAddress,
} from '@/hooks/use-shipping-addresses'
import { useMySellerRegistration, useUpdateDispatchAddress } from '@/hooks/use-seller'
import { getCountryName, useCountryOptions, useStateOptions } from '@/hooks/use-location-data'

type AddressFields = {
  address: string
  country: string
  city: string
  state: string
  postalCode: string
}

type LocationFields = {
  country: string
  state: string
}

type AddressErrors = Partial<Record<keyof AddressFields, string>>

const EMPTY_ADDRESS: AddressFields = { address: '', country: '', city: '', state: '', postalCode: '' }
const IP_LOOKUP_URL = 'https://ipapi.co/json/'

const FIELD_TEXT = 'text-sm font-normal placeholder:text-gray-300 border-gray-50'

const shallowEqual = <T extends Record<string, string>>(a: T, b: T) =>
  (Object.keys(a) as Array<keyof T>).every((key) => a[key] === b[key])

const isBlank = (fields: AddressFields) => Object.values(fields).every((v) => v.trim() === '')

function validateAddress(fields: AddressFields, required: Array<keyof AddressFields>): AddressErrors {
  if (isBlank(fields)) return {}
  const labels: Record<keyof AddressFields, string> = {
    address: 'Address',
    country: 'Country',
    city: 'City/Town',
    state: 'State/Province',
    postalCode: 'Postal code',
  }
  return required.reduce<AddressErrors>((errors, key) => {
    if (!fields[key].trim()) errors[key] = `${labels[key]} is required`
    return errors
  }, {})
}

function useDraft<T extends Record<string, string>>(server: T) {
  const [draft, setDraft] = useState<T | null>(null)
  const value = draft ?? server
  const isDirty = draft !== null && !shallowEqual(draft, server)

  useEffect(() => {
    if (draft && shallowEqual(draft, server)) setDraft(null)
  }, [draft, server])

  const update = useCallback((patch: Partial<T>) => setDraft((prev) => ({ ...(prev ?? server), ...patch })), [server])
  const replace = useCallback((next: T) => setDraft(next), [])

  return { value, isDirty, update, replace }
}

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className='pl-4 text-xs font-semibold text-error-500'>{message}</p> : null

interface SwitchControlProps {
  checked: boolean
  onChange: () => void
  label: string
  disabled?: boolean
  isLoading?: boolean
}

const SwitchControl = ({ checked, onChange, label, disabled, isLoading }: SwitchControlProps) => (
  <button
    type='button'
    role='switch'
    aria-checked={checked}
    aria-label={label}
    aria-busy={isLoading}
    disabled={disabled || isLoading}
    onClick={onChange}
    className={cn(
      'relative inline-flex h-6 w-12 shrink-0 cursor-pointer items-center rounded-full border border-primary-500 transition-colors duration-200',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
      'disabled:cursor-not-allowed disabled:opacity-60',
      checked ? 'bg-primary-500' : 'bg-white',
    )}
  >
    <span
      className={cn(
        'absolute left-px top-1/2 flex size-[18px] -translate-y-1/2 items-center justify-center rounded-full transition-transform duration-300 ease-in-out',
        checked ? 'translate-x-[26px] bg-white' : 'translate-x-0 bg-primary-500',
      )}
    >
      {isLoading && <Loader2 className={cn('size-3 animate-spin', checked ? 'text-primary-500' : 'text-white')} />}
    </span>
  </button>
)

interface CountryFieldProps {
  value: string
  onChange: (code: string) => void
  disabled?: boolean
  error?: string
}

const CountryField = ({ value, onChange, disabled, error }: CountryFieldProps) => {
  const { countries, isLoading } = useCountryOptions()
  const [query, setQuery] = useState('')

  const options = useMemo<DropdownOption[]>(
    () => countries.map((c) => ({ id: c.code, label: c.name })),
    [countries],
  )
  const selected = useMemo<DropdownOption | undefined>(() => {
    if (!value) return undefined
    return options.find((o) => o.id === value) ?? { id: value, label: getCountryName(value) ?? value }
  }, [options, value])

  return (
    <div className='flex flex-col gap-y-1.5'>
      <Dropdown
        options={options}
        value={selected}
        onChange={(option) => {
          setQuery('')
          onChange(String(option.id))
        }}
        placeholder='Country'
        title='Country'
        arrow='triangle'
        searchable
        searchPlaceholder='Search country'
        searchValue={query}
        onSearchChange={setQuery}
        isLoading={isLoading}
        disabled={disabled}
        variant={error ? 'error' : 'default'}
        emptyMessage='No countries found'
      />
      <FieldError message={error} />
    </div>
  )
}

interface StateFieldProps {
  country: string
  value: string
  onChange: (state: string) => void
  disabled?: boolean
  error?: string
}

const StateField = ({ country, value, onChange, disabled, error }: StateFieldProps) => {
  const { countries } = useCountryOptions()
  const [query, setQuery] = useState('')

  const countryName = country
    ? countries.find((c) => c.code === country)?.name ?? getCountryName(country)
    : undefined
  const { states, isLoading, isError, refetch } = useStateOptions(countryName)

  const options = useMemo<DropdownOption[]>(() => states.map((name) => ({ id: name, label: name })), [states])
  const selected = useMemo<DropdownOption | undefined>(
    () => (value ? { id: value, label: value } : undefined),
    [value],
  )

  return (
    <div className='flex min-w-0 flex-1 flex-col gap-y-1.5'>
      <Dropdown
        options={options}
        value={selected}
        onChange={(option) => {
          setQuery('')
          onChange(String(option.id))
        }}
        placeholder='State/Province'
        title='State/Province'
        arrow='triangle'
        searchable
        searchPlaceholder='Search state'
        searchValue={query}
        onSearchChange={setQuery}
        isLoading={isLoading}
        disabled={disabled || !country}
        variant={error ? 'error' : 'default'}
        emptyMessage={
          !country
            ? 'Select a country first'
            : isError
              ? 'Could not load states'
              : 'No states found for this country'
        }
      />
      {isError && !disabled && (
        <button
          type='button'
          onClick={() => refetch()}
          className='self-start pl-4 text-xs font-semibold text-primary-500 underline underline-offset-2 hover:text-primary-600'
        >
          Could not load states. Retry
        </button>
      )}
      <FieldError message={error} />
    </div>
  )
}

interface AddressCardProps {
  value: AddressFields
  errors?: AddressErrors
  onChange: (patch: Partial<AddressFields>) => void
  disabled?: boolean
  lockedFields?: boolean
  idPrefix: string
}

const AddressCard = ({ value, errors = {}, onChange, disabled, lockedFields, idPrefix }: AddressCardProps) => {
  const locked = disabled || lockedFields

  return (
    <div className='flex flex-col gap-y-4 rounded-[24px] bg-secondary-50 p-6'>
      <Input
        id={`${idPrefix}-address`}
        placeholder='Address'
        aria-label='Address'
        autoComplete='off'
        value={value.address}
        disabled={disabled}
        error={errors.address}
        maxLength={300}
        onChange={(e) => onChange({ address: e.target.value })}
        className={FIELD_TEXT}
      />
      <CountryField
        value={value.country}
        disabled={locked}
        error={errors.country}
        onChange={(country) => onChange({ country, state: '' })}
      />
      <Input
        id={`${idPrefix}-city`}
        placeholder='City/Town'
        aria-label='City or town'
        autoComplete='off'
        value={value.city}
        disabled={locked}
        error={errors.city}
        maxLength={100}
        onChange={(e) => onChange({ city: e.target.value })}
        className={FIELD_TEXT}
      />
      <div className='flex flex-col gap-4 sm:flex-row'>
        <StateField
          country={value.country}
          value={value.state}
          disabled={locked}
          error={errors.state}
          onChange={(state) => onChange({ state })}
        />
        <div className='sm:w-48 sm:shrink-0'>
          <Input
            id={`${idPrefix}-postal`}
            placeholder='Postal Code'
            aria-label='Postal code'
            autoComplete='off'
            value={value.postalCode}
            disabled={locked}
            error={errors.postalCode}
            maxLength={20}
            onChange={(e) => onChange({ postalCode: e.target.value })}
            className={FIELD_TEXT}
          />
        </div>
      </div>
    </div>
  )
}

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <p className='font-poppins text-body-m font-semibold leading-6 tracking-wide text-primary-500'>{children}</p>
)

const SectionDescription = ({ children }: { children: ReactNode }) => (
  <p className='font-poppins text-body-xs leading-8 tracking-wide text-gray-200'>{children}</p>
)

export default function ShippingLocation({ goBack }: { goBack?: () => void }) {
  const { user } = useAuthStore()
  const { error: toastError } = useToast()

  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile()
  const {
    data: addresses,
    isLoading: isLoadingAddresses,
    isError: isAddressesError,
    refetch: refetchAddresses,
  } = useShippingAddresses()
  const { mutateAsync: createAddress, isPending: isCreatingAddress } = useCreateShippingAddress()
  const { mutateAsync: updateAddress, isPending: isUpdatingAddress } = useUpdateShippingAddress()
  const { mutate: deleteAddress, isPending: isDeletingAddress } = useDeleteShippingAddress()
  const { data: registration, isLoading: isLoadingRegistration } = useMySellerRegistration()
  const { mutateAsync: updateDispatch, isPending: isUpdatingDispatch } = useUpdateDispatchAddress()

  const defaultDelivery = addresses?.[0]
  const canEditDispatch = registration?.status === 'APPROVED'

  const serverLocation = useMemo<LocationFields>(
    () => ({ country: user?.country ?? '', state: user?.state ?? '' }),
    [user?.country, user?.state],
  )
  const serverDelivery = useMemo<AddressFields>(
    () =>
      defaultDelivery
        ? {
            address: defaultDelivery.address_line_1 ?? '',
            country: defaultDelivery.country_code ?? '',
            city: defaultDelivery.city ?? '',
            state: defaultDelivery.state ?? '',
            postalCode: defaultDelivery.postal_code ?? '',
          }
        : EMPTY_ADDRESS,
    [defaultDelivery],
  )
  const serverDispatch = useMemo<AddressFields>(
    () =>
      registration
        ? {
            address: registration.address ?? '',
            country: registration.country ?? '',
            city: registration.city ?? '',
            state: registration.state ?? '',
            postalCode: registration.postal_code ?? '',
          }
        : EMPTY_ADDRESS,
    [registration],
  )

  const location = useDraft(serverLocation)
  const delivery = useDraft(serverDelivery)
  const dispatch = useDraft(serverDispatch)

  const [deliveryErrors, setDeliveryErrors] = useState<AddressErrors>({})
  const [dispatchErrors, setDispatchErrors] = useState<AddressErrors>({})
  const [isAutoLocation, setIsAutoLocation] = useState(false)
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)

  const isSaving = isUpdatingProfile || isCreatingAddress || isUpdatingAddress || isUpdatingDispatch
  const hasChanges = location.isDirty || delivery.isDirty || (canEditDispatch && dispatch.isDirty)

  const updateDelivery = (patch: Partial<AddressFields>) => {
    setDeliveryErrors((prev) => {
      const next = { ...prev }
      for (const key of Object.keys(patch) as Array<keyof AddressFields>) delete next[key]
      return next
    })
    delivery.update(patch)
  }

  const updateDispatchFields = (patch: Partial<AddressFields>) => {
    setDispatchErrors((prev) => {
      const next = { ...prev }
      for (const key of Object.keys(patch) as Array<keyof AddressFields>) delete next[key]
      return next
    })
    dispatch.update(patch)
  }

  const handleClearDelivery = () => {
    setDeliveryErrors({})
    delivery.replace(EMPTY_ADDRESS)
    if (defaultDelivery?.id) {
      deleteAddress(defaultDelivery.id, { onError: () => delivery.replace(serverDelivery) })
    }
  }

  const handleToggleAutoLocation = async () => {
    if (isAutoLocation) {
      setIsAutoLocation(false)
      return
    }

    setIsDetectingLocation(true)
    try {
      const res = await fetch(IP_LOOKUP_URL)
      if (!res.ok) throw new Error(`Lookup failed (${res.status})`)
      const data = (await res.json()) as {
        error?: boolean
        country_code?: string
        region?: string
        city?: string
        postal?: string
      }
      if (data.error || !data.country_code) throw new Error('Location could not be determined')

      updateDispatchFields({
        country: data.country_code.toUpperCase(),
        state: data.region ?? '',
        city: data.city ?? '',
        postalCode: data.postal ?? '',
      })
      setIsAutoLocation(true)
    } catch {
      toastError('Could not detect location', 'Enter your shipping address manually or try again.')
    } finally {
      setIsDetectingLocation(false)
    }
  }

  const handleSave = async () => {
    const nextDeliveryErrors = delivery.isDirty
      ? validateAddress(delivery.value, ['address', 'country', 'city', 'state', 'postalCode'])
      : {}
    const nextDispatchErrors =
      canEditDispatch && dispatch.isDirty
        ? validateAddress(dispatch.value, ['address', 'country', 'city', 'state'])
        : {}
    setDeliveryErrors(nextDeliveryErrors)
    setDispatchErrors(nextDispatchErrors)

    if (Object.keys(nextDeliveryErrors).length > 0 || Object.keys(nextDispatchErrors).length > 0) {
      toastError('Check the highlighted fields', 'Some required details are missing.')
      return
    }

    const tasks: Promise<unknown>[] = []

    if (location.isDirty) {
      tasks.push(
        updateProfile({
          country: location.value.country || null,
          state: location.value.state || null,
        }),
      )
    }

    if (delivery.isDirty && !isBlank(delivery.value)) {
      const fields = {
        address_line_1: delivery.value.address.trim(),
        city: delivery.value.city.trim(),
        state: delivery.value.state.trim(),
        postal_code: delivery.value.postalCode.trim(),
        country_code: delivery.value.country,
      }
      tasks.push(
        defaultDelivery?.id
          ? updateAddress({ id: defaultDelivery.id, input: fields })
          : createAddress({
              ...fields,
              full_name: user?.displayName || user?.username || '',
              is_default: true,
            }),
      )
    }

    if (canEditDispatch && dispatch.isDirty && !isBlank(dispatch.value)) {
      tasks.push(
        updateDispatch({
          address: dispatch.value.address.trim(),
          country: dispatch.value.country,
          city: dispatch.value.city.trim(),
          state: dispatch.value.state.trim(),
          postal_code: dispatch.value.postalCode.trim(),
        }),
      )
    }

    await Promise.allSettled(tasks)
  }

  const dispatchDisabled = !canEditDispatch || isLoadingRegistration

  return (
    <section className='flex h-full min-h-0 w-full flex-col overflow-hidden lg:rounded-2xl lg:border lg:border-gray-50 bg-white'>
      <header className='flex h-20 shrink-0 items-center justify-between gap-x-4 border-b border-gray-50 px-8'>
        <h5 className='font-raleway text-h5 font-semibold tracking-wide text-primary-500'>Shipping & Location</h5>
        <Button
          size='sm'
          className='rounded-full'
          onClick={handleSave}
          isLoading={isSaving}
          loadingText='Saving…'
          disabled={!hasChanges || isSaving}
          aria-label='Save shipping and location changes'
        >
          Save
        </Button>
      </header>

      <div className='min-h-0 flex-1 overflow-y-auto px-8 pb-8 pt-12'>
        <div className='flex flex-col gap-y-16'>
          <div className='flex flex-col gap-y-4'>
            <SectionTitle>Location</SectionTitle>
            <SectionDescription>
              This is your primary country and region on Artsony. It’s used for compliance, payouts, and platform
              features — not for shipping.
            </SectionDescription>
            <div className='flex flex-col gap-y-4 rounded-[24px] bg-secondary-50 p-6'>
              <CountryField
                value={location.value.country}
                onChange={(country) => location.update({ country, state: '' })}
              />
              <StateField
                country={location.value.country}
                value={location.value.state}
                onChange={(state) => location.update({ state })}
              />
            </div>
          </div>

          <div className='flex flex-col gap-y-4'>
            <div className='flex h-10 items-center justify-between'>
              <SectionTitle>Delivery Address</SectionTitle>
              <button
                type='button'
                aria-label='Delete delivery address'
                onClick={handleClearDelivery}
                disabled={isDeletingAddress || (!defaultDelivery && isBlank(delivery.value))}
                className={cn(
                  'flex size-10 items-center justify-center rounded-full border border-gray-50 bg-white text-gray-400 transition-colors',
                  'hover:bg-gray-50 active:bg-gray-100',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
                  'disabled:cursor-not-allowed disabled:opacity-60',
                )}
              >
                {isDeletingAddress ? <Loader2 className='size-4 animate-spin' /> : <Trash2 className='size-4' />}
              </button>
            </div>
            <SectionDescription>
              Used only for delivering physical artworks. You can save and manage addresses anytime.
            </SectionDescription>
            {isAddressesError && (
              <p className='-mt-2 text-xs font-semibold text-error-500'>
                Could not load your saved address.{' '}
                <button type='button' onClick={() => refetchAddresses()} className='underline underline-offset-2'>
                  Retry
                </button>
              </p>
            )}
            <AddressCard
              idPrefix='delivery'
              value={delivery.value}
              errors={deliveryErrors}
              onChange={updateDelivery}
              disabled={isLoadingAddresses}
            />
          </div>

          <div
            className='flex flex-col gap-y-4'
            title={dispatchDisabled && !isLoadingRegistration ? 'Available once your seller account is approved' : undefined}
          >
            <div className='mb-4'>
              <SectionTitle>Shipping Address</SectionTitle>
            </div>
            <div className='flex flex-col gap-y-2'>
              <div className='flex h-6 items-center justify-between gap-x-4'>
                <p className='font-poppins text-body-s font-medium leading-6 text-heading'>Set Automatically by location</p>
                <SwitchControl
                  checked={isAutoLocation}
                  onChange={handleToggleAutoLocation}
                  label='Set shipping address automatically by location'
                  disabled={dispatchDisabled}
                  isLoading={isDetectingLocation}
                />
              </div>
              <SectionDescription>
                Make sure this address matches where your artworks are stored. It’s used to generate shipping labels
                and pickup requests.
              </SectionDescription>
            </div>
            <AddressCard
              idPrefix='dispatch'
              value={dispatch.value}
              errors={dispatchErrors}
              onChange={updateDispatchFields}
              disabled={dispatchDisabled}
              lockedFields={isAutoLocation}
            />
          </div>
        </div>
      </div>
    </section>
  )
}