import { Navbar } from '@/components/layout/navbar'
import EmptyCartPage from '@/features/cart/components/empty-cart-page'
import Image from 'next/image'
import React from 'react'

const CartPage = () => {
    const cartProducts: any[] = []

    return (
        <div className='bg-white py-14 px-8'>
            <Navbar />
            <div className='flex justify-between items-center pb-12'>
                <h2 className='font-raleway font-semibold text-body text-h4 leading-10 tracking-wide'>Cart</h2>
                <div className='flex gap-3 items-center'>
                    <div className='rounded-full bg-primary-500 p-2'>
                        <Image src='/icons/cart-white.svg' width={24} height={24} alt='cart icon' />
                    </div>

                    <p className='font-raleway font-medium text-h5 text-body leading-8 tracking-wide'>/5</p>
                </div>
            </div>
            {cartProducts.length > 0 
                ? <CartPage />
                : <EmptyCartPage />
            }
        </div>
    )
}

export default CartPage