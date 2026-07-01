import { Button } from '@/components'
import { Check, X } from 'lucide-react'
import React from 'react'

const CancelReason = () => {
    const reasons = [
        { id: 0, text: 'I ordered by mistake', isSelected: false },
        { id: 1, text: 'The wrong artwork was selected', isSelected: false },
        { id: 2, text: 'I changed my mind', isSelected: false },
        { id: 3, text: 'I found a problem with the listing', isSelected: false },
        { id: 4, text: 'Other', isSelected: false },
    ]

    return (
        <div className='py-16 px-10 rounded-2xl border border-gray-50 relative gap-y-12'>
            <span className='absolute border border-gray-50 rounded-full w-10 h-10 items-center' style={{ top: 10, left: 10 }}>
                <span className='bg-gray-400 w-6 h-6 rounded-full items-center'>
                    <X color='white' size={20} />
                </span>
            </span>

            <h4 className='font-raleway font-medium text-h4 text-[#333333] leading-10 tracking-wide'>Cancel Ordetr</h4>

            <div className='flex flex-col items-center justify-center gap-y-6'>
                <p className='font-poppins text-body-xs leading-4 text-body tracking-wide text-center px-4'>
                    You&apos;re about to cancel this order. <br />
                    Cancellations are only available until the seller activates shipping. <br />
                    Your payment, excluding transaction fees, will be refunded once the cancellation is processed. <br />
                    Refunds are typically completed within 2–3 business days.
                </p>

                {reasons.map((r, i) => (
                    <div className={` py-3 px-6 flex items-center gap-x-3 w-full ${r.isSelected ? 'bg-action' : 'bg-white border-b border-gray-50' }`} key={i}>
                        <p className={`flex-1 font-poppins font-medium text-body-xs tracking-wide ${r.isSelected ? 'text-white' : 'text-body'}`}>{r.text}</p>
                        <button className={`cursor-pointer bg-white rounded-full w-6 h-6 ${r.isSelected ? '' : 'border-2 border-gray-50'}`}>
                            {r.isSelected && <Check color='#F25B38' size={20} />}
                        </button>
                    </div>
                ))}
            </div>

            <Button rightIcon='/icons/alt-arrow-right-double.svg' className='mx-auto'>Continue</Button>
        </div>
    )
}

export default CancelReason