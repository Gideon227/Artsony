import { Input } from '@/components';
import { Artwork } from '@/types';
import { Order } from '@/types/order';
import Image from 'next/image'
import React from 'react'

interface Props {
    art: Partial<Artwork>
    order: Order
    status: 'completed' | 'canceled'
    orderId: string;
    artworkType: 'physical' | 'digital'
    purchaseDate: string;
    pickupDate: string;
    deliveryDate: string;
}

const OrderDetails = ({ status, orderId, artworkType, pickupDate, deliveryDate, purchaseDate, art, order }: Props) => {
    
    if (!art) {
        return;
    }

    return (
        <div className='bg-white py-4 border-2 border-gray-50 rounded-xl flex flex-col justify-between'>
            {/* Header */}
            <div className='px-4 w-full flex flex-col gap-y-10'>
                <div className='flex justify-between items-center w-full'>
                    <h5 className='font-raleway font-semibold text-h5 text-heading leading-10 tracking-wide'>{status === 'completed' ? 'Delivery Information' : status === 'canceled' ? 'Canceled Order Info' : null}</h5>
                    <button className='cursor-pointer '>
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <mask id="path-1-inside-1_6542_34054" fill="white">
                            <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z"/>
                            </mask>
                            <path d="M20 40V38C10.0589 38 2 29.9411 2 20H0H-2C-2 32.1503 7.84974 42 20 42V40ZM40 20H38C38 29.9411 29.9411 38 20 38V40V42C32.1503 42 42 32.1503 42 20H40ZM20 0V2C29.9411 2 38 10.0589 38 20H40H42C42 7.84974 32.1503 -2 20 -2V0ZM20 0V-2C7.84974 -2 -2 7.84974 -2 20H0H2C2 10.0589 10.0589 2 20 2V0Z" fill="#E6E8EB" mask="url(#path-1-inside-1_6542_34054)"/>
                            <path d="M15 20C15 21.1046 14.1046 22 13 22C11.8954 22 11 21.1046 11 20C11 18.8954 11.8954 18 13 18C14.1046 18 15 18.8954 15 20Z" fill="#525965"/>
                            <path d="M22 20C22 21.1046 21.1046 22 20 22C18.8954 22 18 21.1046 18 20C18 18.8954 18.8954 18 20 18C21.1046 18 22 18.8954 22 20Z" fill="#525965"/>
                            <path d="M29 20C29 21.1046 28.1046 22 27 22C25.8954 22 25 21.1046 25 20C25 18.8954 25.8954 18 27 18C28.1046 18 29 18.8954 29 20Z" fill="#525965"/>
                        </svg>
                    </button>
                </div>

                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-x-4'>
                        <span className='border border-gray-50 rounded-[20px] p-3'>
                            <Image src='/icons/' width={38} height={38} alt='box icon' />
                        </span>

                        <div className='flex flex-col gap-y-2'>
                            <p className='font-poppins text-body-xs text-gray-200 tracking-wide'>Artwork Type: <span className='text-body'>{artworkType}</span></p>
                            <p className='font-poppins text-body-xs text-gray-200 tracking-wide'>Order ID: <span className='text-body'>{orderId}</span></p>
                            <p className='font-poppins text-body-xs text-gray-200 tracking-wide'>Status: <span className={`${status === 'completed' ? 'text-successful-500' : 'text-error-500'}`}>{status}</span></p>
                        </div>
                    </div>

                    <div className='flex flex-col gap-y-2'>
                        <p className='font-poppins text-body-xs text-gray-200 tracking-wide'>Purchase Date: <span className='text-body'>{purchaseDate}</span></p>
                        <p className='font-poppins text-body-xs text-gray-200 tracking-wide'>{status === 'completed' ? 'Pickup Date: ': 'Canceled Date' } <span className='text-body'>{pickupDate}</span></p>
                        <p className='font-poppins text-body-xs text-gray-200 tracking-wide'>{status === 'completed' ? 'Delivery Date: ' : 'Refund Date'} <span className={`${status === 'completed' ? 'text-body' : 'text-info-500'}`}>{status === 'completed' ? deliveryDate : 'In Progress'}</span></p>
                    </div>
                </div>
            </div>

            {/* Artwork Details */}
            <div className='py-6 px-4 flex flex-col gap-y-4 border-y border-gray-50'>
                <p className='font-poppins font-medium text-body-m text-body tracking-wide'>Artwork Details</p>
                <div className='flex gap-x-4 items-center'>
                    {art.assets && <div className='w-full h-full '>
                        <Image src={art?.assets[0]?.thumbnail_url as string} fill alt='art image' />
                    </div>}

                    <div className='grid col-span-2 row-span-3 gap-x-4 gap-y-2 '>
                        <div className='flex flex-col gap-y-2'>
                            <p className='font-poppins text-body-xxs text-body tracking-wide'>Artwork Name</p>
                            <Input placeholder={art?.title} value={art.title} disabled />
                        </div>

                        <div className='flex flex-col gap-y-2'>
                            <p className='font-poppins text-body-xxs text-body tracking-wide'>Artwork Cost</p>
                            <Input placeholder={String(art?.price)} value={String(art.price)} disabled />
                        </div>

                        <div className='flex flex-col gap-y-2'>
                            <p className='font-poppins text-body-xxs text-body tracking-wide'>Quantity</p>
                            <Input placeholder={order.items.length.toString()} value={order.items.length.toString()} disabled />
                        </div>

                        <div className='flex flex-col gap-y-2'>
                            <p className='font-poppins text-body-xxs text-body tracking-wide'>Shipping Cost</p>
                            <Input placeholder={order.shipping_cost} value={order.shipping_cost} disabled />
                        </div>

                        <div className='flex flex-col gap-y-2'>
                            <p className='font-poppins text-body-xxs text-body tracking-wide'>Variant</p>
                            <Input placeholder={order.items[0]?.variant_snapshot?.variant_name} value={order.items[0]?.variant_snapshot?.variant_name} disabled /> TODO: ADD VARIANTS VALUE
                        </div>

                        <div className='flex flex-col gap-y-2'>
                            <p className='font-poppins text-body-xxs text-body tracking-wide'>Total Cost</p>
                            <Input placeholder={order.subtotal.toString()} value={order.subtotal.toString()} disabled />
                        </div>
                    </div>
                </div>
            </div>

            {status === 'canceled' && (
                <div className='px-4 flex flex-col gap-y-6'>
                    <p className='font-poppins font-medium text-body-m leading-6 tracking-white text-body'>Refund Details</p>

                    <div className='grid col-span-2 gap-y-2 gap-x-8'>
                        <div className='flex flex-col gap-y-2'>
                            <label className='font-poppins text-body-xxs text-body tracking-wide'>Courier</label>
                            <Input value={order.courier_service} disabled />
                        </div>

                        <div className='flex flex-col gap-y-2'>
                            <label className='font-poppins text-body-xxs text-body tracking-wide'>Reason</label>
                            <Input placeholder='The artwork was damaged before packaging.' disabled />
                        </div>

                        <div className='flex flex-col gap-y-2'>
                            <label className='font-poppins text-body-xxs text-body tracking-wide'>Tracking ID :</label>
                            <Input value={order.tracking_id} disabled />
                        </div>

                        <div className='flex flex-col gap-y-2'>
                            <label className='font-poppins text-body-xxs text-body tracking-wide'>Refund Status</label>
                            <Input value={order.refund_status} disabled />
                        </div>

                        <div className='flex flex-col gap-y-2'>
                            <label className='font-poppins text-body-xxs text-body tracking-wide'>Service Type</label>
                            <Input placeholder='Not Activated' disabled />
                        </div>

                        <div className='flex flex-col gap-y-2'>
                            <label className='font-poppins text-body-xxs text-body tracking-wide'>Refund Amount</label>
                            <Input value={order.refund_amount} disabled />
                        </div>

                        <div className='flex flex-col gap-y-2'>
                            <label className='font-poppins text-body-xxs text-body tracking-wide'>Pickup Address</label>
                            <Input value={order.shipping_address!} disabled />
                        </div>
                    </div>
                </div>
            )}

            {status === 'completed' && (
                <div className='px-4 flex flex-col gap-y-6'>
                    <p className='font-poppins font-medium text-body-m leading-6 tracking-white text-body'>Shipping Details</p>
                
                    <div className='flex items-center gap-x-12 w-full'>
                        <div className='flex flex-col gap-y-2 w-2/3'>
                            <div className='flex flex-col gap-y-2'>
                                <label className='font-poppins text-body-xxs text-body tracking-wide'>Courier</label>
                                <Input value={order.courier_service} disabled />
                            </div>

                            <div className='flex flex-col gap-y-2'>
                                <label className='font-poppins text-body-xxs text-body tracking-wide'>Tracking ID:</label>
                                <Input value={order.tracking_id} disabled />
                            </div>
                            <div className='flex flex-col gap-y-2'>
                                <label className='font-poppins text-body-xxs text-body tracking-wide'>Service Type</label>
                                <Input placeholder='Standard (3-5) Days' disabled />
                            </div>
                            <div className='flex flex-col gap-y-2'>
                                <label className='font-poppins text-body-xxs text-body tracking-wide'>Delivery Address</label>
                                <Input value={order.shipping_address!} disabled />
                            </div>
                        </div>

                        <div className='flex flex-col gap-y-3'>
                            <p className='font-poppins text-body-m text-body leading-6 tracking-wide'>Delivery Gallery</p>
                            {/* TODO: PHOTO OF THE PRODUCT DELIVERED TO YOUR DOORSTEP */}
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default OrderDetails