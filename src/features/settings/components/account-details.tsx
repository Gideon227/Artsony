'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js'
import { Button } from '@/components'
import ContactSection from '../sections/contact-section'
import { useAuthStore } from '@/store'
import ConnectedAccount from '../sections/connected-accounts'
import { useUpdateProfile } from '@/hooks/use-auth-mutations'
import { usePrivateDetails, useUpdatePrivateDetails } from '@/hooks/use-private-details'
import type { UpdateProfileInput } from '@/services/auth.service'

export type AccountDraft = {
  country: string // ISO 3166-1 alpha-2
  state: string
}

const AccountDetails = ({ goBack }: { goBack?: () => void }) => {
  const { user } = useAuthStore()
  const { mutateAsync: saveProfile, isPending: isSavingProfile } = useUpdateProfile()
  const { data: details, isLoading: isLoadingDetails } = usePrivateDetails()
  const { mutateAsync: saveDetails, isPending: isSavingDetails } = useUpdatePrivateDetails()

  // ── Region (country / state) → profiles, via PATCH /users/me ──────────────
  const [region, setRegion] = useState<AccountDraft>(() => ({
    country: user?.country ?? '',
    state: user?.state ?? '',
  }))
  const syncedUserId = useRef<string | null>(user?.id ?? null)
  useEffect(() => {
    if (user && syncedUserId.current !== user.id) {
      syncedUserId.current = user.id
      setRegion({ country: user.country ?? '', state: user.state ?? '' })
    }
  }, [user])

  const handleLocationChange = useCallback(
    (patch: { country?: string; state?: string }) => setRegion((r) => ({ ...r, ...patch })),
    [],
  )

  // ── Phone → user_private_details, via PATCH /users/me/private-details ─────
  // What the user types is a local number ("0801 234 5678"); it is stored as
  // E.164 ("+2348012345678"), parsed with the country picked in the input.
  const savedPhone = details?.phone_number ?? null
  const savedParsed = useMemo(
    () => (savedPhone ? parsePhoneNumberFromString(savedPhone) : undefined),
    [savedPhone],
  )
  const [phoneInput, setPhoneInput] = useState('')
  const [phoneCountry, setPhoneCountry] = useState<CountryCode | undefined>()
  const [phoneError, setPhoneError] = useState<string | undefined>()

  // Show the stored number once it loads (and again after each save).
  useEffect(() => {
    setPhoneInput(savedParsed?.nationalNumber ?? '')
    setPhoneError(undefined)
  }, [savedParsed])

  const handlePhoneChange = useCallback((value: string) => {
    setPhoneInput(value)
    setPhoneError(undefined)
  }, [])
  const handlePhoneCountry = useCallback((iso: CountryCode) => setPhoneCountry(iso), [])

  const phoneResult = useMemo(() => {
    const raw = phoneInput.trim()
    if (!raw) return { valid: true, value: null as string | null }
    const parsed = parsePhoneNumberFromString(raw, phoneCountry)
    return parsed?.isValid() ? { valid: true, value: parsed.number as string } : { valid: false, value: null }
  }, [phoneInput, phoneCountry])

  const regionDirty = !!user && (region.country !== (user.country ?? '') || region.state !== (user.state ?? ''))
  // Not dirty until the saved value has loaded, so an empty form can never overwrite it.
  const phoneDirty = !isLoadingDetails && (!phoneResult.valid || phoneResult.value !== savedPhone)
  const isDirty = regionDirty || phoneDirty
  const isSaving = isSavingProfile || isSavingDetails

  const handleSave = async () => {
    if (!user || !isDirty || isSaving) return

    if (phoneDirty && !phoneResult.valid) {
      setPhoneError('Enter a valid phone number for the selected country.')
      return
    }

    const tasks: Promise<unknown>[] = []

    if (regionDirty) {
      const payload: UpdateProfileInput = {}
      if (region.country !== (user.country ?? '')) {
        payload.country = region.country || null
        // The stored city belongs to the old country — don't leave "Ashburn, Nigeria".
        payload.city = null
      }
      if (region.state !== (user.state ?? '')) payload.state = region.state.trim() || null
      tasks.push(saveProfile(payload))
    }

    if (phoneDirty) tasks.push(saveDetails({ phone_number: phoneResult.value }))

    // Each mutation reports its own success/failure toast.
    await Promise.allSettled(tasks)
  }

  return (
    <div className='flex w-full flex-col bg-white lg:h-full lg:min-h-0 lg:overflow-hidden lg:rounded-2xl lg:border lg:border-gray-50'>
      {/* Topbar */}
      <div className='sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-gray-50 bg-white px-4 max-lg:pb-4 max-lg:pt-6 lg:static lg:px-8 lg:py-4'>
        <div className='flex items-center gap-2'>
          <button onClick={goBack} className='cursor-pointer lg:hidden'>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <mask id="path-1-inside-1_10796_3029" fill="white">
                <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z"/>
              </mask>
              <path d="M0 20M40 20M40 20M0 20M20 0M40 20M20 40M0 20M20 40V38C10.0589 38 2 29.9411 2 20H0H-2C-2 32.1503 7.84974 42 20 42V40ZM40 20H38C38 29.9411 29.9411 38 20 38V40V42C32.1503 42 42 32.1503 42 20H40ZM20 0V2C29.9411 2 38 10.0589 38 20H40H42C42 7.84974 32.1503 -2 20 -2V0ZM20 0V-2C7.84974 -2 -2 7.84974 -2 20H0H2C2 10.0589 10.0589 2 20 2V0Z" fill="#E6E8EB" mask="url(#path-1-inside-1_10796_3029)"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M30 20C30 25.5228 25.5228 30 20 30C14.4772 30 10 25.5228 10 20C10 14.4772 14.4772 10 20 10C25.5228 10 30 14.4772 30 20ZM16.9696 16.9696C17.2625 16.6768 17.7374 16.6768 18.0303 16.9696L20 18.9393L21.9696 16.9697C22.2625 16.6768 22.7374 16.6768 23.0303 16.9697C23.3232 17.2626 23.3232 17.7374 23.0303 18.0303L21.0606 20L23.0303 21.9696C23.3232 22.2625 23.3232 22.7374 23.0303 23.0303C22.7374 23.3232 22.2625 23.3232 21.9696 23.0303L20 21.0607L18.0303 23.0303C17.7374 23.3232 17.2625 23.3232 16.9696 23.0303C16.6768 22.7374 16.6768 22.2625 16.9696 21.9697L18.9393 20L16.9696 18.0303C16.6767 17.7374 16.6767 17.2625 16.9696 16.9696Z" fill="#525965"/>
            </svg>
          </button>
          <h5 className='max-lg:font-poppins lg:font-raleway font-medium lg:font-semibold max-lg:text-body-s lg:text-h5 text-body lg:text-primary-500 leading-10 tracking-wide'>Account Details</h5>
        </div>
        <Button size='sm' className='rounded-2xl max-lg:w-20 max-lg:h-10 max-lg:text-body-xs' onClick={handleSave} isLoading={isSaving} loadingText='Saving…' disabled={!isDirty || isSaving}>
          Save
        </Button>
      </div>

      <div className='flex flex-col gap-y-16 px-4 pb-16 pt-8 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:px-8 lg:pb-8 scrollbar-hide'>
        <ContactSection
          email={user!.email}
          country={region.country}
          state={region.state}
          onLocationChange={handleLocationChange}
          phone={{
            value: phoneInput,
            onChange: handlePhoneChange,
            onCountryChange: handlePhoneCountry,
            defaultCountry: savedParsed?.country,
            remountKey: savedParsed?.country ?? 'none',
            error: phoneError,
            disabled: isLoadingDetails,
          }}
        />
        <ConnectedAccount user={user!} />
      </div>
    </div>
  )
}

export default AccountDetails
