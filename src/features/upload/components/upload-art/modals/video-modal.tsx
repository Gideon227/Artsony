// upload-art/modals/video-modal.tsx
'use client'

import React, { useState, useRef, useCallback } from 'react'
import { artworkService } from '@/services/artwork.service'
import { useDragOver } from '../hooks/use-drag-over'
import {
  ModalCloseBtn, BackBtn, OrangeBtn, OutlineBtn,
  ErrorMsg, DropZone, UploadingSpinner,
} from './modal-primitives'
import {
  UploadedFile,
  ACCEPTED_VIDEO_EXTENSIONS,
  formatBytes,
  validateVideoFile,
} from '../types'
import Image from 'next/image'
import { Button } from '@/components'

type Step = 'drop' | 'success'

interface VideoModalProps {
  onClose: () => void
  onSaved: (file: UploadedFile) => void
}

export function VideoModal({ onClose, onSaved }: VideoModalProps) {
  const [step, setStep] = useState<Step>('drop')
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { isDragging, handlers } = useDragOver()

  const processFile = useCallback(async (file: File) => {
    setError(null)
    const err = validateVideoFile(file)
    if (err) { setError(err); return }

    setUploading(true)
    try {
      const asset = await artworkService.uploadAsset(file)
      setUploadedFile({ file, previewUrl: URL.createObjectURL(file), uploadedAsset: asset })
      setStep('success')
    } catch (err) {
      const message = err instanceof Error
        ? err.message
        : 'Upload failed. Please try again.'
      setError(message)
    } finally {
      setUploading(false)
    }
  }, [])

  const handleDrop = (e: React.DragEvent) => {
    handlers.onDrop(e)
    const f = e.dataTransfer.files[0]
    if (f) processFile(f)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) processFile(f)
  }

  const videoIcon = (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="5" width="12" height="10" rx="2" stroke="#F25B38" strokeWidth="1.5" />
      <path d="M14 9L18 7V13L14 11V9Z" stroke="#F25B38" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )

  // ── Drop step ─────────────────────────────────────────────────────────────
  if (step === 'drop') {
    return (
      <div className="relative bg-white rounded-2xl border border-[#E6E8EB] w-1/2 h-5/6 flex flex-col gap-y-14 items-center justify-center p-8">
        <ModalCloseBtn onClose={onClose} />
        <h2 className="font-raleway font-medium text-h4 leading-10 text-gray-500 mb-1 tracking-wide text-center">Upload Video</h2>

        <DropZone
          isDragging={isDragging}
          {...handlers}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          icon={videoIcon}
          title="video"
          subtitle="MP4, MOV, AVI or MKV"
        />

        <div className='flex flex-col gap-2'>
          {error && <div className='flex items-center gap-1 justify-center'>
            <Image src='/icons/caution.svg' width={16} height={16} alt='caution icon' />
            <p className='font-semibold flex items-center ml-2 font-poppins text-body-s tracking-wide text-center leading-6 text-primary-500'>
              Error: <ErrorMsg message={error} />
            </p>
          </div>}

          <p className="text-body-s font-poppins tracking-wide text-center leading-6 text-gray-400">
            Upload videos in MP4, MOV, AVI, or MKV format, up to 500MB and no longer than 10 minutes. Minimum resolution: 720p.         
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_VIDEO_EXTENSIONS}
          className="hidden"
          onChange={handleInputChange}
        />

        {uploading && <UploadingSpinner label="Uploading video…" />}

        <div onClick={() => fileInputRef.current?.click()}  className='flex items-center justfify-center'>
            <Button rightIcon='/icons/alt-arrow-right-double.svg' disabled={!uploadedFile} >Save</Button>
        </div>
      </div>
    )
  }

  // ── Success step ──────────────────────────────────────────────────────────
  return (
    <div className="relative bg-white rounded-2xl border border-[#E6E8EB] w-full max-w-[564px] p-8">
      <ModalCloseBtn onClose={onClose} />
      <BackBtn onBack={() => { setUploadedFile(null); setStep('drop') }} />

      <h2 className="text-xl font-semibold text-[#333333] mb-1">Video ready</h2>
      <p className="text-xs text-[#525965] mb-5">Your video has been uploaded successfully.</p>

      {/* Video preview */}
      {uploadedFile && (
        <div className="w-full rounded-xl overflow-hidden bg-gray-900 mb-5 aspect-video">
          <video src={uploadedFile.previewUrl} controls className="w-full h-full object-contain" />
        </div>
      )}

      {/* Success chip */}
      {uploadedFile && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100 mb-5">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#333333] truncate">{uploadedFile.file.name}</p>
            <p className="text-xs text-[#525965]">{formatBytes(uploadedFile.file.size)}</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <OrangeBtn onClick={() => { if (uploadedFile) { onSaved(uploadedFile); onClose() } }}>
          Save
        </OrangeBtn>
        <OutlineBtn onClick={() => { setUploadedFile(null); setStep('drop') }}>Re-upload</OutlineBtn>
      </div>
    </div>
  )
}