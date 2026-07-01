import { Input } from '@/components'
import { User } from '@/types'
import React from 'react'

const ConnectedAccount = ({ user }: { user: User }) => {
  return (
    <div className='flex flex-col gap-y-6'>
        <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>Connected Accounts (Social login)</p>

        <form className=' bg-secondary-50 p-6 flex flex-col gap-y-4 rounded-xl'>
            <div className='gap-y-2 flex flex-col w-full'>
                <label className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>Google (<span className='text-successful-500'>Connected</span>)</label>
                <Input
                    placeholder='forexample@gmail.com'
                    onChange={() => {}}
                    rightIcon='/icons/link.svg'
                    leftIcon='/socials/google.svg'
                />
            </div>

            <div className='gap-y-2 flex flex-col w-full'>
                <label className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>Apple (<span className='text-successful-500'>Connected</span>)</label>
                <Input
                    placeholder='Link Apple ID'
                    onChange={() => {}}
                    rightIcon='/icons/link.svg'
                    leftIcon='/socials/apple.svg'
                />
            </div>

            <div className='gap-y-2 flex flex-col w-full'>
                <label className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>Facebook (<span className='text-successful-500'>Connected</span>)</label>
                <Input
                    placeholder='Link Facebook Account'
                    onChange={() => {}}
                    rightIcon='/icons/link.svg'
                    leftIcon='/socials/facebook-blue.svg'
                />
            </div>

        </form>
        
    </div>
  )
}

export default ConnectedAccount