import { Button } from '@/components'
import { Dropdown, DropdownOption } from '@/components/ui/dropdown'
import { usePrivacySettings, useUpdatePrivacySettings } from '@/hooks/use-auth-mutations'
import type { PrivacyLevel, PrivacySettings } from '@/types'
import { useEffect, useState } from 'react'
import BlockedUsers from '@/features/settings/components/blocked-users'

const PRIVACY_OPTIONS: DropdownOption[] = [
  { id: 'EVERYONE', label: 'Everyone' },
  { id: 'FOLLOWERS', label: 'Followers Only' },
  { id: 'NO_ONE', label: 'No One' },
]

const optionFor = (level: PrivacyLevel): DropdownOption =>
  PRIVACY_OPTIONS.find((o) => o.id === level) ?? PRIVACY_OPTIONS[0]!

type FormState = {
  who_can_message: PrivacyLevel
  who_can_comment: PrivacyLevel
  who_can_purchase: PrivacyLevel
}

const DEFAULTS: FormState = {
  who_can_message: 'EVERYONE',
  who_can_comment: 'EVERYONE',
  who_can_purchase: 'EVERYONE',
}

type View = 'settings' | 'blocked'

const PrivacySafety = () => {
  const { data: settings, isLoading } = usePrivacySettings()
  const { mutate: save, isPending } = useUpdatePrivacySettings()
  const [formData, setFormData] = useState<FormState>(DEFAULTS)
  const [view, setView] = useState<View>('settings')

  // Re-sync local form state whenever the server value changes — e.g. after
  // the initial fetch resolves, or another tab/session updates it.
  useEffect(() => {
    if (settings) setFormData(settings)
  }, [settings])

  const isDirty =
    !settings ||
    formData.who_can_message !== settings.who_can_message ||
    formData.who_can_comment !== settings.who_can_comment ||
    formData.who_can_purchase !== settings.who_can_purchase

  const setField = (field: keyof PrivacySettings) => (option: DropdownOption) =>
    setFormData((prev) => ({ ...prev, [field]: option.id as PrivacyLevel }))

  const handleSave = () => {
    if (!isDirty || isPending) return
    save(formData)
  }

  if (view === 'blocked') {
    return (
      <div className='border border-gray-50 rounded-2xl bg-white w-full px-8 pt-12 pb-8'>
        <BlockedUsers onBack={() => setView('settings')} />
      </div>
    )
  }

  return (
    <div className='border border-gray-50 rounded-2xl bg-white w-full pb-8'>
      <div className='px-8 py-4 flex justify-between items-center border-b border-gray-50 '>
        <h5 className='font-raleway font-semibold text-h5 text-primary-500 leading-10 tracking-wide'>Privacy & Safety</h5>
        <Button
          size='sm'
          className='rounded-2xl'
          onClick={handleSave}
          disabled={!isDirty}
          isLoading={isPending}
          loadingText='Saving…'
        >
          Save
        </Button>
      </div>

      <div className='pt-12 px-8 gap-y-4 flex flex-col'>
        <button
          type='button'
          onClick={() => setView('blocked')}
          aria-label='Open blocked users'
          className='bg-white cursor-pointer border border-gray-50 py-3 px-6 rounded-2xl w-full flex-1 flex items-center justify-between gap-x-3 transition-colors hover:bg-secondary-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500'
        >
          <p className='font-poppins text-body-s placeholder:text-body text-heading leading-6'>Blocked Users</p>

          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden='true'>
            <path d="M11 19L17 12L11 5" stroke="#525965" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 19L13 12L7 5" stroke="#525965" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className='flex flex-col ' style={{ gap: 12 }}>
          <p className='font-poppins font-medium text-body-s text-body leading-6 tracking-wide'>Who can message you</p>
          <p className='font-poppins text-body-xs text-text-disabled leading-4 tracking-wide'>Choose who is allowed to send you direct messages on Artsony.</p>
          <Dropdown
            options={PRIVACY_OPTIONS}
            value={optionFor(formData.who_can_message)}
            onChange={setField('who_can_message')}
            disabled={isLoading}
          />
        </div>

        <div className='flex flex-col' style={{ gap: 12 }}>
          <p className='font-poppins font-medium text-body-s text-body leading-6 tracking-wide'>Who can comment on your artworks</p>
          <p className='font-poppins text-body-xs text-text-disabled leading-4 tracking-wide'>Control who can leave comments on your artworks.</p>
          <Dropdown
            options={PRIVACY_OPTIONS}
            value={optionFor(formData.who_can_comment)}
            onChange={setField('who_can_comment')}
            disabled={isLoading}
          />
        </div>

        <div className='flex flex-col' style={{ gap: 12 }}>
          <p className='font-poppins font-medium text-body-s text-body leading-6 tracking-wide'>Who can purchase your artworks</p>
          <p className='font-poppins text-body-xs text-text-disabled leading-4 tracking-wide'>Decide who can buy your artworks from your store.</p>
          <Dropdown
            options={PRIVACY_OPTIONS}
            value={optionFor(formData.who_can_purchase)}
            onChange={setField('who_can_purchase')}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  )
}

export default PrivacySafety
