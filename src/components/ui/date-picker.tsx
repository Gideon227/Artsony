'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'] as const
const MONTH_LABEL = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function isSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function isBetween(date: Date, from: Date, to: Date): boolean {
  const t = date.getTime()
  return t > from.getTime() && t < to.getTime()
}

function buildMonthGrid(monthCursor: Date): Date[] {
    const year = monthCursor.getFullYear()
    const month = monthCursor.getMonth()
    const firstOfMonth = new Date(year, month, 1)
    // Monday-first grid offset
    const leadingOffset = (firstOfMonth.getDay() + 6) % 7
    const gridStart = new Date(year, month, 1 - leadingOffset)
    return Array.from({ length: 42 }, (_, i) => new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i))
}

export type DateRange = { from: Date | null; to: Date | null }

type CalendarProps = {
    monthCursor: Date
    onMonthCursorChange: (date: Date) => void
    selected: Date | null | DateRange
    onSelectDay: (day: Date) => void
    minDate?: Date
    maxDate?: Date
    className?: string
}

function Calendar({ monthCursor, onMonthCursorChange, selected, onSelectDay, minDate, maxDate, className }: CalendarProps) {
    const days = React.useMemo(() => buildMonthGrid(monthCursor), [monthCursor])
    const currentMonth = monthCursor.getMonth()

    const range = selected && typeof selected === 'object' && 'from' in selected ? selected : null
    const single = selected instanceof Date ? selected : null

    const goToMonth = (offset: number) => {
        onMonthCursorChange(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + offset, 1))
    }
    const goToYear = (offset: number) => {
        onMonthCursorChange(new Date(monthCursor.getFullYear() + offset, monthCursor.getMonth(), 1))
    }

    const isDisabled = (day: Date) => (minDate && day < startOfDay(minDate)) || (maxDate && day > startOfDay(maxDate))

    return (
        <div className={cn('w-[296px] rounded-2xl border border-gray-50 bg-white p-4 shadow-card', className)}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <button type="button" aria-label="Previous year" onClick={() => goToYear(-1)} className="rounded-full p-1 text-primary-500 hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-primary-500">
                        <ChevronsLeft className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                    <button type="button" aria-label="Previous month" onClick={() => goToMonth(-1)} className="rounded-full p-1 text-primary-500 hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-primary-500">
                        <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                    </div>
                    <span className="font-poppins text-body-m font-bold text-heading">{MONTH_LABEL.format(monthCursor)}</span>
                    <div className="flex items-center gap-1">
                    <button type="button" aria-label="Next month" onClick={() => goToMonth(1)} className="rounded-full p-1 text-primary-500 hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-primary-500">
                        <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                    <button type="button" aria-label="Next year" onClick={() => goToYear(1)} className="rounded-full p-1 text-primary-500 hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-primary-500">
                        <ChevronsRight className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-7">
                {WEEKDAYS.map((day) => (
                <span key={day} className="flex h-8 items-center justify-center font-poppins text-body-xs font-semibold text-text-alt-grey">
                    {day}
                </span>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1">
                {days.map((day) => {
                const outsideMonth = day.getMonth() !== currentMonth
                const disabled = isDisabled(day)

                const isRangeStart = range && isSameDay(day, range.from)
                const isRangeEnd = range && isSameDay(day, range.to)
                const isRangeMiddle = range?.from && range?.to && isBetween(day, range.from, range.to)
                const isSingleSelected = isSameDay(day, single)

                return (
                    <div
                    key={day.toISOString()}
                    className={cn(
                        'relative flex h-10 items-center justify-center',
                        isRangeMiddle && 'bg-primary-50',
                        isRangeStart && range?.to && 'rounded-l-full bg-primary-50',
                        isRangeEnd && range?.from && 'rounded-r-full bg-primary-50'
                    )}
                    >
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => onSelectDay(day)}
                        aria-pressed={isRangeStart || isRangeEnd || isSingleSelected}
                        aria-label={day.toDateString()}
                        className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-full font-poppins text-body-s transition-colors',
                        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
                        outsideMonth && 'bg-gray-50 text-text-alt-grey',
                        !outsideMonth && !isRangeStart && !isRangeEnd && !isSingleSelected && 'text-heading hover:bg-primary-50',
                        (isRangeStart || isRangeEnd || isSingleSelected) && 'border border-primary-500 font-semibold text-primary-500',
                        disabled && 'cursor-not-allowed opacity-40 hover:bg-transparent'
                        )}
                    >
                        {day.getDate()}
                    </button>
                    </div>
                )
                })}
            </div>
        </div>
    )
}

