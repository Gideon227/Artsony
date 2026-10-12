import type { ReactNode } from 'react'
import type { Notification } from '@/types'
import { NOTIFICATION_LABELS } from '@/utils'
import {
  parseNotificationPayload,
  type NotificationPayload,
} from './notification-payload'
import { notificationRoutes } from './notification-routes'

export const ORDER_ACTIVATION_WINDOW_HOURS = 48

export type NotificationPresentation = {
  avatar: 'system' | 'actor'
  title: ReactNode
  description?: ReactNode
  card?: { text: ReactNode; thumbnailUrl: string | null }
  action?: { label: string; href: string }
  href: string | null
}

const Accent = ({ children }: { children: ReactNode }) => (
  <span className='text-primary-500'>{children}</span>
)

const Emphasis = ({ children }: { children: ReactNode }) => (
  <span className='text-body-xs font-normal text-heading'>{children}</span>
)

const formatAmount = (amount: number, currency: string): string => {
  const value = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return currency === 'USDT' || currency === 'USD' ? `$${value}` : `${value} ${currency}`
}

const withAction = (
  label: string,
  href: string | null,
): Pick<NotificationPresentation, 'action'> => (href ? { action: { label, href } } : {})

function presentEvent(p: NotificationPayload): NotificationPresentation | null {
  const isSeller = p.audience === 'seller'
  const artworkTitle = p.artwork?.title ?? 'your artwork'
  const thumbnailUrl = p.artwork?.thumbnailUrl ?? null
  const orderHref = isSeller
    ? notificationRoutes.sellerOrder(p.orderId)
    : notificationRoutes.buyerOrder(p.physicalId)
  const deliveredHref = isSeller
    ? notificationRoutes.sellerOrder(p.orderId)
    : notificationRoutes.buyerOrder(p.physicalId, 'delivered')
  const card = (text: ReactNode) => ({ card: { text, thumbnailUrl } })

  switch (p.event) {
    case 'order_received':
      return {
        avatar: 'system',
        title: 'New order received',
        description: (
          <>
            You have <Accent>{ORDER_ACTIVATION_WINDOW_HOURS}</Accent> hours to activate this
            shipment before it auto-cancels
          </>
        ),
        ...card(<>You&apos;ve received a new order for “{artworkTitle}.”</>),
        ...withAction('Activate order', notificationRoutes.sellerOrder(p.orderId)),
        href: notificationRoutes.sellerOrder(p.orderId),
      }

    case 'order_confirmed':
      return {
        avatar: 'system',
        title: 'Order confirmed',
        description: (
          <>
            Your order will be activated by the seller within a{' '}
            <Accent>{ORDER_ACTIVATION_WINDOW_HOURS}</Accent> hour window
          </>
        ),
        ...card(
          <>
            Your order for “<Emphasis>{artworkTitle}</Emphasis>” has been confirmed.
          </>,
        ),
        ...withAction('View Order', notificationRoutes.buyerOrder(p.physicalId)),
        href: notificationRoutes.buyerOrder(p.physicalId),
      }

    case 'shipment_activated':
      return {
        avatar: 'system',
        title: 'Shipment activated',
        ...card(
          <>
            Shipping has been activated for “<Emphasis>{artworkTitle}</Emphasis>”
          </>,
        ),
        ...withAction('Track Shipment', orderHref),
        href: orderHref,
      }

    case 'pickup_scheduled':
      return {
        avatar: 'system',
        title: 'Pickup scheduled',
        description: isSeller
          ? 'A courier is scheduled to pick up your artwork.'
          : 'A courier is scheduled to pick up your order.',
        ...card(<Emphasis>“{artworkTitle}”</Emphasis>),
        ...withAction('View Details', orderHref),
        href: orderHref,
      }

    case 'order_in_transit':
      return {
        avatar: 'system',
        title: 'Order in transit',
        description: 'Your artwork is on its way.',
        ...card(<Emphasis>“{artworkTitle}”</Emphasis>),
        ...withAction('Track Order', orderHref),
        href: orderHref,
      }

    case 'order_delivered':
      return {
        avatar: 'system',
        title: isSeller ? 'Order completed' : 'Order delivered',
        description: isSeller
          ? 'This order has been delivered and completed.'
          : 'Your artwork has been delivered successfully.',
        ...card(<Emphasis>“{artworkTitle}”</Emphasis>),
        ...withAction('View Order Summary', deliveredHref),
        href: deliveredHref,
      }

    case 'delivery_issue':
      return {
        avatar: 'system',
        title: 'Delivery issue',
        description: isSeller
          ? 'There’s an issue with this delivery. Please resolve it.'
          : 'There’s an issue with your delivery. Please review the details.',
        ...card(<Emphasis>“{artworkTitle}”</Emphasis>),
        ...withAction(isSeller ? 'Fix Issue' : 'Get Support', orderHref),
        href: orderHref,
      }

    case 'refund':
      return {
        avatar: 'system',
        title: 'Refund',
        ...card(
          <>
            A refund for ‘<Emphasis>{artworkTitle}</Emphasis>’ has been processed
          </>,
        ),
        ...withAction('View Receipt', deliveredHref),
        href: deliveredHref,
      }

    case 'buyer_refund':
      return {
        avatar: 'system',
        title: 'Buyer Refund',
        ...card(
          <>
            Refund processed for ‘<Emphasis>{artworkTitle}</Emphasis>’
            {p.amount !== null && <> — {formatAmount(p.amount, p.currency)}</>}
          </>,
        ),
        ...withAction('View Transaction', notificationRoutes.wallet),
        href: notificationRoutes.wallet,
      }

    case 'funds_available':
      return {
        avatar: 'system',
        title: 'Funds available',
        description: 'Your earnings are now available for withdrawal.',
        ...withAction('View Wallet', notificationRoutes.wallet),
        href: notificationRoutes.wallet,
      }

    case 'withdrawal_requested':
      return {
        avatar: 'system',
        title: 'Withdrawal requested',
        description:
          'Your withdrawal request is being processed, this can take up to 2 business days.',
        href: notificationRoutes.wallet,
      }

    case 'withdrawal_completed':
      return {
        avatar: 'system',
        title: 'Withdrawal completed',
        description: 'Your funds have been sent to your bank account.',
        ...withAction('View Transaction', notificationRoutes.wallet),
        href: notificationRoutes.wallet,
      }

    case 'withdrawal_failed':
      return {
        avatar: 'system',
        title: 'Withdrawal Failed',
        description: 'We couldn’t complete your withdrawal. Please review your details.',
        ...withAction('Resolve Issue', notificationRoutes.wallet),
        href: notificationRoutes.wallet,
      }

    case 'artwork_approved': {
      const href = notificationRoutes.artwork(p.artwork?.slug)
      return {
        avatar: 'system',
        title: 'Artwork approved',
        ...card(
          <>
            Your artwork “<Emphasis>{artworkTitle}</Emphasis>” is now live.
          </>,
        ),
        ...withAction('View Artwork', href),
        href,
      }
    }

    case 'artwork_rejected': {
      const href = notificationRoutes.artwork(p.artwork?.slug)
      return {
        avatar: 'system',
        title: 'Artwork rejected',
        ...card(
          <>
            Your artwork “<Emphasis>{artworkTitle}</Emphasis>” requires updates before it can go
            live.
          </>,
        ),
        ...withAction('Review Feedback', href),
        href,
      }
    }

    case 'artwork_sold_out': {
      const href = notificationRoutes.artwork(p.artwork?.slug)
      return {
        avatar: 'system',
        title: 'Artwork sold out',
        ...card(
          <>
            Your artwork <Emphasis>{artworkTitle}</Emphasis> is out of stock
          </>,
        ),
        ...withAction('Re-stock', href),
        href,
      }
    }

    case 'artwork_removed':
      return {
        avatar: 'system',
        title: 'Artwork Removed',
        ...card(
          <>
            Your artwork <Emphasis>{artworkTitle}</Emphasis> has been removed for violating our
            guidelines.
          </>,
        ),
        ...withAction('Learn more', p.policy?.href ?? null),
        href: p.policy?.href ?? null,
      }

    case 'login_alert':
      return {
        avatar: 'system',
        title: 'Login alert',
        description: 'A new login was detected on your account.',
        ...withAction('Review Activity', notificationRoutes.settings),
        href: notificationRoutes.settings,
      }

    case 'password_updated':
      return {
        avatar: 'system',
        title: 'Password updated',
        description: 'Your password was changed successfully.',
        href: null,
      }

    case 'policy_update':
      return {
        avatar: 'system',
        title: 'Policy update',
        description: `We’ve updated our ${p.policy?.name ?? 'policies'}.`,
        ...withAction('Review changes', p.policy?.href ?? null),
        href: p.policy?.href ?? null,
      }

    default:
      return null
  }
}

