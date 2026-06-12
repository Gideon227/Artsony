// upload-art/modals/modal-primitives.tsx
// Shared atomic components used by every modal.
// Kept in one file — they're tiny and always imported together.
'use client'

import Image from 'next/image';
import React from 'react'

// ── Close button ──────────────────────────────────────────────────────────────

export function ModalCloseBtn({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      className="absolute cursor-pointer top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
      aria-label="Close"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M1 1L13 13M13 1L1 13" stroke="#525965" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </button>
  )
}

// ── Back button ───────────────────────────────────────────────────────────────

export function BackBtn({ onBack, label = 'Back' }: { onBack: () => void; label?: string }) {
  return (
    <button
      onClick={onBack}
      className="flex items-center gap-1.5 text-sm text-[#525965] hover:text-[#333333] transition-colors mb-4"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </button>
  )
}

// ── Primary orange button ─────────────────────────────────────────────────────

interface BtnProps {
  children: React.ReactNode
  onClick?:  () => void
  disabled?: boolean
  loading?:  boolean
  className?: string
}

export function OrangeBtn({ children, onClick, disabled, loading, className = '' }: BtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#F25B38] text-white text-sm font-semibold hover:bg-[#e04f2f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
          <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}

// ── Outlined orange button ────────────────────────────────────────────────────

export function OutlineBtn({ children, onClick, disabled, className = '' }: Omit<BtnProps, 'loading'>) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-[#F25B38] text-[#F25B38] text-sm font-semibold hover:bg-[#fff1ee] disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {children}
    </button>
  )
}

// ── Error message chip ────────────────────────────────────────────────────────

export function ErrorMsg({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2">
      {/* <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          fillRule="evenodd" clipRule="evenodd"
          d="M7 0.875C3.61 0.875 0.875 3.61 0.875 7C0.875 10.39 3.61 13.125 7 13.125C10.39 13.125 13.125 10.39 13.125 7C13.125 3.61 10.39 0.875 7 0.875ZM7.875 9.625H6.125V7.875H7.875V9.625ZM7.875 6.125H6.125V4.375H7.875V6.125Z"
          fill="#E1350F"
        />
      </svg> */}
      <p className="text-xs text-[#E1350F] leading-relaxed">{message}</p>
    </div>
  )
}

// ── Modal backdrop ────────────────────────────────────────────────────────────
// z-[200] ensures modals sit above the upload modal (z-50) and flow layout

export function ModalBackdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', zIndex: 200 }}
    >
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}

// ── Upload drop zone ──────────────────────────────────────────────────────────
// Shared drop zone shape reused by Image and Video modals

interface DropZoneProps {
  isDragging:  boolean
  onDragOver:  (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop:      (e: React.DragEvent) => void
  onClick:     () => void
  icon:        React.ReactNode
  title:       string
  subtitle:    string
}

export function DropZone({ isDragging, onDragOver, onDragLeave, onDrop, onClick, icon, title, subtitle }: DropZoneProps) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      style={{ minHeight: 136 }}
      className={`relative flex items-center justify-center gap-2 px-6 py-3 w-full rounded-2xl border-2 border-dashed cursor-pointer transition-colors
        ${isDragging ? 'border-[#F25B38] bg-[#fff5f3]' : 'border-primary-500 bg-gray-50 hover:border-primary-600 hover:bg-[#fff5f3]'}
      `}
    >
      <Image src='/icons/plus-red-bg.svg' width={24} height={24} alt='plus icon' />
      <p className='font-poppins font-medium text-primary-500 text-body-s leading-6 tracking-wide'>Drag & drop your {title} here, or click to upload.</p>
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────

export function UploadingSpinner({ label }: { label: string }) {
  return (
    <div className="mt-4 flex items-center gap-2 text-sm text-[#525965]">
      <svg className="animate-spin w-4 h-4 text-[#F25B38]" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      {label}
    </div>
  )
}