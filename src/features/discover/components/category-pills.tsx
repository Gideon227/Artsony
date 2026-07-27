'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { INTERESTS } from '@/features/onboarding/data/interests'
import { cn } from '@/lib/utils'

type CategoryPillsProps = {
  // null = "Today" — no category filter, matches the reference's default pill.
  value: string | null
  onChange: (value: string | null) => void
}

export function CategoryPills({ value, onChange }: CategoryPillsProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const scrollByAmount = (amount: number) => {
    scrollRef.current?.scrollBy({ left: amount, behavior: 'smooth' })
  }

  return (
    <div className="flex items-center gap-2 border border-gray-50 bg-white px-4 md:px-8 py-4">
      <button
        type="button"
        onClick={() => scrollByAmount(-240)}
        aria-label="Scroll categories left"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div
        ref={scrollRef}
        className="flex flex-1 gap-3 overflow-x-auto scroll-smooth scrollbar-hide"
      >
        {INTERESTS.map((interest) => (
          <Pill
            key={interest.id}
            label={interest.label}
            active={value === interest.id}
            onClick={() => onChange(interest.id)}
            bg={interest.image}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => scrollByAmount(240)}
        aria-label="Scroll categories right"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

function Pill({ label, active, onClick, bg }: { label: string; active: boolean; onClick: () => void, bg: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={ active ? { backgroundColor: '#F25B38' } : { backgroundImage: `url(${bg})`, backgroundPosition: 'center' }}
      className={cn(
        'shrink-0 whitespace-nowrap cursor-pointer rounded-full px-5 py-2.5 font-poppins text-[14px] font-medium transition-colors',
        active
          ? 'bg-primary-500 text-white'
          : 'bg-neutral-600 text-white hover:bg-neutral-700',
      )}
    >
      {label}
    </button>
  )
}
