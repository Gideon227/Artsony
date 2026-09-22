'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { CheckCircle2 } from 'lucide-react'
import { User } from '@/types'

const SOCIAL_ICONS: { key: keyof User; icon: string; label: string }[] = [
  { key: 'facebookLink', icon: '/socials/facebook-grey.svg', label: 'Facebook' },
  { key: 'twitterLink', icon: '/socials/twitter-grey.svg', label: 'Twitter' },
  { key: 'behanceLink', icon: '/socials/behance-grey.svg', label: 'Behance' },
  { key: 'instagramLink', icon: '/socials/instagram-grey.svg', label: 'Instagram' },
]

export default function ProfileBioOverlay({ user, onClose }: { user: User; onClose: () => void }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const socials = SOCIAL_ICONS.filter((s) => user[s.key])

  return (
    <div className="scrollbar-hide fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8" onClick={onClose}>
      <motion.div
        initial={{ y: '-100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '-100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative scrollbar-hide flex max-h-[85vh] w-full max-w-[900px] flex-col overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <div className="relative h-[220px] w-full shrink-0 bg-[#D9D9D9] md:h-[280px]">
          <Image fill src={user?.backgroundUrl || ''} alt='user background image' objectFit='cover' />
          {user.avatarUrl && (
            <Image src={user.avatarUrl} alt="" fill className="object-cover" />
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute cursor-pointer right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-black/30"
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <mask id="path-1-inside-1_9058_34225" fill="white">
                <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z"/>
              </mask>
              <path d="M0 20M40 20M40 20M0 20M20 0M40 20M20 40M0 20M20 40V38C10.0589 38 2 29.9411 2 20H0H-2C-2 32.1503 7.84974 42 20 42V40ZM40 20H38C38 29.9411 29.9411 38 20 38V40V42C32.1503 42 42 32.1503 42 20H40ZM20 0V2C29.9411 2 38 10.0589 38 20H40H42C42 7.84974 32.1503 -2 20 -2V0ZM20 0V-2C7.84974 -2 -2 7.84974 -2 20H0H2C2 10.0589 10.0589 2 20 2V0Z" fill="#E6E8EB" mask="url(#path-1-inside-1_9058_34225)"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M30 20C30 25.5228 25.5228 30 20 30C14.4772 30 10 25.5228 10 20C10 14.4772 14.4772 10 20 10C25.5228 10 30 14.4772 30 20ZM16.9696 16.9696C17.2625 16.6768 17.7374 16.6768 18.0303 16.9696L20 18.9393L21.9696 16.9697C22.2625 16.6768 22.7374 16.6768 23.0303 16.9697C23.3232 17.2626 23.3232 17.7374 23.0303 18.0303L21.0606 20L23.0303 21.9696C23.3232 22.2625 23.3232 22.7374 23.0303 23.0303C22.7374 23.3232 22.2625 23.3232 21.9696 23.0303L20 21.0607L18.0303 23.0303C17.7374 23.3232 17.2625 23.3232 16.9696 23.0303C16.6768 22.7374 16.6768 22.2625 16.9696 21.9697L18.9393 20L16.9696 18.0303C16.6767 17.7374 16.6767 17.2625 16.9696 16.9696Z" fill="white"/>
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-8 p-6 md:flex-row md:p-10">
          <div className="flex shrink-0 flex-row gap-6 md:w-[160px] md:flex-col md:gap-8 h-full">
            <div className="flex flex-col gap-1">
              <span className="font-poppins text-[20px] font-medium text-primary-500">{(user.followersCount ?? 0).toLocaleString()}</span>
              <span className="font-poppins text-body-s text-body">Followers</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-poppins text-[20px] font-medium text-primary-500">{(user.viewsCount ?? 0).toLocaleString()}</span>
              <span className="font-poppins text-body-s text-body">Views</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-poppins text-[20px] font-medium text-primary-500">{(user.likesCount ?? 0).toLocaleString()}</span>
              <span className="font-poppins text-body-s text-body">Likes</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-poppins text-[20px] font-medium text-primary-500">{(user.followingCount ?? 0).toLocaleString()}</span>
              <span className="font-poppins text-body-s text-body">Following</span>
            </div>

            {socials.length > 0 && (
              <div className="grid grid-cols-2 grid-rows-2 gap-4 mt-auto">
                {socials.map((s) => (
                  <a key={s.key} href={user[s.key] as string} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="transition-opacity hover:opacity-90">
                    <Image src={s.icon} width={32} height={32} alt="" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-2 w-full">
            <h2 className="font-raleway text-[24px] font-semibold text-heading">{user.username}</h2>
            {user.isVerified && (
              <span className="flex w-fit items-center gap-1.5 font-poppins text-body-s font-medium text-primary-500">
                <CheckCircle2 size={16} className="fill-primary-500 text-white" /> Verified Artsony Artist
              </span>
            )}
            <p className="whitespace-pre-line font-poppins text-body-m leading-7 mt-4 text-gray-500">
              {user.bio || 'This artist hasn\'t written a bio yet.'}
            </p>
            <div className='mx-auto flex items-center justify-center gap-2 mt-auto'>
              <Image
                src={user?.avatarUrl || '/images/image-avatar.svg'}
                alt={user?.username ? `${user.username}'s profile` : 'User avatar'}
                width={40}
                height={40}
              />
              <p className='font-poppins text-body text-body-s items-center tracking-wide whitespace-nowrap'>Posted by {user?.username}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
