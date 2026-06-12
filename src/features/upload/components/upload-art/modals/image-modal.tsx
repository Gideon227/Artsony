// upload-art/modals/image-modal.tsx
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
  ACCEPTED_IMAGE_EXTENSIONS,
  validateImageFile,
} from '../types'
import Image from 'next/image'
import { Button } from '@/components'
import { CheckIcon } from 'lucide-react'

type Step = 'drop' | 'success'

interface ImageModalProps {
  onClose: () => void
  onSaved: (files: UploadedFile[]) => void
}

export function ImageModal({ onClose, onSaved }: ImageModalProps) {
  const [step, setStep] = useState<Step>('drop')
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { isDragging, handlers } = useDragOver()

  const processFiles = useCallback(async (rawFiles: FileList | File[]) => {
    setError(null)
    const arr = Array.from(rawFiles)

    // Client-side validation first
    for (const f of arr) {
      const err = validateImageFile(f)
      if (err) { setError(err); return }
    }

    const newFiles: UploadedFile[] = arr.map((f) => ({
      file: f,
      previewUrl: URL.createObjectURL(f),
    }))

    setUploading(true)
    try {
      const uploaded: UploadedFile[] = []
      for (const uf of newFiles) {
        // ── Actual server upload ──────────────────────────────────────────────
        const asset = await artworkService.uploadAsset(uf.file)
        uploaded.push({ ...uf, uploadedAsset: asset })
      }
      setFiles((prev) => [...prev, ...uploaded])
      setStep('success')
    } catch (err) {
      // Show the real server error message, not a generic one
      const message = err instanceof Error
        ? err.message
        : 'Upload failed. Please try again.'
      setError(message)
      // Revoke blob URLs for failed uploads
      newFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl))
    } finally {
      setUploading(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    handlers.onDrop(e)
    if (e.dataTransfer.files.length) processFiles(e.dataTransfer.files)
  }, [handlers, processFiles])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) processFiles(e.target.files)
  }

  const handleRemove = (idx: number) => {
    setFiles((prev) => {
      const next = [...prev]
      URL.revokeObjectURL(next[idx]!.previewUrl)
      next.splice(idx, 1)
      return next
    })
    if (files.length <= 1) setStep('drop')
  }

  const handleSave = () => {
    onSaved(files)
    onClose()
  }

  // ── Icons ─────────────────────────────────────────────────────────────────
  const uploadIcon = (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 13V4M10 4L6.5 7.5M10 4L13.5 7.5" stroke="#F25B38" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 14V16C3 16.5523 3.44772 17 4 17H16C16.5523 17 17 16.5523 17 16V14" stroke="#F25B38" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )

  // ── Drop step ─────────────────────────────────────────────────────────────
  if (step === 'drop') {
    return (
      <div style={{ zIndex: 50 }} className="relative bg-white rounded-2xl border border-[#E6E8EB] w-1/2 h-3/4 flex flex-col gap-y-14 items-center justify-center p-8">
        <ModalCloseBtn onClose={onClose} />
        <h2 className="font-raleway font-medium text-h4 leading-10 text-gray-500 mb-1 tracking-wide text-center">Upload Image</h2>
        
        <DropZone
          isDragging={isDragging}
          {...handlers}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          icon={uploadIcon}
          title="image"
          subtitle="JPG, PNG or TIFF"
        />
        
        <div className='flex flex-col gap-2'>
            {error && <div className='flex items-center gap-1 justify-center'>
                <Image src='/icons/caution.svg' width={16} height={16} alt='caution icon' />
                <p className='font-semibold flex items-center font-poppins text-body-s tracking-wide text-center leading-6 text-primary-500'>
                    Error: {' '} <ErrorMsg message={error} />
                </p>
            </div>}

            <p className="text-body-s font-poppins tracking-wide text-center leading-6 text-gray-400">
              Formats: JPG, PNG, TIFF maximum size 50MB • Min 1200px,<br /> Recommended 3000–4096px
            </p>
        </div>



        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_EXTENSIONS}
          multiple
          className="hidden"
          onChange={handleInputChange}
        />

        {uploading && <UploadingSpinner label="Uploading…" />}
        {/* {error && <ErrorMsg message={error} />} */}

        <div onClick={() => fileInputRef.current?.click()}  className='flex items-center justfify-center'>
            <Button rightIcon='/icons/alt-arrow-right-double.svg' disabled={!files} >Save</Button>
        </div>
        
      </div>
    )
  }

  // ── Success step ──────────────────────────────────────────────────────────
  return (
    <div className="relative bg-white rounded-2xl border border-[#E6E8EB] flex flex-col justify-center items-center gap-y-14 py-16 px-10" style={{ width: 564, height: '75%' }}>
      {/* <ModalCloseBtn onClose={onClose} />
      <BackBtn onBack={() => setStep('drop')} /> */}

      <div className='flex items-center gap-2 justify-center'>
        <span className='bg-gray-500 p-1 rounded-full w-5 h-5 flex items-center justify-center' style={{ backgroundColor: '#4CAF50' }}>
          <CheckIcon size={20} color='#fff' />
        </span>
        <h2 className='font-raleway font-medium text-[#333333] text-h4 leading-10 tracking-wide'>Image Upload Successful</h2>
      </div>

      {/* Preview grid - FIXED: Confined container with explicit horizontal scroll layout */}
      <div className={`w-full max-w-full gap-6 mb-6 flex flex-row overflow-x-auto hide-scrollbar px-2 py-1 ${files.length > 1 ? 'items-start justify-start' : 'items-center justify-center'}`}>
        {files.map((uf, i) => (
          <div key={i} className={`flex flex-col items-center justify-center w-54 ${files.length > 1 && 'shrink-0'}`}>
            <div className="relative rounded-2xl overflow-hidden justify-center bg-[#00000033] w-full h-[175px]">
              <Image src={uf.previewUrl} alt={uf.file.name} width={216} height={175} className="object-cover bg-gray-500 w-full h-full" />
              <button
                onClick={() => handleRemove(i)}
                className="absolute cursor-pointer rounded-full flex items-center justify-center"
                aria-label="Remove"
                style={{ top: 8, left: 8 }}
              >
                <Image src='/icons/cancel-close.svg' width={20} height={20} alt='cancel icon' />
              </button>
            </div>

            <div className='flex gap-x-2 mt-4 items-center w-full text-center'>
              <p className='font-poppins text-heading text-[12px] leading-5 tracking-wide truncate w-full'>{uf.uploadedAsset?.optimized_url}</p>
              <p className='font-poppins text-disabled text-[12px] text-nowrap leading-5 tracking-wide'>{uf.uploadedAsset && (uf.uploadedAsset.file_size_bytes / 1024).toFixed(2)}KB {uf.uploadedAsset?.mime_type.split('/').pop()}</p>
            </div>

          </div>
        ))}
        
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_EXTENSIONS}
          multiple
          className="hidden"
          onChange={handleInputChange}
        />
      </div>

      {error && <ErrorMsg message={error} />}

      <div onClick={handleSave}  className='flex items-center justify-center'>
        <Button rightIcon='/icons/alt-arrow-right-double.svg' disabled={!files} >Save</Button>
      </div>
    </div>
  )
}