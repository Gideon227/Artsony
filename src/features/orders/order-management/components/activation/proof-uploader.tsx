'use client'

import * as React from 'react'
import { Camera, Plus, Upload, X } from 'lucide-react'
import { Button } from '@/components'
import { cn } from '@/lib/utils'
import { activationUploadService, ActivationUploadError } from '@/services/order/activation-upload.service'
import { PACKAGING_ACCEPTED_TYPES, REQUIRED_PACKAGING_PHOTOS } from '../../constants'
import { validatePackagingPhoto } from '../../lib/activation'
import { IllustrationSlot } from '../illustration-slot'
import { FailedScreen, ProcessingScreen, SuccessScreen } from './result-screens'

type Step = 'intro' | 'select' | 'uploading' | 'failed' | 'success'

type Photo = { id: string; file: File; url: string }

const FINAL_ERROR_CODES = new Set(['UPLOAD_LINK_EXPIRED', 'UPLOAD_LINK_INVALID', 'UPLOAD_LINK_USED'])

type Props = {
  token: string
  onBack?: (() => void) | undefined
  onDone?: (() => void) | undefined
  onSuccess?: (() => void) | undefined
  onDownloadLabel?: (() => void) | undefined
  isDownloadingLabel?: boolean
  successHint?: string
}

