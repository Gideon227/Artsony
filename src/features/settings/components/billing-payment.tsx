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
            <div className='px-8 py-4 flex justify-between items-center border-b border-gray-50 '>
                <h5 className='font-raleway font-semibold text-h5 text-primary-500 leading-10 tracking-wide'>Billing & Payments</h5>
                <Button size='md' onClick={() => {}}>Send</Button>
            </div>

            <div className='py-12 px-8 overflow-y-scroll gap-y-16 flex flex-col' style={{ gap: 64 }}>
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
                        <div className="w-full grid grid-cols-[1fr_192px] gap-4 items-center">
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