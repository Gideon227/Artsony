import { ROUTES } from '@/constants'
import { formatOrderCode } from '@/lib/orders/format'

type BuyerOrderView = 'live' | 'delivered'

export const notificationRoutes = {
  buyerOrder: (physicalId: string | null, view: BuyerOrderView = 'live'): string =>
    physicalId
      ? `/my-orders?${new URLSearchParams({ view, physicalId }).toString()}`
      : '/my-orders',

  sellerOrder: (orderId: string | null): string =>
    orderId
      ? `/all-orders?${new URLSearchParams({ q: formatOrderCode(orderId) }).toString()}`
      : '/all-orders',

  wallet: '/artsony-studio',
  messages: '/messages',
  settings: '/settings/profile-customization',

  artwork: (slug: string | null | undefined): string | null =>
    slug ? `/artworks/${encodeURIComponent(slug)}` : null,

  profile: (userId: string | null | undefined): string | null =>
    userId ? ROUTES.profile(userId) : null,
} as const
