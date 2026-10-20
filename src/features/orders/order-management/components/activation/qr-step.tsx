'use client'

import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components'
import { REQUIRED_PACKAGING_PHOTOS } from '../../constants'

type Props = { uploadUrl: string; expired: boolean; onBack: () => void; onRegenerate: () => void; isRegenerating: boolean }

export function QrStep({ uploadUrl, expired, onBack, onRegenerate, isRegenerating }: Props) {
  const [image, setImage] = React.useState<string | null>(null)
  const [failed, setFailed] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    setImage(null)
    setFailed(false)
    import('qrcode')
      .then(({ default: QRCode }) => QRCode.toDataURL(uploadUrl, { margin: 1, width: 360, errorCorrectionLevel: 'M' }))
      .then((dataUrl) => !cancelled && setImage(dataUrl))
      .catch(() => !cancelled && setFailed(true))
    return () => {
      cancelled = true
    }
  }, [uploadUrl])

  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      <h2 className="font-raleway text-h5 font-medium tracking-wide text-primary-500 lg:text-h4">Upload Your Packaging Proof</h2>
      <p className="max-w-[480px] font-poppins text-body-xs leading-5 tracking-wide text-gray-400">
        Scan this QR code with your mobile phone to open the camera and upload your packaging photos. You&apos;ll need to take{' '}
        <span className="text-primary-500">
          {REQUIRED_PACKAGING_PHOTOS} clear shots before sealing your box
        </span>{' '}
        — this helps confirm your packaging and protects your shipment.
      </p>

      <div className="flex h-[260px] w-[260px] items-center justify-center rounded-[24px] border border-gray-50 bg-white p-3">
        {expired ? (
          <p className="font-poppins text-body-s text-gray-400">This QR code has expired.</p>
        ) : failed ? (
          <p role="alert" className="font-poppins text-body-s text-error-500">
            Couldn&apos;t draw the QR code.
          </p>
        ) : image ? (
          // eslint-disable-next-line @next/next/no-img-element -- generated data URL
          <img src={image} alt="QR code to upload packaging photos from your phone" className="h-full w-full" />
        ) : (
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" aria-label="Generating QR code" />
        )}
      </div>

      <div className="flex w-full max-w-[420px] items-center justify-center gap-3">
        <Button variant="outline" leftIcon="/icons/alt-arrow-left-double-red.svg" onClick={onBack} className="flex-1">
          Back
        </Button>
        {(expired || failed) && (
          <Button onClick={onRegenerate} isLoading={isRegenerating} className="flex-1">
            New QR code
          </Button>
        )}
      </div>
    </div>
  )
}
