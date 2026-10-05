'use client'

import { Button } from '@/components'
import React, { useEffect, useState } from 'react'
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '@/hooks/use-notification-preferences'
import type { NotificationType } from '@/services/notification-preferences.service'

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
    <div className='flex flex-col gap-y-1 w-full'>
      <div className='flex items-center justify-between gap-x-4'>
        <p className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>{title}</p>
        <Toggle checked={checked} onChange={onChange} />
      </div>
      <p className='font-poppins text-body-xs text-text-disabled leading-5 tracking-wide text-left max-w-[90%]'>{text}</p>
    </div>
  )
}

// --- 3. Full Page Category Definitions ---
type NotificationItem = {
  key: string;
  title: string;
  text: string;
  type: NotificationType; // Ensure your backend/service types are expanded to accept these keys
}

type NotificationSection = {
  title: string;
  items: NotificationItem[];
}

const NOTIFICATION_SECTIONS: NotificationSection[] = [
  {
    title: 'Order & Shipping Notifications',
    items: [
      { key: 'new_order', title: 'New Order', text: 'Get notified when someone places a new order', type: 'new_order' as NotificationType },
      { key: 'order_activated', title: 'Order Activated', text: 'Know when order status changes to activated', type: 'order_activated' as NotificationType },
      { key: 'shipment_updates', title: 'Shipment Updates', text: "Receive updates on your order's delivery progress", type: 'shipment_updates' as NotificationType },
      { key: 'order_delivered', title: 'Order Delivered', text: 'Get notified when an order has been successfully delivered', type: 'order_delivered' as NotificationType },
      { key: 'order_canceled', title: 'Order Canceled', text: 'Be alerted when an order has been successfully canceled', type: 'order_canceled' as NotificationType },
    ]
  },
  {
    title: 'Wallet & Payments',
    items: [
      { key: 'earnings_received', title: 'Earnings Received', text: 'Get notified when earnings are credited to your seller wallet', type: 'earnings_received' as NotificationType },
      { key: 'funds_available', title: 'Funds Available', text: 'Know when your earnings move from pending to available', type: 'funds_available' as NotificationType },
      { key: 'withdrawal_completed', title: 'Withdrawal Completed', text: 'Get notified when a withdrawal request is fully processed', type: 'withdrawal_completed' as NotificationType },
      { key: 'refund_issued', title: 'Refund Issued', text: 'Be notified when a refund has been processed', type: 'refund_issued' as NotificationType },
      { key: 'transaction_failed', title: 'Transaction Failed', text: 'Get alerts if a payment transaction fails', type: 'transaction_failed' as NotificationType },
    ]
  },
  {
    title: 'Account & Security',
    items: [
      { key: 'new_device_login', title: 'New Device Login', text: 'Get alerted when your account is accessed from a new device', type: 'new_device_login' as NotificationType },
      { key: 'password_changed', title: 'Password Changed', text: 'Be notified when your password is updated', type: 'password_changed' as NotificationType },
      { key: 'suspicious_activity', title: 'Suspicious Activity', text: 'Get notified if we detect unusual activity on your account', type: 'suspicious_activity' as NotificationType },
    ]
  },
  {
    title: 'Messages & Social Activity',
    items: [
      { key: 'new_message', title: 'New Message', text: 'Get notified when you receive a new message', type: 'new_message' as NotificationType },
      { key: 'new_comment', title: 'New Comment', text: 'Know when someone comments on your artwork', type: 'new_comment' as NotificationType },
      { key: 'new_follower', title: 'New Follower', text: 'Get notified when someone new follows you', type: 'new_follower' as NotificationType },
      { key: 'artwork_liked', title: 'Artwork Liked', text: 'Get notified when someone likes your artwork', type: 'artwork_liked' as NotificationType },
    ]
  },
  {
    title: 'Reviews & Feedback',
    items: [
      { key: 'new_review', title: 'New Review', text: 'Get notified when a buyer leaves a review', type: 'new_review' as NotificationType },
      { key: 'rating_updated', title: 'Rating Updated', text: 'Know when your overall rating changes', type: 'rating_updated' as NotificationType },
    ]
  },
  {
    title: 'Platform Updates & Announcements',
    items: [
      { key: 'product_updates', title: 'Product Updates', text: 'Be notified of new features and improvements', type: 'product_updates' as NotificationType },
      { key: 'policy_changes', title: 'Policy Changes', text: 'Get notified when important updates are made to policies', type: 'policy_changes' as NotificationType },
      { key: 'maintenance_alerts', title: 'Maintenance Alerts', text: 'Receive updates when scheduled maintenance downtime', type: 'maintenance_alerts' as NotificationType },
    ]
  },
  {
    title: 'Marketing & Community',
    items: [
      { key: 'featured_opportunities', title: 'Featured Opportunities', text: 'Get notified when your artwork is featured in a curated collection', type: 'featured_opportunities' as NotificationType },
      { key: 'challenge_events', title: 'Challenge/Events', text: 'Be alerted when a new art challenge or event starts', type: 'challenge_events' as NotificationType },
    ]
  }
];

