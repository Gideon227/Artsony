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
    <div className="scrollbar-hide fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/40 md:px-4 md:py-8" onClick={onClose}>
      <motion.div
        initial={{ y: '-100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '-100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative scrollbar-hide flex max-md:h-screen md:max-h-[85vh] w-full max-w-[900px] flex-col overflow-y-auto md:rounded-2xl bg-white"
      >
        <div className='md:hidden flex items-start gap-4 py-6 px-4'>
          <button onClick={onClose}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <mask id="path-1-inside-1_10787_12167" fill="white">
                <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z"/>
              </mask>
              <path d="M0 20M40 20M40 20M0 20M20 0M40 20M20 40M0 20M20 40V38C10.0589 38 2 29.9411 2 20H0H-2C-2 32.1503 7.84974 42 20 42V40ZM40 20H38C38 29.9411 29.9411 38 20 38V40V42C32.1503 42 42 32.1503 42 20H40ZM20 0V2C29.9411 2 38 10.0589 38 20H40H42C42 7.84974 32.1503 -2 20 -2V0ZM20 0V-2C7.84974 -2 -2 7.84974 -2 20H0H2C2 10.0589 10.0589 2 20 2V0Z" fill="#E6E8EB" mask="url(#path-1-inside-1_10787_12167)"/>
              <path d="M28 20H12M18 26L12 20L18 14" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke="#525965"/>
            </svg>
          </button>

          <div className='flex flex-col gap-1'>
            <p className='font-raleway font-semibold text-h6 text-heading tracking-wide'>{user?.username}</p>
            {user.artworks && 
            <div className='flex items-center gap-2'>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.5924 3.20027C9.34888 3.4078 9.22711 3.51158 9.09706 3.59874C8.79896 3.79854 8.46417 3.93721 8.1121 4.00672C7.95851 4.03705 7.79903 4.04977 7.48008 4.07522C6.6787 4.13918 6.278 4.17115 5.94371 4.28923C5.17051 4.56233 4.56233 5.17051 4.28923 5.94371C4.17115 6.278 4.13918 6.6787 4.07522 7.48008C4.04977 7.79903 4.03705 7.95851 4.00672 8.1121C3.93721 8.46417 3.79854 8.79896 3.59874 9.09706C3.51158 9.22711 3.40781 9.34887 3.20027 9.5924C2.67883 10.2043 2.4181 10.5102 2.26522 10.8301C1.91159 11.57 1.91159 12.43 2.26522 13.1699C2.41811 13.4898 2.67883 13.7957 3.20027 14.4076C3.40778 14.6511 3.51158 14.7729 3.59874 14.9029C3.79854 15.201 3.93721 15.5358 4.00672 15.8879C4.03705 16.0415 4.04977 16.201 4.07522 16.5199C4.13918 17.3213 4.17115 17.722 4.28923 18.0563C4.56233 18.8295 5.17051 19.4377 5.94371 19.7108C6.278 19.8288 6.6787 19.8608 7.48008 19.9248C7.79903 19.9502 7.95851 19.963 8.1121 19.9933C8.46417 20.0628 8.79896 20.2015 9.09706 20.4013C9.22711 20.4884 9.34887 20.5922 9.5924 20.7997C10.2043 21.3212 10.5102 21.5819 10.8301 21.7348C11.57 22.0884 12.43 22.0884 13.1699 21.7348C13.4898 21.5819 13.7957 21.3212 14.4076 20.7997C14.6511 20.5922 14.7729 20.4884 14.9029 20.4013C15.201 20.2015 15.5358 20.0628 15.8879 19.9933C16.0415 19.963 16.201 19.9502 16.5199 19.9248C17.3213 19.8608 17.722 19.8288 18.0563 19.7108C18.8295 19.4377 19.4377 18.8295 19.7108 18.0563C19.8288 17.722 19.8608 17.3213 19.9248 16.5199C19.9502 16.201 19.963 16.0415 19.9933 15.8879C20.0628 15.5358 20.2015 15.201 20.4013 14.9029C20.4884 14.7729 20.5922 14.6511 20.7997 14.4076C21.3212 13.7957 21.5819 13.4898 21.7348 13.1699C22.0884 12.43 22.0884 11.57 21.7348 10.8301C21.5819 10.5102 21.3212 10.2043 20.7997 9.5924C20.5922 9.34887 20.4884 9.22711 20.4013 9.09706C20.2015 8.79896 20.0628 8.46417 19.9933 8.1121C19.963 7.95851 19.9502 7.79903 19.9248 7.48008C19.8608 6.6787 19.8288 6.278 19.7108 5.94371C19.4377 5.17051 18.8295 4.56233 18.0563 4.28923C17.722 4.17115 17.3213 4.13918 16.5199 4.07522C16.201 4.04977 16.0415 4.03705 15.8879 4.00672C15.5358 3.93721 15.201 3.79854 14.9029 3.59874C14.7729 3.51158 14.6511 3.40781 14.4076 3.20027C13.7957 2.67883 13.4898 2.41811 13.1699 2.26522C12.43 1.91159 11.57 1.91159 10.8301 2.26522C10.5102 2.4181 10.2043 2.67883 9.5924 3.20027ZM16.3735 9.86314C16.6913 9.5453 16.6913 9.03 16.3735 8.71216C16.0557 8.39433 15.5403 8.39433 15.2225 8.71216L10.3723 13.5624L8.77746 11.9676C8.45963 11.6498 7.94432 11.6498 7.62649 11.9676C7.30866 12.2854 7.30866 12.8007 7.62649 13.1186L9.79678 15.2889C10.1146 15.6067 10.6299 15.6067 10.9478 15.2889L16.3735 9.86314Z" fill-rule="evenodd" clip-rule="evenodd" fill="#F25B38"/>
              </svg>
                <p className='font-poppins text-body text-body-xs'>Verified Artsony Artist</p>
            </div>
            }
          </div>
        </div>

        <div className="relative h-[296px] w-full shrink-0 bg-[#D9D9D9] md:h-[280px] max-md:pb-24">
          <Image fill src={user?.backgroundUrl || ''} alt='user background image' objectFit='cover' />
          {user.avatarUrl && (
            <Image src={user.avatarUrl} alt="" fill className="object-cover" />
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            className="max-lg:hidden absolute cursor-pointer right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-black/30"
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
          <div className="flex flex-row md:flex-col shrink-0 md:w-[160px] md:h-full">
            <div className='flex flex-col gap-4 max-md:grid max-md:grid-cols-2 max-md:grid-rows-2'>
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
            </div>

            {socials.length > 0 && (
              <div className="grid max-md:grid-rows-2 md:grid-cols-2 gap-4 ml-auto md:mt-auto pt-8">
                {socials.map((s) => (
                  <a key={s.key} href={user[s.key] as string} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="transition-opacity hover:opacity-90">
                    <Image src={s.icon} width={32} height={32} alt="" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-2 w-full max-md:pb-20">
            <h2 className="max-md:hidden font-raleway text-[24px] font-semibold text-heading">{user.username}</h2>
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
