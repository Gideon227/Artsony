import { Button } from '@/components'
import { X } from 'lucide-react'
import React from 'react'

interface ConfirmDeactivationProps {
    onClose: () => void;
}

const ConfirmDeactivation = ({ onClose }: ConfirmDeactivationProps) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className='bg-white w-[564px] py-16 px-10 rounded-2xl border border-gray-50 relative flex flex-col gap-y-12'>
                {/* <button 
                    onClick={onClose}
                    className='absolute border border-gray-50 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors' 
                    style={{ top: 32, left: 32 }}
                >
                    <span className='bg-gray-400 w-6 h-6 rounded-full flex items-center justify-center'>
                        <X color='white' size={16} />
                    </span>
                </button> */}

                <h4 className='font-raleway font-medium text-h4 text-[#333333] leading-10 tracking-wide text-center'>
                    Confirm Account De-Activation
                </h4>

                <p className='font-poppins text-body-xs leading-5 text-body tracking-wide text-center px-4'>
                    Your account will be temporarily deactivated and hidden from the platform. You can reactivate it anytime by logging back in.
                </p>

                <div className='flex items-center justify-between w-full mt-4 gap-4'>
                    <Button variant='outline' size='lg' onClick={onClose} className='flex-1 w-full'>Cancel</Button>
                    <Button className='w-full flex-1'>De-Activate Account</Button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmDeactivation