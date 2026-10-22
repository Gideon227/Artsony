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
        className="w-10 h-10 rounded-full flex items-center justify-center hover:border-gray-100 transition-colors"
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <mask id="path-1-inside-1_10941_9828" fill="white">
            <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z"/>
          </mask>
          <path d="M0 20M40 20M40 20M0 20M20 0M40 20M20 40M0 20M20 40V38C10.0589 38 2 29.9411 2 20H0H-2C-2 32.1503 7.84974 42 20 42V40ZM40 20H38C38 29.9411 29.9411 38 20 38V40V42C32.1503 42 42 32.1503 42 20H40ZM20 0V2C29.9411 2 38 10.0589 38 20H40H42C42 7.84974 32.1503 -2 20 -2V0ZM20 0V-2C7.84974 -2 -2 7.84974 -2 20H0H2C2 10.0589 10.0589 2 20 2V0Z" fill="#E6E8EB" mask="url(#path-1-inside-1_10941_9828)"/>
          <path d="M15 20C15 21.1046 14.1046 22 13 22C11.8954 22 11 21.1046 11 20C11 18.8954 11.8954 18 13 18C14.1046 18 15 18.8954 15 20Z" fill="#525965"/>
          <path d="M22 20C22 21.1046 21.1046 22 20 22C18.8954 22 18 21.1046 18 20C18 18.8954 18.8954 18 20 18C21.1046 18 22 18.8954 22 20Z" fill="#525965"/>
          <path d="M29 20C29 21.1046 28.1046 22 27 22C25.8954 22 25 21.1046 25 20C25 18.8954 25.8954 18 27 18C28.1046 18 29 18.8954 29 20Z" fill="#525965"/>
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 top-[calc(100%+8px)] w-[219px] bg-white border border-gray-50 rounded-b-m rounded-tl-m shadow-xl overflow-hidden z-40"
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
                    'font-poppins font-medium text-[12px] text-body transition-colors',
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