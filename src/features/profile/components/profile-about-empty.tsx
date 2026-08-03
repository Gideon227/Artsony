import { Button } from '@/components'
import Image from 'next/image'
import React from 'react'

const ProfileAboutEmpty = () => {
    return (
        <div className='pt-12 pb-24 flex flex-col justify-center items-center mx-auto px-6 gap-y-12'>
            <Image src='/illustrations/empty-profile-about.svg' width={500} height={329} alt='illustatios' />
            <div className='flex flex-col gap-y-4 items-center justify-center'>
                <p className='font-poppins font-medium text-h6 text-heading'>Tell your story</p>
                <p className='max-w-125 font-poppins text-body-m text-body text-center'>Share your background, artistic style, experience, and inspiration to create a stronger connection with your audience.</p>
                <Button size='md' leftIcon='/icons/pen.svg' className='mt-2'>Edit Profile</Button>
            </div>
            
        </div>
    )
}

export default ProfileAboutEmpty