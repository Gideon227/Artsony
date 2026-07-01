import { Input } from '@/components'
import { User } from '@/types'
import React from 'react'

const SocialSection = ({ user }: { user: User }) => {
    return (
        <div className='flex flex-col gap-y-6'>
            <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>Links & Socials</p>

            <div className='bg-secondary-50 p-6 gap-y-4 rounded-xl'>
                <div className='gap-y-2 flex flex-col w-full mb-6'>
                    <p className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>Website Link</p>
                    <Input placeholder='Website URL Link' rightIcon='/icons/cancel.svg' className='w-full flex-1' />
                </div>

                <div className='flex flex-col gap-y-4'>
                    <div className='gap-y-2 flex flex-col w-full'>
                        <p className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>Website Link</p>
                        <Input placeholder='Paste Behance Link' leftIcon='/socials/behance.svg' rightIcon='/icons/cancel.svg' />
                    </div>

                    <div className='gap-y-2 flex flex-col w-full'>
                        <p className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>Website Link</p>
                        <Input placeholder='Paste Pinterests Link' leftIcon='/socials/pinterest.svg' rightIcon='/icons/cancel.svg' />
                    </div>

                    <div className='gap-y-2 flex flex-col w-full'>
                        <p className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>Website Link</p>
                        <Input placeholder='Paste Twitter Link' leftIcon='/socials/twitter-blue.svg' rightIcon='/icons/cancel.svg' />
                    </div>

                    <div className='gap-y-2 flex flex-col w-full'>
                        <p className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>Website Link</p>
                        <Input placeholder='Paste LinkedIn Link' leftIcon='/socials/linkedin-blue.svg' rightIcon='/icons/cancel.svg' />
                    </div>

                </div>
            </div>    
        </div>
    )
}

export default SocialSection