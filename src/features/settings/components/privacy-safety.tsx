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

const PrivacySafety = ({ goBack }: { goBack?: () => void }) => {
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
    <div className='lg:border lg:border-gray-50 lg:rounded-2xl lg:bg-white w-full lg:pb-8 pb-16'>
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
          <h5 className='font-poppins lg:font-raleway font-medium lg:font-semibold max-lg:text-body-s lg:text-h5 text-body lg:text-primary-500 leading-10 tracking-wide'>Privacy & Safety</h5>
        </div>
        <Button size='sm' className='rounded-2xl max-lg:w-20 max-lg:h-10 max-lg:text-body-xs' onClick={handleSave} isLoading={isPending} loadingText='Saving…'>
          Save
        </Button>
      </div>

      <div className='pt-12 px-8 gap-y-4 flex flex-col'>
        <button
          type='button'
          onClick={() => setView('blocked')}
          aria-label='Open blocked users'
          className='bg-secondary-50 cursor-pointer border border-gray-50 py-3 px-6 rounded-2xl w-full flex-1 flex items-center justify-between gap-x-3 transition-colors hover:bg-secondary-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500'
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
