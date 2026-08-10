'use client'

import { useMemo, useState } from 'react'
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

const ProfileCustomization = () => {
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
    <div className='border border-gray-50 rounded-2xl bg-white w-full pb-8'>
      <div className='px-8 py-4 flex justify-between items-center border-b border-gray-50 '>
        <h5 className='font-raleway font-semibold text-h5 text-primary-500 leading-10 tracking-wide'>Profile Customization</h5>
        <Button size='sm' className='rounded-2xl' onClick={handleSave} isLoading={isPending} loadingText='Saving…'>
          Save
        </Button>
      </div>

      <div className='pt-12 px-8 overflow-y-scroll gap-y-16 flex flex-col' style={{ gap: 64 }}>
        <InfoSection draft={draft} setField={setField} />
        <ImageSection draft={draft} setField={setField} />
        <SocialSection draft={draft} setField={setField} />
      </div>
    </div>
  )
}

export default ProfileCustomization
