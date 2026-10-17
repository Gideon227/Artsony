'use client'

import { Button } from '@/components'
import { X } from 'lucide-react'
import Image from 'next/image'
import React, { useRef, useState, useEffect, useCallback } from 'react'
import { HttpError } from '@/lib/api-client'
import { useSendSellerEmailCode, useVerifySellerEmailCode } from '@/hooks/use-seller'

const OTP_LENGTH = 4
const DEFAULT_RESEND_SECONDS = 60

type VerificationStatus = 'idle' | 'loading' | 'success' | 'error'

interface OtpVerificationProps {
    email: string
    initialResendIn?: number
    onVerified: (email: string) => void
    onNext: () => void
    onBack: () => void
}

const emptyOtp = () => Array<string>(OTP_LENGTH).fill('')

const errorMessage = (err: unknown, fallback: string) => (err instanceof HttpError ? err.message : fallback)

const OtpVerification = ({
    email,
    initialResendIn = DEFAULT_RESEND_SECONDS,
    onVerified,
    onNext,
    onBack,
}: OtpVerificationProps) => {
    const [otp, setOtp] = useState<string[]>(emptyOtp)
    const [status, setStatus] = useState<VerificationStatus>('idle')
    const [failureMessage, setFailureMessage] = useState('Invalid code — please try again or request a new one.')
    const [resendError, setResendError] = useState<string>()
    const [timeLeft, setTimeLeft] = useState<number>(initialResendIn)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    const { mutateAsync: verifyCode } = useVerifySellerEmailCode()
    const { mutateAsync: sendCode, isPending: isResending } = useSendSellerEmailCode()

    useEffect(() => {
        if (timeLeft > 0 && status === 'idle') {
            const timerId = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
            return () => clearTimeout(timerId)
        }
    }, [timeLeft, status])

    const focusFirstInput = () => setTimeout(() => inputRefs.current[0]?.focus(), 0)

    const handleVerify = useCallback(
        async (code: string) => {
            if (code.length !== OTP_LENGTH || status === 'loading') return

            setStatus('loading')
            try {
                await verifyCode({ email, code })
                onVerified(email)
                setStatus('success')
            } catch (err) {
                setFailureMessage(errorMessage(err, 'We could not verify your code. Please try again.'))
                setStatus('error')
            }
        },
        [email, onVerified, status, verifyCode],
    )

    const handleChange = (value: string, index: number) => {
        if (!/^\d*$/.test(value)) return

        const digit = value.slice(-1)
        const newOtp = [...otp]
        newOtp[index] = digit
        setOtp(newOtp)

        if (digit && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus()
        }

        if (newOtp.every((item) => item !== '')) {
            void handleVerify(newOtp.join(''))
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace') {
            if (otp[index]) {
                const newOtp = [...otp]
                newOtp[index] = ''
                setOtp(newOtp)
            } else if (index > 0) {
                inputRefs.current[index - 1]?.focus()
                const newOtp = [...otp]
                newOtp[index - 1] = ''
                setOtp(newOtp)
            }
        }

        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }

        if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()

        const pastedData = e.clipboardData
            .getData('text')
            .replace(/\D/g, '')
            .slice(0, OTP_LENGTH)

        if (!pastedData) return

        const newOtp = emptyOtp()
        pastedData.split('').forEach((digit, index) => {
            newOtp[index] = digit
        })
        setOtp(newOtp)

        const nextIndex = Math.min(pastedData.length, OTP_LENGTH - 1)
        inputRefs.current[nextIndex]?.focus()

        if (pastedData.length === OTP_LENGTH) {
            void handleVerify(pastedData)
        }
    }

    const handleResend = async () => {
        if (timeLeft > 0 || isResending) return

        setResendError(undefined)
        try {
            const receipt = await sendCode(email)
            setOtp(emptyOtp())
            setTimeLeft(receipt.resend_in)
            setStatus('idle')
            focusFirstInput()
        } catch (err) {
            setResendError(errorMessage(err, 'We could not send a new code. Please try again.'))
        }
    }

    const handleRetry = () => {
        setOtp(emptyOtp())
        setResendError(undefined)
        setStatus('idle')
        focusFirstInput()
    }

    return (
        <div className='w-full max-w-3xl mx-auto'>
            {status === 'idle' && (
                <div className='mx-auto border border-gray-50 rounded-2xl flex flex-col items-center justify-center gap-y-6 px-4 py-10 sm:px-12 md:px-26 md:py-16'>
                    <div className='flex flex-col items-center gap-y-8 w-full'>
                        <div className='flex items-center justify-center gap-x-2 sm:gap-x-4'>
                            {otp.map((digit, index) => (
                                <input
                                    key={`otp-input-${index}`}
                                    ref={(el) => { inputRefs.current[index] = el }}
                                    type='text'
                                    inputMode='numeric'
                                    autoComplete='one-time-code'
                                    aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(e.target.value, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    onPaste={handlePaste}
                                    className={`
                                        w-16 h-20 sm:w-22 sm:h-26 rounded-3xl border-2 text-center text-h2 text-heading font-raleway
                                        outline-none transition-all duration-200 ease-out transform
                                        hover:border-primary-500 focus:outline-action focus:outline-offset-4
                                        focus:scale-[1.03] active:scale-[0.98]
                                        ${digit ? 'border-primary-200' : 'border-gray-50'}
                                    `}
                                />
                            ))}
                        </div>

                        <div className='flex flex-col gap-y-4 items-center justify-center text-center'>
                            <p className='font-poppins text-body-m leading-6 tracking-wide text-body'>
                                We&apos;ve sent a {OTP_LENGTH}-digit verification code to <span className='text-primary-500 break-all'>{email}</span>. Enter the code below to confirm it&apos;s you. This helps keep your account secure.
                            </p>

                            <div className='flex flex-col items-center gap-y-2 mt-4'>
                                <p className='font-poppins text-body-m leading-6 tracking-wide text-body'>
                                    {timeLeft > 0 ? (
                                        <>Resend in <span className='text-primary-500'>{timeLeft}</span> sec</>
                                    ) : (
                                        "Didn't receive the code?"
                                    )}
                                </p>
                                <Button
                                    variant='ghost'
                                    rightIcon='/icons/arrow-round-right-double.svg'
                                    onClick={handleResend}
                                    isLoading={isResending}
                                    loadingText='Sending…'
                                    disabled={timeLeft > 0 || isResending}
                                >
                                    Resend
                                </Button>
                                {resendError && (
                                    <p role='alert' className='font-poppins text-body-xs font-medium text-error-500'>{resendError}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className='w-full mt-8'>
                        <div className='flex flex-col-reverse sm:flex-row items-center justify-center mx-auto gap-4'>
                            <Button variant='outline' className='w-full sm:w-42' onClick={onBack}>Back</Button>
                            <Button
                                className='w-full sm:w-42'
                                rightIcon='/icons/shield-user.svg'
                                onClick={() => handleVerify(otp.join(''))}
                                disabled={otp.join('').length !== OTP_LENGTH}
                            >
                                Verify
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {status === 'loading' && (
                <div
                    role='status'
                    aria-live='polite'
                    className='mx-auto border border-gray-50 rounded-2xl flex flex-col items-center justify-center gap-y-10 md:gap-y-14 px-4 py-20 sm:px-12 md:px-26 md:py-35'
                >
                    <h5 className='font-raleway font-semibold text-h5 text-primary-500 tracking-wide leading-8 text-center'>
                        We&apos;re verifying your details — this may take a few seconds
                    </h5>
                    <div className='flex items-center justify-center mx-auto gap-x-2 animate-pulse'>
                        <Image src='/icons/vector.svg' width={72} height={72} alt='' className='size-12 sm:size-18 animate-spin duration-300' />
                        <Image src='/icons/vector.svg' width={72} height={72} alt='' className='size-12 sm:size-18 animate-spin duration-500' />
                        <Image src='/icons/vector.svg' width={72} height={72} alt='' className='size-12 sm:size-18 animate-spin duration-700' />
                        <Image src='/icons/vector.svg' width={72} height={72} alt='' className='size-12 sm:size-18 animate-spin duration-1000' />
                    </div>
                </div>
            )}

            {status === 'error' && (
                <div role='alert' className='mx-auto border border-gray-50 rounded-2xl py-10 px-4 sm:px-12 md:py-16 md:px-26 flex flex-col items-center justify-center gap-y-10 md:gap-y-14'>
                    <div className='flex flex-col items-center justify-center text-center gap-y-4'>
                        <h5 className='font-raleway font-semibold text-h5 text-primary-500 tracking-wide'>Verification Failed</h5>
                        <p className='font-poppins text-body-xs text-body tracking-wide'>{failureMessage}</p>
                        <div className='p-2 bg-error-500 rounded-full w-25 h-25 flex items-center justify-center mt-4'>
                            <X color='#fff' size={48} />
                        </div>
                    </div>

                    <div className='flex flex-col-reverse sm:flex-row items-center justify-center gap-4 w-full mt-8'>
                        <Button variant='outline' size='lg' className='w-full sm:w-[168px] h-12' onClick={onBack}>Back</Button>
                        <Button rightIcon='/icons/refresh-circle.svg' size='lg' className='w-full sm:w-[168px] h-12' onClick={handleRetry}>Refresh</Button>
                    </div>
                </div>
            )}

            {status === 'success' && (
                <div role='status' className='mx-auto border border-gray-50 rounded-2xl py-10 px-4 sm:px-12 md:py-16 md:px-26 flex flex-col items-center justify-center gap-y-10 md:gap-y-14'>
                    <div className='flex flex-col items-center justify-center gap-y-6'>
                        <Image src='/icons/verified-check.svg' width={104} height={104} alt='verify successful' className='size-20 sm:size-26' />
                        <p className='font-raleway font-semibold text-h5 text-secondary-500 tracking-wide text-center'>Verification Successful</p>
                    </div>

                    <div className='flex flex-col-reverse sm:flex-row items-center justify-center gap-4 w-full mt-8'>
                        <Button variant='outline' size='lg' onClick={onBack} className='w-full sm:w-[168px] h-12'>Back</Button>
                        <Button rightIcon='/icons/alt-arrow-right-double.svg' size='lg' onClick={onNext} className='w-full sm:w-[168px] h-12'>Continue</Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default OtpVerification