'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { artworkService } from '@/services/artwork.service'
import { useToast } from '@/components/ui/toaster'
import { Spinner } from '@/components/ui/spinner'
import { HttpError } from '@/lib/api-client'
import type { ProfileDraft } from '../components/profile-customization'

interface Props {
  draft: ProfileDraft
  setField: <K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) => void
}

const ImageSection = ({ draft, setField }: Props) => {
  const { error } = useToast()
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const backgroundInputRef = useRef<HTMLInputElement>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingBackground, setUploadingBackground] = useState(false)

  const handleUpload = async (
    file: File,
    field: 'avatarUrl' | 'backgroundUrl',
    setUploading: (v: boolean) => void,
  ) => {
    setUploading(true)
    try {
      const result = await artworkService.uploadAsset(file)
      setField(field, result.optimized_url ?? result.original_url)
    } catch (err) {
      const message = err instanceof HttpError ? err.message : 'Could not upload image. Please try again.'
      error('Upload failed', message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className='flex flex-col gap-y-6'>
      <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>Images</p>

      <div className='bg-secondary-50 p-6 gap-y-4 rounded-xl'>
        <div className='gap-y-2 flex flex-col w-full'>
          <p className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>Profile Images</p>
          <div className='flex items-center justify-center mx-auto w-full'>
            <div className='relative w-36 h-36'>
              <Image
                src={draft.avatarUrl || '/images/image-avatar.svg'}
                width={144}
                height={144}
                alt='profile image'
                className='border border-gray-50 rounded-full object-cover w-36 h-36'
              />
              {uploadingAvatar && (
                <div className='absolute inset-0 bg-black/40 rounded-full flex items-center justify-center'>
                  <Spinner size='sm' />
                </div>
              )}
              <input
                ref={avatarInputRef}
                type='file'
                accept='image/*'
                className='hidden'
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void handleUpload(file, 'avatarUrl', setUploadingAvatar)
                  e.target.value = ''
                }}
              />
              <button
                type='button'
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className='absolute cursor-pointer w-14 h-14 bg-primary-500 rounded-full flex items-center justify-center disabled:opacity-60'
                style={{ bottom: 10, left: '50%', transform: 'translateX(-50%)' }}
              >
                <Image src='/icons/camera-white.svg' width={32} height={32} alt='camera icon' />
              </button>
            </div>
          </div>
        </div>

        <div className='gap-y-2 flex flex-col w-full'>
          <p className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>Profile Background</p>

          <div className='rounded-m relative bg-gray-400 overflow-hidden' style={{ width: 800, height: 308 }}>
            {draft.backgroundUrl && (
              <Image src={draft.backgroundUrl} alt='profile background' fill className='object-cover' />
            )}
            <div className='bg-[#00000080] absolute inset-0' />
            <input
              ref={backgroundInputRef}
              type='file'
              accept='image/*'
              className='hidden'
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void handleUpload(file, 'backgroundUrl', setUploadingBackground)
                e.target.value = ''
              }}
            />
            <div className='flex gap-x-4 items-center justify-center mx-auto w-full h-full absolute inset-0'>
              {uploadingBackground ? (
                <Spinner size='sm' className='text-white' />
              ) : (
                <>
                  <button type='button' onClick={() => backgroundInputRef.current?.click()}>
                    <Image src='/icons/camera-white.svg' width={32} height={32} alt='camera icon' />
                  </button>
                  <p className='font-poppins text-body-m text-white tracking-wide'>Resolution (1920px X 440px)</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageSection
