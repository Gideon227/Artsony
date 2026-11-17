import { useMemo, useState, type ChangeEvent } from 'react'
import type { CountryCode } from 'libphonenumber-js'
import { Input } from '@/components'
import { Dropdown, DropdownOption } from '@/components/ui/dropdown'
import { PhoneInput } from '@/components/ui/phone-input'
import { useToast } from '@/components/ui/toaster'
import { getCountryName, useCountryOptions, useStateOptions } from '@/hooks/use-location-data'

const IP_LOOKUP_URL = 'https://ipapi.co/json/'

export type ContactSectionProps = {
    /** Sign-in email. Shown read-only — there is no verified email-change flow yet. */
    email: string
    /** ISO 3166-1 alpha-2 code ('NG') — the same format the backend stores. */
    country: string
    state: string
    onLocationChange: (patch: { country?: string; state?: string }) => void
    phone: {
        value: string
        onChange: (value: string) => void
        onCountryChange: (iso: CountryCode) => void
        defaultCountry: CountryCode | undefined
        /** Remounts the input when the saved number's country changes so its dial code follows. */
        remountKey: string
        error?: string
        disabled?: boolean
    }
}

const ContactSection = ({ email, country, state, onLocationChange, phone }: ContactSectionProps) => {
    const { error: toastError } = useToast()
    const { countries, isLoading: isLoadingCountries } = useCountryOptions()

    const countryName = country
        ? (countries.find((c) => c.code === country)?.name ?? getCountryName(country))
        : undefined
    const { states, isLoading: isLoadingStates } = useStateOptions(countryName)

    const [isAutoLocation, setIsAutoLocation] = useState(false)
    const [isDetectingLocation, setIsDetectingLocation] = useState(false)

    const countryOptions = useMemo<DropdownOption[]>(
        () => countries.map((c) => ({ id: c.code, label: c.name })),
        [countries],
    )
    const stateOptions = useMemo<DropdownOption[]>(
        () => states.map((name) => ({ id: name, label: name })),
        [states],
    )
    const selectedCountry = useMemo<DropdownOption | undefined>(() => {
        if (!country) return undefined
        return countryOptions.find((o) => o.id === country) ?? { id: country, label: getCountryName(country) ?? country }
    }, [countryOptions, country])
    const selectedState = useMemo<DropdownOption | undefined>(
        () => (state ? { id: state, label: state } : undefined),
        [state],
    )

    // Fills country + state from the visitor's connection. The country is kept
    // as an ISO code (not a display name) because that is what the API stores.
    const handleToggleLocation = async () => {
        if (isAutoLocation) {
            setIsAutoLocation(false)
            return
        }

        setIsDetectingLocation(true)
        try {
            const res = await fetch(IP_LOOKUP_URL)
            if (!res.ok) throw new Error(`Lookup failed (${res.status})`)
            const data = (await res.json()) as { error?: boolean; country_code?: string; region?: string }
            if (data.error || !data.country_code) throw new Error('Location could not be determined')

            onLocationChange({ country: data.country_code.toUpperCase(), state: data.region ?? '' })
            setIsAutoLocation(true)
        } catch {
            toastError('Could not detect location', 'Select your country and state manually or try again.')
        } finally {
            setIsDetectingLocation(false)
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
                        type="email"
                        value={email}
                        readOnly
                        disabled
                        placeholder='forexample@gmail.com'
                        className='h-12'
                    />
                </div>

                {/* Phone Number Field */}
                <div className='gap-y-2 flex flex-col w-full'>
                    <label className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>Phone Number</label>
                    <PhoneInput
                        key={phone.remountKey}
                        defaultCountry={phone.defaultCountry}
                        value={phone.value}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => phone.onChange(e.target.value)}
                        onCountryChange={phone.onCountryChange}
                        placeholder='08012345678'
                        disabled={phone.disabled || isDetectingLocation}
                        aria-invalid={Boolean(phone.error)}
                    />
                    {phone.error && <p className='pl-4 text-xs font-semibold text-error-500'>{phone.error}</p>}
                </div>

                {/* Country Dropdown */}
                <div className='gap-y-2 flex flex-col w-full'>
                    <label className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>
                        Country
                    </label>
                    <Dropdown
                        options={countryOptions}
                        value={selectedCountry}
                        onChange={(option) => onLocationChange({ country: String(option.id), state: '' })}
                        placeholder={isLoadingCountries ? 'Loading countries...' : 'Select Country'}
                        disabled={isAutoLocation || isLoadingCountries || isDetectingLocation}
                        searchable={true}
                        searchPlaceholder="Search country..."
                        isLoading={isLoadingCountries}
                        emptyMessage="No countries found"
                    />
                </div>

                {/* State Dropdown */}
                <div className='gap-y-2 flex flex-col w-full'>
                    <label className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>State / Province</label>
                    <Dropdown
                        options={stateOptions}
                        value={selectedState}
                        onChange={(option) => onLocationChange({ state: String(option.id) })}
                        placeholder={
                            isLoadingStates
                                ? 'Loading regions...'
                                : !country
                                ? 'Select country first'
                                : 'Select State/Province'
                        }
                        disabled={isAutoLocation || isLoadingStates || !country || isDetectingLocation}
                        searchable={true}
                        searchPlaceholder="Searching states..."
                        isLoading={isLoadingStates}
                        emptyMessage="No States Found In This Region"
                    />
                </div>

                {/* Auto Location Toggle Switch */}
                <div className='flex justify-between items-center w-full pt-2'>
                    <p className='font-poppins font-medium text-body-xs lg:text-body-s leading-6 text-heading tracking-wide'>
                        {isDetectingLocation ? 'Detecting location...' : 'Set Automatically by location'}
                    </p>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isAutoLocation}
                      aria-label="Set location automatically"
                      onClick={handleToggleLocation}
                      disabled={isDetectingLocation}
                      className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-2xl transition-colors duration-200 focus:outline-none border border-primary-500 ${
                          isAutoLocation ? 'bg-primary-500' : 'bg-white'
                      } ${isDetectingLocation ? 'opacity-50 cursor-wait' : ''}`}
                    >
                      <span
                        className={`inline-block transform rounded-full transition-transform duration-300 ease-in-out ${
                          isAutoLocation ? 'translate-x-6 bg-white' : 'translate-x-0.5 bg-primary-500'
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
