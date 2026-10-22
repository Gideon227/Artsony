'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'] as const
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'] as const

function formatMonthTitle(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`
}

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
    const today = React.useMemo(() => startOfDay(new Date()), [])

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
                    <span className="font-poppins text-body-m font-medium text-primary-500">{formatMonthTitle(monthCursor)}</span>
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
                const isToday = isSameDay(day, today)
                const isSelectedDay = Boolean(isRangeStart || isRangeEnd || isSingleSelected)

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
                        aria-pressed={isSelectedDay}
                        aria-label={day.toDateString()}
                        className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-full font-poppins text-body-s transition-colors',
                        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
                        outsideMonth && 'bg-gray-50 text-text-alt-grey',
                        !outsideMonth && !isSelectedDay && 'text-heading hover:bg-primary-50',
                        isToday && !isSelectedDay && 'border border-primary-500 text-primary-500',
                        isSelectedDay && 'bg-primary-500 font-semibold text-white',
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

function DateRangePicker({ value, onChange, minDate, maxDate, placeholder = 'Date: from - to', className }: DateRangePickerProps) {
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
        <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.75 0.75C5.75 0.335786 5.41421 0 5 0C4.58579 0 4.25 0.335786 4.25 0.75V2.32926C2.81067 2.44451 1.86577 2.72737 1.17157 3.42157C0.477374 4.11577 0.194513 5.06067 0.0792572 6.5H19.9207C19.8055 5.06067 19.5226 4.11577 18.8284 3.42157C18.1342 2.72737 17.1893 2.44451 15.75 2.32926V0.75C15.75 0.335786 15.4142 0 15 0C14.5858 0 14.25 0.335786 14.25 0.75V2.2629C13.5847 2.25 12.839 2.25 12 2.25H8C7.16097 2.25 6.41527 2.25 5.75 2.2629V0.75Z" fill="#525965"/>
          <path d="M0 10.25C0 9.41096 0 8.66527 0.012902 8H19.9871C20 8.66527 20 9.41096 20 10.25V12.25C20 16.0212 20 17.9069 18.8284 19.0784C17.6569 20.25 15.7712 20.25 12 20.25H8C4.22876 20.25 2.34315 20.25 1.17157 19.0784C0 17.9069 0 16.0212 0 12.25V10.25ZM15 12.25C15.5523 12.25 16 11.8023 16 11.25C16 10.6977 15.5523 10.25 15 10.25C14.4477 10.25 14 10.6977 14 11.25C14 11.8023 14.4477 12.25 15 12.25ZM15 16.25C15.5523 16.25 16 15.8023 16 15.25C16 14.6977 15.5523 14.25 15 14.25C14.4477 14.25 14 14.6977 14 15.25C14 15.8023 14.4477 16.25 15 16.25ZM11 11.25C11 11.8023 10.5523 12.25 10 12.25C9.44771 12.25 9 11.8023 9 11.25C9 10.6977 9.44771 10.25 10 10.25C10.5523 10.25 11 10.6977 11 11.25ZM11 15.25C11 15.8023 10.5523 16.25 10 16.25C9.44771 16.25 9 15.8023 9 15.25C9 14.6977 9.44771 14.25 10 14.25C10.5523 14.25 11 14.6977 11 15.25ZM5 12.25C5.55228 12.25 6 11.8023 6 11.25C6 10.6977 5.55228 10.25 5 10.25C4.44772 10.25 4 10.6977 4 11.25C4 11.8023 4.44772 12.25 5 12.25ZM5 16.25C5.55228 16.25 6 15.8023 6 15.25C6 14.6977 5.55228 14.25 5 14.25C4.44772 14.25 4 14.6977 4 15.25C4 15.8023 4.44772 16.25 5 16.25Z" fillRule="evenodd" clipRule="evenodd" fill="#525965"/>
        </svg>
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