import { Input } from '@/components'
import type { ProfileDraft } from '../components/profile-customization'

interface Props {
  draft: ProfileDraft
  setField: <K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) => void
}

const SocialSection = ({ draft, setField }: Props) => {
  return (
    <div className='flex flex-col gap-y-6'>
      <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>Links & Socials</p>

      <div className='bg-secondary-50 p-6 gap-y-4 rounded-xl'>
        <div className='gap-y-2 flex flex-col w-full mb-6'>
          <p className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>Website Link</p>
          <Input
            placeholder='Website URL Link'
            rightIcon='/icons/cancel.svg'
            className='w-full flex-1'
            value={draft.website}
            onChange={(e) => setField('website', e.target.value)}
          />
        </div>

        <div className='flex flex-col gap-y-4'>
          <div className='gap-y-2 flex flex-col w-full'>
            <p className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>Behance Link</p>
            <Input
              placeholder='Paste Behance Link'
              leftIcon='/socials/behance.svg'
              rightIcon='/icons/cancel.svg'
              value={draft.behanceLink}
              onChange={(e) => setField('behanceLink', e.target.value)}
            />
          </div>

          <div className='gap-y-2 flex flex-col w-full'>
            <p className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>Pinterest Link</p>
            <Input
              placeholder='Paste Pinterests Link'
              leftIcon='/socials/pinterest.svg'
              rightIcon='/icons/cancel.svg'
              value={draft.pinterestLink}
              onChange={(e) => setField('pinterestLink', e.target.value)}
            />
          </div>

          <div className='gap-y-2 flex flex-col w-full'>
            <p className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>Twitter Link</p>
            <Input
              placeholder='Paste Twitter Link'
              leftIcon='/socials/twitter-blue.svg'
              rightIcon='/icons/cancel.svg'
              value={draft.twitterLink}
              onChange={(e) => setField('twitterLink', e.target.value)}
            />
          </div>

          <div className='gap-y-2 flex flex-col w-full'>
            <p className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>LinkedIn Link</p>
            <Input
              placeholder='Paste LinkedIn Link'
              leftIcon='/socials/linkedin-blue.svg'
              rightIcon='/icons/cancel.svg'
              value={draft.linkedinLink}
              onChange={(e) => setField('linkedinLink', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SocialSection
