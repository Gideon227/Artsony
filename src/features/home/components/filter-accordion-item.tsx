'use client'

import React, { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Dropdown } from '@/components/ui/dropdown'
import { cn } from '@/lib/utils'
import type { FilterDropdownConfig } from './filter'

interface FilterAccordionItemProps {
  item: FilterDropdownConfig
}

/** "Selected (03) 5 max" for multi-selects, "Selected (Nigeria)" for single values. */
function SelectionSummary({ item }: { item: FilterDropdownConfig }) {
  if (item.multiple) {
    const count = item.values?.length ?? 0
    return (
      <span className="flex items-center gap-x-2 font-poppins text-body-s text-body">
        <span>
          Selected <span className="text-primary-500">({String(count).padStart(2, '0')})</span>
        </span>
        {item.maxSelected !== undefined && <span className="text-xs text-neutral-400">{item.maxSelected} max</span>}
      </span>
    )
  }

  const label = item.valueLabel ?? item.value?.label
  if (!label) return null

  return (
    <span className="min-w-0 truncate font-poppins text-body-s text-body">
      Selected <span className="text-primary-500">({label})</span>
    </span>
  )
}

/**
 * One filter in the mobile drawer. The card header toggles an inline panel that
 * reuses the Dropdown's own list / chips / search / colour grid, so selection
 * behaviour stays identical to the desktop dropdowns.
 */
export function FilterAccordionItem({ item }: FilterAccordionItemProps) {
  const [open, setOpen] = useState(false)
  const reduceMotion = useReducedMotion()
  const panelId = `filter-panel-${item.id}`
  const hasSummary = item.multiple || Boolean(item.valueLabel ?? item.value?.label)

  return (
    <div className="shrink-0 rounded-[28px] border border-gray-50 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={item.disabled}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full cursor-pointer items-center justify-between gap-x-3 px-4 py-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 rounded-[28px]"
      >
        <span className="font-poppins text-body-m font-medium text-heading">{item.placeholder}</span>

        {hasSummary ? (
          <SelectionSummary item={item} />
        ) : (
          <ChevronDown
            aria-hidden="true"
            className={cn('h-5 w-5 shrink-0 text-neutral-400 transition-transform duration-200', open && 'rotate-180')}
          />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            key="panel"
            initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.1 : 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <Dropdown
                inline
                options={item.options}
                value={item.value ?? undefined}
                onChange={item.onChange}
                multiple={item.multiple}
                values={item.values}
                onChangeMultiple={item.onChangeMultiple}
                maxSelected={item.maxSelected}
                placeholder={item.placeholder}
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
                customBody={item.customBody}
                valueLabel={item.valueLabel}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}