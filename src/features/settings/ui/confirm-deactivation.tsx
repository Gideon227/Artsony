import { Button } from '@/components'
import { X } from 'lucide-react'
import React from 'react'

interface ConfirmDeactivationProps {
    onClose: () => void;
}

const ConfirmDeactivation = ({ onClose }: ConfirmDeactivationProps) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className='bg-white w-[343px] lg:w-[564px] py-8 px-6 lg:py-16 lg:px-10 rounded-2xl border border-gray-50 relative flex flex-col gap-y-6 lg:gap-y-12'>
                <h4 className='font-raleway font-medium max-lg:text-h6 lg:text-h4 text-[#333333] lg:leading-10 text-center'>
                    Confirm Account De-Activation
                </h4>

                <p className='font-poppins text-body-xs leading-5 text-body tracking-wide text-center lg:px-4'>
                    Your account will be temporarily deactivated and hidden from the platform. You can reactivate it anytime by logging back in.
                </p>

                <div className='flex flex-row max-lg:flex-col items-center justify-between w-full mt-4 gap-4'>
                    <Button variant='outline' onClick={onClose} className='w-full'>Cancel</Button>
                    <Button className='w-full' >De-Activate Account</Button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmDeactivation