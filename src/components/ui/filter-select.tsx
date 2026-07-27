'use client'

import * as React from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export type FilterSelectOption<T extends string> = {
  value: T
  label: string
}

export type FilterSelectProps<T extends string> = {
  options: FilterSelectOption<T>[]
  value: T
  onChange: (value: T) => void
  /** Static label shown on the trigger regardless of selection, e.g. "Status". Omit to show the selected option's label instead (e.g. Sort). */
  triggerLabel?: string
  isActive?: boolean
  disabled?: boolean
  className?: string
}

function FilterSelect<T extends string>({
  options,
  value,
  onChange,
  triggerLabel,
  isActive,
  disabled,
  className,
}: FilterSelectProps<T>) {
    const [isOpen, setIsOpen] = React.useState(false)
    const containerRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        const handleClick = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false)
        }
        const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsOpen(false)
        }
        document.addEventListener('mousedown', handleClick)
        document.addEventListener('keydown', handleKey)
        return () => {
        document.removeEventListener('mousedown', handleClick)
        document.removeEventListener('keydown', handleKey)
        }
    }, [])

    const selected = options.find((o) => o.value === value) ?? options[0]
    const others = options.filter((o) => o.value !== selected?.value)

    return (
        <div className={cn('relative w-full', className)} ref={containerRef}>
        <button
            type="button"
            disabled={disabled}
            onClick={() => setIsOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            className={cn(
            'flex h-12 w-full items-center justify-between gap-2 rounded-full border bg-white px-6 transition-all outline-none',
            'text-body-s font-medium text-heading hover:border-neutral-300',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
            isActive ? 'border-primary-500 text-primary-500' : 'border-neutral-200',
            disabled && 'cursor-not-allowed border-neutral-200 bg-neutral-100 text-text-disabled',
            isOpen && !isActive && 'border-neutral-300'
            )}
        >
            <span className="truncate">{triggerLabel ?? selected?.label}</span>
            <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', isActive ? 'text-primary-500' : 'text-text-alt-grey', isOpen && 'rotate-180')} />
        </button>

        {isOpen && !disabled && (
            <div
            role="listbox"
            className="absolute left-0 top-[calc(100%+8px)] z-40 w-full min-w-[220px] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-100"
            >
            <div
                role="option"
                aria-selected
                className="flex items-center justify-between bg-primary-500 px-6 py-4 font-poppins text-body-s font-semibold text-white"
            >
                <span className="truncate">{selected?.label}</span>
                <Check className="h-5 w-5 shrink-0" strokeWidth={2} />
            </div>

            <ul>
                {others.map((option) => (
                <li key={option.value}>
                    <div
                    role="option"
                    aria-selected={false}
                    tabIndex={0}
                    onClick={() => {
                        onChange(option.value)
                        setIsOpen(false)
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onChange(option.value)
                        setIsOpen(false)
                        }
                    }}
                    className="flex cursor-pointer items-center justify-between border-b border-neutral-100 px-6 py-4 font-poppins text-body-s font-medium text-heading outline-none last:border-b-0 hover:bg-neutral-50"
                    >
                    <span className="truncate">{option.label}</span>
                    <span className="h-5 w-5 shrink-0 rounded-full border border-neutral-200" />
                    </div>
                </li>
                ))}
            </ul>
            </div>
        )}
        </div>
    )
}

export { FilterSelect }