'use client'

import * as React from 'react'
import Image from 'next/image'
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
    <div className="border border-gray-50 bg-white">
      <div className="max-w-[1440px] relative mx-auto flex items-center px-4 md:px-8 py-4">
        <button
          type="button"
          onClick={() => scrollByAmount(-240)}
          aria-label="Scroll categories left"
          className="absolute left-4 z-20 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-colors cursor-pointer"
        >
          <Image src='/icons/alt-arrow-left.svg' width={16} height={16} alt='left arrow' />
        </button>

        <div
          ref={scrollRef}
          className="flex flex-1 gap-2 overflow-x-auto scroll-smooth scrollbar-hide"
        >
          <Pill label="Today" active={value === null} onClick={() => onChange(null)} />

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
          className="absolute right-4 z-20 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-colors cursor-pointer"
        >
          <Image src='/icons/alt-arrow-right.svg' width={16} height={16} alt='right arrow' />
        </button>
      </div>
    </div>
  )
}

function Pill({
  label,
  active,
  onClick,
  bg,
}: {
  label: string
  active: boolean
  onClick: () => void
  bg?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative shrink-0 whitespace-nowrap cursor-pointer overflow-hidden rounded-full',
        'h-11 px-5 font-poppins text-[14px] font-medium transition-colors',
        'flex items-center justify-center',
        active ? 'bg-primary-500 opacity-80 text-white' : 'bg-neutral-600 text-white hover:brightness-110',
      )}
    >
      {!active && bg && (
        <>
          <Image
            src={bg}
            alt=""
            fill
            sizes="140px"
            className="object-cover"
            aria-hidden
          />
          <span className="absolute inset-0 bg-black/45" aria-hidden />
        </>
      )}
      <span className="relative z-10">{label}</span>
    </button>
  )
}
