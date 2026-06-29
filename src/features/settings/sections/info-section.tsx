import { Input, Textarea } from '@/components'
import { Dropdown } from '@/components/ui/dropdown'
import { INTERESTS } from '@/features/onboarding/data/interests'
import { useAuthStore } from '@/store'
import { User } from '@/types'
import React from 'react'

const InfoSection = ({ user }: { user: User }) => {
    return (
        <div className='flex flex-col gap-y-6'>
            <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>Personal Info</p>
            <form className=' bg-secondary-50 p-6 gap-y-4 border rounded-xl'>
                <div className='gap-y-2 flex flex-col w-full'>
                    <label className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>Username</label>
                    <Input 
                        placeholder={user?.username}
                        onChange={() => {}}
                    />
                </div>

                <div className='gap-y-2 flex flex-col w-full'>
                    <label className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>Full Name</label>
                    <Input 
                        placeholder={user?.displayName}
                        onChange={() => {}}
                    />
                </div>

                <div className='gap-y-2 flex flex-col w-full'>
                    <label className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>Bio</label>
                    <Textarea 
                        placeholder={user?.bio as string}
                        onChange={() => {}}
                    />
                    <p className='font-poppins text-body-xxs text-gray-200 tracking-wide'>Max Character 500</p>
                </div>

                <div className='gap-y-2 flex flex-col w-full'>
                    <label className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>Art Focus</label>
                    <Dropdown 
                        options={INTERESTS}
                        onChange={() => {}}
                        placeholder='illustration'
                    />
                </div>
            </form>
        </div>
    )
}

export default InfoSection