const NotificationSettings = () => {
  const { data: preferences } = useNotificationPreferences()
  const { mutate: save, isPending } = useUpdateNotificationPreferences()

  const [emailEnabled, setEmailEnabled] = useState(true)
  const [typesMuted, setTypesMuted] = useState<NotificationType[]>([])

  useEffect(() => {
    if (preferences) {
      setEmailEnabled(preferences.email_enabled)
      setTypesMuted(preferences.types_muted)
    }
  }, [preferences])

  // A notification type is ENABLED if it is NOT in the muted array
  const isItemEnabled = (type: NotificationType) => !typesMuted.includes(type)

  const toggleItem = (type: NotificationType) => {
    setTypesMuted((current) =>
      current.includes(type)
        ? current.filter((t) => t !== type) // turning on — remove from muted
        : [...current, type] // turning off — add to muted
    )
  }

  const handleSave = () => {
    if (!preferences) return
    const changed: { email_enabled?: boolean; types_muted?: NotificationType[] } = {}
    
    if (emailEnabled !== preferences.email_enabled) {
      changed.email_enabled = emailEnabled
    }

    const sortedCurrent = [...typesMuted].sort()
    const sortedPrev = [...preferences.types_muted].sort()
    
    if (JSON.stringify(sortedCurrent) !== JSON.stringify(sortedPrev)) {
      changed.types_muted = typesMuted
    }
    
    if (Object.keys(changed).length === 0) return
    save(changed)
  }

  return (
    <div className='border border-gray-50 rounded-2xl bg-white w-full pb-8'>
      {/* Header */}
      <div className='px-8 py-4 flex justify-between items-center border-b border-gray-50'>
        <h5 className='font-raleway font-semibold text-h5 text-primary-500 leading-10 tracking-wide'>
          Notifications
        </h5>
        <Button size='sm' className='rounded-2xl' onClick={handleSave} isLoading={isPending} loadingText='Saving…'>
          Save
        </Button>
      </div>

      <div className='pt-8 px-8 overflow-y-scroll gap-y-16 flex flex-col'>
        
        {/* Top-Level Email Toggle */}
        <CustomBox
          title='Enable Notifications Via Email'
          text='Choose to receive notifications and updates via email also.'
          checked={emailEnabled}
          onChange={() => setEmailEnabled((v) => !v)}
        />

        {/* Dynamic Categorized Sections */}
        {NOTIFICATION_SECTIONS.map((section) => (
          <div key={section.title} className='flex flex-col gap-y-6'>
            {/* Section Heading */}
            <h6 className='font-poppins font-semibold text-body-s text-primary-500'>
              {section.title}
            </h6>
            
            {/* Grouped Toggles Box */}
            <div className='bg-secondary-50 p-6 gap-y-6 flex flex-col rounded-xl'>
              {section.items.map((item) => (
                <CustomBox
                  key={item.key}
                  title={item.title}
                  text={item.text}
                  checked={isItemEnabled(item.type)}
                  onChange={() => toggleItem(item.type)}
                />
              ))}
            </div>
          </div>
        ))}
        
      </div>
    </div>
  )
}

export default NotificationSettings