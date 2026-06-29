'use client'
import { Input } from '@/components';
import { ArrowLeftIcon } from 'lucide-react';
import Image from 'next/image';
import React from 'react'

interface NavContentProps {
    id: string;
    icon: string;
    text: string;
    isSelected: boolean;
    notification: number;
}


const LeftSideBarComp = () => {
    const navContent: NavContentProps[] = [
        { id: 'all-orders', icon: '/icons/', text: 'All Orders', isSelected: false, notification: 0 },
        { id: 'live-orders', icon: '/icons/', text: 'Live Orders', isSelected: false, notification: 0 },
        { id: 'pending-orders', icon: '/icons/', text: 'Pending Orders', isSelected: false, notification: 0 },
        { id: 'completed-orders', icon: '/icons/', text: 'Completed Orders', isSelected: false, notification: 0 },
        { id: 'canceled-orders', icon: '/icons/', text: 'Canceled Orders', isSelected: false, notification: 0 },
    ]

    return (
        <div className='bg-successful-100 px-4 pb-4 pt-6 flex flex-col gap-y-8 items-center justify-center'>
            <div className='flex items-center gap-x-4 '>
                <span className='w-10 h-10 border-gray-50 rounded-full items-center justify-center'>
                    <ArrowLeftIcon color='#525965' size={16} />
                </span>

                <h6 className='font-raleway font-semibold text-h6 text-body leading-8 tracking-wide'>Order Management</h6>
            </div>

            <div className='border-t border-gray-50 flex flex-col gap-y-4 pt-4'>
                {navContent?.map((nav) => (
                    <div key={nav.id} className={`flex group items-center justify-center border rounded-m py-6 px-4 gap-x-4 bg-transparent border-transparent group-hover:bg-primary-50 group-focus-visible:ring-2 group-focus-visible:ring-white group-focus-visible:border-gray-50 `}>
                        <Image src={nav.icon} width={19} height={18} alt='icons' />
                        <p className='font-poppins text-body-s leading-6 text-body group-hover-text-primary-500 '>{nav.text}</p>
                        <span className='border rounded-s bg-primary-500 p-1 items-center justify-center'>
                            <p className='text-white text-body-xs'>
                                {nav.notification > 0 && String(nav.notification)}
                            </p>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default LeftSideBarComp