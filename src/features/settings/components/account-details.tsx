'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components'
import ContactSection from '../sections/contact-section'
import { useAuthStore } from '@/store'
import ConnectedAccount from '../sections/connected-accounts'
import { useUpdateProfile } from '@/hooks/use-auth-mutations'

export type AccountDraft = {
  country: string
  state: string
  city: string
}

const AccountDetails = ({ goBack }: { goBack?: () => void }) => {
  const { user } = useAuthStore()
  const { mutate: save, isPending } = useUpdateProfile()

  const initialDraft = useMemo<AccountDraft>(() => ({
    country: user?.country ?? '',
    state: user?.state ?? '',
    city: user?.city ?? '',
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [user?.id])

  const [draft, setDraft] = useState<AccountDraft>(initialDraft)

  const setField = <K extends keyof AccountDraft>(key: K, value: AccountDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const handleSave = () => {
    if (!user) return
    const payload: Partial<Record<keyof AccountDraft, string | null>> = {}
    if (draft.country !== (user.country ?? '')) payload.country = draft.country || null
    if (draft.state.trim() !== (user.state ?? '')) payload.state = draft.state.trim() || null
    if (draft.city.trim() !== (user.city ?? '')) payload.city = draft.city.trim() || null
    if (Object.keys(payload).length === 0) return
    save(payload)
  }

  if (!user) return null

  return (
    <div className='lg:border lg:border-gray-50 lg:rounded-2xl lg:bg-white w-full lg:pb-8 pb-20'>
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
          <h5 className='font-poppins lg:font-raleway font-medium lg:font-semibold max-lg:text-body-s lg:text-h5 text-body lg:text-primary-500 leading-10 tracking-wide'>Account Details</h5>
        </div>
        <Button size='sm' className='rounded-2xl max-lg:w-20 max-lg:h-10 max-lg:text-body-xs' onClick={handleSave} isLoading={isPending} loadingText='Saving…'>
          Save
        </Button>
      </div>

      <div className='pt-12 px-8 overflow-y-scroll gap-y-8 lg:gap-y-16 flex flex-col'>
        <ContactSection user={user} />
        <ConnectedAccount user={user} />
      </div>
    </div>
  )
}

export default AccountDetails
