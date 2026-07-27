import { useDeleteNotification, useMarkAllRead, useMarkRead, useNotifications, useUnreadCount } from '@/hooks/use-notification'
import React, { useMemo, useState } from 'react'
import type { Notification } from '@/types'
import { NotificationList } from './notification-list'
import UnreadNotification from './unread-notification'

const NotificationModal = () => {
    const [filter, setFilter] = useState<'all' | 'unread'>('all')
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
    
    // ── Data ────────────────
    const {
        data,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useNotifications(filter)

    const { data: unreadCount = 0 } = useUnreadCount()

    const notifications: Notification[] = useMemo(
        () => data?.pages.flatMap((p) => p.data) ?? [],
        [data]
    )

    // ── Mutations 
    const { mutate: markRead } = useMarkRead()
    const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllRead()
    const { mutate: deleteNotification } = useDeleteNotification()

    const handleDelete = (id: string) => {
        setDeletingIds((prev) => new Set(prev).add(id))
        
        setTimeout(() => {
            deleteNotification(id)
            setDeletingIds((prev) => {
                const next = new Set(prev)
                next.delete(id)
                return next
            })
        }, 280)
    }

    return (
        <div className='flex flex-col border border-gray-50 rounded-2xl bg-white w-9/10 h-4/5 mx-auto md:w-[40vw] md:h-[70vh] overflow-hidden shadow-2xl'>
            <div className='flex justify-between items-center py-6 px-8 shrink-0'>
                <h6 className='font-raleway font-medium text-h6 text-heading leading-8'>Notifications</h6>
                <button className='border border-gray-50 p-2 rounded-full hover:bg-gray-50 transition-colors'>
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <mask id="path-1-inside-1_7128_27464" fill="white">
                            <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z"/>
                        </mask>
                        <path d="M0 20M40 20M40 20M0 20M20 0M40 20M20 40M0 20M20 40V38C10.0589 38 2 29.9411 2 20H0H-2C-2 32.1503 7.84974 42 20 42V40ZM40 20H38C38 29.9411 29.9411 38 20 38V40V42C32.1503 42 42 32.1503 42 20H40ZM20 0V2C29.9411 2 38 10.0589 38 20H40H42C42 7.84974 32.1503 -2 20 -2V0ZM20 0V-2C7.84974 -2 -2 7.84974 -2 20H0H2C2 10.0589 10.0589 2 20 2V0Z" fill="#E6E8EB" mask="url(#path-1-inside-1_7128_27464)"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M20 30C15.286 30 12.9289 30 11.4645 28.5355C10 27.0711 10 24.714 10 20C10 15.286 10 12.9289 11.4645 11.4645C12.9289 10 15.286 10 20 10C24.714 10 27.0711 10 28.5355 11.4645C30 12.9289 30 15.286 30 20C30 24.714 30 27.0711 28.5355 28.5355C27.0711 30 24.714 30 20 30ZM22.4743 16.419C22.7952 16.6809 22.8429 17.1534 22.581 17.4743L16.8667 24.4743C16.7243 24.6488 16.511 24.75 16.2857 24.75C16.0605 24.75 15.8472 24.6488 15.7047 24.4743L13.419 21.6743C13.1571 21.3534 13.2048 20.8809 13.5257 20.619C13.8466 20.3571 14.3191 20.4048 14.581 20.7257L16.2857 22.814L21.419 16.5257C21.6809 16.2048 22.1534 16.1571 22.4743 16.419ZM26.4743 16.419C26.7952 16.681 26.8429 17.1534 26.581 17.4743L20.8665 24.4743C20.7152 24.6596 20.4846 24.7617 20.2457 24.7489C20.0068 24.7362 19.7883 24.6103 19.6575 24.4099L19.3719 23.9724C19.1455 23.6256 19.2432 23.1608 19.5901 22.9344C19.7939 22.8014 20.0384 22.7803 20.2514 22.8558L25.419 16.5257C25.681 16.2048 26.1534 16.1571 26.4743 16.419Z" fill="#525965"/>
                    </svg>
                </button>
            </div>

            <div className='flex-1 overflow-y-auto'>
                {unreadCount > 0 
                    ?   <NotificationList
                            notifications={notifications}
                            isLoading={isLoading}
                            isFetchingNextPage={isFetchingNextPage}
                            hasNextPage={hasNextPage ?? false}
                            fetchNextPage={fetchNextPage}
                            onRead={markRead}
                            onDelete={handleDelete}
                            deletingIds={deletingIds}
                        />
                    :   <UnreadNotification />
                }
            </div>
        </div>
    )
}

export default NotificationModal