'use client'

import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components'
import { Dropdown } from '@/components/ui/dropdown'
import type { FilterDropdownConfig } from './filter'

interface MobileFilterDrawerProps {
  open: boolean
  onClose: () => void
  dropdowns: FilterDropdownConfig[]
  onClear: () => void
  filterNum: number
}

export function MobileFilterDrawer({ open, onClose, dropdowns, onClear, filterNum }: MobileFilterDrawerProps) {
  const [activeDropdownId, setActiveDropdownId] = useState<string | number | null>(null)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[500] bg-white flex flex-col md:hidden"
        >
          <div className="flex items-center gap-4 px-6 h-16 border-b border-gray-50 shrink-0">
            <button
              onClick={onClose}
              aria-label="Close filters"
              className="flex items-center justify-center"
            >
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <mask id="path-1-inside-1_10679_46297" fill="white">
                  <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z"/>
                </mask>
                <path d="M0 20M40 20M40 20M0 20M20 0M40 20M20 40M0 20M20 40V38C10.0589 38 2 29.9411 2 20H0H-2C-2 32.1503 7.84974 42 20 42V40ZM40 20H38C38 29.9411 29.9411 38 20 38V40V42C32.1503 42 42 32.1503 42 20H40ZM20 0V2C29.9411 2 38 10.0589 38 20H40H42C42 7.84974 32.1503 -2 20 -2V0ZM20 0V-2C7.84974 -2 -2 7.84974 -2 20H0H2C2 10.0589 10.0589 2 20 2V0Z" fill="#E6E8EB" mask="url(#path-1-inside-1_10679_46297)"/>
                <path d="M28 20H12M18 26L12 20L18 14" stroke="#525965" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h2 className="font-raleway font-semibold text-h6 text-body">Filters</h2>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
            {dropdowns.map((item) => {
              const isActive = activeDropdownId === item.id;

              return (
                <div 
                  key={item.id} 
                  className={`flex flex-col gap-y-6 p-4 border border-gray-50 rounded-2xl transition-all duration-300 scrollbar-hide ${
                    isActive 
                      ? 'h-[464px] overflow-y-auto' 
                      : 'h-max shrink-0 overflow-hidden'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-poppins text-body-s font-medium text-heading">
                      {item.placeholder}
                    </span>
                  </div>

                  <div 
                    className="w-full cursor-pointer" 
                    onClick={() => {
                      setActiveDropdownId(isActive ? null : item.id);
                    }}
                  >
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
                      disabled={item.disabled}
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
                </div>
              )
            })}
          </div>

          <div className="shrink-0 border-t border-gray-50 px-6 py-4 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => { onClear(); onClose() }}>
              Reset
            </Button>
            <Button variant="primary" className="flex-1 active:ring-2 active:ring-primary-500" onClick={onClose}>
              Apply{filterNum > 0 ? ` (${filterNum})` : ''}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}