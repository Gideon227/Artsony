import { Input, Textarea } from '@/components'
import { Dropdown, DropdownOption } from '@/components/ui/dropdown'
import { INTERESTS } from '@/features/onboarding/data/interests'
import type { ProfileDraft } from '../components/profile-customization'

const MAX_ART_FOCUS = 3

interface Props {
  draft: ProfileDraft
  setField: <K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) => void
}

const InfoSection = ({ draft, setField }: Props) => {
  const selectedOptions: DropdownOption[] = draft.interests
    .map((id) => INTERESTS.find((i) => i.id === id))
    .filter((i): i is (typeof INTERESTS)[number] => Boolean(i))
    .map((i) => ({ id: i.id, label: i.label, icon: i.image }))

  return (
    <div className='flex flex-col gap-y-6'>
      <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>Personal Info</p>
      <form className='bg-secondary-50 p-6 gap-y-4 flex flex-col rounded-xl' onSubmit={(e) => e.preventDefault()}>
        <div className='gap-y-2 flex flex-col w-full'>
          <label className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>Username</label>
          <Input
            value={draft.username}
            onChange={(e) => setField('username', e.target.value)}
          />
        </div>

        <div className='gap-y-2 flex flex-col w-full'>
          <label className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>Full Name</label>
          <Input
            value={draft.displayName}
            onChange={(e) => setField('displayName', e.target.value)}
          />
        </div>

        <div className='gap-y-2 flex flex-col w-full'>
          <label className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>Bio</label>
          <Textarea
            value={draft.bio}
            maxLength={500}
            onChange={(e) => setField('bio', e.target.value)}
          />
          <p className='font-poppins text-body-xxs text-gray-200 tracking-wide'>
            {draft.bio.length}/500 characters
          </p>
        </div>

        <div className='gap-y-2 flex flex-col w-full'>
          <label className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>Art Focus</label>
          <Dropdown
            options={INTERESTS.map((i) => ({ id: i.id, label: i.label, icon: i.image }))}
            multiple
            values={selectedOptions}
            maxSelected={MAX_ART_FOCUS}
            onChangeMultiple={(options) => setField('interests', options.map((o) => String(o.id)))}
            placeholder='Select up to 3'
          />
          <p className='font-poppins text-body-xxs text-gray-200 tracking-wide'>
            {draft.interests.length}/{MAX_ART_FOCUS} selected
          </p>
        </div>
      </form>
    </div>
  )
}

export default InfoSection
