'use client'

import Image from 'next/image'
import React from 'react'
import clsx from 'clsx'

interface NavContentProps {
  id: string
  icon: string
  text: string
  isSelected: boolean
  notification: number
}

const navContent: NavContentProps[] = [
    {
        id: 'all-orders',
        icon: '/icons/orders/all-orders.svg',
        text: 'All Orders',
        isSelected: true,
        notification: 0,
    },
    {
        id: 'live-orders',
        icon: '/icons/orders/live-orders.svg',
        text: 'Live Orders',
        isSelected: false,
        notification: 0,
    },
    {
        id: 'pending-orders',
        icon: '/icons/orders/pending-orders.svg',
        text: 'Pending Orders',
        isSelected: false,
        notification: 0,
    },
    {
        id: 'completed-orders',
        icon: '/icons/orders/completed-orders.svg',
        text: 'Completed Orders',
        isSelected: false,
        notification: 0,
    },
    {
        id: 'canceled-orders',
        icon: '/icons/orders/cancelled-orders.svg',
        text: 'Canceled Orders',
        isSelected: false,
        notification: 0,
    },
]

const LeftSideBarComp = () => {
    return (
        <aside className="w-1/4 min-h-screen bg-[#F5F7F8] rounded-r-2XL px-4 py-8">
            <h2 className="font-raleway text-H4 font-semibold leading-none text-primary-500">
                Order Management
            </h2>

            <div className="mt-10 flex flex-col gap-4">
                {navContent.map((nav) => (
                    <button
                        key={nav.id}
                        className={clsx(
                        'w-full h-[76px] rounded-2xl px-6 flex items-center flex-1 gap-x-4 transition-all duration-200',
                        nav.isSelected
                            ? 'border-2 border-gray-50 outline outline-offset-2 outline-primary-500 bg-[#FFF1ED]'
                            : 'border-2 border-transparent hover:bg-white'
                        )}
                    >
                        <Image
                            src={nav.icon}
                            alt={nav.text}
                            width={22}
                            height={22}
                        />

                        <span
                            className={clsx(
                            'font-poppins text-[22px] leading-none flex-1',
                            nav.isSelected
                                ? 'text-primary-500'
                                : 'text-[#525965]'
                            )}
                        >
                            {nav.text}
                        </span>

                        {nav.notification > 0 && (
                            <div className="min-w-[28px] h-[28px] rounded-lg bg-primary-500 flex items-center justify-center px-2">
                                <span className="text-white text-sm font-medium">
                                {String(nav.notification).padStart(2, '0')}
                                </span>
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </aside>
    )
}

export default LeftSideBarComp