function presentSocial(
  n: Notification,
  p: NotificationPayload,
): NotificationPresentation | null {
  const actorName = n.actor?.display_name || n.actor?.username
  if (!actorName) return null

  const header = (action: string): ReactNode => (
    <>
      <span className='text-primary-500'>{actorName}</span> {action}
    </>
  )
  const artworkHref = notificationRoutes.artwork(p.artwork?.slug)
  const thumbnailUrl = p.artwork?.thumbnailUrl ?? null

  switch (n.type) {
    case 'message':
      return {
        avatar: 'actor',
        title: header('Sent you a message'),
        ...(p.preview ? { description: p.preview } : {}),
        href: notificationRoutes.messages,
      }

    case 'follow':
      return {
        avatar: 'actor',
        title: header('Started Following you'),
        href: notificationRoutes.profile(n.actor_id),
      }

    case 'like':
      return {
        avatar: 'actor',
        title: header('Liked your Artwork'),
        ...(p.artwork
          ? { card: { text: <>Someone liked “{p.artwork.title}.”</>, thumbnailUrl } }
          : {}),
        href: artworkHref,
      }

    case 'comment':
    case 'reply':
      return {
        avatar: 'actor',
        title: header(n.type === 'reply' ? 'Replied to your comment' : 'Commented on your artwork'),
        ...(p.preview && p.artwork ? { card: { text: p.preview, thumbnailUrl } } : {}),
        ...(p.preview && !p.artwork ? { description: p.preview } : {}),
        href: artworkHref,
      }

    case 'mention':
      return {
        avatar: 'actor',
        title: header('Mentioned you in a comment'),
        ...(p.preview ? { card: { text: p.preview, thumbnailUrl } } : {}),
        ...withAction('View comment', artworkHref),
        href: artworkHref,
      }

    case 'review':
      return {
        avatar: 'actor',
        title: header('Left a review'),
        ...(p.body ? { description: p.body } : {}),
        href: null,
      }

    default:
      return null
  }
}

function presentFallback(n: Notification, p: NotificationPayload): NotificationPresentation {
  const titles: Partial<Record<Notification['type'], string>> = {
    order_update: 'Order update',
    sale: 'Wallet update',
  }
  return {
    avatar: 'system',
    title: titles[n.type] ?? NOTIFICATION_LABELS[n.type],
    ...(p.body ? { description: p.body } : {}),
    href: null,
  }
}

export function presentNotification(n: Notification): NotificationPresentation {
  const payload = parseNotificationPayload(n)
  return (
    (payload.event ? presentEvent(payload) : null) ??
    presentSocial(n, payload) ??
    presentFallback(n, payload)
  )
}

const UNITS: ReadonlyArray<readonly [string, number]> = [
  ['week', 7 * 24 * 60 * 60],
  ['day', 24 * 60 * 60],
  ['hour', 60 * 60],
  ['minute', 60],
]

export function timeAgo(iso: string, now: number = Date.now()): string {
  const seconds = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000))
  for (const [unit, size] of UNITS) {
    if (seconds >= size) {
      const value = Math.floor(seconds / size)
      return `${value} ${unit}${value === 1 ? '' : 's'} ago`
    }
  }
  return 'Just now'
}
