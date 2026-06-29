import { Button, Input } from '@/components'
import { Dropdown } from '@/components/ui/dropdown'
import React from 'react'

interface MessageOptionsProps {
    id: string;
    label: string;
}


const PrivacySafety = () => {
    const messageOptions: MessageOptionsProps[] = [
        { id: 'everyone', label: 'Everyone' },
        { id: 'follower', label: 'Followers Only' },
        { id: 'no-one', label: 'No One' },
    ]

    return (
        <div className='border border-gray-50 rounded-2xl bg-white w-full'>
            <div className='px-8 py-4 flex justify-between items-center border-b border-gray-50 '>
                <h5 className='font-raleway font-semibold text-h5 text-primary-500 leading-10 tracking-wide'>Privacy & Safety</h5>
                <Button size='sm' onClick={() => {}}>Send</Button>
            </div>

            <div className='pt-12 px-8 overflow-y-scroll gap-y-4 flex flex-col'>
                <button className='bg-white py-3 px-6 rounded-2xl w-full flex-1 flex items-center gap-x-3'>
                    <p className='font-poppins text-body-s placeholder:text-body text-heading leading-8'>Blocked Users</p>
                    
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 19L17 12L11 5" stroke="#525965" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M7 19L13 12L7 5" stroke="#525965" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>

                <div className='flex flex-col gap-y-3'>
                    <p className='font-poppins font-medium text-body-s text-body leading-6 tracking-wide'>Who can message you</p>
                    <p className='font-poppins text-body-xs text-text-disabled leading-4 tracking-wide'>Choose who is allowed to send you direct messages on Artsony.</p>
                    <Dropdown 
                        options={messageOptions}
                    />
                </div>

                <div className='flex flex-col gap-y-3'>
                    <p className='font-poppins font-medium text-body-s text-body leading-6 tracking-wide'>Who can comment on your artworks</p>
                    <p className='font-poppins text-body-xs text-text-disabled leading-4 tracking-wide'>Control who can leave comments on your artworks.</p>
                    <Dropdown 
                        options={messageOptions}
                    />
                </div>

                <div className='flex flex-col gap-y-3'>
                    <p className='font-poppins font-medium text-body-s text-body leading-6 tracking-wide'>Who can purchase your artworks</p>
                    <p className='font-poppins text-body-xs text-text-disabled leading-4 tracking-wide'>Decide who can buy your artworks from your store.</p>
                    <Dropdown 
                        options={messageOptions}
                    />
                </div>

            </div>

        </div>
    )
}

export default PrivacySafety