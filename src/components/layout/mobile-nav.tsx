'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, MotionConfig, useReducedMotion, type Transition, type Variants } from 'framer-motion'
import { useAuthStore, selectHasSellerAccount } from '@/store'
import { cn } from '@/lib/utils'

type NavItem = {
  key: string
  label: string
  href: string
  icon: string
}

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

const GLASS_FILL = '#1D1C1C80'
const PILL_HEIGHT = 62
const PANEL_RADIUS = 28
const PANEL_PADDING = 8
const MENU_COLUMNS = 3
const MENU_ITEM_HEIGHT = 73
const MENU_ROW_GAP = 16

const EASE_OUT = [0.22, 1, 0.36, 1] as const
const EASE_IN = [0.4, 0, 1, 1] as const

const PANEL_SPRING: Transition = { type: 'spring', stiffness: 230, damping: 28, mass: 0.9 }
const INDICATOR_SPRING: Transition = { type: 'spring', stiffness: 380, damping: 34 }

const collapsedVariants: Variants = {
  closed: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: { delay: 0.14, duration: 0.32, ease: EASE_OUT },
  },
  open: {
    opacity: 0,
    scale: 0.94,
    filter: 'blur(8px)',
    transition: { duration: 0.18, ease: EASE_IN },
  },
}

const menuVariants: Variants = {
  closed: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
  open: { transition: { delayChildren: 0.1, staggerChildren: 0.04 } },
}

const menuItemVariants: Variants = {
  closed: {
    opacity: 0,
    y: 14,
    scale: 0.88,
    filter: 'blur(8px)',
    transition: { duration: 0.14, ease: EASE_IN },
  },
  open: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.45, ease: EASE_OUT },
  },
}

function getPanelHeight(itemCount: number) {
  const rows = Math.ceil(itemCount / MENU_COLUMNS)
  return PANEL_PADDING * 2 + rows * MENU_ITEM_HEIGHT + (rows - 1) * MENU_ROW_GAP
}

function Glyph({ src, className }: { src: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('block bg-current', className)}
      style={{
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
      }}
    />
  )
}

type MobileNavProps = {
  variant?: 'buyer' | 'seller'
  className?: string
}

