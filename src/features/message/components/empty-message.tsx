import Image from 'next/image'
import React from 'react'

const EmptyMessage = () => {
    return (
        <div className='bg-white px-8 pb-8 pt-14 flex flex-col gap-2'>
            <h2 className='font-raleway font-semibold text-body text-h4 leading-10 tracking-wide'>Messages</h2>
        
            <div className='flex flex-col gap-12 items-center justify-center max-w-138'>
                <Image src='/images/message-void.png' width={382} height={400} alt='empty message illustration' />
                <div className='flex flex-col gap-6 items-center justify-center'>
                    <div className='flex flex-col gap-4 items-center justify-center'>
                        <p className='font-poppins font-medium text-heading text-body-xl leading-8 tracking-wide'>Your Inbox is empty</p>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default EmptyMessage