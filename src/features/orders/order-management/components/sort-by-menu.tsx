'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { ORDER_SORT_OPTIONS, type OrderSort } from '@/features/orders/my-orders/constant'
import { cn } from '@/lib/utils'

type Props = {
  value: OrderSort
  onChange: (value: OrderSort) => void
  /** The trigger button content (the sort icon). */
  children: React.ReactNode
  className?: string
}

/**
 * Icon button that opens a "Sort By" dropdown (Newest / Oldest / Highest Value /
 * Lowest Value). Closes on selection, the X button, outside click, or Escape.
 */
export function SortByMenu({ value, onChange, children, className }: Props) {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const handlePointer = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('touchstart', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('touchstart', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div ref={containerRef} className={cn('relative shrink-0', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Sort orders"
        className="flex cursor-pointer items-center justify-center rounded-full transition-transform active:scale-95"
      >
        {children}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Sort by"
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-[calc(100%+8px)] z-40 w-[min(340px,calc(100vw-2rem))] origin-top-right rounded-2xl border border-gray-50 bg-white px-6 pb-4 pt-4 "
          >
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close sort options"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-4 border-gray-50 transition-transform active:scale-95"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-400 text-white">
                  <X size={12} strokeWidth={3} />
                </span>
              </button>
            </div>

            <h2 className="pb-4 pt-1 text-center font-poppins text-h6 font-normal text-heading">Sort By</h2>

            <ul role="radiogroup" aria-label="Sort orders by">
              {ORDER_SORT_OPTIONS.map((option) => {
                const selected = option.value === value
                return (
                  <li key={option.value} className="border-b border-gray-50 last:border-b-0">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => {
                        onChange(option.value)
                        setOpen(false)
                      }}
                      className="flex w-full cursor-pointer items-center justify-between py-5 text-left font-poppins text-body-s font-medium tracking-wide text-gray-400"
                    >
                      <span>{option.label}</span>
                      <span
                        aria-hidden="true"
                        className={cn(
                          'flex h-6 w-6 items-center justify-center rounded-full border-2',
                          selected ? 'border-primary-500 bg-primary-500 text-white' : 'border-gray-100 bg-white',
                        )}
                      >
                        {selected && <Check size={14} strokeWidth={3} />}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