export function MobileNav({ variant, className }: MobileNavProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()
  const hasSellerAccount = useAuthStore(selectHasSellerAccount)

  const resolvedVariant = variant ?? (hasSellerAccount ? 'seller' : 'buyer')
  const menuItems = resolvedVariant === 'seller' ? SELLER_MENU_ITEMS : BUYER_MENU_ITEMS
  const panelHeight = React.useMemo(() => getPanelHeight(menuItems.length), [menuItems.length])
  const panelTransition: Transition = reduceMotion ? { duration: 0.15 } : PANEL_SPRING

  React.useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  React.useEffect(() => {
    if (!isOpen) return
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  if (pathname.startsWith('/checkout')) return null

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)
  const state = isOpen ? 'open' : 'closed'

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={rootRef}
        className={cn(
          'pointer-events-none fixed inset-x-0 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-[350] px-4 md:hidden',
          className,
        )}
      >
        <div className="pointer-events-auto mx-auto flex w-full max-w-[341px] items-end gap-[18px]">
          <motion.div
            initial={false}
            animate={{
              height: isOpen ? panelHeight : PILL_HEIGHT,
              borderRadius: isOpen ? PANEL_RADIUS : PILL_HEIGHT / 2,
            }}
            transition={panelTransition}
            style={{ backgroundColor: GLASS_FILL }}
            className="relative min-w-0 flex-1 overflow-hidden backdrop-blur-2xl ring-1 ring-inset ring-gray-50"
          >
            <motion.nav
              aria-label="Primary"
              aria-hidden={isOpen}
              initial={false}
              animate={state}
              variants={collapsedVariants}
              style={{ height: PILL_HEIGHT, pointerEvents: isOpen ? 'none' : 'auto' }}
              className="absolute inset-x-0 bottom-0 flex items-center justify-between px-[19px]"
            >
              {PRIMARY_NAV_ITEMS.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    aria-label={item.label}
                    aria-current={active ? 'page' : undefined}
                    tabIndex={isOpen ? -1 : 0}
                    className="group relative flex size-10 items-center justify-center rounded-full outline-none"
                  >
                    {active && (
                      <motion.span
                        layoutId="mobile-nav-active"
                        transition={INDICATOR_SPRING}
                        className="absolute -inset-x-4 -inset-y-2 rounded-full bg-primary-50"
                      />
                    )}
                    {!active && (
                      <span
                        aria-hidden
                        className="absolute -inset-x-4 -inset-y-2 rounded-full border border-gray-100 bg-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100"
                      />
                    )}
                    <Glyph
                      src={item.icon}
                      className={cn(
                        'relative size-6 transition-colors duration-200',
                        active
                          ? 'text-primary-500'
                          : 'text-white group-hover:text-gray-600 group-focus-visible:text-gray-600 group-active:text-gray-600',
                      )}
                    />
                  </Link>
                )
              })}
            </motion.nav>

            <motion.nav
              aria-label="Menu"
              aria-hidden={!isOpen}
              initial={false}
              animate={state}
              variants={menuVariants}
              style={{ height: panelHeight, pointerEvents: isOpen ? 'auto' : 'none' }}
              className="absolute inset-x-0 bottom-0 grid grid-cols-3 content-start gap-x-5 gap-y-4 p-2"
            >
              {menuItems.map((item) => {
                const active = isActive(item.href)
                return (
                  <motion.div key={item.key} variants={menuItemVariants} className="min-w-0">
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      tabIndex={isOpen ? 0 : -1}
                      className="group flex flex-col items-center gap-1 outline-none"
                    >
                      <span
                        className={cn(
                          'flex h-14 w-full items-center justify-center rounded-full border border-white text-white transition-colors duration-200',
                          'group-hover:bg-white/15 group-focus-visible:bg-white/15 group-active:bg-white/25',
                          active && 'bg-white/20',
                        )}
                      >
                        <Glyph src={item.icon} className="size-5" />
                      </span>
                      <span className="h-[13px] w-full truncate text-center text-[11px] font-medium leading-[13px] text-white">
                        {item.label}
                      </span>
                    </Link>
                  </motion.div>
                )
              })}
            </motion.nav>
          </motion.div>

          <motion.button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
            initial={false}
            animate={{ y: isOpen ? 0 : -4 }}
            transition={panelTransition}
            whileTap={{ scale: 0.92 }}
            style={{ backgroundColor: GLASS_FILL }}
            className="relative size-[54px] shrink-0 rounded-full text-white outline-none backdrop-blur-2xl ring-1 ring-inset ring-gray-50 focus-visible:ring-2 focus-visible:ring-white"
          >
            <motion.svg
              aria-hidden
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              initial={false}
              animate={{
                opacity: isOpen ? 0 : 1,
                rotate: isOpen ? 90 : 0,
                scale: isOpen ? 0.5 : 1,
              }}
              transition={{ duration: 0.28, ease: EASE_OUT }}
              className="absolute inset-0 m-auto"
            >
              <path d="M1.5 4h17M1.5 10h17M1.5 16h17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </motion.svg>

            <motion.svg
              aria-hidden
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              initial={false}
              animate={{
                opacity: isOpen ? 1 : 0,
                rotate: isOpen ? 0 : -90,
                scale: isOpen ? 1 : 0.5,
              }}
              transition={{ duration: 0.28, ease: EASE_OUT }}
              className="absolute inset-0 m-auto"
            >
              <circle cx="10" cy="10" r="10" fill="currentColor" />
              <path d="M6.8 6.8l6.4 6.4M13.2 6.8l-6.4 6.4" stroke="#8E8E8E" strokeWidth="1.6" strokeLinecap="round" />
            </motion.svg>
          </motion.button>
        </div>
      </div>
    </MotionConfig>
  )
}