export function ProofUploader({ token, onBack, onDone, onSuccess, onDownloadLabel, isDownloadingLabel, successHint }: Props) {
  const [step, setStep] = React.useState<Step>('intro')
  const [photos, setPhotos] = React.useState<Photo[]>([])
  const [active, setActive] = React.useState(0)
  const [pickError, setPickError] = React.useState<string | null>(null)
  const [failure, setFailure] = React.useState<{ message: string | null; retryable: boolean } | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const abortRef = React.useRef<AbortController | null>(null)
  const photosRef = React.useRef<Photo[]>([])
  photosRef.current = photos

  React.useEffect(
    () => () => {
      abortRef.current?.abort()
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.url))
    },
    [],
  )

  const addPhoto = (file: File | undefined) => {
    if (!file) return
    const problem = validatePackagingPhoto(file)
    if (problem) {
      setPickError(problem)
      return
    }
    setPickError(null)
    setPhotos((current) => {
      if (current.length >= REQUIRED_PACKAGING_PHOTOS) return current
      const next = [...current, { id: `${file.name}-${file.size}-${Date.now()}`, file, url: URL.createObjectURL(file) }]
      setActive(next.length - 1)
      return next
    })
  }

  const removePhoto = (id: string) => {
    setPhotos((current) => {
      const target = current.find((photo) => photo.id === id)
      if (target) URL.revokeObjectURL(target.url)
      const next = current.filter((photo) => photo.id !== id)
      setActive((index) => Math.min(index, Math.max(next.length - 1, 0)))
      return next
    })
  }

  const upload = async () => {
    if (photos.length !== REQUIRED_PACKAGING_PHOTOS) return
    const controller = new AbortController()
    abortRef.current = controller
    setStep('uploading')
    setFailure(null)

    try {
      const publicIds: string[] = []
      for (const photo of photos) {
        const signature = await activationUploadService.sign(token, photo.file, controller.signal)
        publicIds.push(await activationUploadService.uploadToCloudinary(signature.data, photo.file, controller.signal))
      }
      await activationUploadService.complete(token, publicIds, controller.signal)
      setStep('success')
      onSuccess?.()
    } catch (err) {
      if (controller.signal.aborted) return
      const known = err instanceof ActivationUploadError
      setFailure({
        message: known && err.code && FINAL_ERROR_CODES.has(err.code) ? err.message : null,
        retryable: !(known && err.code && FINAL_ERROR_CODES.has(err.code)),
      })
      setStep('failed')
    }
  }

  if (step === 'uploading') return <ProcessingScreen />
  if (step === 'success') {
    return (
      <SuccessScreen
        onDone={onDone}
        onDownloadLabel={onDownloadLabel}
        isDownloading={isDownloadingLabel ?? false}
        {...(successHint && { labelHint: successHint })}
      />
    )
  }
  if (step === 'failed') {
    return (
      <FailedScreen
        message={failure?.message}
        onBack={() => setStep('select')}
        onRetry={failure?.retryable ? () => void upload() : undefined}
      />
    )
  }

  if (step === 'intro') {
    return (
      <div className="flex flex-col items-center gap-6 px-6 py-8 text-center">
        <h2 className="font-raleway text-h5 font-medium tracking-wide text-gray-500">Upload Your Packaging Proof</h2>
        <IllustrationSlot src={null} alt="Take photos of your packaged artwork" className="h-56 w-48 rounded-[16px]" />
        <p className="max-w-[420px] font-poppins text-body-xs leading-5 tracking-wide text-gray-400">
          Take {REQUIRED_PACKAGING_PHOTOS} clear pictures of your artwork in its packaging before sealing the box. Make sure each photo is
          well-lit and in focus — these images are stored against your order and protect you if anything goes wrong in transit.
        </p>
        <div className="flex w-full max-w-[420px] flex-col gap-3">
          <Button rightIcon="/icons/alt-arrow-right-double.svg" onClick={() => setStep('select')}>
            Continue
          </Button>
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
          )}
        </div>
      </div>
    )
  }

  const current = photos[active]
  const ready = photos.length === REQUIRED_PACKAGING_PHOTOS

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-8 sm:px-6">
      <h2 className="font-raleway text-h6 font-medium tracking-wide text-gray-500">Upload Images</h2>

      <div className="relative aspect-square w-full max-w-[420px] overflow-hidden rounded-[32px] bg-secondary-100">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element -- local blob preview, not optimisable
          <img src={current.url} alt={`Packaging photo ${active + 1}`} className="h-full w-full object-cover" />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-3 text-gray-300 hover:text-primary-500"
          >
            <Camera className="h-10 w-10" aria-hidden="true" />
            <span className="font-poppins text-body-s">Tap to take a photo</span>
          </button>
        )}
      </div>

      <ul className="grid w-full max-w-[420px] grid-cols-3 gap-3" aria-label="Packaging photos">
        {Array.from({ length: REQUIRED_PACKAGING_PHOTOS }, (_, index) => {
          const photo = photos[index]
          const isNext = index === photos.length
          return (
            <li key={index} className="relative aspect-square">
              {photo ? (
                <>
                  <button
                    type="button"
                    onClick={() => setActive(index)}
                    aria-label={`Show photo ${index + 1}`}
                    aria-pressed={active === index}
                    className={cn(
                      'h-full w-full cursor-pointer overflow-hidden rounded-[20px] border-2',
                      active === index ? 'border-primary-500' : 'border-transparent',
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                    <img src={photo.url} alt="" className="h-full w-full object-cover" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    aria-label={`Remove photo ${index + 1}`}
                    className="absolute left-1.5 top-1.5 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white text-gray-500 shadow active:scale-95"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={!isNext}
                  onClick={() => inputRef.current?.click()}
                  aria-label="Add a photo"
                  className="flex h-full w-full cursor-pointer items-center justify-center rounded-[20px] bg-secondary-100 text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="h-7 w-7" aria-hidden="true" />
                </button>
              )}
            </li>
          )
        })}
      </ul>

      <input
        ref={inputRef}
        type="file"
        accept={PACKAGING_ACCEPTED_TYPES.join(',')}
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          addPhoto(event.target.files?.[0])
          event.target.value = ''
        }}
      />

      <p className="font-poppins text-body-xs tracking-wide text-gray-300">
        {photos.length} of {REQUIRED_PACKAGING_PHOTOS} photos added
      </p>
      {pickError && (
        <p role="alert" className="font-poppins text-body-xs text-error-500">
          {pickError}
        </p>
      )}

      <div className="flex w-full max-w-[420px] flex-col gap-3">
        <Button disabled={!ready} onClick={() => void upload()}>
          <Upload className="h-5 w-5" aria-hidden="true" />
          Upload
        </Button>
        <Button variant="outline" onClick={() => setStep('intro')}>
          Back
        </Button>
      </div>
    </div>
  )
}
