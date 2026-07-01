import { Button, Input } from '@/components'
import { Dropdown, DropdownOption } from '@/components/ui/dropdown'
import { PhoneInput } from '@/components/ui/phone-input'
import React, { useState, useEffect } from 'react'

const SellerAddress = ({ onNext }: { onNext: () => void }) => {
    // Form field states - country and  state now track full DropdownOption objects or null
    const [formData, setFormData] = useState({
        address: '',
        country: null as DropdownOption | null,
        state: null as DropdownOption | null,
        postalCode: '',
        isAutoLocation: false,
    })

    // Dropdown lists strongly typed using your UI types
    const [countries, setCountries] = useState<DropdownOption[]>([])
    const [states, setStates] = useState<DropdownOption[]>([])
    
    // UI Loading & Error States
    const [isLoadingCountries, setIsLoadingCountries] = useState(false)
    const [isLoadingStates, setIsLoadingStates] = useState(false)
    const [isDetectingLocation, setIsDetectingLocation] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    // 1. Fetch all countries on component mount
    useEffect(() => {
        const fetchCountries = async () => {
            setIsLoadingCountries(true)
            try {
                const response = await fetch('https://countriesnow.space/api/v0.1/countries')
                const resData = await response.json()
                
                if (!resData.error) {
                    const formattedCountries: DropdownOption[] = resData.data.map((item: any) => ({
                        id: item.country, 
                        label: item.country,
                    }))
                    setCountries(formattedCountries)
                }
            } catch (error) {
                console.error('Failed to fetch countries lookup table:', error)
                setErrors(prev => ({ ...prev, country: 'Failed to load countries list.' }))
            } finally {
                setIsLoadingCountries(false)
            }
        }

        fetchCountries()
    }, [])

    // 2. Fetch specific states/provinces dynamically when the selected country object updates
    useEffect(() => {
        if (!formData.country) {
            setStates([])
            return
        }

        const fetchStates = async () => {
            setIsLoadingStates(true)
            try {
                const response = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ country: formData?.country?.label }) 
                })
                const resData = await response.json()

                if (!resData.error && resData.data?.states) {
                    const formattedStates: DropdownOption[] = resData.data.states.map((state: any, index: number) => ({
                        id: state.state_code || `${state.name}-${index}`, 
                        label: state.name
                    }))
                    setStates(formattedStates)
                } else {
                    setStates([])
                }
            } catch (error) {
                console.error('Failed to resolve target regional states:', error)
                setStates([])
            } finally {
                setIsLoadingStates(false)
            }
        }

        fetchStates()
    }, [formData.country])

    // Handler for standard string inputs (Address, Postal Code)
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }))
        }
    }

    // Typed handler specifically for your Dropdown components
    const handleDropdownChange = (name: 'country' | 'state', option: DropdownOption) => {
        setFormData((prev) => {
            const updated = { ...prev, [name]: option }
            if (name === 'country') {
                updated.state = null
            }
            return updated
        })
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }))
        }
    }

    // Dynamic Live IP address parser and locator config
    const handleToggleLocation = async () => {
        const nextValue = !formData.isAutoLocation
        setErrors({})

        if (nextValue) {
            setIsDetectingLocation(true)
            try {
                // Fetch location metadata by checking user's public IP address
                const response = await fetch('https://ipapi.co/json/')
                const data = await response.json()
                
                if (data && !data.error) {
                    setFormData((prev) => ({
                        ...prev,
                        isAutoLocation: nextValue,
                        address: data.city || '', 
                        country: data.country_name ? { id: data.country_name, label: data.country_name } : null,
                        state: data.region ? { id: data.region_code || data.region, label: data.region } : null,
                        postalCode: data.postal || '',
                    }))
                } else {
                    throw new Error("Location data fallback initialized")
                }
            } catch (error) {
                console.error('IP address mapping routing breakdown:', error)
                setErrors(prev => ({ ...prev, address: 'Auto-location failed. Please enter manually.' }))
                setFormData((prev) => ({ ...prev, isAutoLocation: false }))
            } finally {
                setIsDetectingLocation(false)
            }
        } else {
            // Clear location values completely if toggle is switched off
            setFormData((prev) => ({ 
                ...prev, 
                isAutoLocation: nextValue, 
                address: '',
                country: null, 
                state: null,
                postalCode: ''
            }))
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}
        if (!formData.address.trim()) newErrors.address = 'Address is required'
        if (!formData.country) newErrors.country = 'Country is required'
        if (!formData.state) newErrors.state = 'State/Province is required'
        if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) return

        setIsSubmitting(true)
        
        const submissionPayload = {
            address: formData.address,
            country: formData.country?.label || '',
            state: formData.state?.label || '',
            postalCode: formData.postalCode,
        }

        try {
            await new Promise((resolve) => setTimeout(resolve, 1200))
            console.log('Successfully saved profile payload:', submissionPayload)
        } catch (error) {
            console.error('Failed to sync changes:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form 
            onSubmit={handleSubmit} 
            className='mx-auto border border-gray-50 rounded-2xl py-16 px-14 flex flex-col items-center justify-center gap-y-14 max-w-4xl'
            style={{ paddingBlock: 64, paddingInline: 56, width: 912 }}
        >
            <div className='flex flex-col items-center justify-center gap-y-8 w-full'>
                
                {/* Geolocation Switch Header */}
                <div className='flex flex-col gap-y-2 items-center w-full'>
                    <div className='flex w-full items-center justify-between gap-x-3'>
                        <p className='font-poppins font-medium text-body-s leading-6 tracking-wide text-heading'>
                            {isDetectingLocation ? 'Detecting your location...' : 'Set Automatically by location'}
                        </p>
                        <button
                            type="button"
                            disabled={isDetectingLocation}
                            onClick={handleToggleLocation}
                            className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-2xl transition-colors duration-200 focus:outline-none border border-primary-500 ${
                                formData.isAutoLocation ? 'bg-primary-500' : 'bg-white'
                            } ${isDetectingLocation ? 'opacity-50 cursor-wait' : ''}`}
                        >
                            <span
                                className={`inline-block transform rounded-full transition-transform duration-300 ease-in-out ${
                                    formData.isAutoLocation ? 'translate-x-6 bg-white' : 'translate-x-1 bg-primary-500'
                                }`}
                                style={{ width: 18, height: 18 }}
                            />
                        </button>
                    </div>
                    <p className='font-poppins text-text-disabled text-body-xs leading-4 tracking-wide text-start'>
                        Make sure this address matches where your artworks are stored. It&apos;s used to generate shipping labels and pickup requests.
                    </p>
                </div>

                {/* Input Fields Layout Container */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-start'>
                    
                    {/* Address Field */}
                    <div className='flex flex-col gap-y-2'>
                        <label className='font-poppins font-medium text-body-s text-heading tracking-wide'>Address</label>
                        <Input 
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder={isDetectingLocation ? 'Locating...' : 'Enter Address'} 
                            className='flex-1'
                            disabled={formData.isAutoLocation || isDetectingLocation}
                        />
                        {errors.address && <p className="text-red-500 text-xs mt-1 font-poppins">{errors.address}</p>}
                    </div>

                    {/* Country Field Dropdown */}
                    <div className='flex flex-col gap-y-2'>
                        <label className='font-poppins font-medium text-body-s text-heading tracking-wide'>Country</label>
                        <Dropdown 
                            options={countries}
                            value={formData.country || undefined}
                            onChange={(option) => handleDropdownChange('country', option)}
                            placeholder={isLoadingCountries ? 'Loading countries...' : 'Select Country'}
                            className='flex-1'
                            disabled={formData.isAutoLocation || isLoadingCountries || isDetectingLocation}
                        />
                        {errors.country && <p className="text-red-500 text-xs mt-1 font-poppins">{errors.country}</p>}
                    </div>

                    {/* State/Province Field Dropdown */}
                    <div className='flex flex-col gap-y-2'>
                        <label className='font-poppins font-medium text-body-s text-heading tracking-wide'>State/Province</label>
                        <Dropdown 
                            options={states}
                            value={formData.state || undefined}
                            onChange={(option) => handleDropdownChange('state', option)}
                            placeholder={
                                isLoadingStates 
                                    ? 'Loading regions...' 
                                    : !formData.country 
                                    ? 'Select country first' 
                                    : 'Select State/Province'
                            }
                            className='flex-1'
                            disabled={formData.isAutoLocation || isLoadingStates || !formData.country || isDetectingLocation}
                        />
                        {errors.state && <p className="text-red-500 text-xs mt-1 font-poppins">{errors.state}</p>}
                    </div>

                    {/* Postal Code Field */}
                    <div className='flex flex-col gap-y-2'>
                        <label className='font-poppins font-medium text-body-s text-heading tracking-wide'>Postal Code</label>
                        <Input 
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            placeholder={isDetectingLocation ? 'Locating...' : 'Enter area code'} 
                            className='flex-1'
                            disabled={formData.isAutoLocation || isDetectingLocation}
                        />
                        {errors.postalCode && <p className="text-red-500 text-xs mt-1 font-poppins">{errors.postalCode}</p>}
                    </div>
                </div>

            </div>

            {/* Navigation Actions */}
            <div className='flex items-center justify-center gap-x-4 w-full'>
                <Button 
                    type='button' 
                    variant='outline' 
                    size='lg'
                    disabled={isSubmitting || isDetectingLocation}
                    style={{ width: 168, height: 48 }}
                >
                    Back
                </Button>
                <Button 
                    onClick={onNext}
                    rightIcon={!isSubmitting ? '/icons/alt-arrow-right-double.svg' : undefined} 
                    size='lg'
                    disabled={isSubmitting || isLoadingCountries || isLoadingStates || isDetectingLocation}
                    style={{ width: 168, height: 48 }}
                >
                    {isSubmitting ? 'Submitting...' : 'Continue'}
                </Button>
            </div>
        </form>
    )
}

export default SellerAddress