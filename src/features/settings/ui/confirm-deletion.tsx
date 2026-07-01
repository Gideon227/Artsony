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
            <div className='bg-white py-16 px-10 rounded-2xl border border-gray-50 relative flex flex-col gap-y-12 max-w-lg w-full'>
                <button 
                    onClick={onClose}
                    className='absolute border border-gray-50 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors' 
                    style={{ top: 10, left: 10 }}
                >
                    <span className='bg-gray-400 w-6 h-6 rounded-full flex items-center justify-center'>
                        <X color='white' size={16} />
                    </span>
                </button>

                <h4 className='font-raleway font-medium text-h4 text-[#333333] leading-10 tracking-wide text-center'>
                    Confirm Account Deletion
                </h4>

                <div className='flex flex-col gap-y-6'>
                    <div className='flex items-start gap-x-4 bg-gray-50 p-4 rounded-xl'>
                        <Image src='/icons/info-circle.svg' width={20} height={20} alt='info icon' className="mt-0.5" />
                        <p className='font-poppins text-body-xs leading-5 text-body tracking-wide text-left'>
                            Your account will be temporarily deactivated and hidden from the platform. You can reactivate it anytime by logging back in.
                        </p>
                    </div>

                    <Input type='password' placeholder='Enter Password' />
                </div>

                <div className='flex items-center justify-between w-full mt-2'>
                    <Button variant='outline' size='lg' onClick={onClose}>Cancel</Button>
                    <Button leftIcon='/icons/shield-warning.svg' size='lg'>Delete Account</Button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmDeletion