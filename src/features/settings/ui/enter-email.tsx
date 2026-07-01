import { Button, Input } from '@/components'
import { X } from 'lucide-react'
import React from 'react'

const EnterEmail = () => {
    return (
        <div className='py-16 px-10 rounded-2xl border border-gray-50 relative gap-y-12'>
            <span className='absolute border border-gray-50 rounded-full w-10 h-10 items-center' style={{ top: 10, left: 10 }}>
                <span className='bg-gray-400 w-6 h-6 rounded-full items-center'>
                    <X color='white' size={20} />
                </span>
            </span>

            <h4 className='font-raleway font-medium text-h4 text-[#333333] leading-10 tracking-wide'>Enter New Email</h4>
            
            <div className='flex flex-col gap-y-2'>
                <p className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>Email</p>
                <Input placeholder='example@gmail.com' />
            </div>

             <div className='w-full flex items-center justify-center'>
                <Button leftIcon='/icons/verified-check-white.svg' className='mx-auto'>Verify</Button>
             </div>
        </div>
    )
}

export default EnterEmail