'use client'
import { Button } from '@/components'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ChevronsRight } from 'lucide-react'
import React from 'react'

const EmptyCartPage = () => {
    const router = useRouter()
    
    return (
        <div className='pt-[85px] pb-14 flex justify-center items-center min-h-screen bg-white'>
            
            <div className='w-full max-w-[509px] px-4 lg:h-[590px]'>
                <div className='flex flex-col justify-center items-center gap-y-12 w-full'>
                    
                    <div className="relative mx-auto h-[168px] w-[203px] lg:h-[378px] lg:w-[448px] shrink-0 overflow-hidden rounded-2xl">
                        <Image
                            src='/images/empty-cart.svg'
                            fill
                            className="object-cover"
                            alt='empty cart icon'
                        />
                    </div>
                    <div className='flex flex-col gap-y-4 justify-center items-center text-center'>
                        <p className='font-poppins font-medium text-body-m lg:text-h6 leading-8 tracking-wide text-heading'>
                            Oops — your cart is as empty as a blank canvas!
                        </p>
                        <p className='max-w-[509px] font-poppins text-body-xs lg:text-body-m text-body tracking-wide text-center leading-6'>
                            Browse the Artsony Shop to discover one-of-a-kind pieces worth collecting.
                        </p>
                        <Button
                            onClick={() => router.push('/shop')}
                            variant='primary'
                            size='lg'
                            rightIcon='/icons/alt-arrow-right-double.svg'
                        >
                            Artsony Shop
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EmptyCartPage