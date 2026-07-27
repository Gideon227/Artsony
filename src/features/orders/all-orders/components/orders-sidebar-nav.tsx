'use client'

import { Package, Truck, Hourglass, Flag, FileX2, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STATUS_GROUP_META, STATUS_GROUP_VALUES, type OrderStatusGroup } from '@/lib/orders/status'
import Image from 'next/image'

type NavItem = {
  id: OrderStatusGroup | 'ALL'
  label: string
  icon: string
  count: number
}

export type OrdersSidebarNavProps = {
  activeGroup: OrderStatusGroup | 'ALL'
  onChangeGroup: (group: OrderStatusGroup | 'ALL') => void
  counts: Record<OrderStatusGroup | 'ALL', number>
  className?: string
}

const GROUP_ICONS: Record<OrderStatusGroup, string> = {
  LIVE: '/icons/bus.svg',
  PENDING: '/icons/hourglass.svg',
  COMPLETED: '/home/delivery.svg',
  CANCELLED: '/icons/notification-cancel.svg',
}

function OrdersSidebarNav({ activeGroup, onChangeGroup, counts, className }: OrdersSidebarNavProps) {
    const items: NavItem[] = [
        { id: 'ALL', label: 'All Orders', icon: '/icons/box.svg', count: counts.ALL },
        ...STATUS_GROUP_VALUES.map((group) => ({
            id: group,
            label: STATUS_GROUP_META[group].sidebarLabel,
            icon: GROUP_ICONS[group],
            count: counts[group],
        })),
    ]

    return (
        <nav aria-label="Order Management" style={{ backgroundColor: '#F5FAFA' }} className={cn('py-8 px-4 rounded-2xl flex flex-col gap-y-8', className)}>
            <div className='flex gap-x-4 items-center'>
                <span className='border border-gray-50 rounded-full flex justify-center p-2 items-center w-8 h-8'>
                    <ArrowLeft size={16}/>
                </span>
                <h2 className="font-raleway font-semibold text-h6 leading-8 text-body">Order Management</h2>
            </div>

            <ul className="flex flex-col border-t border-gray-50 pt-4 gap-y-4">
                {items.map((item) => {
                    const isActive = item.id === activeGroup
                    return (
                        <li key={item.id}>
                            <button
                                type="button"
                                onClick={() => onChangeGroup(item.id)}
                                aria-current={isActive ? 'page' : undefined}
                                style={{ borderRadius: 16 }}
                                className={cn(
                                    'flex w-full items-center gap-4 rounded-m px-4 py-6 text-left text-body-s font-poppins transition-colors',
                                    // 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
                                    isActive
                                        ? 'border border-gray-50 bg-primary-50 text-primary-500 ring-2 ring-offset-2 ring-primary-500'
                                        : 'text-body hover:bg-white/60'
                                )}
                            >
                                <Image src={item.icon} width={24} height={24} alt='icons'  />
                                <span className="flex-1 truncate">{item.label}</span>
                                {item.id === 'ALL' && (
                                    <span
                                        className={cn(
                                        'flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-body-xxs font-semibold',
                                        isActive ? 'bg-primary-500 text-white' : 'bg-primary-100 text-primary-600'
                                        )}
                                    >
                                        {item.count}
                                    </span>
                                )}
                            </button>
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}

export { OrdersSidebarNav }