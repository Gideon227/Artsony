import { Button, Input } from '@/components'
import { Dropdown } from '@/components/ui/dropdown'
import Image from 'next/image'
import React from 'react'

const ShippingLocation = () => {
    return (
        <div className='border border-gray-50 rounded-2xl bg-white w-full'>
            <div className='px-8 py-4 flex justify-between items-center border-b border-gray-50'>
                <h5 className='font-raleway font-semibold text-h5 text-primary-500 leading-10 tracking-wide'>Shipping & Location</h5>
                <Button size='sm' onClick={() => {}}>Send</Button>
            </div>

            <div className='pt-12 px-8 overflow-y-scroll gap-y-16 flex flex-col'>
                <div className='flex flex-col gap-y-6'>
                    <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>Location</p>

                    <p className='font-poppins text-body-xs leading-4 tracking-wide text-text-disabled'>This is your primary country and region on Artsony. It&apos;s used for compliance, payouts, and platform features — not for shipping.</p>

                    <div className='bg-secondary-50 p-6 gap-y-4 border rounded-xl'>
                        {/* <Dropdown placeholder='Country' options={getCountries} /> Fetch all countries */}
                        {/* <Dropdown placeholder='State/Province' options={getStates} /> Fetch all states under country */}
                    </div>
                </div>

                <div className='flex flex-col gap-y-6'>
                    <div className='flex items-center justify-between w-full'>
                        <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>Delivery Address</p>
                        <span className='border border-gray-50 rounded-full p-2'>
                            <Image src='/icons/trash-grey.svg' width={18} height={20} alt='delete icon' />
                        </span>
                    </div>

                    <p className='font-poppins text-body-xs leading-4 tracking-wide text-text-disabled'>Used only for delivering physical artworks. You can save and manage addresses anytime.</p>

                    <div className='bg-secondary-50 p-6 gap-y-4 border rounded-xl'>
                        <Input placeholder='Address' />
                        {/* <Dropdown placeholder='Country' /> */}
                        <Input placeholder='City/Town' />
                        <div className='w-full flex gap-x-4 items-center'>
                            {/* <Dropdown placeholder='State/Province' className='w-3/4' />  */}
                            <Input placeholder='Postal Code' className='w-1/4' />
                        </div>
                    </div>
                </div>

                <div className='flex flex-col gap-y-6'>
                    <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>Shipping Address</p>
                    
                    <div className='flex flex-col gap-y-2 items-center justify-between w-full'>
                        <p className='font-poppins font-medium text-body-xs leading-6 tracking-wide text-heading'>Set Automatically by location</p>
                        <p className='font-poppins text-body-xs leading-4 tracking-wide text-text-disabled'>Make sure this address matches where your artworks are stored. It&apos;s used to generate shipping labels and pickup requests.</p>
                    </div>

                    <div className='bg-secondary-50 p-6 gap-y-4 border rounded-xl'>
                        <Input placeholder='Address' />
                        {/* <Dropdown placeholder='Country' /> */}
                        <Input placeholder='City/Town' />
                        <div className='w-full flex gap-x-4 items-center'>
                            {/* <Dropdown placeholder='State/Province' className='w-3/4' />  */}
                            <Input placeholder='Postal Code' className='w-1/4' />
                        </div>
                    </div>
                </div>                
            </div>
            
        </div>
    )
}

export default ShippingLocation