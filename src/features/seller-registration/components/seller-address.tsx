'use client'

import React, { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button, Input } from '@/components'
import { CountryField, StateField } from '@/components/forms/location-fields'
import { useToast } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'
import { EMPTY_ADDRESS, type SellerAddressValues } from '../types'

const IP_LOOKUP_URL = 'https://ipapi.co/json/'

type AddressErrors = Partial<Record<keyof SellerAddressValues, string>>

interface SellerAddressProps {
    defaultValues?: SellerAddressValues
    onBack: () => void
    onNext: (values: SellerAddressValues) => void
}

function validate(values: SellerAddressValues): AddressErrors {
    const errors: AddressErrors = {}
    if (values.address.trim().length < 3) errors.address = 'Address is required'
    if (!values.country) errors.country = 'Country is required'
    if (!values.state.trim()) errors.state = 'State/Province is required'
    if (!values.postalCode.trim()) errors.postalCode = 'Postal code is required'
    return errors
}

const SellerAddress = ({ defaultValues, onBack, onNext }: SellerAddressProps) => {
    const { error: toastError } = useToast()
    const [values, setValues] = useState<SellerAddressValues>(defaultValues ?? EMPTY_ADDRESS)
    const [errors, setErrors] = useState<AddressErrors>({})
    const [isAutoLocation, setIsAutoLocation] = useState(false)
    const [isDetectingLocation, setIsDetectingLocation] = useState(false)

    const update = (patch: Partial<SellerAddressValues>) => {
        setValues((prev) => ({ ...prev, ...patch }))
        setErrors((prev) => {
            const next = { ...prev }
            for (const key of Object.keys(patch) as Array<keyof SellerAddressValues>) delete next[key]
            return next
        })
    }

    const handleToggleLocation = async () => {
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

            update({
                country: data.country_code.toUpperCase(),
                state: data.region ?? '',
                city: data.city ?? '',
                postalCode: data.postal ?? '',
            })
            setIsAutoLocation(true)
        } catch {
            toastError('Could not detect location', 'Enter your fulfilment address manually or try again.')
        } finally {
            setIsDetectingLocation(false)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const nextErrors = validate(values)
        setErrors(nextErrors)
        if (Object.keys(nextErrors).length > 0) return

        onNext({
            address: values.address.trim(),
            country: values.country,
            state: values.state.trim(),
            city: values.city.trim(),
            postalCode: values.postalCode.trim(),
        })
    }

    const lockLocation = isAutoLocation || isDetectingLocation

    return (
        <form
            onSubmit={handleSubmit}
            noValidate
            className='mx-auto w-full max-w-[912px] border border-gray-50 rounded-2xl px-4 py-8 sm:px-8 sm:py-12 lg:px-14 lg:py-16 flex flex-col items-center justify-center gap-y-10 lg:gap-y-14'
        >
            <div className='flex flex-col items-center justify-center gap-y-8 w-full'>
                <div className='flex flex-col gap-y-2 items-center w-full'>
                    <div className='flex w-full items-center justify-between gap-x-3'>
                        <p className='font-poppins font-medium text-body-s leading-6 tracking-wide text-heading'>
                            {isDetectingLocation ? 'Detecting your location...' : 'Set Automatically by location'}
                        </p>
                        <button
                            type='button'
                            role='switch'
                            aria-checked={isAutoLocation}
                            aria-label='Set fulfilment address automatically by location'
                            disabled={isDetectingLocation}
                            onClick={handleToggleLocation}
                            className={cn(
                                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-2xl border border-primary-500 transition-colors duration-200',
                                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
                                'disabled:cursor-wait disabled:opacity-60',
                                isAutoLocation ? 'bg-primary-500' : 'bg-white',
                            )}
                        >
                            <span
                                className={cn(
                                    'inline-flex transform items-center justify-center rounded-full transition-transform duration-300 ease-in-out',
                                    isAutoLocation ? 'translate-x-6 bg-white' : 'translate-x-1 bg-primary-500',
                                )}
                                style={{ width: 18, height: 18 }}
                            >
                                {isDetectingLocation && <Loader2 className='size-3 animate-spin text-white' />}
                            </span>
                        </button>
                    </div>
                    <p className='font-poppins text-text-disabled text-body-xs leading-4 tracking-wide text-start w-full'>
                        Make sure this address matches where your artworks are stored. It&apos;s used to generate shipping labels and pickup requests.
                    </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-start'>
                    <div className='flex flex-col gap-y-2'>
                        <label htmlFor='seller-address' className='font-poppins font-medium text-body-s text-heading tracking-wide'>Address</label>
                        <Input
                            id='seller-address'
                            value={values.address}
                            onChange={(e) => update({ address: e.target.value })}
                            placeholder='Enter Address'
                            autoComplete='street-address'
                            maxLength={300}
                            className='flex-1'
                            error={errors.address}
                        />
                    </div>

                    <div className='flex flex-col gap-y-2'>
                        <span className='font-poppins font-medium text-body-s text-heading tracking-wide'>Country</span>
                        <CountryField
                            value={values.country}
                            onChange={(country) => update({ country, state: '', city: '' })}
                            placeholder='Select Country'
                            disabled={lockLocation}
                            error={errors.country}
                        />
                    </div>

                    <div className='flex flex-col gap-y-2'>
                        <span className='font-poppins font-medium text-body-s text-heading tracking-wide'>State/Province</span>
                        <StateField
                            country={values.country}
                            value={values.state}
                            onChange={(state) => update({ state, city: '' })}
                            placeholder={values.country ? 'Select State/Province' : 'Select country first'}
                            disabled={lockLocation}
                            error={errors.state}
                        />
                    </div>

                    <div className='flex flex-col gap-y-2'>
                        <label htmlFor='seller-postal' className='font-poppins font-medium text-body-s text-heading tracking-wide'>Postal Code</label>
                        <Input
                            id='seller-postal'
                            value={values.postalCode}
                            onChange={(e) => update({ postalCode: e.target.value })}
                            placeholder='Enter area code'
                            autoComplete='postal-code'
                            maxLength={20}
                            className='flex-1'
                            disabled={lockLocation}
                            error={errors.postalCode}
                        />
                    </div>
                </div>
            </div>

            <div className='flex flex-col-reverse sm:flex-row items-center justify-center gap-4 w-full'>
                <Button
                    type='button'
                    variant='outline'
                    size='lg'
                    onClick={onBack}
                    disabled={isDetectingLocation}
                    className='w-full sm:w-[168px] h-12'
                >
                    Back
                </Button>
                <Button
                    type='submit'
                    rightIcon='/icons/alt-arrow-right-double.svg'
                    size='lg'
                    disabled={isDetectingLocation}
                    className='w-full sm:w-[168px] h-12'
                >
                    Continue
                </Button>
            </div>
        </form>
    )
}

export default SellerAddress