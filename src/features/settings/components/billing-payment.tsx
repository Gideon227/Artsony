'use client'

import { Button, Input } from '@/components'
import { Dropdown, DropdownOption } from '@/components/ui/dropdown'
import { useToast } from '@/components/ui/toaster'
import { usePrivateDetails, useUpdatePrivateDetails } from '@/hooks/use-private-details'
import { getCountryName, useCountryOptions, useStateOptions } from '@/hooks/use-location-data'
import Link from 'next/link'
import React, { useEffect, useMemo, useState } from 'react'

type BillingDraft = {
    address: string
    country: string // ISO 3166-1 alpha-2
    city: string
    state: string
    postalCode: string
}

type BillingErrors = Partial<Record<keyof BillingDraft, string>>

const EMPTY_BILLING: BillingDraft = { address: '', country: '', city: '', state: '', postalCode: '' }

const BillingPayment = ({ goBack }: { goBack?: () => void }) => {
    const { error: toastError } = useToast()
    const { data: details, isLoading: isLoadingDetails } = usePrivateDetails()
    const { mutateAsync: saveDetails, isPending: isSaving } = useUpdatePrivateDetails()
    const { countries, isLoading: isLoadingCountries } = useCountryOptions()

    // What's stored. The form edits a local draft on top of it; the draft is
    // dropped as soon as it matches the server again (e.g. right after a save).
    const server = useMemo<BillingDraft>(
        () =>
            details
                ? {
                      address: details.billing_address ?? '',
                      country: details.billing_country_code ?? '',
                      city: details.billing_city ?? '',
                      state: details.billing_state ?? '',
                      postalCode: details.billing_postal_code ?? '',
                  }
                : EMPTY_BILLING,
        [details],
    )
    const [draft, setDraft] = useState<BillingDraft | null>(null)
    const [errors, setErrors] = useState<BillingErrors>({})

    const value = draft ?? server
    const isDirty = draft !== null && (Object.keys(server) as Array<keyof BillingDraft>).some((k) => draft[k] !== server[k])

    useEffect(() => {
        if (draft && !isDirty) setDraft(null)
    }, [draft, isDirty])

    const update = (patch: Partial<BillingDraft>) => {
        setDraft((prev) => ({ ...(prev ?? server), ...patch }))
        setErrors((prev) => {
            const next = { ...prev }
            for (const key of Object.keys(patch) as Array<keyof BillingDraft>) delete next[key]
            return next
        })
    }

    const countryName = value.country
        ? (countries.find((c) => c.code === value.country)?.name ?? getCountryName(value.country))
        : undefined
    const { states, isLoading: isLoadingStates } = useStateOptions(countryName)

    const countryOptions = useMemo<DropdownOption[]>(
        () => countries.map((c) => ({ id: c.code, label: c.name })),
        [countries],
    )
    const stateOptions = useMemo<DropdownOption[]>(
        () => states.map((name) => ({ id: name, label: name })),
        [states],
    )
    const selectedCountry = useMemo<DropdownOption | undefined>(() => {
        if (!value.country) return undefined
        return countryOptions.find((o) => o.id === value.country) ?? { id: value.country, label: getCountryName(value.country) ?? value.country }
    }, [countryOptions, value.country])
    const selectedState = useMemo<DropdownOption | undefined>(
        () => (value.state ? { id: value.state, label: value.state } : undefined),
        [value.state],
    )

    const handleSave = async () => {
        if (!isDirty || isSaving) return

        const next = {
            address: value.address.trim(),
            country: value.country,
            city: value.city.trim(),
            state: value.state.trim(),
            postalCode: value.postalCode.trim(),
        }

        // A fully blank form means "remove my billing address". Otherwise the
        // core fields must all be present — a half-saved address is useless.
        const isBlank = Object.values(next).every((v) => v === '')
        const found: BillingErrors = {}
        if (!isBlank) {
            if (!next.address) found.address = 'Address is required'
            if (!next.country) found.country = 'Country is required'
            if (!next.city) found.city = 'City/Town is required'
            if (!next.postalCode) found.postalCode = 'Postal code is required'
        }
        setErrors(found)
        if (Object.keys(found).length > 0) {
            toastError('Check the highlighted fields', 'Some required details are missing.')
            return
        }

        try {
            await saveDetails({
                billing_address: next.address || null,
                billing_country_code: next.country || null,
                billing_city: next.city || null,
                billing_state: next.state || null,
                billing_postal_code: next.postalCode || null,
            })
            setDraft(null)
        } catch {
            // The mutation already showed its own error toast; keep the draft so nothing is lost.
        }
    }

    return (
        <div className='flex w-full flex-col bg-white lg:h-full lg:min-h-0 lg:overflow-hidden lg:rounded-2xl lg:border lg:border-gray-50'>
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
                    <h5 className='max-lg:font-poppins lg:font-raleway font-medium lg:font-semibold max-lg:text-body-s lg:text-h5 text-body lg:text-primary-500 leading-10 tracking-wide'>Billings & Payments</h5>
                </div>
                <Button
                    size='sm'
                    className='rounded-2xl max-lg:w-20 max-lg:h-10 max-lg:text-body-xs'
                    onClick={handleSave}
                    isLoading={isSaving}
                    loadingText='Saving…'
                    disabled={!isDirty || isSaving}
                >
                    Save
                </Button>
            </div>

            <div className='flex flex-col gap-y-16 px-4 pb-16 pt-8 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:px-8 lg:pb-8 scrollbar-hide'>
                <div className='flex flex-col gap-y-6'>
                    <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>Connected Accounts (Social login)</p>

                    <div className='bg-secondary-50 p-6 gap-y-2 flex flex-col rounded-xl'>
                        <label className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>
                            MoonPay Wallet (<span className='text-successful-500'>Connected</span>)
                        </label>
                        <p className='font-poppins text-body text-body-xs tracking-wide'>
                            Your MoonPay account handles payments, payouts, and currency conversion securely on Artsony.{' '}
                            <Link href='/' className='text-primary-500'>Manage on MoonPay</Link>
                        </p>
                        <Input
                            placeholder='forexample@gmail.com'
                            onChange={() => {}}
                            rightIcon='/icons/link.svg'
                            leftIcon='/socials/moonpay.svg'
                        />
                    </div>
                </div>

                <div className='flex flex-col gap-y-6'>
                    <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>Billing Address</p>

                    <div className='bg-secondary-50 p-6 gap-y-4 flex flex-col rounded-xl w-full'>
                        <Input
                            placeholder='Address'
                            aria-label='Address'
                            autoComplete='street-address'
                            className='w-full'
                            maxLength={300}
                            value={value.address}
                            onChange={(e) => update({ address: e.target.value })}
                            error={errors.address}
                            disabled={isLoadingDetails}
                        />

                        {/* Country Dropdown */}
                        <div className='flex flex-col gap-y-1.5'>
                            <Dropdown
                                options={countryOptions}
                                value={selectedCountry}
                                onChange={(opt) => update({ country: String(opt.id), state: '' })}
                                indicator='checkmark'
                                searchable={true}
                                searchPlaceholder='Search country'
                                isLoading={isLoadingCountries}
                                disabled={isLoadingDetails}
                                variant={errors.country ? 'error' : 'default'}
                                emptyMessage='No matching countries'
                                placeholder='Country'
                            />
                            {errors.country && <p className='pl-4 text-xs font-semibold text-error-500'>{errors.country}</p>}
                        </div>

                        <Input
                            placeholder='City/Town'
                            aria-label='City or town'
                            autoComplete='address-level2'
                            className='w-full'
                            maxLength={100}
                            value={value.city}
                            onChange={(e) => update({ city: e.target.value })}
                            error={errors.city}
                            disabled={isLoadingDetails}
                        />

                        {/* State & Postal Code Row */}
                        <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_192px] gap-4 items-start">
                            <Dropdown
                                options={stateOptions}
                                value={selectedState}
                                onChange={(opt) => update({ state: String(opt.id) })}
                                indicator="checkmark"
                                searchable={true}
                                searchPlaceholder="Search state/province"
                                isLoading={isLoadingStates}
                                disabled={!value.country || isLoadingDetails}
                                emptyMessage={value.country ? "No matching states found" : "Select a country first"}
                                placeholder={value.country ? "State/Province" : "State/Province (Select country first)"}
                                className="w-full min-w-0"
                            />
                            <Input
                                placeholder="Postal Code"
                                aria-label='Postal code'
                                autoComplete='postal-code'
                                className="w-full"
                                maxLength={20}
                                value={value.postalCode}
                                onChange={(e) => update({ postalCode: e.target.value })}
                                error={errors.postalCode}
                                disabled={isLoadingDetails}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BillingPayment