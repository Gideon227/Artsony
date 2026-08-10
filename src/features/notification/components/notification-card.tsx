'use client'

import Image from 'next/image'
import Link from 'next/link'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils'
import { Avatar } from '@/components/ui/avatar'
import { NotificationIcon } from './notification-icon'
import { NOTIFICATION_LABELS, relativeTime } from '@/utils/index'
import { ROUTES } from '@/constants'
import type { Notification } from '@/types'
import { Button } from '@/components'
import { useRouter } from 'next/navigation'

type NotificationCardProps = {
  notification: Notification
  onRead: (id: string) => void
  onDelete: (id: string) => void
  isDeleting?: boolean
}

export function NotificationCard({
  notification: n,
  onRead,
  onDelete,
  isDeleting,
}: NotificationCardProps) {
  const href = resolveHref(n)
  const router = useRouter()

  const handleClick = () => {
    if (!n.is_read) onRead(n.id)
  }

  console.log("notifs data: ", n)

  return (
    <AnimatePresence>
      {!isDeleting && (
        <motion.div
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          onClick={handleClick}
          className={cn(
            'group flex items-start gap-4 p-6 border',
            'transition-colors duration-150',
            n.is_read
              ? 'bg-white border-neutral-100 hover:bg-neutral-50'
              : 'bg-primary-50 border-primary-100 hover:bg-primary-50/80'
          )}
        >
          <Image src='/icons/logo-var.svg' width={56} height={56} className='w-12 h-12 lg:w-auto lg:h-auto ' alt='icon'/>

          <div className='flex flex-col w-full gap-y-2'>
            <p className='font-poppins text-body-s text-heading'>{NOTIFICATION_LABELS[n.type]}</p>

            {n.type === 'message' && <p className='font-poppins font-light text-body-xs text-body'>{n.data.preview}</p>}
            
            <div className='border border-gray-50 bg-white flex gap-4 py-2 pl-2 pr-4 rounded-m w-full'>
              <Image src={n.actor.avatarUrl || '/images/image-avatar.svg'} width={72} height={72} className='object-cover rounded-m' alt='sender avatar' />
              
              <div className='h-full flex flex-col gap-2'>
                <p className='font-poppins font-light text-body-xxs'>{n.data.preview}</p>
                <Button variant='outline' size='md' onClick={() => router.push(`/messages/${n.data.conversation_id}`)}>Send a Message</Button>
              </div>
            </div>

            <p className='font-poppins text-text-alt-grey text-body-xxs'>{String(n.created_at)}</p>
          </div>


          

          {/* ── Delete button ────────────────────────────────────────────── */}
          {/* <button
            onClick={() => onDelete(n.id)}
            aria-label="Dismiss notification"
            className={cn(
              'shrink-0 w-7 h-7 flex items-center justify-center rounded-full',
              'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100',
              'opacity-0 group-hover:opacity-100 transition-all duration-150',
              'focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-primary-500'
            )}
          >
            <X className="w-3.5 h-3.5" />
          </button> */}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Resolve destination href for each notification type ─────────────────────

function resolveHref(n: Notification): string {
  if (n.resourceType === 'artwork') return ROUTES.artwork(n.resourceId)
  if (n.resourceType === 'user') return ROUTES.profile(n.actor_id)
  if (n.resourceType === 'comment') return ROUTES.artwork(n.resourceId)
  return ROUTES.notifications
}