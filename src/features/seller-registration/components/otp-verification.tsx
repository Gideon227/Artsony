'use client'

import { Button } from '@/components'
import { X } from 'lucide-react'
import Image from 'next/image'
import React, { useRef, useState } from 'react'

const OTP_LENGTH = 4

const OtpVerification = ({ phone }: { phone: string }) => {
    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''))
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    const handleChange = ( value: string, index: number ) => {
        if (!/^\d*$/.test(value)) return;

        const digit = value.slice(-1)

        const newOtp = [...otp]
        newOtp[index] = digit

        setOtp(newOtp)

        if (digit && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus()
        }

        if (newOtp.every((item) => item !== '')) {
            console.log('OTP Complete:', newOtp.join(''))
        }
    }

    const handleKeyDown = ( e: React.KeyboardEvent<HTMLInputElement>, index: number ) => {
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

    const handlePaste = (
        e: React.ClipboardEvent<HTMLInputElement>
    ) => {
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

        const nextIndex = Math.min(
            pastedData.length,
            OTP_LENGTH - 1
        )

        inputRefs.current[nextIndex]?.focus()
    }

    const VerifyOtp = () => {
        return (

            <div className='mx-auto border border-gray-50 rounded-2xl py-16 px-26 flex flex-col items-center justify-center gap-y-6'>
                <div className='flex flex-col items-center gap-y-8 w-full'>
                    <div className='flex items-center justify-center gap-x-4'>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => {
                                    inputRefs.current[index] = el
                                }}
                                type='text'
                                inputMode='numeric'
                                autoComplete='one-time-code'
                                maxLength={1}
                                value={digit}
                                onChange={(e) =>
                                    handleChange(
                                        e.target.value,
                                        index
                                    )
                                }
                                onKeyDown={(e) =>
                                    handleKeyDown(
                                        e,
                                        index
                                    )
                                }
                                onPaste={handlePaste}
                                className={`
                                    w-22
                                    h-26
                                    rounded-3xl
                                    border-2
                                    text-center
                                    text-h2
                                    text-heading
                                    font-raleway
                                    outline-none
                                    transition-all
                                    duration-200
                                    ease-out
                                    transform
                                    border-gray-50
                                    hover:border-primary-500
                                    focus:outline-action
                                    focus:outline-offset-4
                                    focus:scale-[1.03]
                                    active:scale-[0.98]
                                    ${
                                        digit
                                            ? 'border-primary-200'
                                            : 'border-gray-50'
                                    }
                                `}
                            />
                        ))}
                    </div>

                    <div className='flex flex-col gap-y-4 items-center justify-center text-center'>
                        <p className='font-poppins text-body-m leading-6 tracking-wide text-body'>
                            We&apos;ve sent a 6-digit verification code to <span className='text-primary-500'>{phone}</span>. Enter the code below to confirm it&apos;s you. This helps keep your account secure.
                        </p>

                        <p className='font-poppins text-body-m leading-6 tracking-wide text-body'>Resend in <span className='text-primary-500'>60</span> sec</p>
                    
                        <Button variant='ghost' rightIcon='/icons/arrow-round-right-double.svg'>Resend</Button>
                    </div>
                </div>

                <div className='w-full'>
                    <div className='flex items-center justify-center mx-auto gap-x-4 '>
                        <Button variant='outline'>Back</Button>
                        <Button rightIcon='/icons/shield-user.svg'>Verify</Button>
                    </div>
                </div>
            </div>
        )
    }

    const LoadingScreen =  () => {
        return (
            <div className='mx-auto border border-gray-50 rounded-2xl p-26 flex flex-col items-center justify-center gap-y-14'>
                <h5 className='font-raleway font-semibold text-h5 text-primary-500 tracking-wide leading-8'>We&apos;re verifying your details — this may take a few seconds</h5>
                <div className='flex items-center justify-center mx-auto gap-x-2'>
                    <Image src='icons/vector.svg' width={72} height={72} alt='vector icon' />
                    <Image src='icons/vector.svg' width={72} height={72} alt='vector icon' />
                    <Image src='icons/vector.svg' width={72} height={72} alt='vector icon' />
                    <Image src='icons/vector.svg' width={72} height={72} alt='vector icon' />
                </div>
                <Button variant='outline'>Back</Button>
            </div>
        )
    }

    const FailedVerification = () => {
        return (
            <div className='mx-auto border border-gray-50 rounded-2xl p-26 flex flex-col items-center justify-center gap-y-14'>
                <div className='flex flex-col items-center justify-center text-center gap-y-4'>
                    <h5 className='font-raleway font-semibold text-h5 text-primary-500 tracking-wide'>Verification Failed</h5>
                    <p className='font-poppins text-body-xs text-body tracking-wide'>Invalid code — please try again or request a new one.</p>
                    <div className='p-2 bg-error-500 rounded-full w-25 h-25 items-end justify-center'>
                        <X color='#fff' size={83}  />
                    </div>
                </div>

                <div className='flex items-center justify-center gap-x-4 '>
                    <Button variant='outline' size='lg'>Back</Button>
                    <Button rightIcon='/icons/refresh-circle.svg' size='lg'>Refresh</Button>
                </div>
            </div>
        )
    }

    const SuccessVerification = () => {
        return (
            <div className='mx-auto border border-gray-50 rounded-2xl py-16 px-26 flex flex-col items-center justify-center gap-y-14'>
                <div className='flex items-center justify-center gap-y-4'>
                    <Image src='/icons/verified-check.svg' width={104} height={104} alt='verify successful'/>
                    <p className='font-raleway font-semibold text-h5 text-secondary-500 tracking-wide'>Verification Successful</p>
                </div>

                <div className='flex items-center justify-center gap-x-4 '>
                    <Button variant='outline' size='lg'>Back</Button>
                    <Button rightIcon='/icons/alt-arrow-right-double.svg' size='lg'>Continue</Button>
                </div>
            </div>
        )
    }

    return (
        <div>

        </div>
    )
}

export default OtpVerification