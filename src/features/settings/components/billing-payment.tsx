import { Button, Input } from '@/components'
import { Dropdown } from '@/components/ui/dropdown'
import Link from 'next/link'
import React from 'react'

const BillingPayment = () => {
    return (
        <div className='border border-gray-50 rounded-2xl bg-white w-full'>
            <div className='px-8 py-4 flex justify-between items-center border-b border-gray-50 '>
                <h5 className='font-raleway font-semibold text-h5 text-primary-500 leading-10 tracking-wide'>Billing & Payments</h5>
                <Button size='sm' onClick={() => {}}>Send</Button>
            </div>

            <div className='pt-12 px-8 overflow-y-scroll gap-y-16 flex flex-col' style={{ gap: 64 }}>
                <div className='flex flex-col gap-y-6'>
                    <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>Connected Accounts (Social login)</p>

                    <div className='bg-secondary-50 p-6 gap-y-2 flex flex-col rounded-xl'>
                        <label className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>MoonPay Wallet (<span className='text-successful-500'>Connected</span>)</label>
                        <p className='font-poppins text-body text-body-xs tracking-wide'>Your MoonPay account handles payments, payouts, and currency conversion securely on Artsony. <Link href='/' className='text-primary-500'>Manage on MoonPay</Link></p>
                        <Input
                            placeholder='forexample@gmail.com'
                            onChange={() => {}}
                            rightIcon='/icons/link.svg'
                            leftIcon='/socials/moonpay.svg'
                        />
                    </div>
                </div>

                <div className='flex flex-col gap-y-6'>
                    <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>Connected Accounts (Social login)</p>
                
                    <div className='bg-secondary-50 p-6 gap-y-4 flex flex-col rounded-xl'>
                        <Input placeholder='Address' />
                        {/* <Dropdown placeholder='Country' /> */}
                        <Input placeholder='City/Town' />
                        <div className='w-full flex-1 flex gap-x-4 items-center'>
                            <Input placeholder='State/Province' style={{ width: '75%' }} />
                            <Input placeholder='Postal Code' style={{ width: '25%' }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BillingPayment