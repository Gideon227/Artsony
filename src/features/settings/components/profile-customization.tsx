'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components'
import InfoSection from '../sections/info-section'
import { useAuthStore } from '@/store'
import ImageSection from '../sections/image-section'
import SocialSection from '../sections/social-section'
import { useUpdateProfile } from '@/hooks/use-auth-mutations'
import type { UpdateProfileInput } from '@/services/auth.service'

export type ProfileDraft = {
  username: string
  displayName: string
  bio: string
  interests: string[]
  avatarUrl: string | null
  backgroundUrl: string | null
  website: string
  behanceLink: string
  pinterestLink: string
  twitterLink: string
  linkedinLink: string
}

function arraysEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && [...a].sort().every((v, i) => v === [...b].sort()[i])
}

const ProfileCustomization = ({ goBack }: { goBack?: () => void }) => {
  const { user } = useAuthStore()
  const { mutate: save, isPending } = useUpdateProfile()

  const initialDraft = useMemo<ProfileDraft>(() => ({
    username: user?.username ?? '',
    displayName: user?.displayName ?? '',
    bio: user?.bio ?? '',
    interests: user?.interests ?? [],
    avatarUrl: user?.avatarUrl ?? null,
    backgroundUrl: user?.backgroundUrl ?? null,
    website: user?.website ?? '',
    behanceLink: user?.behanceLink ?? '',
    pinterestLink: user?.pinterestLink ?? '',
    twitterLink: user?.twitterLink ?? '',
    linkedinLink: user?.linkedinLink ?? '',
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [user?.id])

  const [draft, setDraft] = useState<ProfileDraft>(initialDraft)

  useEffect(() => {
    if (user) {
      setDraft(initialDraft);
    }
  }, [initialDraft, user]);

  const setField = <K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const handleSave = () => {
    if (!user) return

    const payload: UpdateProfileInput = {}

    if (draft.username.trim() !== user.username) payload.username = draft.username.trim()
    if (draft.displayName.trim() !== (user.displayName ?? '')) payload.display_name = draft.displayName.trim() || null
    if (draft.bio.trim() !== (user.bio ?? '')) payload.bio = draft.bio.trim() || null
    if (!arraysEqual(draft.interests, user.interests ?? [])) payload.interests = draft.interests
    if (draft.avatarUrl !== user.avatarUrl) payload.avatar_url = draft.avatarUrl
    if (draft.backgroundUrl !== user.backgroundUrl) payload.background_url = draft.backgroundUrl
    if (draft.website.trim() !== (user.website ?? '')) payload.website_url = draft.website.trim() || null
    if (draft.behanceLink.trim() !== (user.behanceLink ?? '')) payload.behance_url = draft.behanceLink.trim() || null
    if (draft.pinterestLink.trim() !== (user.pinterestLink ?? '')) payload.pinterest_url = draft.pinterestLink.trim() || null
    if (draft.twitterLink.trim() !== (user.twitterLink ?? '')) payload.twitter_url = draft.twitterLink.trim() || null
    if (draft.linkedinLink.trim() !== (user.linkedinLink ?? '')) payload.linkedin_url = draft.linkedinLink.trim() || null

    if (Object.keys(payload).length === 0) return
    save(payload)
  }

  if (!user) return null

  return (
    <div className='lg:border lg:border-gray-50 lg:rounded-2xl bg-white w-full lg:pb-8 pb-16'>
      <div className='lg:px-8 px-4 max-lg:pb-4 max-lg:pt-6 flex justify-between items-center border-b border-gray-50 '>
        <div className='flex items-center gap-2'>
          <button onClick={goBack} className='cursor-pointer lg:hidden'>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <mask id="path-1-inside-1_10796_3029" fill="white">
                <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z"/>
              </mask>
              <path d="M0 20M40 20M40 20M0 20M20 0M40 20M20 40M0 20M20 40V38C10.0589 38 2 29.9411 2 20H0H-2C-2 32.1503 7.84974 42 20 42V40ZM40 20H38C38 29.9411 29.9411 38 20 38V40V42C32.1503 42 42 32.1503 42 20H40ZM20 0V2C29.9411 2 38 10.0589 38 20H40H42C42 7.84974 32.1503 -2 20 -2V0ZM20 0V-2C7.84974 -2 -2 7.84974 -2 20H0H2C2 10.0589 10.0589 2 20 2V0Z" fill="#E6E8EB" mask="url(#path-1-inside-1_10796_3029)"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M30 20C30 25.5228 25.5228 30 20 30C14.4772 30 10 25.5228 10 20C10 14.4772 14.4772 10 20 10C25.5228 10 30 14.4772 30 20ZM16.9696 16.9696C17.2625 16.6768 17.7374 16.6768 18.0303 16.9696L20 18.9393L21.9696 16.9697C22.2625 16.6768 22.7374 16.6768 23.0303 16.9697C23.3232 17.2626 23.3232 17.7374 23.0303 18.0303L21.0606 20L23.0303 21.9696C23.3232 22.2625 23.3232 22.7374 23.0303 23.0303C22.7374 23.3232 22.2625 23.3232 21.9696 23.0303L20 21.0607L18.0303 23.0303C17.7374 23.3232 17.2625 23.3232 16.9696 23.0303C16.6768 22.7374 16.6768 22.2625 16.9696 21.9697L18.9393 20L16.9696 18.0303C16.6767 17.7374 16.6767 17.2625 16.9696 16.9696Z" fill="#525965"/>
            </svg>
          </button>
          <h5 className='font-poppins lg:font-raleway font-medium lg:font-semibold max-lg:text-body-s lg:text-h5 text-body lg:text-primary-500 leading-10 tracking-wide'>Profile Customization</h5>
        </div>
        <Button size='sm' className='rounded-2xl max-lg:w-20 max-lg:h-10 max-lg:text-body-xs' onClick={handleSave} isLoading={isPending} loadingText='Saving…'>
          Save
        </Button>
      </div>

      <div className='lg:pt-12 lg:px-8 pt-6 px-4 max-lg:pb-16 overflow-y-scroll scrollbar-hide gap-y-8 lg:gap-y-16 flex flex-col' style={{ gap: 64 }}>
        <InfoSection draft={draft} setField={setField} />
        <ImageSection draft={draft} setField={setField} />
        <SocialSection draft={draft} setField={setField} />
      </div>
    </div>
  )
}

export default ProfileCustomization
