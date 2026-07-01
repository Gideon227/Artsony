import { Button, Checkbox } from '@/components'
import { Check, Mail, Globe } from 'lucide-react'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

const AgreementConfirmation = () => {
    // Functional state handling for user acknowledgment criteria
    const [isAgreed, setIsAgreed] = useState(false)
    const route = useRouter()

    const handleToggleAgreement = () => {
        setIsAgreed((prev) => !prev)
    }

    const handleFinish = () => {
        if (!isAgreed) return
        console.log('Terms explicitly acknowledged. Proceeding to profile finalization.')
        route.push('/')
    }

    return (
        <div className='mx-auto border border-gray-50 bg-white rounded-[32px] py-10 px-6 md:px-14 flex flex-col gap-y-6 max-w-4xl shadow-sm'>
            
            {/* Scrollable Document Body Container */}
            <div className='max-h-[320px] overflow-y-auto pr-4 custom-scrollbar flex flex-col gap-6 text-gray-700'>
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

                    {/* Section 14 Layout Match from Image */}
                    <h3 className='text-base font-semibold text-heading pt-4'>14. Contact</h3>
                    <p className='text-sm text-gray-600'>For inquiries about these Terms or your account:</p>
                    <div className='flex flex-col gap-y-2 pt-1 text-sm text-gray-700'>
                        <div className='flex items-center gap-x-2'>
                            <Mail size={16} className='text-heading' />
                            <span className='font-medium'>support@artsony.io</span>
                        </div>
                        <div className='flex items-center gap-x-2'>
                            <Globe size={16} className='text-heading' />
                            <span className='font-medium'>www.artsony.io/terms</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Interactive Custom Checkbox Row */}
            <div 
                onClick={handleToggleAgreement}
                className='flex items-start gap-x-4 pt-4 border-t border-gray-100 cursor-pointer select-none group'
            >
                {/* <div 
                    onClick={(e) => {
                        e.stopPropagation(); // Prevents double-toggling when clicking directly on the circle
                        handleToggleAgreement();
                    }}
                    className={`flex items-center justify-center rounded-full transition-all duration-200 mt-0.5 flex-shrink-0 w-6 h-6 border ${
                        isAgreed 
                            ? 'bg-action border-action text-white scale-100' 
                            : 'border-gray-300 bg-white group-hover:border-action'
                    }`}
                >
                    {isAgreed && <Check size={14} strokeWidth={3} />}
                </div> */}

                <Checkbox />

                <p className='font-poppins font-medium text-body-xs text-action leading-5 tracking-wide text-left transition-opacity duration-200'>
                    By checking this box, I acknowledge that I have read, understood, and agree to Artsony’s Seller Terms and Conditions. I confirm the accuracy of the information provided and consent to Artsony’s processing of my details for seller verification and payouts.
                </p>
            </div>

            {/* Anchored Footer Control Actions */}
            <div className='w-full flex justify-center pt-2'>
                <Button 
                    onClick={handleFinish}
                    disabled={!isAgreed}
                    rightIcon='/icons/verified-check-white.svg' 
                    // className={`px-10 py-3 rounded-full font-poppins font-semibold tracking-wide text-white transition-all duration-300 ${
                    //     isAgreed 
                    //         ? 'bg-action hover:opacity-95 shadow-md cursor-pointer' 
                    //         : 'bg-gray-300 cursor-not-allowed opacity-60'
                    // }`}
                    style={{ width: 180, height: 48 }}
                >
                    Finish
                </Button>
            </div>
        </div>
    )
}

export default AgreementConfirmation;