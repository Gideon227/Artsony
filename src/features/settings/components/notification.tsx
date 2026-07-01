import { Button } from '@/components'
import React, { useState } from 'react'

// --- 1. Interactive Switch Toggle Component ---
interface ToggleProps {
    checked: boolean;
    onChange: () => void;
}

const Toggle = ({ checked, onChange }: ToggleProps) => {
    return (
        <button
            type="button"
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-2xl transition-colors duration-200 focus:outline-none border border-primary-500 ${
                checked ? 'bg-primary-500' : 'bg-white'
            }`}
        >
            <span
                className={`inline-block transform rounded-full transition-transform duration-300 ease-in-out ${
                    checked ? 'translate-x-6 bg-white' : 'translate-x-1 bg-primary-500'
                }`}
                style={{ width: 18, height: 18 }}
            />
        </button>
    )
}

// --- 2. Controlled Row Box Component ---
interface CustomBoxProps {
    title: string;
    text: string;
    checked: boolean;
    onChange: () => void;
}

const CustomBox = ({ title, text, checked, onChange }: CustomBoxProps) => {
    return (
        <div className='flex flex-col gap-y-2 w-full'>
            <div className='flex items-center justify-between gap-x-4'>
                <p className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>{title}</p>
                <Toggle checked={checked} onChange={onChange} />
            </div>
            <p className='font-poppins text-body-xs text-text-disabled leading-5 tracking-wide text-left max-w-[90%]'>{text}</p>
        </div>
    )
}

// --- 3. Parent Settings View Component ---
const NotificationSettings = () => {
    // Consolidated tracking state for all explicit alert channels
    const [settings, setSettings] = useState({
        emailNotifications: true,
        
        // Orders & Shipping
        newOrder: true,
        orderActivated: false,
        shipmentUpdates: true,
        orderDelivered: true,
        orderCanceled: false,

        // Wallet & Payments
        earningReceived: true,
        fundsAvailable: true,
        withdrawalCompleted: true,
        refundIssued: false,
        transactionFailed: true,

        // Account & Security
        newDeviceLogin: true,
        passwordChanged: true,
        suspiciousActivity: true,

        // Social Activity
        newMessage: true,
        newComment: false,
        newFollower: true,
        artworkLiked: false,

        // Reviews & Feedback
        newReview: true,
        ratingUpdated: false,

        // Platform Updates
        productUpdates: false,
        policyChanged: true,
        maintenanceAlerts: true,

        // Marketing
        featuredOpportunities: true,
        challengesEvents: false,
    })

    // Atomic setting modifier function
    const handleToggleSetting = (key: keyof typeof settings) => {
        setSettings((prev) => ({
            ...prev,
            [key]: !prev[key],
        }))
    }

    const handleSaveSettings = () => {
        console.log('Pushing updated notification parameters to user record state:', settings)
    }

    return (
        <div className='border border-gray-50 rounded-2xl bg-white w-full'>
            {/* Header Toolbar */}
            <div className='px-8 py-4 flex justify-between items-center border-b border-gray-50'>
                <h5 className='font-raleway font-semibold text-h5 text-primary-500 leading-10 tracking-wide'>
                    Notification Settings
                </h5>
                <Button size='sm' className='rounded-2xl' onClick={() => {}}>Save</Button>
            </div>

            {/* Main Application Preferences Body */}
            <div className='pt-12 px-8 overflow-y-scroll gap-y-16 flex flex-col pb-12' style={{ gap: 64 }}>
                
                {/* Global Email Master Switch Row */}
                <CustomBox
                    title='Enable Notification Via Email'
                    text='Choose to also receive notifications and updates via email also.'
                    checked={settings.emailNotifications}
                    onChange={() => handleToggleSetting('emailNotifications')}
                />

                {/* Order Notifications Category Block */}
                <div className='flex flex-col gap-y-6'>
                    <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>
                        Order & Shipping Notification
                    </p>

                    <div className='bg-secondary-50 p-6 gap-y-6 rounded-xl flex flex-col'>
                        <CustomBox 
                            title='New Order'
                            text='Get notified when someone purchases your artwork.'
                            checked={settings.newOrder}
                            onChange={() => handleToggleSetting('newOrder')}
                        />
                        <CustomBox 
                            title='Order Activated'
                            text='Know when a seller activates shipping for an order.'
                            checked={settings.orderActivated}
                            onChange={() => handleToggleSetting('orderActivated')}
                        />
                        <CustomBox 
                            title='Shipment Updates'
                            text='Receive updates as your order moves through transit.'
                            checked={settings.shipmentUpdates}
                            onChange={() => handleToggleSetting('shipmentUpdates')}
                        />
                        <CustomBox 
                            title='Order Delivered'
                            text='Be notified when an order has been successfully delivered.'
                            checked={settings.orderDelivered}
                            onChange={() => handleToggleSetting('orderDelivered')}
                        />
                        <CustomBox 
                            title='Order Canceled'
                            text='Be notified when an order has been successfully canceled.'
                            checked={settings.orderCanceled}
                            onChange={() => handleToggleSetting('orderCanceled')}
                        />
                    </div>
                </div>

                {/* Wallet Notifications Category Block */}
                <div className='flex flex-col gap-y-6'>
                    <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>
                        Wallet & Payments
                    </p>

                    <div className='bg-secondary-50 p-6 gap-y-6 rounded-xl flex flex-col'>
                        <CustomBox 
                            title='Earning Received'
                            text='Get notified when an order is completed and earnings are assigned.'
                            checked={settings.earningReceived}
                            onChange={() => handleToggleSetting('earningReceived')}
                        />
                        <CustomBox 
                            title='Funds Available'
                            text='Know when your earnings move from pending to available.'
                            checked={settings.fundsAvailable}
                            onChange={() => handleToggleSetting('fundsAvailable')}
                        />
                        <CustomBox 
                            title='Withdrawal Completed'
                            text='Get notified when a payout has been sent to your account.'
                            checked={settings.withdrawalCompleted}
                            onChange={() => handleToggleSetting('withdrawalCompleted')}
                        />
                        <CustomBox 
                            title='Refund Issued'
                            text='Be notified when a refund has been processed.'
                            checked={settings.refundIssued}
                            onChange={() => handleToggleSetting('refundIssued')}
                        />
                        <CustomBox 
                            title='Transaction Failed'
                            text='Receive alerts if a payment or payout fails.'
                            checked={settings.transactionFailed}
                            onChange={() => handleToggleSetting('transactionFailed')}
                        />
                    </div>
                </div>

                {/* Account Security Category Block */}
                <div className='flex flex-col gap-y-6'>
                    <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>
                        Account & Security
                    </p>

                    <div className='bg-secondary-50 p-6 gap-y-6 rounded-xl flex flex-col'>
                        <CustomBox 
                            title='New Device Login'
                            text='Get alerted when your account is accessed from a new device.'
                            checked={settings.newDeviceLogin}
                            onChange={() => handleToggleSetting('newDeviceLogin')}
                        />
                        <CustomBox 
                            title='Password Changed'
                            text='Be notified after your password is updated.'
                            checked={settings.passwordChanged}
                            onChange={() => handleToggleSetting('passwordChanged')}
                        />
                        <CustomBox 
                            title='Suspicious Activity'
                            text='Get notified if we detect unusual activity on your account.'
                            checked={settings.suspiciousActivity}
                            onChange={() => handleToggleSetting('suspiciousActivity')}
                        />
                    </div>
                </div>

                {/* Engagement Social Activity Category Block */}
                <div className='flex flex-col gap-y-6'>
                    <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>
                        Message & Social Activity
                    </p>

                    <div className='bg-secondary-50 p-6 gap-y-6 rounded-xl flex flex-col'>
                        <CustomBox 
                            title='New Message'
                            text='Get notified when you receive a new message.'
                            checked={settings.newMessage}
                            onChange={() => handleToggleSetting('newMessage')}
                        />
                        <CustomBox 
                            title='New Comment'
                            text='Know when someone comments on your artwork.'
                            checked={settings.newComment}
                            onChange={() => handleToggleSetting('newComment')}
                        />
                        <CustomBox 
                            title='New Follower'
                            text='Get notified when a platform member starts following your profile portfolio.'
                            checked={settings.newFollower}
                            onChange={() => handleToggleSetting('newFollower')}
                        />
                        <CustomBox 
                            title='Artwork Liked'
                            text='Get notified when someone likes your artwork.'
                            checked={settings.artworkLiked}
                            onChange={() => handleToggleSetting('artworkLiked')}
                        />
                    </div>
                </div>

                {/* Quality Reviews Category Block */}
                <div className='flex flex-col gap-y-6'>
                    <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>
                        Reviews & Feedbacks
                    </p>

                    <div className='bg-secondary-50 p-6 gap-y-6 rounded-xl flex flex-col'>
                        <CustomBox 
                            title='New Review'
                            text='Get notified when a buyer leaves a review.'
                            checked={settings.newReview}
                            onChange={() => handleToggleSetting('newReview')}
                        />
                        <CustomBox 
                            title='Rating Updated'
                            text='Know when your overall rating changes.'
                            checked={settings.ratingUpdated}
                            onChange={() => handleToggleSetting('ratingUpdated')}
                        />
                    </div>
                </div>

                {/* Core Infrastructure Platform Updates Category Block */}
                <div className='flex flex-col gap-y-6'>
                    <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>
                        Platform Updates & Announcements
                    </p>

                    <div className='bg-secondary-50 p-6 gap-y-6 rounded-xl flex flex-col'>
                        <CustomBox 
                            title='Product Updates'
                            text='Stay informed about new features and improvements.'
                            checked={settings.productUpdates}
                            onChange={() => handleToggleSetting('productUpdates')}
                        />
                        <CustomBox 
                            title='Policy Changed'
                            text='Be notified about important updates to Artsony policies.'
                            checked={settings.policyChanged}
                            onChange={() => handleToggleSetting('policyChanged')}
                        />
                        <CustomBox 
                            title='Maintenance Alerts'
                            text='Receive alerts about scheduled maintenance or downtime.'
                            checked={settings.maintenanceAlerts}
                            onChange={() => handleToggleSetting('maintenanceAlerts')}
                        />
                    </div>
                </div>

                {/* Ecosystem Marketing Category Block */}
                <div className='flex flex-col gap-y-6'>
                    <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>
                        Marketing & Community
                    </p>

                    <div className='bg-secondary-50 p-6 gap-y-6 rounded-xl flex flex-col'>
                        <CustomBox 
                            title='Featured Opportunities'
                            text='Get notified when your artwork is featured or eligible for promotion.'
                            checked={settings.featuredOpportunities}
                            onChange={() => handleToggleSetting('featuredOpportunities')}
                        />
                        <CustomBox 
                            title='Challenges & Events'
                            text='Stay updated on community challenges and events.'
                            checked={settings.challengesEvents}
                            onChange={() => handleToggleSetting('challengesEvents')}
                        />
                    </div>
                </div>

            </div>
        </div>
    )
}

export default NotificationSettings