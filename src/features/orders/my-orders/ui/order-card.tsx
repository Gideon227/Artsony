import { Check, X } from 'lucide-react';
import Image from 'next/image';
import React from 'react'

interface Props {
    artType: 'digital' | 'physical'
    artName: string;
    artMedia: string
    courier: string
    canceledBy: string
    modifiedDate: string //Canceled date or delivered date or purchase date
    total: string;
    orderId: string;
    deliveryDate: string;
    artist: {
        name: string;
        avatarUrl: string
        artistId: string
    }
    status: 'delivered' | 'live' | 'canceled';
    isActive: boolean
}

const OrderCard = ({ artType, artName, artMedia, artist, courier, canceledBy, deliveryDate, isActive, modifiedDate, orderId, status, total }: Props ) => {
    return (
        <div className={`border border-gray-50 rounded-2xl p-3 flex flex-col gap-y-6 ${isActive && status === 'delivered' ? 'outline outline-offset-2 outline-action' : isActive && status === 'live' ? 'outline outline-offset-2 outline-information-500' : isActive && status === 'canceled' ? 'outline outline-offset-2 outline-error-500' : null}`}>
            <div className='flex gap-x-4 w-full'>
                <div className='flex-1 flex gap-x-2 items-center justify-start'>
                    <div className='w-14 h-16 bg-[#00000033] rounded-xl'>
                        <Image src={artMedia} fill alt='art image' />
                    </div>
                    <div className='flex flex-col gap-y-1 my-auto'>
                        <p className='font-poppins font-medium text-body-s text-heading tracking-wide '></p>
                        <p className='font-poppins text-body-xxs text-body tracking-wide'>Type: <span className='text-info-500'>{artType}</span></p>
                    </div>
                </div>

                {status === 'delivered' && 
                    <span className='border border-successful-500 bg-successful-100 rounded-s py-1 px-3 text-successful-500'>
                        <p>Delivered</p>
                    </span>
                }

                {status === 'live' && 
                    <span className='border border-info-500 bg-info-100 rounded-s py-1 px-3 text-info-500'>
                        <p>Live</p>
                    </span>
                }

                {status === 'canceled' && 
                    <span className='border border-error-500 bg-error-100 rounded-s py-1 px-3 text-error-500'>
                        <p>Canceled</p>
                    </span>
                }
            </div>

            <div className='flex flex-col gap-y-6'>
                <div className='flex gap-x-0.5 items-center w-full'>
                    <span className='border-2 border-gray-50 p-1.5 w-4 h-4 rounded-full'>
                        <span className={`w-3 h-3 rounded-full ${status === 'delivered' ? 'bg-successful-500' : status === 'live' ? 'bg-info-500' : status === 'canceled' && 'bg-error-500'}`} />
                    </span>

                    <hr className={`flex-1 ${status === 'delivered' ? 'bg-successful-500' : status === 'live' ? 'bg-info-500' : status === 'canceled' && 'bg-error-500'}`} />
                
                    {status === 'delivered' && 
                        <span className='w-5 h-5 rounded-full bg-successful-500 justify-items-center'>
                            <Check color='#fff' size={12} />
                        </span>
                    }

                    {status === 'live' && 
                        <span className='w-5 h-5 rounded-full border-2 border-gray-50 bg-white justify-items-center'>
                            <span className='w-3 h-3 rounded-full bg-gray-400' />
                        </span>
                    }

                    {status === 'canceled' && 
                        <span className='w-5 h-5 rounded-full bg-error-500 justify-items-center'>
                            <X color='#fff' size={12} />
                        </span>
                    }
                </div>
                
                <div className='flex items-center justify-between w-full'>
                    <div className='flex flex-col gap-y-2'>
                        <p className='font-poppins text-body-xs text-text-disabled'>Total: <span className='ml-0.5 text-heading'>{total}</span></p>
                        <p className='font-poppins text-body-xs text-text-disabled'>{status === 'delivered' ? 'Order ID' : status === 'live' ? 'Courier': status === 'canceled' && 'Canceled By'} <span className='ml-0.5 text-heading'>{status === 'delivered' ? orderId : status === 'live' ? courier : status === 'canceled' && canceledBy}</span></p>
                    </div>

                    <div className='flex flex-col gap-y-2 text-start'>
                        <p className='font-poppins text-body-xs text-text-disabled'>{status === 'delivered' ? 'Delivery Date' : status === 'live' ? 'Purchase Date': status === 'canceled' && 'Canceled Date'}</p>
                        <p className='font-poppins text-body-xs text-heading'>{modifiedDate}</p>
                    </div>
                </div>
            </div>

            <div className='pt-4 flex justify-between items-center '></div>
        </div>
    )
}

export default OrderCard