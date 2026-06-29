'use client'
import { Navbar } from '@/components/layout/navbar'
import AccountBasics from '@/features/seller-registration/components/account-basics'
import Footer from '@/features/seller-registration/components/footer'
import { Check } from 'lucide-react'
import React, { useState } from 'react'

const SellerRegistrationPage = () => {
    const [steps, setsteps] = useState<number>(0)

    let totalSteps = 4
    return (
        <div className=''>
            <Navbar />
            <div className='flex-1 pt-12 h-[90vh] flex flex-col gap-y-16 bg-white'>
                <div className='px-8 flex flex-col justify-center items-center gap-y-10 w-full'>
                    <div className='flex flex-col gap-y-4 justify-center items-center'>
                        <h4 className='font-raleway font-semibold text-h4 text-primary-500 leading-10 tracking-wide text-center'>Seller Account Registration</h4>
                        <p className='font-poppins text-body-s text-heading leading-6 text-center tracking-wide'>Create your seller account to list artworks, fulfill orders, and receive payouts securely.</p>
                    </div>

                    <div className='px-14 flex items-center justify-center gap-x-6'>
                        {Array.from({ length: totalSteps }, (_, index) => (
                            <div className='flex items-center justify-center gap-x-6'>
                                <div className='flex flex-col gap-y-2 justify-center items-center'>
                                    <span className={`w-6 h-6 rounded-full border-2 border-gray-100 ${steps === index && 'outline outline-offset-4 outline-primary-500'} ${steps === index + 1 && 'border-none bg-primary-500 '} `}>
                                        {steps === index + 1 && <Check color='#fff' size={12} />}
                                    </span>

                                    <p className={`font-poppins font-medium text-body-s leading-6 tracking-wide text-center ${steps === index + 1 ? 'text-primary-500' : 'text-body'}`}>
                                        {steps === 1 && 'Account Basics'}
                                        {steps === 2 && 'Phone Verification'}
                                        {steps === 1 && 'Fulfilment Address'}
                                        {steps === 1 && 'Agreement & Confirmation'}
                                    </p>
                                </div>

                                {steps === index + 1 && <hr className={`flex-1 ${steps === index + 1 ? 'text-primary-500' : 'text-gray-200'}`} />}
                            </div>
                        ))}
                        
                    </div>
                </div>

                <AccountBasics />
            </div>
            <Footer />
        </div>
    )
}

export default SellerRegistrationPage