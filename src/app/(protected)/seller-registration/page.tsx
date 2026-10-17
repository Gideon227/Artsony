'use client'
import { Navbar } from '@/components/layout/navbar'
import AccountBasics from '@/features/seller-registration/components/account-basics'
import AgreementConfirmation from '@/features/seller-registration/components/agreement-confirmation'
import ApplicationStatus from '@/features/seller-registration/components/application-status'
import Footer from '@/features/seller-registration/components/footer'
import OtpVerification from '@/features/seller-registration/components/otp-verification'
import SellerAddress from '@/features/seller-registration/components/seller-address'
import {
    DEFAULT_DIAL_CODE,
    REGISTRATION_STEPS,
    TOTAL_STEPS,
    buildPhoneNumber,
    stripUsernamePrefix,
    type AccountBasicsValues,
    type SellerAddressValues,
} from '@/features/seller-registration/types'
import {
    useMySellerRegistration,
    useSendSellerEmailCode,
    useSubmitSellerRegistration,
    useSyncSellerRole,
} from '@/hooks/use-seller'
import { HttpError } from '@/lib/api-client'
import { selectUser, useAuthStore } from '@/store'
import { buttonVariants } from '@/components'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'

const sameEmail = (a: string | null, b: string) => a !== null && a.trim().toLowerCase() === b.trim().toLowerCase()

const errorMessage = (err: unknown, fallback: string) => (err instanceof HttpError ? err.message : fallback)

const NOTICE_CARD = 'mx-auto w-full max-w-3xl border border-gray-50 rounded-2xl flex flex-col items-center justify-center gap-y-6 px-4 py-10 sm:px-12 md:px-26 md:py-16 text-center'

const StatusSkeleton = () => (
    <div className={cn(NOTICE_CARD, 'animate-pulse')} aria-busy='true' aria-label='Loading your application'>
        <div className='w-25 h-25 rounded-full bg-gray-50' />
        <div className='h-6 w-56 max-w-full rounded-md bg-gray-50' />
        <div className='h-4 w-full max-w-md rounded-md bg-gray-50' />
        <div className='h-12 w-44 rounded-2xl bg-gray-50' />
    </div>
)

