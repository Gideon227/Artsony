'use client'

import { Button } from '@/components'
import { useState } from 'react'
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '@/hooks/use-notification-preferences'
import type { MutedNotificationKey, NotificationEvent } from '@/services/notification-preferences.service'

interface ToggleProps {
  checked: boolean
  onChange: () => void
  label: string
  disabled?: boolean
}

const Toggle = ({ checked, onChange, label, disabled }: ToggleProps) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-2xl transition-colors duration-200 border border-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-not-allowed disabled:opacity-60 ${
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

interface CustomBoxProps {
  title: string
  text: string
  checked: boolean
  onChange: () => void
  disabled?: boolean
}

const CustomBox = ({ title, text, checked, onChange, disabled }: CustomBoxProps) => {
  return (
    <div className='flex flex-col gap-y-1 w-full'>
      <div className='flex items-center justify-between gap-x-4'>
        <p className='font-poppins font-medium text-body-s text-heading leading-6 tracking-wide'>{title}</p>
        <Toggle checked={checked} onChange={onChange} label={title} disabled={disabled} />
      </div>
      <p className='font-poppins text-body-xs text-text-disabled leading-5 tracking-wide text-left max-w-[90%]'>{text}</p>
    </div>
  )
}

type NotificationItem = {
  event: NotificationEvent
  title: string
  text: string
}

type NotificationSection = {
  title: string
  items: NotificationItem[]
}

const NOTIFICATION_SECTIONS: NotificationSection[] = [
  {
    title: 'Order & Shipping Notifications',
    items: [
      { event: 'new_order', title: 'New Order', text: 'Get notified when someone places a new order' },
      { event: 'order_activated', title: 'Order Activated', text: 'Know when order status changes to activated' },
      { event: 'shipment_updates', title: 'Shipment Updates', text: "Receive updates on your order's delivery progress" },
      { event: 'order_delivered', title: 'Order Delivered', text: 'Get notified when an order has been successfully delivered' },
      { event: 'order_canceled', title: 'Order Canceled', text: 'Be alerted when an order has been successfully canceled' },
    ],
  },
  {
    title: 'Wallet & Payments',
    items: [
      { event: 'earnings_received', title: 'Earnings Received', text: 'Get notified when earnings are credited to your seller wallet' },
      { event: 'funds_available', title: 'Funds Available', text: 'Know when your earnings move from pending to available' },
      { event: 'withdrawal_completed', title: 'Withdrawal Completed', text: 'Get notified when a withdrawal request is fully processed' },
      { event: 'refund_issued', title: 'Refund Issued', text: 'Be notified when a refund has been processed' },
      { event: 'transaction_failed', title: 'Transaction Failed', text: 'Get alerts if a payment transaction fails' },
    ],
  },
  {
    title: 'Account & Security',
    items: [
      { event: 'new_device_login', title: 'New Device Login', text: 'Get alerted when your account is accessed from a new device' },
      { event: 'password_changed', title: 'Password Changed', text: 'Be notified when your password is updated' },
      { event: 'suspicious_activity', title: 'Suspicious Activity', text: 'Get notified if we detect unusual activity on your account' },
    ],
  },
  {
    title: 'Messages & Social Activity',
    items: [
      { event: 'new_message', title: 'New Message', text: 'Get notified when you receive a new message' },
      { event: 'new_comment', title: 'New Comment', text: 'Know when someone comments on your artwork' },
      { event: 'new_follower', title: 'New Follower', text: 'Get notified when someone new follows you' },
      { event: 'artwork_liked', title: 'Artwork Liked', text: 'Get notified when someone likes your artwork' },
    ],
  },
  {
    title: 'Reviews & Feedback',
    items: [
      { event: 'new_review', title: 'New Review', text: 'Get notified when a buyer leaves a review' },
      { event: 'rating_updated', title: 'Rating Updated', text: 'Know when your overall rating changes' },
    ],
  },
  {
    title: 'Platform Updates & Announcements',
    items: [
      { event: 'product_updates', title: 'Product Updates', text: 'Be notified of new features and improvements' },
      { event: 'policy_changes', title: 'Policy Changes', text: 'Get notified when important updates are made to policies' },
      { event: 'maintenance_alerts', title: 'Maintenance Alerts', text: 'Receive updates when scheduled maintenance downtime' },
    ],
  },
  {
    title: 'Marketing & Community',
    items: [
      { event: 'featured_opportunities', title: 'Featured Opportunities', text: 'Get notified when your artwork is featured in a curated collection' },
      { event: 'challenge_events', title: 'Challenge/Events', text: 'Be alerted when a new art challenge or event starts' },
    ],
  },
]

type Draft = {
  emailEnabled: boolean
  typesMuted: MutedNotificationKey[]
}

const sameKeys = (a: MutedNotificationKey[], b: MutedNotificationKey[]) => {
  if (a.length !== b.length) return false
  const sortedB = [...b].sort()
  return [...a].sort().every((key, i) => key === sortedB[i])
}

function NotificationSkeleton() {
  return (
    <div className='flex flex-col gap-y-16 animate-pulse' aria-hidden='true'>
      <div className='h-12 w-full rounded-xl bg-gray-50' />
      {[5, 5, 3].map((rows, index) => (
        <div key={index} className='flex flex-col gap-y-6'>
          <div className='h-5 w-56 rounded-md bg-gray-50' />
          <div className='bg-secondary-50 p-6 gap-y-6 flex flex-col rounded-xl'>
            {Array.from({ length: rows }).map((_, row) => (
              <div key={row} className='h-12 w-full rounded-md bg-gray-50' />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const NotificationSettings = ({ goBack }: { goBack?: () => void }) => {
  const { data: preferences, isLoading, isError, refetch, isRefetching } = useNotificationPreferences()
  const { mutate: save, isPending } = useUpdateNotificationPreferences()

  const [draft, setDraft] = useState<Draft | null>(null)

  const current: Draft | null = preferences
    ? (draft ?? { emailEnabled: preferences.email_enabled, typesMuted: preferences.types_muted })
    : null

  const isDirty =
    !!preferences &&
    !!draft &&
    (draft.emailEnabled !== preferences.email_enabled || !sameKeys(draft.typesMuted, preferences.types_muted))

  const edit = (change: (state: Draft) => Draft) => {
    if (!current) return
    setDraft(change(current))
  }

  const toggleEmail = () => edit((state) => ({ ...state, emailEnabled: !state.emailEnabled }))

  const toggleEvent = (event: NotificationEvent) =>
    edit((state) => ({
      ...state,
      typesMuted: state.typesMuted.includes(event)
        ? state.typesMuted.filter((key) => key !== event)
        : [...state.typesMuted, event],
    }))

  const handleSave = () => {
    if (!preferences || !current || !isDirty) return

    const changed: { email_enabled?: boolean; types_muted?: MutedNotificationKey[] } = {}
    if (current.emailEnabled !== preferences.email_enabled) changed.email_enabled = current.emailEnabled
    if (!sameKeys(current.typesMuted, preferences.types_muted)) changed.types_muted = current.typesMuted

    save(changed, { onSuccess: () => setDraft(null) })
  }

  return (
    <div className='lg:border lg:border-gray-50 lg:rounded-2xl lg:bg-white w-full lg:pb-8 pb-16'>
      <div className='px-8 py-4 flex justify-between items-center border-b border-gray-50'>
        <h5 className='font-raleway font-semibold text-h5 text-primary-500 leading-10 tracking-wide'>
          Notifications
        </h5>
        <Button
          size='sm'
          className='rounded-2xl'
          onClick={handleSave}
          isLoading={isPending}
          loadingText='Saving…'
          disabled={!isDirty || isPending}
          aria-label='Save notification preferences'
        >
          Save
        </Button>
      </div>

      <div className='pt-8 px-8 gap-y-16 flex flex-col'>
        {isLoading && <NotificationSkeleton />}

        {isError && !preferences && (
          <div role='alert' className='flex flex-col items-start gap-y-4 rounded-xl bg-secondary-50 p-6'>
            <p className='font-poppins text-body-s text-heading'>We couldn’t load your notification preferences.</p>
            <Button size='sm' className='rounded-2xl' onClick={() => refetch()} isLoading={isRefetching} loadingText='Retrying…'>
              Retry
            </Button>
          </div>
        )}

        {current && (
          <>
            <CustomBox
              title='Enable Notifications Via Email'
              text='Choose to receive notifications and updates via email also.'
              checked={current.emailEnabled}
              onChange={toggleEmail}
              disabled={isPending}
            />

            {NOTIFICATION_SECTIONS.map((section) => (
              <div key={section.title} className='flex flex-col gap-y-6'>
                <h6 className='font-poppins font-semibold text-body-s text-primary-500'>{section.title}</h6>

                <div className='bg-secondary-50 p-6 gap-y-6 flex flex-col rounded-xl'>
                  {section.items.map((item) => (
                    <CustomBox
                      key={item.event}
                      title={item.title}
                      text={item.text}
                      checked={!current.typesMuted.includes(item.event)}
                      onChange={() => toggleEvent(item.event)}
                      disabled={isPending}
                    />
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

export default NotificationSettings