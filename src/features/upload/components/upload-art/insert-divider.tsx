'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { MEDIA_OPTIONS, MediaIcon } from './media-options'
import type { ModalKind } from './types'

interface InsertDividerProps {
  label:    string
  onSelect: (modal: ModalKind) => void
}

export function InsertDivider({ label, onSelect }: InsertDividerProps) {
  const [open, setOpen] = useState(false)

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false)
  }

  const handleSelect = (modal: ModalKind) => {
    setOpen(false)
    onSelect(modal)
  }

  return (
    <div
      className="flex h-[88px] w-full items-center justify-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={handleBlur}
      onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
    >
      {open ? (
        <div
          role="group"
          aria-label={label}
          className="flex items-center gap-3 rounded-full bg-[#FFF0EE] px-4 py-3 shadow-sm animate-in fade-in zoom-in-95 duration-150"
        >
          {MEDIA_OPTIONS.map((option) => (
            <button
              key={option.label}
              type="button"
              aria-label={option.label}
              title={option.label}
              onClick={() => handleSelect(option.modal)}
              className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-gray-800 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-primary-500"
            >
              <MediaIcon option={option} size={24} />
            </button>
          ))}
        </div>
      ) : (
        <button
          type="button"
          aria-label={label}
          aria-expanded={false}
          onClick={() => setOpen(true)}
          className="flex h-[88px] w-[88px] cursor-pointer items-center justify-center rounded-full bg-[#FFF0EE] transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-primary-500"
        >
          <Image src="/icons/plus-red-bg.svg" width={28} height={28} alt="" aria-hidden />
        </button>
      )}
    </div>
  )
}
