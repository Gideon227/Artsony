'use client'

import * as React from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'
import { cn } from '@/utils'
import { Button } from '@/components/ui/button'

type ImageUploadProps = {
  value?: string | null
  onChange: (file: File | null) => void
  accept?: string
  maxSizeMb?: number
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'free'
  error?: string
  disabled?: boolean
  className?: string
  label?: string
  hint?: string
}

const aspectRatioClasses = {
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[16/9]',
  free: 'min-h-[180px]',
}

export function ImageUpload({
  value,
  onChange,
  accept = 'image/jpeg,image/png,image/webp,image/gif',
  maxSizeMb = 10,
  aspectRatio = 'free',
  error,
  disabled,
  className,
  label,
  hint,
}: ImageUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [localError, setLocalError] = React.useState<string | null>(null)
  const [preview, setPreview] = React.useState<string | null>(value ?? null)

  React.useEffect(() => {
    setPreview(value ?? null)
  }, [value])

  const validateAndProcess = (file: File) => {
    setLocalError(null)
    if (!file.type.startsWith('image/')) {
      setLocalError('Please upload an image file.')
      return
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      setLocalError(`File must be under ${maxSizeMb}MB.`)
      return
    }
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    onChange(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) validateAndProcess(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) validateAndProcess(file)
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview)
    setPreview(null)
    setLocalError(null)
    onChange(null)
  }

  const displayError = localError ?? error

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && <span className="text-sm font-medium text-neutral-700">{label}</span>}

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload image"
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'relative w-full overflow-hidden rounded-[var(--radius-xl)]',
          'border-2 border-dashed transition-all duration-200',
          aspectRatioClasses[aspectRatio],
          !preview && 'flex items-center justify-center',
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : displayError
              ? 'border-error-400 bg-error-50'
              : 'border-neutral-200 bg-neutral-50 hover:border-primary-300 hover:bg-primary-50/30',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'cursor-pointer'
        )}
      >
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Upload preview"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
              <span className="text-white text-sm font-medium">Change image</span>
            </div>
            {!disabled && (
              <Button
                type="button"
                variant="danger"
                size="icon-sm"
                onClick={handleRemove}
                aria-label="Remove image"
                className="absolute top-2 right-2 shadow-md"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 p-6 text-center pointer-events-none">
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-full',
                isDragging ? 'bg-primary-100' : 'bg-neutral-100'
              )}
            >
              {isDragging ? (
                <Upload className="h-5 w-5 text-primary-500" />
              ) : (
                <ImageIcon className="h-5 w-5 text-neutral-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-700">
                {isDragging ? 'Drop to upload' : 'Upload image'}
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">
                Drag & drop or click to browse · Max {maxSizeMb}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {displayError ? (
        <p role="alert" className="text-xs text-error-600 flex items-center gap-1">
          <span aria-hidden="true">⚠</span>
          {displayError}
        </p>
      ) : hint ? (
        <p className="text-xs text-neutral-400">{hint}</p>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="sr-only"
        aria-hidden="true"
        disabled={disabled}
      />
    </div>
  )
}
