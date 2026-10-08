// upload-art/modals/file-upload-modal.tsx
// Single-file upload modal shared by PDF and 3D; layout mirrors ImageModal.
'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Box, CheckIcon, FileText } from 'lucide-react'
import { Button } from '@/components'
import { artworkService } from '@/services/artwork.service'
import { MEDIA_RULES, fileExtension, formatBytes, validateMediaFile } from '@/lib/media-rules'
import { useDragOver } from '../hooks/use-drag-over'
import { ErrorMsg, DropZone, ModalCloseBtn, UploadingSpinner } from './modal-primitives'
import { ACCEPTED_3D_EXTENSIONS, ACCEPTED_PDF_EXTENSIONS } from '../types'
import type { UploadedFile } from '../types'

type FileKind = 'PDF' | 'THREE_D'
type Step = 'drop' | 'success'

interface FileModalConfig {
  title:        string
  dropTitle:    string
  subtitle:     string
  successTitle: string
  uploading:    string
  accept:       string
  Icon:         typeof FileText
}

const MB = 1024 * 1024

const CONFIG: Record<FileKind, FileModalConfig> = {
  PDF: {
    title:        'Upload PDF',
    dropTitle:    'PDF',
    subtitle:     'PDF',
    successTitle: 'PDF Upload Successful',
    uploading:    'Uploading PDF',
    accept:       ACCEPTED_PDF_EXTENSIONS,
    Icon:         FileText,
  },
  THREE_D: {
    title:        'Upload 3D Model',
    dropTitle:    '3D model',
    subtitle:     'GLTF, GLB, OBJ or FBX',
    successTitle: '3D Upload Successful',
    uploading:    'Uploading 3D model',
    accept:       ACCEPTED_3D_EXTENSIONS,
    Icon:         Box,
  },
}

interface FileUploadModalProps {
  kind:    FileKind
  onClose: () => void
  onSaved: (file: UploadedFile) => void
}

function isAbort(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError'
}

