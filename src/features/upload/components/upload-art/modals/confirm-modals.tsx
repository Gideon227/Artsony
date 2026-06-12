// upload-art/modals/confirm-modals.tsx
// SaveDraftModal and PublishModal — both follow the same icon + confirm layout.
'use client'

import React from 'react'
import { ModalCloseBtn, OrangeBtn, OutlineBtn } from './modal-primitives'

// ── Shared confirm card ────────────────────────────────────────────────────────

interface ConfirmModalProps {
  icon:        React.ReactNode
  title:       string
  description: string
  confirmLabel: string
  confirmIcon:  React.ReactNode
  loading:     boolean
  onClose:     () => void
  onConfirm:   () => void
}

function ConfirmModal({ icon, title, description, confirmLabel, confirmIcon, loading, onClose, onConfirm }: ConfirmModalProps) {
  return (
    <div className="relative bg-white rounded-2xl border border-[#E6E8EB] w-full max-w-[400px] p-8 text-center">
      <ModalCloseBtn onClose={onClose} />
      <div className="w-14 h-14 rounded-full bg-[#FFF0EE] flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-[#333333] mb-2">{title}</h2>
      <p className="text-sm text-[#525965] mb-6 leading-relaxed">{description}</p>
      <div className="flex items-center gap-3 justify-center">
        <OrangeBtn onClick={onConfirm} loading={loading}>
          {confirmIcon}
          {confirmLabel}
        </OrangeBtn>
        <OutlineBtn onClick={onClose} disabled={loading}>Cancel</OutlineBtn>
      </div>
    </div>
  )
}

// ── Public exports ────────────────────────────────────────────────────────────

export function SaveDraftModal({ onClose, onConfirm, loading }: { onClose: () => void; onConfirm: () => void; loading: boolean }) {
  return (
    <ConfirmModal
      onClose={onClose}
      onConfirm={onConfirm}
      loading={loading}
      title="Save as Draft?"
      description="Your artwork will be saved privately. You can come back and publish it any time."
      confirmLabel="Save Draft"
      icon={
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <path d="M5 6H21M5 10H21M5 14H15M5 18H12" stroke="#F25B38" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M18 16L20 18L24 14" stroke="#F25B38" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      }
      confirmIcon={
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8.5L6 11.5L13 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      }
    />
  )
}

export function PublishModal({ onClose, onConfirm, loading }: { onClose: () => void; onConfirm: () => void; loading: boolean }) {
  return (
    <ConfirmModal
      onClose={onClose}
      onConfirm={onConfirm}
      loading={loading}
      title="Publish Artwork?"
      description="Your artwork will be visible to the public. Make sure everything looks good before publishing."
      confirmLabel="Publish"
      icon={
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <path d="M13 17V6M13 6L8 11M13 6L18 11" stroke="#F25B38" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 19V21C4 21.5523 4.44772 22 5 22H21C21.5523 22 22 21.5523 22 21V19" stroke="#F25B38" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      }
      confirmIcon={
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 11V3M8 3L5 6M8 3L11 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 12V13.5C2 13.7761 2.22386 14 2.5 14H13.5C13.7761 14 14 13.7761 14 13.5V12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      }
    />
  )
}