function useOutsideClose(onClose: () => void) {
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', escHandler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', escHandler)
    }
  }, [onClose])
  return ref
}

const dateFmt = new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short' })

export type DateRangePickerProps = {
  value: DateRange
  onChange: (value: DateRange) => void
  minDate?: Date
  maxDate?: Date
  placeholder?: string
  className?: string
}

function DateRangePicker({ value, onChange, minDate, maxDate, placeholder = 'Date: from – to', className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [monthCursor, setMonthCursor] = React.useState(() => startOfDay(value.from ?? new Date()))
  const containerRef = useOutsideClose(() => setIsOpen(false))

  const handleSelectDay = (day: Date) => {
    if (!value.from || (value.from && value.to)) {
      onChange({ from: day, to: null })
      return
    }
    if (day < value.from) {
      onChange({ from: day, to: value.from })
    } else {
      onChange({ from: value.from, to: day })
    }
  }

  const label = value.from
    ? value.to
      ? `${dateFmt.format(value.from)} – ${dateFmt.format(value.to)}`
      : `${dateFmt.format(value.from)} – to`
    : placeholder

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          'flex h-12 w-full items-center justify-between gap-2 rounded-full border bg-white px-6 text-body-s font-medium transition-all',
          'hover:border-neutral-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
          value.from ? 'border-neutral-200 text-heading' : 'border-neutral-200 text-text-alt-grey',
          isOpen && 'border-neutral-300 ring-2 ring-offset-2 ring-primary-500/20'
        )}
      >
        <span className="truncate">{label}</span>
        <CalendarIcon className="h-4 w-4 shrink-0 text-text-alt-grey" strokeWidth={1.5} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-40">
          <Calendar
            monthCursor={monthCursor}
            onMonthCursorChange={setMonthCursor}
            selected={value}
            onSelectDay={handleSelectDay}
            minDate={minDate}
            maxDate={maxDate}
          />
        </div>
      )}
    </div>
  )
}

export type DatePickerProps = {
  value: Date | null
  onChange: (value: Date | null) => void
  minDate?: Date
  maxDate?: Date
  placeholder?: string
  className?: string
}

function DatePicker({ value, onChange, minDate, maxDate, placeholder = 'Select date', className }: DatePickerProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [monthCursor, setMonthCursor] = React.useState(() => startOfDay(value ?? new Date()))
    const containerRef = useOutsideClose(() => setIsOpen(false))

    return (
        <div className={cn('relative', className)} ref={containerRef}>
        <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className={cn(
            'flex h-12 w-full items-center justify-between gap-2 rounded-full border bg-white px-6 text-body-s font-medium transition-all',
            'hover:border-neutral-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
            value ? 'border-neutral-200 text-heading' : 'border-neutral-200 text-text-alt-grey',
            isOpen && 'border-neutral-300 ring-2 ring-offset-2 ring-primary-500/20'
            )}
        >
            <span className="truncate">{value ? dateFmt.format(value) : placeholder}</span>
            <CalendarIcon className="h-4 w-4 shrink-0 text-text-alt-grey" strokeWidth={1.5} />
        </button>

        {isOpen && (
            <div className="absolute left-0 top-[calc(100%+8px)] z-40">
            <Calendar
                monthCursor={monthCursor}
                onMonthCursorChange={setMonthCursor}
                selected={value}
                onSelectDay={(day) => {
                onChange(day)
                setIsOpen(false)
                }}
                minDate={minDate}
                maxDate={maxDate}
            />
            </div>
        )}
        </div>
    )
}

export { Calendar, DatePicker, DateRangePicker }