export function FileUploadModal({ kind, onClose, onSaved }: FileUploadModalProps) {
  const config = CONFIG[kind]
  const rule = MEDIA_RULES[kind]

  const [step, setStep] = useState<Step>('drop')
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [previewFailed, setPreviewFailed] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadingRef = useRef(false)
  const abortRef = useRef<AbortController | null>(null)
  const uploadedFileRef = useRef<UploadedFile | null>(null)
  const savedRef = useRef(false)
  const { isDragging, handlers } = useDragOver()

  uploadedFileRef.current = uploadedFile

  // Closing mid-upload cancels it; a finished upload that was never handed to
  // the draft would otherwise stay in Cloudinary forever.
  useEffect(() => () => {
    abortRef.current?.abort()
    const asset = uploadedFileRef.current?.uploadedAsset
    if (!savedRef.current && asset) void artworkService.deleteUploadedAsset(kind, asset.public_id)
  }, [kind])

  const processFile = useCallback(async (file: File) => {
    if (uploadingRef.current) return
    setError(null)

    const invalid = validateMediaFile(file, kind)
    if (invalid) { setError(invalid); return }

    const controller = new AbortController()
    abortRef.current = controller
    uploadingRef.current = true
    setUploading(true)
    try {
      const asset = await artworkService.uploadAsset(file, kind, {
        signal: controller.signal,
        onProgress: setProgress,
      })
      setPreviewFailed(false)
      setUploadedFile({ file, previewUrl: asset.thumbnail_url ?? '', uploadedAsset: asset })
      setStep('success')
    } catch (err) {
      if (isAbort(err)) return
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      abortRef.current = null
      uploadingRef.current = false
      setUploading(false)
      setProgress(null)
    }
  }, [kind])

  const handleDiscard = () => {
    const asset = uploadedFile?.uploadedAsset
    if (asset) void artworkService.deleteUploadedAsset(kind, asset.public_id)
    setUploadedFile(null)
    setStep('drop')
  }

  const handleSave = () => {
    if (!uploadedFile) return
    savedRef.current = true
    onSaved(uploadedFile)
    onClose()
  }

  const handleDrop = (e: React.DragEvent) => {
    handlers.onDrop(e)
    const file = e.dataTransfer.files[0]
    if (file) void processFile(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) void processFile(file)
  }

  const { Icon } = config
  const uploadIcon = <Icon size={20} color="#F25B38" aria-hidden />

  const hiddenInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept={config.accept}
      className="hidden"
      onChange={handleInputChange}
    />
  )

  if (step === 'drop') {
    return (
      <div style={{ zIndex: 50 }} className="relative bg-white rounded-2xl border border-[#E6E8EB] w-1/2 h-3/4 flex flex-col gap-y-14 items-center justify-center p-8">
        <ModalCloseBtn onClose={onClose} />
        <h2 className="font-raleway font-medium text-h4 leading-10 text-gray-500 mb-1 tracking-wide text-center">{config.title}</h2>

        <DropZone
          isDragging={isDragging}
          {...handlers}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          icon={uploadIcon}
          title={config.dropTitle}
          subtitle={config.subtitle}
        />

        <div className="flex flex-col gap-2">
          {error && (
            <div className="flex items-center gap-1 justify-center">
              <Image src="/icons/caution.svg" width={16} height={16} alt="caution icon" />
              <p className="font-semibold flex items-center font-poppins text-body-s tracking-wide text-center leading-6 text-primary-500">
                Error: {' '} <ErrorMsg message={error} />
              </p>
            </div>
          )}

          <p className="text-body-s font-poppins tracking-wide text-center leading-6 text-gray-400">
            Formats: {rule.typeLabel} maximum size {Math.round(rule.maxBytes / MB)}MB
          </p>
        </div>

        {hiddenInput}

        {uploading && (
          <UploadingSpinner label={progress === null ? `${config.uploading}…` : `${config.uploading}… ${progress}%`} />
        )}

        <div className="flex items-center justify-center">
          <Button rightIcon="/icons/alt-arrow-right-double.svg" disabled>Save</Button>
        </div>
      </div>
    )
  }

  const thumbnailUrl = uploadedFile?.uploadedAsset?.thumbnail_url
  const showThumbnail = kind === 'PDF' && Boolean(thumbnailUrl) && !previewFailed

  return (
    <div className="relative bg-white rounded-2xl border border-[#E6E8EB] flex flex-col justify-center items-center gap-y-14 py-16 px-10" style={{ width: 564, height: '75%' }}>
      <div className="flex items-center gap-2 justify-center">
        <span className="p-1 rounded-full w-5 h-5 flex items-center justify-center" style={{ backgroundColor: '#4CAF50' }}>
          <CheckIcon size={20} color="#fff" />
        </span>
        <h2 className="font-raleway font-medium text-[#333333] text-h4 leading-10 tracking-wide">{config.successTitle}</h2>
      </div>

      {uploadedFile && (
        <div className="flex flex-col items-center justify-center w-54">
          <div className="relative rounded-2xl overflow-hidden bg-[#00000033] w-full h-[175px] flex items-center justify-center">
            {showThumbnail ? (
              <Image
                src={thumbnailUrl as string}
                alt={uploadedFile.file.name}
                fill
                sizes="216px"
                onError={() => setPreviewFailed(true)}
                className="object-cover bg-gray-500"
              />
            ) : (
              <Icon size={48} color="#fff" aria-hidden />
            )}
            <button
              type="button"
              onClick={handleDiscard}
              aria-label="Remove"
              className="absolute cursor-pointer rounded-full flex items-center justify-center"
              style={{ top: 8, left: 8 }}
            >
              <Image src="/icons/cancel-close.svg" width={20} height={20} alt="cancel icon" />
            </button>
          </div>

          <div className="flex gap-x-2 mt-4 items-center w-full text-center">
            <p className="font-poppins text-heading text-[12px] leading-5 tracking-wide truncate w-full">{uploadedFile.file.name}</p>
            <p className="font-poppins text-disabled text-[12px] text-nowrap leading-5 tracking-wide">
              {formatBytes(uploadedFile.file.size)} {fileExtension(uploadedFile.file.name)}
            </p>
          </div>
        </div>
      )}

      {hiddenInput}

      {error && <ErrorMsg message={error} />}

      <div className="flex items-center justify-center">
        <Button rightIcon="/icons/alt-arrow-right-double.svg" onClick={handleSave} disabled={!uploadedFile}>Save</Button>
      </div>
    </div>
  )
}

export const PdfModal = (props: Omit<FileUploadModalProps, 'kind'>) => (
  <FileUploadModal kind="PDF" {...props} />
)

export const ThreeDModal = (props: Omit<FileUploadModalProps, 'kind'>) => (
  <FileUploadModal kind="THREE_D" {...props} />
)
