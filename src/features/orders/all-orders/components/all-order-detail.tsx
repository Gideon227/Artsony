'use client'
import { Input } from '@/components'
import { Dropdown } from '@/components/ui/dropdown'
import React, { useState } from 'react'

const sortFilter = [
    { id: 'new-to-old', label: 'New to Old', value: 'b-a' },
    { id: 'old-to-new', label: 'Old to New', value: 'a-b' }
]

//MOCKUP DATA;
const orders = [
    {
        id: 'AR-621843ED',
        artwork: 'Crimson Echoes',
        thumbnail: '/images/mock/art-1.png',
        type: 'Physical',
        buyer: 'Salvador Okeef...',
        date: '22.10.2025 - 11:10 AM',
        status: 'Live',
        quantity: 10,
        price: '$239.46',
    },
    {
        id: 'AR-245306YR',
        artwork: 'Zero Gravity Blue',
        thumbnail: '/images/mock/art-2.png',
        type: 'Physical',
        buyer: 'Heidi Reichel',
        date: '22.10.2025 - 08:14 PM',
        status: 'Live',
        quantity: 98,
        price: '$1,501.01',
    },
    {
        id: 'AR-413280JI',
        artwork: 'Solstice of the...',
        thumbnail: '/images/mock/art-3.png',
        type: 'Digital',
        buyer: 'Roland Keebler',
        date: '21.10.2025 - 01:59 PM',
        status: 'Delivered',
        quantity: 76,
        price: '$9,952.25',
    },
    {
        id: 'AR-180699GB',
        artwork: 'Riverbend Noct...',
        thumbnail: '/images/mock/art-4.png',
        type: 'Physical',
        buyer: 'Nancy Swift',
        date: '21.10.2025 - 07:26 PM',
        status: 'Pending',
        quantity: 99,
        price: '$6,421.14',
    },
    {
        id: 'AR-955394AQ',
        artwork: 'Salt Spray and...',
        thumbnail: '/images/mock/art-5.png',
        type: 'Digital',
        buyer: 'Marty Hickle',
        date: '20.10.2025 - 09:53 AM',
        status: 'Delivered',
        quantity: 90,
        price: '$7,085.49',
    },
    {
        id: 'AR-733167SK',
        artwork: 'Obsidian Peaks',
        thumbnail: '/images/mock/art-6.png',
        type: 'Physical',
        buyer: 'Diana Dooley',
        date: '20.10.2025 - 05:37 AM',
        status: 'Delivered',
        quantity: 53,
        price: '$6,613.22',
    },
    {
        id: 'AR-549633CV',
        artwork: 'Waiting for the...',
        thumbnail: '/images/mock/art-7.png',
        type: 'Physical',
        buyer: 'Earl Kessler',
        date: '16.10.2025 - 11:44 AM',
        status: 'Delivered',
        quantity: 7,
        price: '$7,892.65',
    },
    {
        id: 'AR-000000AX',
        artwork: 'Fire Escape Sy...',
        thumbnail: '/images/mock/art-8.png',
        type: 'Physical',
        buyer: 'Miss Fred Bahr...',
        date: '16.10.2025 - 08:51 AM',
        status: 'Cancelled',
        quantity: 25,
        price: '$8,360.19',
    },
]

const statusStyles = {
  Live: 'bg-[#E6F4FF] text-[#0085FF]',
  Delivered: 'bg-[#EAF8EF] text-[#24A148]',
  Pending: 'bg-[#FFF4E5] text-[#F59E0B]',
  Cancelled: 'bg-[#FDECEC] text-[#EF4444]',
}

const AllOrderDetail = () => {
    const [searchInput, setSearchInput] = useState('')

    const searchResult = (e: any) => {
        if (e.key === 'Enter' || e.key === 'return') {
            e.preventDefault(); 
            
            console.log('Enter key was pressed!');
        }
    }

    return (
        <div className='p-4 border rounded-2xl flex flex-col gap-y-12 bg-secondary-50 w-3/4'>
            {/* Headers */}
            <div className='p-4 flex flex-col gap-y-14 bg-white'>
                <h2 className='font-raleway font-semibold text-h5 text-body tracking-wide'>Search</h2>
                <div className='flex items-center gap-x-4 w-full'>
                    <Input 
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value) }
                        placeholder='Search by Order ID, Customer, Artwork name'
                        className='w-1/2 h-12'
                    />

                    <Dropdown 
                        options={sortFilter}
                        placeholder='New to Old'
                    />

                    {/* <Dropdown 
                        options={sortFilter}
                        placeholder='More Filters'
                    /> */}
                </div>
            </div>

            {/* Order Data */}
            <div className='w-full flex flex-col gap-y-2'>
                <div className=''></div>
            </div>
        </div>
    )
}

export default AllOrderDetail