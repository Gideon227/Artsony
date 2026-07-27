'use client'

import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components'
import { Dropdown } from '@/components/ui/dropdown'
import type { FilterDropdownConfig } from './filter'

interface MobileFilterDrawerProps {
  open: boolean
  onClose: () => void
  dropdowns: FilterDropdownConfig[]
  onClear: () => void
}

export function MobileFilterDrawer({ open, onClose, dropdowns, onClear }: MobileFilterDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[500] bg-white flex flex-col md:hidden"
        >
          <div className="flex items-center justify-between px-6 h-16 border-b border-gray-50 shrink-0">
            <h2 className="font-raleway font-semibold text-h6 text-neutral-700">Filters</h2>
            <button
              onClick={onClose}
              aria-label="Close filters"
              className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center"
            >
              <X className="w-5 h-5 text-neutral-600" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
            {dropdowns.map((item) => (
              <div key={item.id} className="flex flex-col gap-2">
                <span className="font-poppins text-[13px] font-medium text-neutral-500">
                  {item.placeholder}
                </span>
                <Dropdown
                  options={item.options}
                  value={item.value ?? undefined}
                  onChange={item.onChange}
                  multiple={item.multiple}
                  values={item.values}
                  onChangeMultiple={item.onChangeMultiple}
                  maxSelected={item.maxSelected}
                  placeholder={item.placeholder}
                  leftIcon={item.leftIcon}
                  searchable={item.searchable}
                  searchPlaceholder={item.searchPlaceholder}
                  searchValue={item.searchValue}
                  onSearchChange={item.onSearchChange}
                  searchVariant={item.searchVariant}
                  onSearchSubmit={item.onSearchSubmit}
                  layout={item.layout}
                  indicator={item.indicator}
                  isLoading={item.isLoading}
                  emptyMessage={item.emptyMessage}
                />
              </div>
            ))}
          </div>

          <div className="shrink-0 border-t border-gray-50 px-6 py-4 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => { onClear(); onClose() }}>
              Clear all
            </Button>
            <Button variant="primary" className="flex-1" onClick={onClose}>
              Show results
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}