'use client'

import { Button, Checkbox } from '@/components'
import { Mail, Globe } from 'lucide-react'
import React, { useState } from 'react'

interface AgreementConfirmationProps {
    isSubmitting: boolean
    onBack: () => void
    onFinish: () => void | Promise<void>
}

const AgreementConfirmation = ({ isSubmitting, onBack, onFinish }: AgreementConfirmationProps) => {
    const [isAgreed, setIsAgreed] = useState(false)

    const handleFinish = () => {
        if (!isAgreed || isSubmitting) return
        void onFinish()
    }

    return (
        <div className='mx-auto w-full border border-gray-50 bg-white rounded-[32px] py-8 px-4 sm:px-6 md:py-10 md:px-14 flex flex-col gap-y-6 max-w-4xl shadow-sm'>

            <div
                tabIndex={0}
                role='region'
                aria-label='Seller terms and conditions'
                className='max-h-[320px] overflow-y-auto pr-2 sm:pr-4 custom-scrollbar flex flex-col gap-6 text-gray-700'
            >
                <div className='font-poppins text-body-xs leading-6 tracking-wide space-y-4'>
                    <h2 className='text-base font-semibold text-heading'>Artsony Seller Terms and Conditions</h2>
                    <p className='text-text-disabled text-xs'>Last Updated: October 2025</p>

                    <p className='text-sm'>Welcome to Artsony — a global platform empowering artists to share, sell, and connect through art.</p>
                    <p className='text-sm'>These Seller Terms and Conditions (“Terms”) outline your rights and obligations when listing and selling artworks (digital or physical) on Artsony.</p>
                    <p className='text-sm'>By activating your seller account, you agree to comply with these Terms and all applicable laws.</p>

                    <h3 className='font-semibold text-heading pt-2'>1. Eligibility</h3>
                    <ul className='list-disc pl-5 space-y-1 text-sm'>
                        <li>Be at least 18 years old (or of legal age in your country).</li>
                        <li>Provide accurate personal information, including your legal name, email, and verified wallet address.</li>
                        <li>Own or have rights to the artworks you list for sale.</li>
                        <li>Be able to fulfill physical orders in a reasonable timeframe if you sell physical items.</li>
                    </ul>
                    <p className='text-sm'>Artsony reserves the right to suspend or remove accounts that fail verification or breach these Terms.</p>

                    <h3 className='font-semibold text-heading pt-2'>2. Account & Verification</h3>
                    <p className='text-sm'>You must maintain a verified seller account linked to your Web3Auth wallet for all transactions.</p>
                    <p className='text-sm'>Artsony may require additional identity verification to comply with international regulations and prevent fraud.</p>
                    <p className='text-sm'>You are responsible for keeping your wallet, password, and login credentials secure. Artsony is not liable for lost access due to compromised wallets or third-party breaches outside its control.</p>

                    <h3 className='font-semibold text-heading pt-2'>3. Artwork Ownership & Rights</h3>
                    <ul className='list-disc pl-5 space-y-1 text-sm'>
                        <li>You are the original creator or hold full rights to the artwork.</li>
                        <li>You grant Artsony a non-exclusive, royalty-free license to display, promote, and distribute your artwork for marketing and sales purposes on the platform.</li>
                        <li>You will not upload or sell any artwork that infringes on another person’s intellectual property, copyright, or trademark.</li>
                    </ul>

                    <h3 className='font-semibold text-heading pt-2'>13. Termination</h3>
                    <p className='text-sm'>Sellers can deactivate their account at any time. Artsony may also deactivate an account if:</p>
                    <ol className='list-decimal pl-5 space-y-1 text-sm'>
                        <li>Fraud or policy abuse is detected.</li>
                        <li>Repeated copyright infringement occurs.</li>
                        <li>Required verification documents are not provided.</li>
                        <li>Pending payouts will be settled before full account closure.</li>
                    </ol>

                    <h3 className='text-base font-semibold text-heading pt-4'>14. Contact</h3>
                    <p className='text-sm text-gray-600'>For inquiries about these Terms or your account:</p>
                    <div className='flex flex-col gap-y-2 pt-1 text-sm text-gray-700'>
                        <div className='flex items-center gap-x-2'>
                            <Mail size={16} className='text-heading' />
                            <span className='font-medium break-all'>support@artsony.io</span>
                        </div>
                        <div className='flex items-center gap-x-2'>
                            <Globe size={16} className='text-heading' />
                            <span className='font-medium break-all'>www.artsony.io/terms</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className='flex items-start gap-x-4 pt-4 border-t border-gray-100'>
                <Checkbox
                    id='seller-terms-agreement'
                    checked={isAgreed}
                    onChange={setIsAgreed}
                    disabled={isSubmitting}
                    aria-label='I agree to the Artsony Seller Terms and Conditions'
                />

                <label
                    htmlFor='seller-terms-agreement'
                    className='cursor-pointer select-none font-poppins font-medium text-body-xs text-action leading-5 tracking-wide text-left transition-opacity duration-200'
                >
                    By checking this box, I acknowledge that I have read, understood, and agree to Artsony’s Seller Terms and Conditions. I confirm the accuracy of the information provided and consent to Artsony’s processing of my details for seller verification and payouts.
                </label>
            </div>

            <div className='w-full flex flex-col-reverse sm:flex-row items-center justify-center gap-4 pt-2'>
                <Button
                    type='button'
                    variant='outline'
                    onClick={onBack}
                    disabled={isSubmitting}
                    className='w-full sm:w-[168px] h-12'
                >
                    Back
                </Button>
                <Button
                    onClick={handleFinish}
                    isLoading={isSubmitting}
                    loadingText='Submitting…'
                    disabled={!isAgreed || isSubmitting}
                    rightIcon='/icons/verified-check-white.svg'
                    className='w-full sm:w-[180px] h-12'
                >
                    Finish
                </Button>
            </div>
        </div>
    )
}

export default AgreementConfirmation