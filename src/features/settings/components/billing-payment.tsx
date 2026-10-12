'use client'

import { Button, Input } from '@/components'
import { Dropdown, DropdownOption } from '@/components/ui/dropdown'
import Link from 'next/link'
import React, { useEffect, useMemo, useState } from 'react'

const BillingPayment = ({ goBack }: { goBack?: () => void }) => {
    const [countryQuery, setCountryQuery] = useState('')
    const [selectedCountry, setSelectedCountry] = useState<DropdownOption | null>(null)
    const [countries, setCountries] = useState<DropdownOption[]>([])
    const [isLoadingCountries, setIsLoadingCountries] = useState(false)

    // State / Province state variables
    const [stateQuery, setStateQuery] = useState('')
    const [selectedState, setSelectedState] = useState<DropdownOption | null>(null)
    const [states, setStates] = useState<DropdownOption[]>([])
    const [isLoadingStates, setIsLoadingStates] = useState(false)

    // Fetch Countries
    useEffect(() => {
        const fetchCountries = async () => {
            setIsLoadingCountries(true)
            try {
                const response = await fetch('https://countriesnow.space/api/v0.1/countries')
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
                const resData = await response.json()

                if (!resData.error && Array.isArray(resData.data)) {
                    const formattedCountries: DropdownOption[] = resData.data.map((item: { country: string }) => ({
                        id: item.country,
                        label: item.country,
                    }))
                    setCountries(formattedCountries)
                }
            } catch (error) {
                console.error('Failed to load countries selection table:', error)
            } finally {
                setIsLoadingCountries(false)
            }
        }

        fetchCountries()
    }, [])

    // Fetch States when Selected Country Changes
    useEffect(() => {
        if (!selectedCountry) {
            setStates([])
            setSelectedState(null)
            setStateQuery('')
            return
        }

        const fetchStates = async () => {
            setIsLoadingStates(true)
            setSelectedState(null)
            setStateQuery('')
            try {
                const response = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ country: selectedCountry.label }),
                })
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
                const resData = await response.json()

                if (!resData.error && resData.data?.states && Array.isArray(resData.data.states)) {
                    const formattedStates: DropdownOption[] = resData.data.states.map((item: { name: string }) => ({
                        id: item.name,
                        label: item.name,
                    }))
                    setStates(formattedStates)
                } else {
                    setStates([])
                }
            } catch (error) {
                console.error('Failed to load states:', error)
                setStates([])
            } finally {
                setIsLoadingStates(false)
            }
        }

        fetchStates()
    }, [selectedCountry])

    const countryOptions = useMemo(() => {
        if (!countryQuery.trim()) return countries
        const q = countryQuery.trim().toLowerCase()
        return countries.filter((c) => c.label.toLowerCase().includes(q))
    }, [countries, countryQuery])

    const stateOptions = useMemo(() => {
        if (!stateQuery.trim()) return states
        const q = stateQuery.trim().toLowerCase()
        return states.filter((s) => s.label.toLowerCase().includes(q))
    }, [states, stateQuery])

    return (
        <div className='lg:border lg:border-gray-50 lg:rounded-2xl lg:bg-white w-full lg:pb-8 pb-16'>
            <div className='lg:px-8 lg:py-4 px-4 max-lg:pb-4 max-lg:pt-6 flex justify-between items-center border-b border-gray-50 '>
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
                    // onClick={handleSave} 
                    // isLoading={isPending} 
                    loadingText='Saving…'
                >
                    Save
                </Button>
            </div>

            <div className='lg:py-12 py-6 px-4 lg:px-8 overflow-y-scroll gap-y-16 flex flex-col' style={{ gap: 64 }}>
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
                        <Input placeholder='Address' className='w-full' />
                        
                        {/* Country Dropdown */}
                        <Dropdown
                            options={countryOptions}
                            value={selectedCountry as DropdownOption}
                            onChange={(opt) => setSelectedCountry(opt)}
                            indicator='checkmark'
                            searchable={true}
                            searchPlaceholder='Search country'
                            searchValue={countryQuery}
                            onSearchChange={setCountryQuery}
                            isLoading={isLoadingCountries}
                            emptyMessage='No matching countries'
                            placeholder='Country'
                        />

                        <Input placeholder='City/Town' className='w-full' />

                        {/* State & Postal Code Row */}
                        <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_192px] gap-4 items-center">
                            <Dropdown
                                options={stateOptions}
                                value={selectedState as DropdownOption}
                                onChange={(opt) => setSelectedState(opt)}
                                indicator="checkmark"
                                searchable={true}
                                searchPlaceholder="Search state/province"
                                searchValue={stateQuery}
                                onSearchChange={setStateQuery}
                                isLoading={isLoadingStates}
                                disabled={!selectedCountry}
                                emptyMessage={selectedCountry ? "No matching states found" : "Select a country first"}
                                placeholder={selectedCountry ? "State/Province" : "State/Province (Select country first)"}
                                className="w-full min-w-0"
                            />
                            <Input placeholder="Postal Code" className="w-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BillingPayment