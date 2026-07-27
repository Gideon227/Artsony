'use client'
import { Button } from '@/components'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'

const EmptySearch = () => {
    const router = useRouter()

    return (
        <div className='flex flex-col gap-y-12 items-center justify-center w-full py-24 px-4 bg-white'>
            <div className='w-[60vw] md:w-[40vw] h-[400px] relative shrink-0'>
                <Image src='/images/empty_search.png' fill className='object-contain' alt='empty search' />
            </div>
            
            <div className='flex flex-col gap-y-6 items-center justify-center'>
                <div className='flex flex-col items-center justify-center gap-y-4'>
                    <p className='font-poppins font-medium text-heading text-h6 '>Looks Like This Canvas Is Empty</p>
                    <p className='font-poppins max-w-[680px] text-body-m text-body max-md:text-center '>We couldn’t find a match for your search. Browse the explore page and uncover artwork from creators around the world.</p>
                </div>
                <Button rightIcon='/icons/alt-arrow-right-double.svg' onClick={() => router.push('/discover')}>Explore</Button>
            </div>
        </div>
    )
}

export default EmptySearch