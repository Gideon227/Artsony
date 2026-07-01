import { Button } from '@/components'
import React from 'react'
import ContactSection from '../sections/contact-section'
import { useAuthStore } from '@/store'
import ConnectedAccount from '../sections/connected-accounts'

const AccountDetails = () => {
    const { user } = useAuthStore()
    
    return (
        <div className='border border-gray-50 rounded-2xl bg-white w-full pb-8'>
            <div className='px-8 py-4 flex justify-between items-center border-b border-gray-50 '>
                <h5 className='font-raleway font-semibold text-h5 text-primary-500 leading-10 tracking-wide'>Contatct Details</h5>
                <Button size='sm' className='rounded-2xl' onClick={() => {}}>Save</Button>
            </div>

            <div className='pt-12 px-8 overflow-y-scroll gap-y-16 flex flex-col' style={{ gap: 64 }}>
                <ContactSection user={user!} />
                <ConnectedAccount user={user!} />
            </div>
        </div>
    )
}

export default AccountDetails