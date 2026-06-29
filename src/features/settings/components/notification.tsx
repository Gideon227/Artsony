import { Button } from '@/components'
import React from 'react'

const Toggle = () => {
    return (
        <></>
    )
}

const CustomBox = ({ title, text }: { title: string; text: string }) => {
    return (
        <div className='flex flex-col gap-y-2 w-full'>
            <div className='flex items-center justify-between '>
                <p className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>{title}</p>
                <Toggle />
            </div>

            <p className='font-poppins text-body-xs text-text-disabled leading-4 tracking-wide'>{text}</p>
        </div>
    )
}

const NotificationSettings = () => {
  return (
     <div className='border border-gray-50 rounded-2xl bg-white w-full'>
        <div className='px-8 py-4 flex justify-between items-center border-b border-gray-50'>
            <h5 className='font-raleway font-semibold text-h5 text-primary-500 leading-10 tracking-wide'>Shipping & Location</h5>
            <Button size='sm' onClick={() => {}}>Send</Button>
        </div>

        <div className='pt-12 px-8 overflow-y-scroll gap-y-16 flex flex-col'>
            <CustomBox
                title='Enable Notification Via Email'
                text='Choose to alo receive notifications and updates via email also'
            />

            {/* Order Notification */}
            <div className='flex flex-col gap-y-6'>
                <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>Order & Shipping Notification</p>

                <div className='bg-secondary-50 p-6 gap-y-4 border rounded-xl'>
                    <CustomBox 
                        title='New Order'
                        text='Get notified when someone purchases your artwork'
                    />
                    <CustomBox 
                        title='Order Activated'
                        text='Know when a seller activates shipping for an order.'
                    />
                    <CustomBox 
                        title='Shipment Updates'
                        text='Receive updates as your order moves through transit.'
                    />
                    <CustomBox 
                        title='Order Delivered'
                        text='Be notified when an order has been successfully delivered.'
                    />
                    <CustomBox 
                        title='Order Canceled'
                        text='Be notified when an order has been successfully canceled.'
                    />
                </div>
            </div>

            {/* Wallet Notification */}
            <div className='flex flex-col gap-y-6'>
                <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>Wallet & Payments</p>

                <div className='bg-secondary-50 p-6 gap-y-4 border rounded-xl'>
                    <CustomBox 
                        title='Earning Received'
                        text='Get notified when an order is canceled by you or the other party.'
                    />
                    <CustomBox 
                        title='Funds Available'
                        text='Know when your earnings move from pending to available'
                    />
                    <CustomBox 
                        title='Withdrawal Completed'
                        text='Get notified when a payout has been sent to your account.'
                    />
                    <CustomBox 
                        title='Refund Issued'
                        text='Be notified when a refund has been processed'
                    />
                    <CustomBox 
                        title='Transaction Failed'
                        text='Receive alerts if a payment or payout fails'
                    />
                </div>
            </div>

            {/* Account Notification */}
            <div className='flex flex-col gap-y-6'>
                <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>Account & Security</p>

                <div className='bg-secondary-50 p-6 gap-y-4 border rounded-xl'>
                    <CustomBox 
                        title='New Device Login'
                        text='Get alerted when your account is accessed from a new device.'
                    />
                    <CustomBox 
                        title='Password Changed'
                        text='Be notified after your password is updated.'
                    />
                    <CustomBox 
                        title='Suspicious Activity'
                        text='Get notified if we detect unusual activity on your account.'
                    />
                </div>
            </div>

            {/* Message Notification */}
            <div className='flex flex-col gap-y-6'>
                <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>Message & Social Activity</p>

                <div className='bg-secondary-50 p-6 gap-y-4 border rounded-xl'>
                    <CustomBox 
                        title='New Message '
                        text='Get notified when you receive a new message.'
                    />
                    <CustomBox 
                        title='New Comment'
                        text='Know when someone comments on your artwork.'
                    />
                    <CustomBox 
                        title='New Follower'
                        text='Get notified when someone likes your artwork.'
                    />
                    <CustomBox 
                        title='Artwork Liked'
                        text='Get notified when someone likes your artwork.'
                    />
                </div>
            </div>

            {/* Reviews Notification */}
            <div className='flex flex-col gap-y-6'>
                <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>Reviews & Feedbacks</p>

                <div className='bg-secondary-50 p-6 gap-y-4 border rounded-xl'>
                    <CustomBox 
                        title='New Review'
                        text='Get notified when a buyer leaves a review.'
                    />
                    <CustomBox 
                        title='Rating Updated'
                        text='Know when your overall rating changes.'
                    />
                </div>
            </div>

            {/* Platform Notification */}
            <div className='flex flex-col gap-y-6'>
                <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>Platform Updates & Announcements</p>

                <div className='bg-secondary-50 p-6 gap-y-4 border rounded-xl'>
                    <CustomBox 
                        title='Product Updates'
                        text='Satay informed about new features and improvements'
                    />
                    <CustomBox 
                        title='Policy Changed'
                        text='Be notified about important updates to Artsony policies'
                    />
                    <CustomBox 
                        title='Maintenance Alerts'
                        text='Receive alerts about scheduled maintenance or downtime'
                    />
                </div>
            </div>

            {/* Marketing Notification */}
            <div className='flex flex-col gap-y-6'>
                <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>Marketing & Community</p>

                <div className='bg-secondary-50 p-6 gap-y-4 border rounded-xl'>
                    <CustomBox 
                        title='Featured Opportunities'
                        text='Get notified when your artwork is featured or eligible for promotion.'
                    />
                    <CustomBox 
                        title='Challenges & Events'
                        text='Stay updated on community challenges and events'
                    />
                </div>
            </div>

        </div>
    </div>
  )
}

export default NotificationSettings