'use client'

import { Button } from '@/components'
import React, { useEffect, useState } from 'react'
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '@/hooks/use-notification-preferences'
import type { NotificationType } from '@/services/notification-preferences.service'

// --- 1. Interactive Switch Toggle Component ---
interface ToggleProps {
    checked: boolean;
    onChange: () => void;
}

const Toggle = ({ checked, onChange }: ToggleProps) => {
    return (
        <button
            type="button"
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-2xl transition-colors duration-200 focus:outline-none border border-primary-500 ${
                checked ? 'bg-primary-500' : 'bg-white'
            }`}
        >
            <span
                className={`inline-block transform rounded-full transition-transform duration-300 ease-in-out ${
                    checked ? 'translate-x-6 bg-white' : 'translate-x-1 bg-primary-500'
                }`}
                style={{ width: 18, height: 18 }}
            />
        </button>
    )
}

// --- 2. Controlled Row Box Component ---
interface CustomBoxProps {
    title: string;
    text: string;
    checked: boolean;
    onChange: () => void;
}

const CustomBox = ({ title, text, checked, onChange }: CustomBoxProps) => {
    return (
        <div className='flex flex-col gap-y-2 w-full'>
            <div className='flex items-center justify-between gap-x-4'>
                <p className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>{title}</p>
                <Toggle checked={checked} onChange={onChange} />
            </div>
            <p className='font-poppins text-body-xs text-text-disabled leading-5 tracking-wide text-left max-w-[90%]'>{text}</p>
        </div>
    )
}

// --- 3. Category definitions ---
// Each category maps to the actual notification_type value(s) the backend
// can produce for it — collapsed from the original 26 sub-toggles down to
// what the backend can genuinely distinguish and enforce. A notification's
// "type" is the only axis notification_preferences.types_muted can mute on;
// there's no sub-type tracking (e.g. "order shipped" vs "order delivered"
// both fire as the same order_update type), so those variants share one
// toggle rather than pretending to be independently controllable.
type Category = {
    key: string
    title: string
    text: string
    types: NotificationType[]
}

const CATEGORIES: Category[] = [
    {
        key: 'orders',
        title: 'Orders & Shipping',
        text: 'New orders, order status changes, and delivery updates.',
        types: ['order_update'],
    },
    {
        key: 'wallet',
        title: 'Wallet & Payments',
        text: 'Withdrawal requests, approvals, and payout status.',
        types: ['sale'],
    },
    {
        key: 'messages',
        title: 'Messages',
        text: 'Direct messages and announcements from artists you follow.',
        types: ['message', 'broadcast'],
    },
    {
        key: 'social',
        title: 'Comments & Replies',
        text: 'Comments and replies on your artwork.',
        types: ['comment', 'reply'],
    },
    {
        key: 'follows',
        title: 'Follows & Likes',
        text: 'New followers and likes on your artwork.',
        types: ['follow', 'like'],
    },
    {
        key: 'reviews',
        title: 'Reviews',
        text: 'New reviews left on your artwork sales.',
        types: ['review'],
    },
]

const NotificationSettings = () => {
    const { data: preferences } = useNotificationPreferences()
    const { mutate: save, isPending } = useUpdateNotificationPreferences()

    const [emailEnabled, setEmailEnabled] = useState(true)
    const [typesMuted, setTypesMuted] = useState<NotificationType[]>([])

    useEffect(() => {
        if (preferences) {
            setEmailEnabled(preferences.email_enabled)
            setTypesMuted(preferences.types_muted)
        }
    }, [preferences])

    const isCategoryEnabled = (types: NotificationType[]) =>
        !types.every((t) => typesMuted.includes(t))

    const toggleCategory = (types: NotificationType[]) => {
        const enabled = isCategoryEnabled(types)
        setTypesMuted((current) =>
            enabled
                ? [...new Set([...current, ...types])] // turning off — mute all types in this category
                : current.filter((t) => !types.includes(t)), // turning on — unmute all
        )
    }

    const handleSave = () => {
        if (!preferences) return
        const changed: { email_enabled?: boolean; types_muted?: NotificationType[] } = {}
        if (emailEnabled !== preferences.email_enabled) changed.email_enabled = emailEnabled
        const sortedCurrent = [...typesMuted].sort()
        const sortedPrev = [...preferences.types_muted].sort()
        if (JSON.stringify(sortedCurrent) !== JSON.stringify(sortedPrev)) changed.types_muted = typesMuted
        if (Object.keys(changed).length === 0) return
        save(changed)
    }

    return (
        <div className='border border-gray-50 rounded-2xl bg-white w-full pb-8'>
            <div className='px-8 py-4 flex justify-between items-center border-b border-gray-50 '>
                <h5 className='font-raleway font-semibold text-h5 text-primary-500 leading-10 tracking-wide'>Notifications</h5>
                <Button size='sm' className='rounded-2xl' onClick={handleSave} isLoading={isPending} loadingText='Saving…'>Save</Button>
            </div>

            <div className='pt-12 px-8 overflow-y-scroll gap-y-8 flex flex-col'>
                <CustomBox
                    title='Enable Notifications Via Email'
                    text='Receive a copy of important notifications by email, in addition to in-app.'
                    checked={emailEnabled}
                    onChange={() => setEmailEnabled((v) => !v)}
                />

                <div className='bg-secondary-50 p-6 gap-y-6 flex flex-col rounded-xl'>
                    {CATEGORIES.map((category) => (
                        <CustomBox
                            key={category.key}
                            title={category.title}
                            text={category.text}
                            checked={isCategoryEnabled(category.types)}
                            onChange={() => toggleCategory(category.types)}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default NotificationSettings
