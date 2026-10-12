import { Button, Input } from '@/components'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import ConfirmDeactivation from '../ui/confirm-deactivation'
import ConfirmDeletion from '../ui/confirm-deletion'
import { useUpdatePrivacySettings } from '@/hooks/use-auth-mutations'

const Security = ({ goBack }: { goBack?: () => void }) => {
    const { mutate: save, isPending } = useUpdatePrivacySettings()
    
    // State to manage modal visibility
    const [isDeactivateOpen, setIsDeactivateOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    // const handleSave = () => {
    //     if (!isDirty || isPending) return
    //     save(formData)
    // }

    return (
        <div className='lg:border lg:border-gray-50 lg:rounded-2xl lg:bg-white w-full lg:pb-8 pb-16'>
            <div className='lg:px-8 lg:py-4 px-4 max-lg:pb-4 max-lg:pt-6 flex justify-between items-center border-b border-gray-50 '>
                <div className='flex items-center gap-2'>
                    <button onClick={goBack} className='cursor-pointer lg:hidden'>
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <mask id="path-1-inside-1_10796_3029" fill="white">
                            <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z"/>
                        </mask>
                        <path d="M0 20M40 20M40 20M0 20M20 0M40 20M20 40M0 20M20 40V38C10.0589 38 2 29.9411 2 20H0H-2C-2 32.1503 7.84974 42 20 42V40ZM40 20H38C38 29.9411 29.9411 38 20 38V40V42C32.1503 42 42 32.1503 42 20H40ZM20 0V2C29.9411 2 38 10.0589 38 20H40H42C42 7.84974 32.1503 -2 20 -2V0ZM20 0V-2C7.84974 -2 -2 7.84974 -2 20H0H2C2 10.0589 10.0589 2 20 2V0Z" fill="#E6E8EB" mask="url(#path-1-inside-1_10796_3029)"/>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M30 20C30 25.5228 25.5228 30 20 30C14.4772 30 10 25.5228 10 20C10 14.4772 14.4772 10 20 10C25.5228 10 30 14.4772 30 20ZM16.9696 16.9696C17.2625 16.6768 17.7374 16.6768 18.0303 16.9696L20 18.9393L21.9696 16.9697C22.2625 16.6768 22.7374 16.6768 23.0303 16.9697C23.3232 17.2626 23.3232 17.7374 23.0303 18.0303L21.0606 20L23.0303 21.9696C23.3232 22.2625 23.3232 22.7374 23.0303 23.0303C22.7374 23.3232 22.2625 23.3232 21.9696 23.0303L20 21.0607L18.0303 23.0303C17.7374 23.3232 17.2625 23.3232 16.9696 23.0303C16.6768 22.7374 16.6768 22.2625 16.9696 21.9697L18.9393 20L16.9696 18.0303C16.6767 17.7374 16.6767 17.2625 16.9696 16.9696Z" fill="#525965"/>
                        </svg>
                    </button>
                    <h5 className='max-lg:font-poppins lg:font-raleway font-medium lg:font-semibold max-lg:text-body-s lg:text-h5 text-body lg:text-primary-500 leading-10 tracking-wide'>Security</h5>
                </div>
                <Button 
                    size='sm' 
                    className='rounded-2xl max-lg:w-20 max-lg:h-10 max-lg:text-body-xs'
                    // onClick={handleSave} 
                    isLoading={isPending} 
                    loadingText='Saving…'
                >
                    Save
                </Button>
            </div>

            <div className='pt-12 lg:px-8 px-4 overflow-y-scroll gap-y-4 flex flex-col pb-12'>
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

                    <hr className="border-gray-200 max-lg:hidden" />

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