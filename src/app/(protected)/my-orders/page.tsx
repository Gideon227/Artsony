import { Navbar } from '@/components/layout/navbar'
import LeftSideBarComp from '@/features/orders/components/left-sidebar'
import React from 'react'

const MyOrderPage = () => {
    return (
        <>
            <Navbar />
            <div className='px-8 py-6 flex gap-x-4 bg-white'>
                <LeftSideBarComp />
            </div>
        </>
    )
}

export default MyOrderPage