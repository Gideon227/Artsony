import { Button } from '@/components'
import { X } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

const Confirmation = () => {
    return (
        <div className='py-16 px-10 rounded-2xl border border-gray-50 relative gap-y-12'>
            <span className='absolute border border-gray-50 rounded-full w-10 h-10 items-center' style={{ top: 10, left: 10 }}>
                <span className='bg-gray-400 w-6 h-6 rounded-full items-center'>
                    <X color='white' size={20} />
                </span>
            </span>

            <h4 className='font-raleway font-medium text-h4 text-[#333333] leading-10 tracking-wide'>Are you sure?</h4>
            
            <div className='flex flex-col gap-y-4 items-center justify-center'>
                <p className='font-poppins text-body-xs text-body tracking-wide text-center'>
                    This action can&apos;t be undone once confirmed. 
                    The order will be permanently canceled, and your refund will be processed 
                    according to Artsony&apos;s policy.
                </p>
                <div className='flex gap-x-4'>
                    <Image src='' width={16} height={16} alt='icon' />
                    <p className='font-poppins text-body-xs text-body tracking-wide text-center'>
                        This item may not be available for repurchase once canceled.
                    </p>
                </div>
            </div>

            <div className='flex items-center justify-between w-full'>
                <Button variant='outline' size='lg'>Cancel</Button>
                <Button size='lg'>Finish</Button>
            </div>
        </div>
    )
}

export default Confirmation