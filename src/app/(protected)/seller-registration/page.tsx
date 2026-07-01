'use client'
import { Navbar } from '@/components/layout/navbar'
import AccountBasics from '@/features/seller-registration/components/account-basics'
import AgreementConfirmation from '@/features/seller-registration/components/agreement-confirmation'
import Footer from '@/features/seller-registration/components/footer'
import OtpVerification from '@/features/seller-registration/components/otp-verification'
import SellerAddress from '@/features/seller-registration/components/seller-address'
import { Check } from 'lucide-react'
import React, { useState } from 'react'

const SellerRegistrationPage = () => {
    const [steps, setSteps] = useState<number>(1)
    const totalSteps = 4

    const handleNext = () => setSteps(prev => Math.min(prev + 1, totalSteps))
    const handleBack = () => setSteps(prev => Math.min(prev - 1, totalSteps))

    return (
        <div className=''>
            <Navbar />
            <div className='flex-1 pt-12 flex flex-col gap-y-16 bg-white' style={{ gap: 64 }}>
                <div className='flex flex-col justify-center items-center gap-y-10 w-full' style={{ paddingInline: 88 }}>
                    <div className='flex flex-col gap-y-4 justify-center items-center'>
                        <h4 className='font-raleway font-semibold text-h4 text-primary-500 leading-10 tracking-wide text-center'>Seller Account Registration</h4>
                        <p className='font-poppins text-body-s text-heading leading-6 text-center tracking-wide'>Create your seller account to list artworks, fulfill orders, and receive payouts securely.</p>
                    </div>

                    {/* Stepper Container - Flattened for pixel-perfect alignment */}
                    <div className='flex items-start justify-between w-full'>
                        {Array.from({ length: totalSteps }, (_, index) => (
                            <React.Fragment key={index}>
                                {/* Step Node */}
                                <div className='flex flex-col gap-y-2 justify-start items-center w-32 shrink-0 relative z-10'>
                                    <span 
                                        className={`w-6 h-6 rounded-full border-2 flex justify-center items-center transition-all duration-300
                                            ${steps === index + 1 ? 'outline outline-2 outline-offset-1 outline-primary-500' : ''} 
                                            ${steps > index + 1 ? 'border-none bg-primary-500' : 'border-gray-100 bg-white'}
                                        `}
                                    >
                                        {steps > index + 1 && <Check color='#fff' size={12} strokeWidth={3} />}
                                    </span>

                                    <p className={`font-poppins font-medium text-body-s leading-6 tracking-wide text-center whitespace-nowrap mt-2 ${steps === index + 1 ? 'text-primary-500' : 'text-body'}`}>
                                        {index === 0 && 'Account Basics'}
                                        {index === 1 && 'Phone Verification'}
                                        {index === 2 && 'Fulfilment Address'}
                                        {index === 3 && 'Agreement & Confirmation'}
                                    </p>
                                </div>

                                {/* Connecting Line */}
                                {index < totalSteps - 1 && (
                                    <div className='flex-1 flex items-center pt-3'>
                                        <hr className={`w-full border-t-2 transition-colors duration-300 ${steps > index + 1 ? 'border-primary-500' : 'border-gray-200'}`} />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {steps === 1 && <AccountBasics onNext={handleNext} />}
                {steps === 2 && <OtpVerification phone='08029049304' onNext={handleNext} onBack={handleBack} />}
                {steps === 3 && <SellerAddress onNext={handleNext} />}
                {steps === 4 && <AgreementConfirmation />}
            </div>
            
            <Footer />
        </div>
    )
}

export default SellerRegistrationPage