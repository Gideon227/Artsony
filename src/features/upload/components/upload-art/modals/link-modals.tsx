// upload-art/modals/link-modals.tsx
// EmbedModal and ThreeDModal share the same URL-input layout.
// Extracted into a single reusable UrlInputModal to avoid duplication.
'use client'

import React, { useState } from 'react'
import { ModalCloseBtn, OrangeBtn, OutlineBtn, ErrorMsg } from './modal-primitives'
import { Button, Textarea } from '@/components'

// ── Shared URL input modal ─────────────────────────────────────────────────────

interface UrlInputModalProps {
  title:       string
  description: string
  placeholder: string
  helpText:    string
  onClose:     () => void
  onSaved:     (url: string) => void
}

function UrlInputModal({ title, description, placeholder, helpText, onClose, onSaved }: UrlInputModalProps) {
  const [url, setUrl]     = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSave = () => {
    if (!url.trim()) { setError('Please enter a URL.'); return }
    try {
      new URL(url.trim())
      setError(null)
      onSaved(url.trim())
      onClose()
    } catch {
      setError('Please enter a valid URL (e.g. https://example.com).')
    }
  }

  return (
    <div className="relative bg-white rounded-2xl border border-[#E6E8EB] w-1/2 h-3/4 flex flex-col gap-y-14 items-center justify-center p-8">
      <ModalCloseBtn onClose={onClose} />

      <h2 className="font-raleway font-medium text-h4 leading-10 text-gray-500 mb-1 tracking-wide text-center">{title}</h2>
      
      <div className='space-y-6 flex flex-col items-center justify-center'>
        <Textarea
          placeholder={description}
          onChange={(e) => setUrl(e.target.value)}
        />

        <div className='flex flex-col justify-center items-center gap-1 text-center'>
          <p className='font-poppins text-body-s text-body leading-6 tracking-wide'>{helpText}</p>
          <p className='font-poppins text-body-s text-body leading-6 tracking-wide'>Click <a href='/' className='text-primary-500 underline underline-primary-500'>“here”</a> to see all supported file types</p>
        </div>
      </div>

      {error && <ErrorMsg message={error} />}

      <div className='flex items-center justfify-center'>
        <Button rightIcon='/icons/alt-arrow-right-double.svg' disabled={!url} >Save</Button>
      </div>
    </div>
  )
}

// ── Public exports ─────────────────────────────────────────────────────────────

export function EmbedModal({ onClose, onSaved }: { onClose: () => void; onSaved: (url: string) => void }) {
  return (
    <UrlInputModal
      title="Embed"
      description="Paste Embed Code Here"
      placeholder="https://sketchfab.com/models/…"
      helpText="Paste a valid embed link (YouTube, Vimeo, SoundCloud, Behance, etc.). Make sure your link is public and shareable."
      onClose={onClose}
      onSaved={onSaved}
    />
  )
}

export function ThreeDModal({ onClose, onSaved }: { onClose: () => void; onSaved: (url: string) => void }) {
  return (
    <UrlInputModal
      title="Upload 3D Model"
      description="Paste 3D Code Here"
      placeholder="https://sketchfab.com/3d-models/…"
      helpText="Paste a Sketchfab or supported 3D viewer link to showcase interactive models. Ensure the model is optimized for smooth viewing."
      onClose={onClose}
      onSaved={onSaved}
    />
  )
}