import { Button, Input } from '@/components'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

const LeftSideBar = () => {
    return (
        <div className='flex flex-col gap-y-4 '>
            {/* Topbar */}
            <div className='flex flex-col gap-y-8 pb-4'>
                <div className='flex items-center justify-start gap-x-4'>
                    <span className='p-2'>
                        <ArrowLeft color='#525965' size={24} />
                    </span>

                    <h4 className='font-raleway font-semibold text-h4 text-body tracking-wide leading-10'>My Orders</h4>
                </div>

                <div className='flex flex-col gap-y-4'>
                    <div className='flex gap-x-2 items-center w-full'>
                        <Input leftIcon='/home/magnifier.svg' placeholder='Search Order' className='flex-1' />
                        <span className='border border-gray-50 rounded-full p-2 justify-items-center'>
                            <Image src='/icons/tuning.svg' width={21} height={16} alt='tuning icon' />
                        </span>
                    </div>

                    <div className='flex items-center gap-x-2 w-full'>
                        <button className='cursor-pointer flex-1 px-6 py-3 border border-gray-50 rounded-2xl font-poppins text-body text-body-s'>Delivered</button>
                        <button className='cursor-pointer flex-1 px-6 py-3 border border-gray-50 rounded-2xl font-poppins text-body text-body-s'>Live</button>
                        <button className='cursor-pointer flex-1 px-6 py-3 border border-gray-50 rounded-2xl font-poppins text-body text-body-s'>Canceled</button>
                    </div>
                </div>

                
            </div>
        </div>
    )
}

export default LeftSideBar