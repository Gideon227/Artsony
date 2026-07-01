import { X } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

const VerifyEmail = () => {
    return (
        <div className='py-16 px-10 rounded-2xl border border-gray-50 relative gap-y-12'>
            <span className='absolute border border-gray-50 rounded-full w-10 h-10 items-center' style={{ top: 10, left: 10 }}>
                <span className='bg-gray-400 w-6 h-6 rounded-full items-center'>
                    <X color='white' size={20} />
                </span>
            </span>

            <h4 className='font-raleway font-medium text-h4 text-[#333333] leading-10 tracking-wide'>Verify New Email</h4>

            <div className='flex flex-col gap-y-6 px-4'>
                <Image src='/illustrations/email-check.svg' width={452} height={316} alt='email illustration' />
                <p className='font-poppins text-body-xs text-body tracking-wide text-center'>
                    A verification link has been sent to your new email fore*@gmail.com <span className='underline text-primary-500'>fore*@gmail.com</span><br /><br />
                    Click the link in your inbox to Finish.
                </p>

            </div>
            
        </div>
    )
}

export default VerifyEmail