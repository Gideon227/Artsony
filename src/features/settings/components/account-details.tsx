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

const AccountDetails = () => {
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
    <div className='border border-gray-50 rounded-2xl bg-white w-full pb-8'>
      <div className='px-8 py-4 flex justify-between items-center border-b border-gray-50 '>
        <h5 className='font-raleway font-semibold text-h5 text-primary-500 leading-10 tracking-wide'>Account Details</h5>
        <Button size='sm' className='rounded-2xl' onClick={handleSave} isLoading={isPending} loadingText='Saving…'>
          Save
        </Button>
      </div>

      <div className='pt-12 px-8 overflow-y-scroll gap-y-16 flex flex-col' style={{ gap: 64 }}>
        <ContactSection user={user} />
        <ConnectedAccount user={user} />
      </div>
    </div>
  )
}

export default AccountDetails
