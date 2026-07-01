import { Navbar } from '@/components/layout/navbar'
import LeftSideBarComp from '@/features/orders/all-orders/components/left-sidebar'
import React from 'react'

const MyOrderPage = () => {
    return (
        <>
            <Navbar />
            <div className='px-8 py-6 flex bg-white'>
                <div className='bg-secondary-50 rounded-2xl p-4 flex gap-x-4 '>
                    <LeftSideBarComp />

                </div>
            </div>
        </>
    )
}

export default MyOrderPage