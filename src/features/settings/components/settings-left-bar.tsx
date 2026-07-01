'use client'

import { useAuthStore } from '@/store'
import {
  ArrowLeftIcon,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AccountDetails from './account-details'
import PrivacySafety from './privacy-safety'
import Security from './security'
import ShippingLocation from './shipping-location'
import BillingPayment from './billing-payment'
import ProfileCustomization from './profile-customization'
import NotificationSettings from './notification'

type NavItem = {
  id: string
  label: string
  onClick?: React.ReactNode
  icon: string
  variant?: 'default' | 'destructive'
}

const NAV_ITEMS: NavItem[] = [
  { id: 'personal', label: 'Personal Customization', icon: '/icons/tuning.svg'  },
  { id: 'account', label: 'Account Details',  icon: '/icons/user-grey.svg' },
  { id: 'privacy-safety', label: 'Privacy & Safety', icon: '/icons/eye.svg' },
  { id: 'security', label: 'Security', icon: '/icons/shield.svg' },
  { id: 'notification', label: 'Notification', icon: '/home/notification-bell.svg' },
  { id: 'payment', label: 'Billing & Payment', icon: '/icons/wallet.svg'  },
  { id: 'shipping-location', label: 'Shipping & Location', icon: '/icons/compass.svg' },
]

function ProfileSkeleton() {
  return (
    <div className="flex gap-x-4 items-center w-full animate-pulse" aria-hidden="true">
      <div className="w-28 h-28 rounded-full bg-gray-100 shrink-0" />
      <div className="flex flex-col gap-y-2 flex-1">
        <div className="h-6 w-32 rounded-md bg-gray-100" />
        <div className="h-4 w-24 rounded-md bg-gray-100" />
      </div>
      <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
    </div>
  )
}

interface SettingLeftBarProps {
    activeTab: string
    setActiveTab: (value: string) =>  void;  
    onLogout?: () => void
    onDeleteAccountRequest?: () => void
}

const SettingLeftBar = ({ onLogout, onDeleteAccountRequest, activeTab, setActiveTab }: SettingLeftBarProps) => {
    const { user } = useAuthStore()

    const memberSinceYear = (() => {
        if (!user?.created_at) return null
        const date = new Date(user.created_at)
        return Number.isNaN(date.getTime()) ? null : date.getFullYear()
    })()

    return (
        <nav
            aria-label="Settings navigation"
            className="border border-gray-50 rounded-[32px] pt-8 pb-4 px-4 flex flex-col gap-y-8"
        >
        <div className="flex items-center gap-x-4">
            <Link
                href="/settings"
                aria-label="Go back"
                className="w-10 h-10 border border-gray-50 rounded-full flex items-center justify-center hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-50"
            >
                <ArrowLeftIcon color="#525965" size={16} />
            </Link>

            <h6 className="font-raleway font-semibold text-h6 text-body leading-8 tracking-wide">
                Settings
            </h6>
        </div>

        {!user ? (
            <ProfileSkeleton />
        ) : (
            <div className="flex gap-x-4 items-center">
                <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                    <Image
                        src="/home/profile-ring.svg"
                        alt=""
                        width={112}
                        height={112}
                        className="object-contain"
                        priority
                    />

                    <div className="absolute rounded-full overflow-hidden" style={{ width: 86, height: 86 }}>
                        <Image
                            src={user.avatarUrl || '/images/image-avatar.svg'}
                            alt={`${user.username}'s profile picture`}
                            width={86}
                            height={86}
                            className="object-cover w-full h-full border border-gray-50"
                        />
                    </div>
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                    <h6 className="font-poppins font-medium text-h6 text-heading leading-8 tracking-wide truncate">
                        {user.username}
                    </h6>
                    {memberSinceYear && (
                        <p className="font-poppins text-body-xs text-primary-500 leading-6 tracking-wide">
                            Member since {memberSinceYear}
                        </p>
                    )}
                </div>

                <button
                    type="button"
                    onClick={onLogout}
                    aria-label="Log out"
                    className="border border-gray-50 rounded-full w-10 h-10 flex items-center justify-center shrink-0 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-50"
                >
                    <Image src='/icons/logout.svg' width={22} height={22} alt='logout icon' />
                </button>
            </div>
        )}

        <div className="border-t border-gray-50 pt-4 flex flex-col gap-y-4">
            {NAV_ITEMS.map((item) => {
                const isActive = activeTab === item.id

                const sharedClasses =
                    'group flex items-center  cursor-pointer rounded-xl py-6 px-4 gap-x-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-50'

                const stateClasses = isActive
                    ? 'bg-primary-50 border border-gray-50 ring-2 ring-primary-500'
                    : 'border border-transparent hover:bg-primary-50'

                const content = (
                    <>
                        <Image
                            src={item.icon as string}
                            width={20}
                            height={20}
                            alt='icon'
                            className="shrink-0"
                        />
                        <p
                            className={`font-poppins text-body-s leading-6 truncate ${
                            isActive ? 'text-primary-500' : 'text-body'
                            }`}
                        >
                            {item.label}
                        </p>
                    </>
                )

                return (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`${sharedClasses} ${stateClasses}`}
                    >
                        {content}
                    </button>
                )
            })}
        </div>
        </nav>
    )
}

export default SettingLeftBar