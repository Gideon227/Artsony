'use client'
import { Button } from '@/components'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'

const EmptyCartPage = () => {
    const router = useRouter()
    
    return (
        <div className='mt-[85px] mb-14 flex justify-center items-center'>
            <div className='w-[509px] h-[590px]'>
                <div className='flex flex-col justify-center item-center gap-y-12'>
                    <Image src='/images/empty-cart.svg' width={448} height={378} alt='empty cart icon' />
                    <div className='flex flex-col gap-y-4 justify-center items-center text-center'>
                        <p className='font-poppins font-medium text-xl leading-8 tracking-wide text-heading'>Oops — your cart is as empty as a blank canvas!</p>
                        <p className='max-w-[509px] font-poppins text-body-m text-body tracking-wide text-center leading-6'>Browse the Artsony Shop to discover one-of-a-kind pieces worth collecting.</p>
                        <Button
                            onClick={() => router.push('/shop')}
                            variant='primary'
                            size='lg'
                            rightIcon='/icons/alt-arrow-right-double.svg'
                        >Artsony Shop</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EmptyCartPage