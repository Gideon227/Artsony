import { User } from '@/types'
import Image from 'next/image'
import React from 'react'

const ImageSection = ({ user }: { user: User }) => {
    return (
        <div className='flex flex-col gap-y-6'>
            <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>Images</p>

            <div className='bg-secondary-50 p-6 gap-y-4 rounded-xl'>
                <div className='gap-y-2 flex flex-col w-full'>
                    <p className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>Profile Images</p>
                    <div className='flex items-center justify-center mx-auto w-full'>
                        <div className='relative w-36 h-58'>
                            <Image src={user?.avatarUrl as string || '/images/image-avatar.svg'} width={144} height={144} alt='profile image' className='border border-grqay-50' />
                            <button onClick={() => {}} className='absolute cursor-pointer w-14 h-14 bg-primary-500 rounded-full' style={{ bottom: 10, left: '50%' }}>
                                <Image src='/icons/camera-white.svg' width={32} height={32} alt='camera icon' />
                            </button>
                        </div>
                    </div>
                </div>

                <div className='gap-y-2 flex flex-col w-full'>
                    <p className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>Profile Background</p>

                    <div className='rounded-m relative bg-gray-400' style={{ width: 800, height: 308 }}>
                        <div className='bg-[#00000080] absolute inset-0' />
                        <div className='flex gap-x-4 items-center justify-center mx-auto w-full'>
                            <button>
                                <Image src='/icons/camera-white.svg' width={32} height={32} alt='camera icon' />
                            </button>
                            <p className='font-poppins text-body-m text-white tracking-wide'>Resolution (1920px X 440px)</p>
                        </div>
                    </div>
                </div>

                
            </div>
            
        </div>
    )
}

export default ImageSection