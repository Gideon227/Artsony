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
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8" onClick={onClose}>
      <motion.div
        initial={{ y: '-100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '-100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[85vh] w-full max-w-[900px] flex-col overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <div className="relative h-[220px] w-full shrink-0 bg-[#D9D9D9] md:h-[280px]">
          {user.avatarUrl && (
            <Image src={user.avatarUrl} alt="" fill className="object-cover" />
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-black/20 text-white backdrop-blur-sm transition-colors hover:bg-black/30"
          >
            <Image src="/icons/cancel.svg" width={16} height={16} alt="" className="invert" />
          </button>
        </div>

        <div className="flex flex-col gap-8 p-6 md:flex-row md:p-10">
          <div className="flex shrink-0 flex-row gap-6 md:w-[160px] md:flex-col md:gap-8">
            <div className="flex flex-col gap-1">
              <span className="font-poppins text-[22px] font-semibold text-primary-500">{(user.followersCount ?? 0).toLocaleString()}</span>
              <span className="font-poppins text-body-s text-gray-400">Followers</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-poppins text-[22px] font-semibold text-primary-500">{(user.viewsCount ?? 0).toLocaleString()}</span>
              <span className="font-poppins text-body-s text-gray-400">Views</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-poppins text-[22px] font-semibold text-primary-500">{(user.likesCount ?? 0).toLocaleString()}</span>
              <span className="font-poppins text-body-s text-gray-400">Likes</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-poppins text-[22px] font-semibold text-primary-500">{(user.followingCount ?? 0).toLocaleString()}</span>
              <span className="font-poppins text-body-s text-gray-400">Following</span>
            </div>

            {socials.length > 0 && (
              <div className="flex gap-4 md:mt-4">
                {socials.map((s) => (
                  <a key={s.key} href={user[s.key] as string} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="opacity-70 transition-opacity hover:opacity-100">
                    <Image src={s.icon} width={20} height={20} alt="" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-3">
            <h2 className="font-raleway text-[24px] font-semibold text-heading">{user.username}</h2>
            {user.isVerified && (
              <span className="flex w-fit items-center gap-1.5 font-poppins text-body-s font-medium text-primary-500">
                <CheckCircle2 size={16} className="fill-primary-500 text-white" /> Verified Artsony Artist
              </span>
            )}
            <p className="whitespace-pre-line font-poppins text-body-m leading-7 text-gray-500">
              {user.bio || 'This artist hasn\'t written a bio yet.'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
