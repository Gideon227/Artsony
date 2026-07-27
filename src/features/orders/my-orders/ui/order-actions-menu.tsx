'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface OrderActionsMenuItem {
  id: string
  label: string
  onSelect: () => void
  disabled?: boolean
  isPending?: boolean
}

interface Props {
  items: OrderActionsMenuItem[]
}

export function OrderActionsMenu({ items }: Props) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Order actions"
        className="w-10 h-10 rounded-full border border-gray-50 flex items-center justify-center hover:border-gray-100 transition-colors"
      >
        <MoreHorizontal size={20} className="text-gray-200" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 top-[calc(100%+8px)] w-[280px] bg-white border border-[#D2D5DA] rounded-2xl shadow-xl overflow-hidden z-40"
          >
            {items.map((item) => {
              const isDisabled = item.disabled || item.isPending
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
                    'w-full flex items-center justify-between px-6 py-3 text-left border-b border-gray-50 last:border-b-0',
                    'font-poppins font-medium text-body-s text-gray-200 transition-colors',
                    'hover:bg-primary-500 hover:text-white',
                    isDisabled && 'opacity-50 cursor-not-allowed hover:bg-transparent hover:text-gray-200',
                  )}
                >
                  <span>{item.label}</span>
                  {item.isPending && <Loader2 size={16} className="animate-spin" />}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}