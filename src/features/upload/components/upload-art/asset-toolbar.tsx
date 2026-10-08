'use client'

import React from 'react'
import Image from 'next/image'
import { Trash2 } from 'lucide-react'
import { cn } from '@/utils'

interface AssetToolbarProps {
  onEdit?:     () => void
  onMoveUp?:   () => void
  onMoveDown?: () => void
  onDelete?:   () => void
  className?:  string
}

const BUTTON_CLASS =
  'flex items-center justify-center w-10 h-10 border-2 border-white rounded-full transition-colors cursor-pointer hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent'

const ACTIONS = [
  { key: 'edit', src: '/icons/pen.svg',              label: 'Edit media' },
  { key: 'up',   src: '/icons/arrow-up-round.svg',   label: 'Move media up' },
  { key: 'down', src: '/icons/arrow-down-round.svg', label: 'Move media down' },
] as const

export function AssetToolbar({ onEdit, onMoveUp, onMoveDown, onDelete, className }: AssetToolbarProps) {
  const handlers = { edit: onEdit, up: onMoveUp, down: onMoveDown }

  return (
    <div
      className={cn(
        'absolute top-6 left-6 z-10 flex flex-col gap-3 rounded-2xl bg-gray-300/60 p-2 backdrop-blur-sm',
        className,
      )}
    >
      {ACTIONS.map(({ key, src, label }) => (
        <button
          key={key}
          type="button"
          aria-label={label}
          disabled={!handlers[key]}
          onClick={handlers[key]}
          className={BUTTON_CLASS}
        >
          <Image src={src} width={20} height={20} alt="" aria-hidden />
        </button>
      ))}
      <button
        type="button"
        aria-label="Delete media"
        disabled={!onDelete}
        onClick={onDelete}
        className={BUTTON_CLASS}
      >
        <Trash2 size={20} color="#fff" aria-hidden />
      </button>
    </div>
  )
}
