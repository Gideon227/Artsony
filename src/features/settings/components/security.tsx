import { Button, Input } from '@/components'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import ConfirmDeactivation from '../ui/confirm-deactivation'
import ConfirmDeletion from '../ui/confirm-deletion'

const Security = () => {
    // State to manage modal visibility
    const [isDeactivateOpen, setIsDeactivateOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    return (
        <div className='border border-gray-50 rounded-2xl bg-white w-full relative'>
            <div className='px-8 py-4 flex justify-between items-center border-b border-gray-50 '>
                <h5 className='font-raleway font-semibold text-h5 text-primary-500 leading-10 tracking-wide'>Security</h5>
                <Button size='sm' className='rounded-2xl' onClick={() => {}}>Save</Button>
            </div>

            <div className='pt-12 px-8 overflow-y-scroll gap-y-4 flex flex-col pb-12'>
                <div className='flex flex-col gap-y-6'>
                    <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>Change Password</p>

                    <div className='bg-secondary-50 p-6 gap-y-4 flex flex-col border-secondary-50 rounded-xl'>
                        <Input
                            type="password"
                            placeholder="Enter Password"
                            autoComplete="current-password"
                            className="h-12"
                        />
                        <Input
                            type="password"
                            placeholder="Enter New Password"
                            autoComplete="current-password"
                            className="h-12"
                        />
                        <Input
                            type="password"
                            placeholder="Confirm New Password"
                            autoComplete="current-password"
                            className="h-12"
                        />
                        <Link href='/' className='flex mx-auto w-full'>
                            <p className='font-poppins font-medium text-body-s text-primary-500 leading-6 tracking-wide'>Forgot Password? Reset</p>
                        </Link>
                    </div>
                </div>

                <div className='bg-secondary-50 p-6 flex flex-col gap-y-8 rounded-xl mt-6'>
                    <div className='flex flex-col gap-y-4'>
                        <div className='flex gap-x-3 items-center'>
                            <p className='font-poppins font-medium text-heading text-body-s leading-6 tracking-wide'>Deactivate Account</p>
                            <Image src='/icons/question-circle.svg' width={20} height={20} alt='question mark' />
                        </div>
                        <p className='font-poppins text-text-disabled text-body-xs leading-5 tracking-wide'>
                            Deactivating your account will temporarily disable your Artsony profile and activity. <br /><br />
                            While deactivated, your profile won&apos;t be visible, you won&apos;t be able to buy or sell artworks, and notifications will be paused. Your account data, order history, and wallet balance will be kept safe until you return.<br />
                            You can reactivate your account anytime by logging back in.
                        </p>
                        <div className="pt-2">
                            <Button 
                                variant='outline' 
                                size='md' 
                                onClick={() => setIsDeactivateOpen(true)}
                            >
                                Continue
                            </Button>
                        </div>
                    </div>

                    <hr className="border-gray-200" />

                    <div className='flex flex-col gap-y-4'>
                        <div className='flex gap-x-3 items-center'>
                            <p className='font-poppins font-medium text-heading text-body-s leading-6 tracking-wide'>Delete Account</p>
                            <Image src='/icons/question-circle.svg' width={20} height={20} alt='question mark' />
                        </div>
                        <p className='font-poppins text-text-disabled text-body-xs leading-5 tracking-wide'>
                            Deleting your account will permanently remove your Artsony profile and access to the platform. <br /><br />
                            Once deleted, you will no longer be able to sign in or recover your account, settings, or history. This action cannot be undone.<br />
                            If you are a seller before deleting your account, make sure all orders are completed or resolved. If your account has a remaining balance, you&apos;ll need to withdraw those funds first.
                            Please confirm that you want to continue.
                        </p>
                        <div className="pt-2">
                            <Button 
                                variant='outline' 
                                size='md' 
                                onClick={() => setIsDeleteOpen(true)}
                            >
                                Continue
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Render Modals Conditionally */}
            {isDeactivateOpen && (
                <ConfirmDeactivation onClose={() => setIsDeactivateOpen(false)} />
            )}
            
            {isDeleteOpen && (
                <ConfirmDeletion onClose={() => setIsDeleteOpen(false)} />
            )}
        </div>
    )
}

export default Security