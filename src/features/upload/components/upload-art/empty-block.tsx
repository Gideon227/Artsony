'use client'

import React from 'react'
import { AssetToolbar } from './asset-toolbar'
import { MEDIA_OPTIONS, MediaIcon } from './media-options'
import type { ModalKind } from './types'

interface EmptyBlockProps {
  onSelect:    (modal: ModalKind) => void
  hideDelete?: boolean
}

export function EmptyBlock({ onSelect, hideDelete = false }: EmptyBlockProps) {
  return (
    <div className="relative flex aspect-[1824/1447] min-h-80 w-full items-center justify-center rounded-2xl border border-gray-50 bg-white bg-[url('/images/upload-bg.png')] bg-repeat shadow-sm">
      <AssetToolbar hideDelete={hideDelete} />

      <div
        role="group"
        aria-label="Add media"
        className="flex flex-wrap items-center justify-center gap-8 p-4 md:gap-12"
      >
        {MEDIA_OPTIONS.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => onSelect(option.modal)}
            className="group flex cursor-pointer flex-col items-center justify-center gap-y-4 transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-primary-500"
          >
            <span className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-gray-800 transition-transform group-hover:scale-105">
              <MediaIcon option={option} size={32} />
            </span>
            <span className="font-poppins text-base font-medium leading-6 tracking-wide text-black">
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
