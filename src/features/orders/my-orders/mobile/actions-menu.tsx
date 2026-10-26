'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, MoreHorizontal } from 'lucide-react'
import type { OrderActionsMenuItem } from '../ui/order-actions-menu'
import { cn } from '@/lib/utils'

interface Props {
  items: OrderActionsMenuItem[]
}

// Mobile "⋯" dropdown from the design: 60px rows, highlighted row in orange.
// Takes the same item shape as the desktop OrderActionsMenu so both screens
// share one definition of what each order can do.
export function MobileActionsMenu({ items }: Props) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Order actions"
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-50 active:scale-95"
      >
        <MoreHorizontal size={20} className="text-body" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-[calc(100%+8px)] z-40 w-[219px] origin-top-right overflow-hidden rounded-2xl border border-gray-50 bg-white shadow-xl"
          >
            {items.map((item, index) => {
              const isDisabled = Boolean(item.disabled || item.isPending)
              return (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  disabled={isDisabled}
                  onClick={() => {
                    item.onSelect()
                    if (!item.isPending) setOpen(false)
                  }}
                  className={cn(
                    'flex h-[60px] w-full items-center justify-between px-6 text-left font-poppins text-body-s font-medium tracking-wide text-body transition-colors',
                    index > 0 && 'border-t border-gray-50',
                    isDisabled
                      ? 'cursor-not-allowed opacity-50'
                      : 'cursor-pointer hover:bg-primary-500 hover:text-white active:bg-primary-500 active:text-white',
                  )}
                >
                  <span>{item.label}</span>
                  {item.isPending && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
