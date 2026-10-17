'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ListFilter } from 'lucide-react'
import { ORDER_SORT_OPTIONS, type OrderSort } from '../constant'
import { cn } from '@/lib/utils'

interface Props {
  value: OrderSort
  onChange: (value: OrderSort) => void
}

export function OrderSortMenu({ value, onChange }: Props) {
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
    <div className="relative shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Sort orders"
        className="w-10 h-10 border border-gray-50 rounded-full flex items-center justify-center hover:border-gray-100 transition-colors"
      >
        <ListFilter size={18} className="text-body" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="Sort orders by"
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 top-[calc(100%+8px)] w-[230px] bg-white border border-[#D2D5DA] rounded-2xl shadow-xl overflow-hidden z-40"
          >
            {ORDER_SORT_OPTIONS.map((option) => {
              const selected = option.value === value
              return (
                <button
                  key={option.value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                  className={cn(
                    'w-full px-6 py-3 text-left border-b border-gray-50 last:border-b-0 font-poppins font-medium text-body-s transition-colors',
                    selected ? 'bg-primary-500 text-white' : 'text-gray-200 hover:bg-primary-500 hover:text-white',
                  )}
                >
                  {option.label}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
