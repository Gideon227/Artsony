'use client'

import { Button } from '@/components'
import { X } from 'lucide-react'
import Image from 'next/image'
import React, { useRef, useState, useEffect } from 'react'

const OTP_LENGTH = 4

type VerificationStatus = 'idle' | 'loading' | 'success' | 'error'

interface OtpVerificationProps {
    phone: string;
    onNext?: () => void;
    onBack?: () => void;
}

const OtpVerification = ({ phone, onNext, onBack }: OtpVerificationProps) => {
    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''))
    const [status, setStatus] = useState<VerificationStatus>('idle')
    const [timeLeft, setTimeLeft] = useState<number>(60)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    // Countdown timer for Resend functionality
    useEffect(() => {
        if (timeLeft > 0 && status === 'idle') {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
            return () => clearTimeout(timerId)
        }
    }, [timeLeft, status])

    const handleChange = (value: string, index: number) => {
        if (!/^\d*$/.test(value)) return;

        const digit = value.slice(-1)
        const newOtp = [...otp]
        newOtp[index] = digit

        setOtp(newOtp)

        if (digit && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus()
        }

        // Auto-verify if all fields are filled
        if (newOtp.every((item) => item !== '')) {
            handleVerify(newOtp.join(''))
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

        const newOtp = [...otp]
        pastedData.split('').forEach((digit, index) => {
            newOtp[index] = digit
        })

        setOtp(newOtp)

        const nextIndex = Math.min(pastedData.length, OTP_LENGTH - 1)
        inputRefs.current[nextIndex]?.focus()

        if (pastedData.length === OTP_LENGTH) {
            handleVerify(pastedData)
        }
    }

    // Mock API Verification
    const handleVerify = async (otpString: string) => {
        if (otpString.length !== OTP_LENGTH) return;
        
        setStatus('loading')

        // TODO: Replace with actual API call
        setTimeout(() => {
            if (otpString === '1234') { // using 1234 as mock success trigger
                setStatus('success')
            } else {
                setStatus('error')
            }
        }, 2000)
    }

    const handleResend = async () => {
        if (timeLeft > 0) return;
        
        // TODO: Trigger actual resend API call here
        setOtp(Array(OTP_LENGTH).fill(''))
        setTimeLeft(60)
        setStatus('idle')
        inputRefs.current[0]?.focus()
    }

    const handleRetry = () => {
        setOtp(Array(OTP_LENGTH).fill(''))
        setStatus('idle')
        // Use timeout to ensure DOM renders inputs before focusing
        setTimeout(() => inputRefs.current[0]?.focus(), 0)
    }

    return (
        <div className="w-full max-w-3xl mx-auto">
            {status === 'idle' && (
                <div className='mx-auto border border-gray-50 rounded-2xl flex flex-col items-center justify-center gap-y-6' style={{ paddingInline: 104, paddingBlock: 64 }}>
                    <div className='flex flex-col items-center gap-y-8 w-full'>
                        <div className='flex items-center justify-center gap-x-4'>
                            {otp.map((digit, index) => (
                                <input
                                    key={`otp-input-${index}`}
                                    ref={(el) => { inputRefs.current[index] = el }}
                                    type='text'
                                    inputMode='numeric'
                                    autoComplete='one-time-code'
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(e.target.value, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    onPaste={handlePaste}
                                    className={`
                                        w-22 h-26 rounded-3xl border-2 text-center text-h2 text-heading font-raleway
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
                                We&apos;ve sent a {OTP_LENGTH}-digit verification code to <span className='text-primary-500'>{phone}</span>. Enter the code below to confirm it&apos;s you. This helps keep your account secure.
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
                                    disabled={timeLeft > 0}
                                    className={timeLeft > 0 ? 'opacity-50 cursor-not-allowed' : ''}
                                >
                                    Resend
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className='w-full mt-8'>
                        <div className='flex items-center justify-center mx-auto gap-x-4'>
                            <Button variant='outline' onClick={onBack}>Back</Button>
                            <Button 
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
                <div className='mx-auto border border-gray-50 rounded-2xl flex flex-col items-center justify-center gap-y-14' style={{ paddingInline: 104, paddingBlock: 140 }}>
                    <h5 className='font-raleway font-semibold text-h5 text-primary-500 tracking-wide leading-8 text-center'>
                        We&apos;re verifying your details — this may take a few seconds
                    </h5>
                    <div className='flex items-center justify-center mx-auto gap-x-2 animate-pulse'>
                        <Image src='/icons/vector.svg' width={72} height={72} alt='vector icon' className='animate-spin duration-300' />
                        <Image src='/icons/vector.svg' width={72} height={72} alt='vector icon' className='animate-spin duration-500' />
                        <Image src='/icons/vector.svg' width={72} height={72} alt='vector icon' className='animate-spin duration-700' />
                        <Image src='/icons/vector.svg' width={72} height={72} alt='vector icon' className='animate-spin duration-1000' />
                    </div>
                </div>
            )}

            {status === 'error' && (
                <div className='mx-auto border border-gray-50 rounded-2xl py-16 px-26 flex flex-col items-center justify-center gap-y-14'>
                    <div className='flex flex-col items-center justify-center text-center gap-y-4'>
                        <h5 className='font-raleway font-semibold text-h5 text-primary-500 tracking-wide'>Verification Failed</h5>
                        <p className='font-poppins text-body-xs text-body tracking-wide'>Invalid code — please try again or request a new one.</p>
                        <div className='p-2 bg-error-500 rounded-full w-25 h-25 flex items-center justify-center mt-4'>
                            <X color='#fff' size={48} />
                        </div>
                    </div>

                    <div className='flex items-center justify-center gap-x-4 w-full mt-8'>
                        <Button variant='outline' size='lg' style={{ width: 168, height: 48 }} onClick={onBack}>Back</Button>
                        <Button rightIcon='/icons/refresh-circle.svg' size='lg' style={{ width: 168, height: 48 }} onClick={handleRetry}>Refresh</Button>
                    </div>
                </div>
            )}

            {status === 'success' && (
                <div className='mx-auto border border-gray-50 rounded-2xl py-16 px-26 flex flex-col items-center justify-center gap-y-14'>
                    <div className='flex flex-col items-center justify-center gap-y-6'>
                        <Image src='/icons/verified-check.svg' width={104} height={104} alt='verify successful'/>
                        <p className='font-raleway font-semibold text-h5 text-secondary-500 tracking-wide'>Verification Successful</p>
                    </div>

                    <div className='flex items-center justify-center gap-x-4 w-full mt-8'>
                        <Button variant='outline' size='lg' onClick={onBack} style={{ width: 168, height: 48 }}>Back</Button>
                        <Button rightIcon='/icons/alt-arrow-right-double.svg' size='lg' onClick={onNext} style={{ width: 168, height: 48 }}>Continue</Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default OtpVerification