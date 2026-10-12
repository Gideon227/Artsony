import { Button, Input } from '@/components'
import { X } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

interface ConfirmDeletionProps {
    onClose: () => void;
}

const ConfirmDeletion = ({ onClose }: ConfirmDeletionProps) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className='bg-white w-[343px] lg:w-141 py-8 px-6 lg:py-16 lg:px-10 rounded-2xl border border-gray-50 relative flex flex-col gap-y-6 lg:gap-y-12'>
                <h4 className='font-raleway font-medium text-h6 lg:text-h4 text-[#333333] leading-10 text-center'>
                    Confirm Account Deletion
                </h4>

                <div className='flex flex-col gap-y-6'>
                    <div className='flex items-start gap-x-2 lg:gap-x-4 p-4 rounded-xl'>
                        <Image src='/icons/info-circle.svg' width={20} height={20} alt='info icon' className="mt-0.5" />
                        <p className='font-poppins text-body-xs leading-4 text-body tracking-wide text-left'>
                            Please enter your password to confirm this action. This helps us make sure it&apos;s really you. {' '}
                            <span className='text-primary-500'>Remember account deletion cannot be undone!</span>                      
                        </p>
                    </div>

                    <Input type='password' placeholder='Enter Password' />
                </div>

                <div className='flex flex-row max-lg:flex-col items-center justify-between w-full mt-2 gap-4'>
                    <Button variant='outline' onClick={onClose} className='w-full'>Cancel</Button>
                    <Button leftIcon='/icons/shield-warning.svg' className='w-full'>Delete Account</Button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmDeletion