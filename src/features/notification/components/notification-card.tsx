'use client'

import { useMemo, useState, type KeyboardEvent, type MouseEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils'
import type { Notification } from '@/types'
import { presentNotification, timeAgo, type NotificationPresentation } from '../lib/notification-presenter'

const SYSTEM_AVATAR_SRC = '/images/notification-system-avatar.svg'
const FALLBACK_AVATAR_SRC = '/images/image-avatar.svg'

type NotificationCardProps = {
  notification: Notification
  onRead: (id: string) => void
  onDelete: (id: string) => void
  isDeleting?: boolean
}

function SystemAvatar() {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return <div aria-hidden='true' className='h-14 w-14 rounded-full bg-primary-500' />
  }

  return (
    <Image
      src={SYSTEM_AVATAR_SRC}
      width={56}
      height={56}
      alt='Artsony'
      className='h-14 w-14 rounded-full object-cover'
      onError={() => setFailed(true)}
    />
  )
}

function ActorAvatar({ src, name }: { src: string | null; name: string }) {
  return (
    <Image
      src={src || FALLBACK_AVATAR_SRC}
      width={56}
      height={56}
      alt={name}
      className='h-14 w-14 rounded-full border border-gray-50 object-cover'
    />
  )
}

function Thumbnail({ src }: { src: string | null }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return <div aria-hidden='true' className='h-[72px] w-[72px] shrink-0 rounded-m bg-gray-50' />
  }

  return (
    <Image
      src={src}
      width={72}
      height={72}
      alt=''
      className='h-[72px] w-[72px] shrink-0 rounded-m object-cover'
      onError={() => setFailed(true)}
    />
  )
}

function ActionLink({
  label,
  href,
  onActivate,
}: {
  label: string
  href: string
  onActivate: (e: MouseEvent) => void
}) {
  return (
    <Link
      href={href}
      onClick={onActivate}
      className={cn(
        'inline-flex w-fit items-center rounded-full border border-gray-50 bg-white px-4 py-2',
        'font-poppins text-body-xs font-normal text-primary-500 transition-colors duration-150',
        'hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
        'active:scale-[0.98]',
      )}
    >
      {label}
    </Link>
  )
}

function CardBody({
  presentation,
  onActivate,
}: {
  presentation: NotificationPresentation
  onActivate: (e: MouseEvent) => void
}) {
  const { card, action } = presentation
  if (!card) return null

  return (
    <div className='flex w-full items-stretch gap-4 rounded-m border border-gray-50 bg-white py-2 pl-2 pr-4'>
      <Thumbnail src={card.thumbnailUrl} />
      <div className='flex min-w-0 flex-1 flex-col justify-center gap-2'>
        <p className='line-clamp-2 font-poppins text-body-xxs font-light text-body'>{card.text}</p>
        {action && <ActionLink {...action} onActivate={onActivate} />}
      </div>
    </div>
  )
}

export function NotificationCard({ notification: n, onRead, isDeleting }: NotificationCardProps) {
  const router = useRouter()
  const presentation = useMemo(() => presentNotification(n), [n])
  const { card, action, href } = presentation

  const target = href ?? action?.href ?? null
  const isRowLink = target !== null && action === undefined
  const actorName = n.actor?.display_name || n.actor?.username || 'Artsony'

  const markRead = () => {
    if (!n.is_read) onRead(n.id)
  }

  const handleRowClick = () => {
    markRead()
    if (target) router.push(target)
  }

  const handleActionClick = (e: MouseEvent) => {
    e.stopPropagation()
    markRead()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleRowClick()
    }
  }

  return (
    <AnimatePresence>
      {!isDeleting && (
        <motion.div
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          onClick={handleRowClick}
          onKeyDown={isRowLink ? handleKeyDown : undefined}
          role={isRowLink ? 'link' : undefined}
          tabIndex={isRowLink ? 0 : undefined}
          className={cn(
            'flex items-start gap-4 px-4 py-6 font-poppins transition-colors duration-150',
            'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-500',
            target && 'cursor-pointer',
            n.is_read ? 'bg-white hover:bg-neutral-50' : 'bg-primary-50 hover:bg-primary-50/80',
          )}
        >
          <div className='shrink-0'>
            {presentation.avatar === 'actor' ? (
              <ActorAvatar src={n.actor?.avatar_url ?? null} name={actorName} />
            ) : (
              <SystemAvatar />
            )}
          </div>

          <div className='flex min-w-0 flex-1 flex-col gap-2'>
            <p className='truncate text-body-s font-normal text-heading'>{presentation.title}</p>

            {presentation.description && (
              <p className='line-clamp-2 text-body-xs font-light text-body'>
                {presentation.description}
              </p>
            )}

            {card ? (
              <CardBody presentation={presentation} onActivate={handleActionClick} />
            ) : (
              action && <ActionLink {...action} onActivate={handleActionClick} />
            )}

            <p className='text-body-xxs font-light text-text-alt-grey'>{timeAgo(n.created_at)}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
