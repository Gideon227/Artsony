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
      <div className="relative flex items-center px-4 md:px-8 py-4">
        <button
          type="button"
          onClick={() => scrollByAmount(-240)}
          aria-label="Scroll categories left"
          className="absolute left-4 z-20 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-colors cursor-pointer"
        >
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.164852 7.37041L6.79533 13.8001C7.20906 14.2013 8 13.9581 8 13.4297L8 0.570303C8 0.0418882 7.20906 -0.201306 6.79533 0.199896L0.164852 6.62959C-0.0549501 6.84274 -0.0549501 7.15726 0.164852 7.37041Z" fill="white"/>
          </svg>
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
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.83515 7.37041L1.20467 13.8001C0.790939 14.2013 5.852e-07 13.9581 5.62102e-07 13.4297L0 0.570304C-2.30978e-08 0.0418892 0.790938 -0.201306 1.20467 0.199897L7.83515 6.62959C8.05495 6.84274 8.05495 7.15726 7.83515 7.37041Z" fill="white"/>
          </svg>
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
        'h-14 px-6 font-poppins font-medium transition-colors border border-gray-50',
        'flex items-center justify-center',
        active ? 'bg-primary-500 border-2 border-primary-600 opacity-80 text-white' : 'bg-gray-400 text-white hover:brightness-110',
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
          <span className="absolute inset-0 bg-black/30" aria-hidden />
        </>
      )}
      <span className="relative z-10 text-center text-white font-poppins font-medium text-body-m 2xl:text-body-l leading-8 ">{label}</span>
    </button>
  )
}
