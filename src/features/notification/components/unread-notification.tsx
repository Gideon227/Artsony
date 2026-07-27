import Image from 'next/image'
import React from 'react'

const UnreadNotification = () => {
    return (
        <div className='pt-16 px-4 bg-white flex flex-col gap-y-4 items-center justify-center'>
            <Image src='/images/unread-notification.png' width={257} height={282} alt='unread notification illustration' />
            <div className='flex flex-col gap-y-4 items-center justify-center'>
                <h2 className='font-poppins font-medium text-h6 text-heading leading-8 tracking-wide text-center'>Nothing New Right Now</h2>
                <p className='font-poppins text-body-m leading-6 tracking-wide text-center'>When there&apos;s activity related to your account, you&apos;ll see it here.</p>
            </div>
        </div>
    )
}

export default UnreadNotification