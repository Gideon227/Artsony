import { Input } from '@/components'
import { Dropdown, DropdownOption } from '@/components/ui/dropdown'
import { PhoneInput } from '@/components/ui/phone-input'
import { User } from '@/types'
import React, { useState, useEffect } from 'react'

const ContactSection = ({ user }: { user: User }) => {
    // Form field state initialized with user prop fallbacks
    const [formData, setFormData] = useState({
        email: user?.email || '',
        phone: '', // Handled by PhoneInput component
        country: null as DropdownOption | null,
        state: null as DropdownOption | null,
        isAutoLocation: false,
    })

    // Dropdown list data states
    const [countries, setCountries] = useState<DropdownOption[]>([])
    const [states, setStates] = useState<DropdownOption[]>([])
    
    // Loading and asynchronous UI states
    const [isLoadingCountries, setIsLoadingCountries] = useState(false)
    const [isLoadingStates, setIsLoadingStates] = useState(false)
    const [isDetectingLocation, setIsDetectingLocation] = useState(false)

    // 1. Fetch all countries on mount
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
                console.error('Failed to load countries selection table:', error)
            } finally {
                setIsLoadingCountries(false)
            }
        }

        fetchCountries()
    }, [])

    // 2. Fetch specific states dynamically when the selected country changes
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
                console.error('Failed to resolve regional states:', error)
                setStates([])
            } finally {
                setIsLoadingStates(false)
            }
        }

        fetchStates()
    }, [formData.country])

    // State structural event handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleDropdownChange = (name: 'country' | 'state', option: DropdownOption) => {
        setFormData((prev) => {
            const updated = { ...prev, [name]: option }
            if (name === 'country') {
                updated.state = null // Wipe state if country resets
            }
            return updated
        })
    }

    // Geolocation IP parser routine
    const handleToggleLocation = async () => {
        const nextValue = !formData.isAutoLocation

        if (nextValue) {
            setIsDetectingLocation(true)
            try {
                const response = await fetch('https://ipapi.co/json/')
                const data = await response.json()
                
                if (data && !data.error) {
                    setFormData((prev) => ({
                        ...prev,
                        isAutoLocation: nextValue,
                        country: data.country_name ? { id: data.country_name, label: data.country_name } : null,
                        state: data.region ? { id: data.region_code || data.region, label: data.region } : null,
                    }))
                }
            } catch (error) {
                console.error('IP location mapping failure:', error)
            } finally {
                setIsDetectingLocation(false)
            }
        } else {
            setFormData((prev) => ({ 
                ...prev, 
                isAutoLocation: nextValue, 
                country: null, 
                state: null 
            }))
        }
    }

    return (
        <div className='flex flex-col gap-y-6'>
            <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>
                Contact & Region
            </p>

            <form className='bg-secondary-50 p-6 flex flex-col gap-y-4 rounded-xl' onSubmit={(e) => e.preventDefault()}>
                
                {/* Email Field */}
                <div className='gap-y-2 flex flex-col w-full'>
                    <label className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>Email</label>
                    <Input
                        name="email"
                        value={formData.email}
                        placeholder='forexample@gmail.com'
                        onChange={handleInputChange}
                        className='h-12'
                    />
                </div>

                {/* Phone Number Field */}
                <div className='gap-y-2 flex flex-col w-full'>
                    <label className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>Phone Number</label>
                    <PhoneInput 
                        value={formData.phone}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            setFormData(prev => ({ ...prev, phone: e.target.value }))
                        }
                        placeholder='08012345678'
                        disabled={isDetectingLocation}
                    />
                </div>

                {/* Country Dropdown */}
                <div className='gap-y-2 flex flex-col w-full'>
                    <label className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>Country</label>
                    <Dropdown 
                        options={countries}
                        value={formData.country || undefined}
                        onChange={(option) => handleDropdownChange('country', option)}
                        placeholder={isLoadingCountries ? 'Loading countries...' : 'Select Country'}
                        disabled={formData.isAutoLocation || isLoadingCountries || isDetectingLocation}
                    />
                </div>

                {/* State Dropdown */}
                <div className='gap-y-2 flex flex-col w-full'>
                    <label className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>State / Province</label>
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
                        disabled={formData.isAutoLocation || isLoadingStates || !formData.country || isDetectingLocation}
                    />
                </div>
                
                {/* Auto Location Toggle Switch */}
                <div className='flex justify-between items-center w-full pt-2'>
                    <p className='font-poppins font-medium text-body-s leading-6 text-heading tracking-wide'>
                        {isDetectingLocation ? 'Detecting location...' : 'Set Automatically by location'}
                    </p>
                    <button
                        type="button"
                        onClick={handleToggleLocation}
                        disabled={isDetectingLocation}
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
            </form>
        </div>
    )
}

export default ContactSection