import { Button, Input } from '@/components'
import { Dropdown, DropdownOption } from '@/components/ui/dropdown'
import Image from 'next/image'
import React, { useState, useEffect } from 'react'

const ShippingLocation = () => {
    // 1. Consolidated state architecture for all form fields
    const [formData, setFormData] = useState({
        // Primary Account Location
        primaryCountry: null as DropdownOption | null,
        primaryState: null as DropdownOption | null,

        // Delivery Address Details
        deliveryAddress: '',
        deliveryCountry: null as DropdownOption | null,
        deliveryCity: '',
        deliveryState: null as DropdownOption | null,
        deliveryPostalCode: '',

        // Shipping Origin Details
        isAutoShipping: false,
        shippingAddress: '',
        shippingCountry: null as DropdownOption | null,
        shippingCity: '',
        shippingState: null as DropdownOption | null,
        shippingPostalCode: '',
    })

    // 2. State hooks for tracking lookup data and async loading spinners
    const [globalCountries, setGlobalCountries] = useState<DropdownOption[]>([])
    const [primaryStates, setPrimaryStates] = useState<DropdownOption[]>([])
    const [deliveryStates, setDeliveryStates] = useState<DropdownOption[]>([])
    const [shippingStates, setShippingStates] = useState<DropdownOption[]>([])

    const [isLoadingCountries, setIsLoadingCountries] = useState(false)
    const [loadingStates, setLoadingStates] = useState({ primary: false, delivery: false, shipping: false })

    // 3. Fetch global country dataset on layout mount
    useEffect(() => {
        const fetchCountries = async () => {
            setIsLoadingCountries(true)
            try {
                const response = await fetch('https://countriesnow.space/api/v0.1/countries')
                const resData = await response.json()
                if (!resData.error) {
                    const mapped: DropdownOption[] = resData.data.map((item: any) => ({
                        id: item.country,
                        label: item.country,
                    }))
                    setGlobalCountries(mapped)
                }
            } catch (err) {
                console.error('Failed to parse country options data:', err)
            } finally {
                setIsLoadingCountries(false)
            }
        }
        fetchCountries()
    }, [])

    // Helper handler to process nested state API resolutions
    const fetchStatesForCountry = async (countryName: string, setStatesPool: React.Dispatch<React.SetStateAction<DropdownOption[]>>, sectionKey: 'primary' | 'delivery' | 'shipping') => {
        setLoadingStates(prev => ({ ...prev, [sectionKey]: true }))
        try {
            const response = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ country: countryName })
            })
            const resData = await response.json()
            if (!resData.error && resData.data?.states) {
                const mapped: DropdownOption[] = resData.data.states.map((st: any, i: number) => ({
                    id: st.state_code || `${st.name}-${i}`,
                    label: st.name
                }))
                setStatesPool(mapped)
            } else {
                setStatesPool([])
            }
        } catch (err) {
            console.error(`Failed resolving regional options for ${countryName}:`, err)
            setStatesPool([])
        } finally {
            setLoadingStates(prev => ({ ...prev, [sectionKey]: false }))
        }
    }

    // 4. Side Effects to handle dependent state lookups when a country field changes
    useEffect(() => {
        if (formData.primaryCountry) {
            fetchStatesForCountry(formData.primaryCountry.label, setPrimaryStates, 'primary')
        } else {
            setPrimaryStates([])
        }
    }, [formData.primaryCountry])

    useEffect(() => {
        if (formData.deliveryCountry) {
            fetchStatesForCountry(formData.deliveryCountry.label, setDeliveryStates, 'delivery')
        } else {
            setDeliveryStates([])
        }
    }, [formData.deliveryCountry])

    useEffect(() => {
        if (formData.shippingCountry) {
            fetchStatesForCountry(formData.shippingCountry.label, setShippingStates, 'shipping')
        } else {
            setShippingStates([])
        }
    }, [formData.shippingCountry])

    // Input string update handlers
    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const clearDeliveryForm = () => {
        setFormData(prev => ({
            ...prev,
            deliveryAddress: '',
            deliveryCountry: null,
            deliveryCity: '',
            deliveryState: null,
            deliveryPostalCode: '',
        }))
    }

    // Auto location IP lookups for shipping parameters
    const handleToggleAutoShipping = async () => {
        const nextMode = !formData.isAutoShipping
        if (nextMode) {
            try {
                const response = await fetch('https://ipapi.co/json/')
                const data = await response.json()
                if (data && !data.error) {
                    setFormData(prev => ({
                        ...prev,
                        isAutoShipping: nextMode,
                        shippingCountry: data.country_name ? { id: data.country_name, label: data.country_name } : null,
                        shippingState: data.region ? { id: data.region, label: data.region } : null,
                        shippingCity: data.city || '',
                    }))
                }
            } catch (err) {
                console.error('IP metadata resolution failure:', err)
            }
        } else {
            setFormData(prev => ({
                ...prev,
                isAutoShipping: nextMode,
                shippingAddress: '',
                shippingCountry: null,
                shippingCity: '',
                shippingState: null,
                shippingPostalCode: '',
            }))
        }
    }

    return (
        <div className='border border-gray-50 rounded-2xl bg-white w-full'>
            {/* Main Section Header */}
            <div className='px-8 py-4 flex justify-between items-center border-b border-gray-50'>
                <h5 className='font-raleway font-semibold text-h5 text-primary-500 leading-10 tracking-wide'>Shipping & Location</h5>
                <Button size='sm' onClick={() => console.log('Saving profile location configuration:', formData)}>Save</Button>
            </div>

            {/* Scroll Container Form Core */}
            <div className='pt-12 px-8 overflow-y-scroll gap-y-16 flex flex-col pb-12' style={{ gap: 64 }}>
                
                {/* SECTION 1: ACCOUNT COMPLIANCE LOCATION */}
                <div className='flex flex-col gap-y-6'>
                    <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>Location</p>
                    <p className='font-poppins text-body-xs leading-5 tracking-wide text-text-disabled text-left'>
                        This is your primary country and region on Artsony. It&apos;s used for compliance, payouts, and platform features — not for shipping.
                    </p>

                    {/* ✨ FIXED: Added flex flex-col to enable functional layout gaps */}
                    <div className='bg-secondary-50 p-6 gap-y-4 rounded-xl flex flex-col'>
                        <Dropdown 
                            placeholder={isLoadingCountries ? 'Loading global destinations...' : 'Select Country'} 
                            options={globalCountries}
                            value={formData.primaryCountry || undefined}
                            onChange={(opt) => setFormData(prev => ({ ...prev, primaryCountry: opt, primaryState: null }))}
                            disabled={isLoadingCountries}
                        />
                        <Dropdown 
                            placeholder={
                                loadingStates.primary 
                                    ? 'Loading sub-regions...' 
                                    : !formData.primaryCountry ? 'Select country first' : 'Select State / Province'
                            } 
                            options={primaryStates}
                            value={formData.primaryState || undefined}
                            onChange={(opt) => setFormData(prev => ({ ...prev, primaryState: opt }))}
                            disabled={loadingStates.primary || !formData.primaryCountry}
                        />
                    </div>
                </div>

                {/* SECTION 2: DELIVERY SHIPPING TARGET */}
                <div className='flex flex-col gap-y-6'>
                    <div className='flex items-center justify-between w-full'>
                        <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>Delivery Address</p>
                        <button 
                            type="button"
                            onClick={clearDeliveryForm}
                            className='border border-gray-50 rounded-full p-2 cursor-pointer hover:bg-gray-50 transition-colors'
                        >
                            <Image src='/icons/trash-grey.svg' width={18} height={20} alt='delete icon' />
                        </button>
                    </div>

                    <p className='font-poppins text-body-xs leading-5 tracking-wide text-text-disabled text-left'>
                        Used only for delivering physical artworks. You can save and manage addresses anytime.
                    </p>

                    {/* ✨ FIXED: Added flex flex-col to activate layout grid alignment */}
                    <div className='bg-secondary-50 p-6 gap-y-4 rounded-xl flex flex-col'>
                        <Input 
                            placeholder='Address' 
                            value={formData.deliveryAddress}
                            onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                        />
                        <Dropdown 
                            placeholder={isLoadingCountries ? 'Loading global destinations...' : 'Select Country'} 
                            options={globalCountries}
                            value={formData.deliveryCountry || undefined}
                            onChange={(opt) => setFormData(prev => ({ ...prev, deliveryCountry: opt, deliveryState: null }))}
                            disabled={isLoadingCountries}
                        />
                        <Input 
                            placeholder='City / Town' 
                            value={formData.deliveryCity}
                            onChange={(e) => handleInputChange('deliveryCity', e.target.value)}
                        />
                        <div className='w-full flex gap-x-4 items-center'>
                            <div className="w-3/4">
                                <Dropdown 
                                    placeholder={
                                        loadingStates.delivery 
                                            ? 'Loading...' 
                                            : !formData.deliveryCountry ? 'Select country' : 'State / Province'
                                    } 
                                    options={deliveryStates}
                                    value={formData.deliveryState || undefined}
                                    onChange={(opt) => setFormData(prev => ({ ...prev, deliveryState: opt }))}
                                    disabled={loadingStates.delivery || !formData.deliveryCountry}
                                /> 
                            </div>
                            <Input 
                                placeholder='Postal Code' 
                                className='w-1/4' 
                                value={formData.deliveryPostalCode}
                                onChange={(e) => handleInputChange('deliveryPostalCode', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* SECTION 3: SELLER INVENTORY DISPATCH ORIGIN */}
                <div className='flex flex-col gap-y-6'>
                    <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>Shipping Address</p>
                    
                    {/* Switch Toggle Row Container */}
                    <div className='flex items-center justify-between w-full bg-gray-50 p-4 rounded-xl gap-x-6'>
                        <div className="flex flex-col gap-y-1 max-w-[80%] text-left">
                            <p className='font-poppins font-medium text-body-xs leading-6 tracking-wide text-heading'>Set Automatically by location</p>
                            <p className='font-poppins text-body-xs leading-4 tracking-wide text-text-disabled'>
                                Make sure this address matches where your artworks are stored. It&apos;s used to generate shipping labels and pickup requests.
                            </p>
                        </div>
                        {/* Interactive UI Switch Element */}
                        <button
                            type="button"
                            onClick={handleToggleAutoShipping}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-2xl transition-colors duration-200 focus:outline-none border border-primary-500 ${
                                formData.isAutoShipping ? 'bg-primary-500' : 'bg-white'
                            }`}
                        >
                            <span
                                className={`inline-block transform rounded-full transition-transform duration-300 ease-in-out ${
                                    formData.isAutoShipping ? 'translate-x-6 bg-white' : 'translate-x-1 bg-primary-500'
                                }`}
                                style={{ width: 18, height: 18 }}
                            />
                        </button>
                    </div>

                    {/* ✨ FIXED: Added flex flex-col to secure inner inputs formatting flow */}
                    <div className='bg-secondary-50 p-6 gap-y-4 rounded-xl flex flex-col'>
                        <Input 
                            placeholder='Address' 
                            value={formData.shippingAddress}
                            onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
                            disabled={formData.isAutoShipping}
                        />
                        <Dropdown 
                            placeholder={isLoadingCountries ? 'Loading global destinations...' : 'Select Country'} 
                            options={globalCountries}
                            value={formData.shippingCountry || undefined}
                            onChange={(opt) => setFormData(prev => ({ ...prev, shippingCountry: opt, shippingState: null }))}
                            disabled={formData.isAutoShipping || isLoadingCountries}
                        />
                        <Input 
                            placeholder='City / Town' 
                            value={formData.shippingCity}
                            onChange={(e) => handleInputChange('shippingCity', e.target.value)}
                            disabled={formData.isAutoShipping}
                        />
                        <div className='w-full flex gap-x-4 items-center'>
                            <div className="w-3/4">
                                <Dropdown 
                                    placeholder={
                                        loadingStates.shipping 
                                            ? 'Loading...' 
                                            : !formData.shippingCountry ? 'Select country' : 'State / Province'
                                    } 
                                    options={shippingStates}
                                    value={formData.shippingState || undefined}
                                    onChange={(opt) => setFormData(prev => ({ ...prev, shippingState: opt }))}
                                    disabled={formData.isAutoShipping || loadingStates.shipping || !formData.shippingCountry}
                                /> 
                            </div>
                            <Input 
                                placeholder='Postal Code' 
                                className='w-1/4' 
                                value={formData.shippingPostalCode}
                                onChange={(e) => handleInputChange('shippingPostalCode', e.target.value)}
                                disabled={formData.isAutoShipping}
                            />
                        </div>
                    </div>
                </div>                
            </div>
        </div>
    )
}

export default ShippingLocation