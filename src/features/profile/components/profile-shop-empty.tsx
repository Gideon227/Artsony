import { Button } from '@/components'
import Image from 'next/image'
import React from 'react'

const ProfileShopEmpty = () => {
    return (
        <div className='pt-12 pb-24 flex flex-col justify-center items-center mx-auto px-6 gap-y-12'>
            <Image src='/illustrations/empty-profile-shop.svg' width={600} height={366} alt='illustatios' />
            <div className='flex flex-col gap-y-4 items-center justify-center'>
                <p className='font-poppins font-medium text-h6 text-heading'>Your Shop is empty</p>
                <p className='max-w-125 font-poppins text-body-m text-body text-center'>Start selling your artwork by creating your first listing. Once published, your products will appear here for collectors and buyers to discover.</p>
                <Button size='md' leftIcon='/icons/tag-white.svg' className='mt-2'>List Artwork</Button>
            </div>
            
        </div>
    )
}

export default ProfileShopEmpty