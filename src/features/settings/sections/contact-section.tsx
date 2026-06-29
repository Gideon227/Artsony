import { Input } from '@/components'
import { Dropdown } from '@/components/ui/dropdown'
import { PhoneInput } from '@/components/ui/phone-input'
import { User } from '@/types'
import React from 'react'

const ContactSection = ({ user }: { user: User }) => {
    return (
        <div className='flex flex-col gap-y-6'>
            <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>Contact & Region</p>

            <form className=' bg-secondary-50 p-6 gap-y-4 border rounded-xl'>
                <div className='gap-y-2 flex flex-col w-full'>
                    <label className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>Email</label>
                    <Input
                        placeholder='forexample@gmail.com'
                        onChange={() => {}}
                        
                    />
                </div>

                <div className='gap-y-2 flex flex-col w-full'>
                    <label className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>Phone Number</label>
                    <PhoneInput 
                        placeholder='08012345678'
                    />
                </div>

                <div className='gap-y-2 flex flex-col w-full'>
                    <label className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>Country</label>
                    {/* <Dropdown 
                        options={} //countries api
                    /> */}
                </div>

                <div className='gap-y-2 flex flex-col w-full'>
                    <label className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>Country</label>
                    {/* <Dropdown 
                        options={} //language api
                    /> */}
                </div>
                
                <div className='flex justify-between items-center w-full'>
                    <p className='font-poppins font-medium text-body-s leading-6 text-heading tracking-wide'>Set Automatically by location</p>
                    <div></div>
                </div>
            </form>
        </div>
    )
}

export default ContactSection