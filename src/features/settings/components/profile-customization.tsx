import { Button } from '@/components'
import React from 'react'
import InfoSection from '../sections/info-section'
import { useAuthStore } from '@/store'
import ImageSection from '../sections/image-section'
import SocialSection from '../sections/social-section'

const ProfileCustomization = () => {
    const { user } = useAuthStore()

    return (
        <div className='border border-gray-50 rounded-2xl bg-white w-full'>
            <div className='px-8 py-4 flex justify-between items-center border-b border-gray-50 '>
                <h5 className='font-raleway font-semibold text-h5 text-primary-500 leading-10 tracking-wide'>Profile Customization</h5>
                <Button size='sm' onClick={() => {}}>Send</Button>
            </div>

            <div className='pt-12 px-8 overflow-y-scroll gap-y-16 flex flex-col'>
                <InfoSection user={user!} />
                <ImageSection user={user!} />
                <SocialSection user={user!}/>
            </div>
        </div> 
    )
}

export default ProfileCustomization