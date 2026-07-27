'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, X, Home, Compass, Image as ImageIcon, User,
  ShoppingCart, Package, Mail, Settings, HelpCircle,
  Briefcase, ClipboardList,
} from 'lucide-react'
import { useAuthStore, selectHasSellerAccount } from '@/store'
import { cn } from '@/lib/utils'
import Image from 'next/image'

type NavItem = {
  key: string
  label: string
  href: string
  icon: string
}

// The 4 primary destinations shown collapsed — identical for both variants.
// Icons/routes here are placeholders matching the wireframe's ambiguity;
// swap freely, nothing else in this component depends on these values.
const PRIMARY_NAV_ITEMS: NavItem[] = [
  { key: 'home', label: 'Home', href: '/home', icon: '/nav/home.svg' },
  { key: 'discover', label: 'Discover', href: '/discover', icon: '/nav/earth.svg' },
  { key: 'shop', label: 'Shop', href: '/shop', icon: '/nav/shop.svg' },
  { key: 'profile', label: 'Profile', href: '/profile', icon: '/nav/user.svg' },
]

const BUYER_MENU_ITEMS: NavItem[] = [
  { key: 'cart', label: 'Cart', href: '/cart', icon: '/nav/cart.svg' },
  { key: 'orders', label: 'Order', href: '/orders', icon: '/nav/order.svg' },
  { key: 'messages', label: 'Messages', href: '/messages', icon: '/nav/message.svg' },
  { key: 'settings', label: 'Settings', href: '/settings', icon: '/nav/settings.svg' },
  { key: 'help', label: 'Help', href: '/help', icon: '/nav/help.svg' },
]

const SELLER_MENU_ITEMS: NavItem[] = [
  { key: 'studio', label: 'Studio', href: '/studio', icon: '/nav/studio.svg' },
  { key: 'order-management', label: 'Order Management', href: '/all-orders', icon: '/nav/doc.svg' },
  { key: 'cart', label: 'Cart', href: '/cart', icon: '/nav/cart.svg' },
  { key: 'orders', label: 'Order', href: '/my-orders', icon: '/nav/order.svg' },
  { key: 'messages', label: 'Messages', href: '/messages', icon: '/nav/message.svg' },
  { key: 'settings', label: 'Settings', href: '/settings', icon: '/nav/settings.svg' },
  { key: 'help', label: 'Help', href: '/help', icon: '/nav/help.svg' },
]

// Shared glass styling — transparent greyish blur, deliberately no shadow.
const GLASS = 'backdrop-blur-2xl border border-gray-50 '

type MobileNavProps = {
  variant?: 'buyer' | 'seller'
  className?: string
}

export function MobileNav({ variant, className }: MobileNavProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const hasSellerAccount = useAuthStore(selectHasSellerAccount)
  const resolvedVariant = variant ?? (hasSellerAccount ? 'seller' : 'buyer')
  const menuItems = resolvedVariant === 'seller' ? SELLER_MENU_ITEMS : BUYER_MENU_ITEMS

  const pathname = usePathname()
  React.useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <div
      className={cn(
        'md:hidden fixed inset-x-4 bottom-6 left-1/2 -translate-x-1/2 z-[350] w-full px-4 flex items-end gap-4',
        className,
      )}
    >
      <motion.div
        layout
        animate={{ borderRadius: isOpen ? 32 : 9999 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ backgroundColor: '#1D1C1C80' }}
        className={cn('flex-1 overflow-hidden', GLASS)}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {isOpen ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.12, duration: 0.2 } }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className="grid grid-cols-3 gap-1 p-4"
            >
              {menuItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="flex flex-col items-center gap-1.5 py-2 rounded-4xl hover:bg-white/10 active:bg-white/15 transition-colors"
                >
                  <span className="flex py-4 px-6 items-center justify-center border border-gray-50 rounded-4xl bg-white/15 text-white">
                    <Image src={item.icon} width={20} height={20} alt='icon' />
                  </span>
                  <span className="w-full truncate px-1 text-center text-[11px] font-medium leading-tight text-white">
                    {item.label}
                  </span>
                </Link>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.12, duration: 0.2 } }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              style={{ justifyContent : 'space-around' }}
              className="flex h-16 justify-around items-center"
            >
              {PRIMARY_NAV_ITEMS.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  aria-label={item.label}
                  className="flex items-center relative justify-center rounded-4xl text-white transition-colors"
                >
                  <Image src={item.icon} width={24} height={24} alt='icon' />
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Toggle — stays a fixed-size circle; only its icon crossfades. Because
          the row above uses items-end, this button naturally sits beside the
          panel's bottom edge in both states: right next to a short pill when
          collapsed, and against the bottom-right corner once the panel has
          grown tall — matching the reference without any position math. */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        style={{ backgroundColor: '#1D1C1C80' }}
        className={cn(
          'flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-white transition-colors',
          GLASS,
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isOpen ? 'close' : 'open'}
            initial={{ opacity: 0, rotate: -45 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 45 }}
            transition={{ duration: 0.18 }}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  )
}