const SellerRegistrationPage = () => {
    const user = useAuthStore(selectUser)
    const { data: registration, isLoading } = useMySellerRegistration({ poll: true })
    useSyncSellerRole(registration?.status)

    const { mutateAsync: sendCode, isPending: isSendingCode } = useSendSellerEmailCode()
    const { mutateAsync: submitRegistration, isPending: isSubmitting } = useSubmitSellerRegistration()

    const [isResubmitting, setIsResubmitting] = useState(false)
    const [step, setStep] = useState<number>(1)
    const [basics, setBasics] = useState<AccountBasicsValues | null>(null)
    const [address, setAddress] = useState<SellerAddressValues | null>(null)
    const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null)
    const [lastSentEmail, setLastSentEmail] = useState<string | null>(null)
    const [resendIn, setResendIn] = useState<number | undefined>()
    const [sendError, setSendError] = useState<string | undefined>()

    const handleNext = () => setStep((prev) => Math.min(prev + 1, TOTAL_STEPS))
    const handleBack = () => setStep((prev) => Math.max(prev - 1, 1))

    const issueCode = async (email: string): Promise<boolean> => {
        try {
            const receipt = await sendCode(email)
            setLastSentEmail(email)
            setResendIn(receipt.resend_in)
            return true
        } catch (err) {
            // A code for this exact address was just emailed and is still valid —
            // the cooldown only blocks sending another one, so carry on to entry.
            if (err instanceof HttpError && err.statusCode === 429 && sameEmail(lastSentEmail, email)) {
                return true
            }
            setSendError(errorMessage(err, 'We could not send the verification code. Please try again.'))
            return false
        }
    }

    const handleBasicsSubmit = async (values: AccountBasicsValues) => {
        setSendError(undefined)
        setBasics(values)

        if (sameEmail(verifiedEmail, values.email)) {
            setStep(3)
            return
        }
        if (await issueCode(values.email.trim())) setStep(2)
    }

    const handleAddressSubmit = (values: SellerAddressValues) => {
        setAddress(values)
        handleNext()
    }

    const restartVerification = async () => {
        if (!basics) {
            setStep(1)
            return
        }
        setVerifiedEmail(null)
        setSendError(undefined)
        setStep((await issueCode(basics.email.trim())) ? 2 : 1)
    }

    const handleFinish = async () => {
        if (!basics || !address || isSubmitting) return

        try {
            await submitRegistration({
                full_name: basics.fullName.trim(),
                username: stripUsernamePrefix(basics.username),
                email: basics.email.trim(),
                phone_number: buildPhoneNumber(basics),
                address: address.address,
                country: address.country,
                state: address.state,
                ...(address.city && { city: address.city }),
                postal_code: address.postalCode,
            })
            setIsResubmitting(false)
            setStep(1)
        } catch (err) {
            if (err instanceof HttpError && err.code === 'EMAIL_NOT_VERIFIED') {
                await restartVerification()
            }
        }
    }

    const role = user?.role
    const isStaff = role === 'ADMIN' || role === 'MODERATOR'
    const showStatus = Boolean(registration) && (registration?.status !== 'REJECTED' || !isResubmitting)

    const rejected = registration?.status === 'REJECTED' ? registration : undefined
    const defaultBasics: Partial<AccountBasicsValues> = basics ?? {
        fullName: rejected?.full_name ?? user?.displayName ?? '',
        email: rejected?.email ?? user?.email ?? '',
        username: rejected?.username ?? user?.username ?? '',
        phone: '',
        dialCode: DEFAULT_DIAL_CODE,
    }
    const defaultAddress: SellerAddressValues | undefined =
        address ??
        (rejected
            ? {
                  address: rejected.address,
                  country: rejected.country,
                  state: rejected.state,
                  city: rejected.city ?? '',
                  postalCode: rejected.postal_code ?? '',
              }
            : undefined)

    const renderBody = () => {
        if (isStaff) {
            return (
                <div className={NOTICE_CARD} role='status'>
                    <h5 className='font-raleway font-semibold text-h5 text-primary-500 tracking-wide'>Staff accounts can&apos;t sell</h5>
                    <p className='font-poppins text-body-s text-body tracking-wide leading-6'>
                        Admin and moderator accounts can&apos;t register as sellers. Use a separate account to open a seller profile.
                    </p>
                </div>
            )
        }

        if (isLoading) return <StatusSkeleton />

        if (registration && showStatus) {
            return <ApplicationStatus registration={registration} onResubmit={() => setIsResubmitting(true)} />
        }

        if (!registration && role === 'ARTIST') {
            return (
                <div className={NOTICE_CARD} role='status'>
                    <h5 className='font-raleway font-semibold text-h5 text-secondary-500 tracking-wide'>You already have a seller account</h5>
                    <p className='font-poppins text-body-s text-body tracking-wide leading-6'>
                        There&apos;s nothing more to set up — you can start listing artwork right away.
                    </p>
                    <Link href='/artworks/upload' className={cn(buttonVariants({ size: 'lg' }), 'w-full sm:w-auto')}>
                        Upload Artwork
                    </Link>
                </div>
            )
        }

        return (
            <>
                {step === 1 && (
                    <AccountBasics
                        defaultValues={defaultBasics}
                        isSubmitting={isSendingCode}
                        serverError={sendError}
                        onSubmit={handleBasicsSubmit}
                    />
                )}
                {step === 2 && basics && (
                    <OtpVerification
                        email={basics.email.trim()}
                        {...(resendIn !== undefined && { initialResendIn: resendIn })}
                        onVerified={setVerifiedEmail}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                )}
                {step === 3 && (
                    <SellerAddress
                        {...(defaultAddress && { defaultValues: defaultAddress })}
                        onBack={handleBack}
                        onNext={handleAddressSubmit}
                    />
                )}
                {step === 4 && (
                    <AgreementConfirmation isSubmitting={isSubmitting} onBack={handleBack} onFinish={handleFinish} />
                )}
            </>
        )
    }

    const showStepper = !isStaff && !isLoading && !(registration && showStatus) && !(!registration && role === 'ARTIST')

    return (
        <div className=''>
            <Navbar />
            <div className='flex-1 pt-8 md:pt-12 pb-10 flex flex-col gap-y-10 lg:gap-y-16 bg-white'>
                <div className='flex flex-col justify-center items-center gap-y-8 md:gap-y-10 w-full px-4 sm:px-8 lg:px-22'>
                    <div className='flex flex-col gap-y-4 justify-center items-center'>
                        <h4 className='font-raleway font-semibold text-h4 text-primary-500 leading-10 tracking-wide text-center'>Seller Account Registration</h4>
                        <p className='font-poppins text-body-s text-heading leading-6 text-center tracking-wide max-w-2xl'>Create your seller account to list artworks, fulfill orders, and receive payouts securely.</p>
                    </div>

                    {showStepper && (
                        <div className='flex flex-col items-center gap-y-3 w-full'>
                            <ol className='flex items-start justify-between w-full' aria-label='Registration progress'>
                                {REGISTRATION_STEPS.map((label, index) => (
                                    <React.Fragment key={label}>
                                        <li
                                            aria-current={step === index + 1 ? 'step' : undefined}
                                            className='flex flex-col gap-y-2 justify-start items-center md:w-32 shrink-0 relative z-10'
                                        >
                                            <span
                                                className={`w-6 h-6 rounded-full border-2 flex justify-center items-center transition-all duration-300
                                                    ${step === index + 1 ? 'outline outline-2 outline-offset-1 outline-primary-500' : ''}
                                                    ${step > index + 1 ? 'border-none bg-primary-500' : 'border-gray-100 bg-white'}
                                                `}
                                            >
                                                {step > index + 1 && <Check color='#fff' size={12} strokeWidth={3} />}
                                            </span>

                                            <p className={`hidden md:block font-poppins font-medium text-body-s leading-6 tracking-wide text-center whitespace-nowrap mt-2 ${step === index + 1 ? 'text-primary-500' : 'text-body'}`}>
                                                {label}
                                            </p>
                                        </li>

                                        {index < TOTAL_STEPS - 1 && (
                                            <li aria-hidden='true' className='flex-1 flex items-center pt-3 px-1 md:px-0'>
                                                <hr className={`w-full border-t-2 transition-colors duration-300 ${step > index + 1 ? 'border-primary-500' : 'border-gray-200'}`} />
                                            </li>
                                        )}
                                    </React.Fragment>
                                ))}
                            </ol>

                            <p className='md:hidden font-poppins font-medium text-body-s leading-6 tracking-wide text-center text-primary-500'>
                                Step {step} of {TOTAL_STEPS} · {REGISTRATION_STEPS[step - 1]}
                            </p>
                        </div>
                    )}
                </div>

                <div className='w-full px-4 sm:px-8'>{renderBody()}</div>
            </div>

            <Footer />
        </div>
    )
}

export default SellerRegistrationPage