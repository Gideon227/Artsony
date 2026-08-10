'use client'

import Image from 'next/image'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDownloadArtwork } from '@/hooks/use-delivery'
import type { DigitalDeliveryToken } from '@/types/order'

interface Props {
  token: DigitalDeliveryToken
}

export function DownloadCard({ token }: Props) {
  const { mutate: download, isPending } = useDownloadArtwork()

  const isExpired = new Date(token.expires_at) < new Date()
  const isExhausted = token.download_count >= token.max_downloads
  const disabled = isExpired || isExhausted || isPending

  return (
    <div className="w-full border border-gray-50 rounded-xl p-4 flex items-center gap-x-4">
      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-50 shrink-0">
        {/* {token.artwork_thumbnail_url ? (
          <Image
            src={token.artwork_thumbnail_url}
            alt={token.artwork_title}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <Image src="/icons/artwork-placeholder.svg" alt="Artwork unavailable" fill sizes="64px" className="object-cover" />
        )} */}
      </div>
{/* They were commented out temporarily */}
      <div className="min-w-0 flex-1">
        {/* <p className="font-poppins font-medium text-body-s text-body truncate">{token.artwork_title}</p> */}
        <p className="font-poppins text-body-xs text-gray-200 tracking-wide mt-1">
          {isExpired
            ? 'Download link expired'
            : isExhausted
              ? `Download limit reached (${token.max_downloads} max)`
              : `${token.download_count}/${token.max_downloads} downloads used`}
        </p>
      </div>

      <Button
        variant="primary"
        size="sm"
        isLoading={isPending}
        loadingText="Preparing…"
        disabled={disabled}
        onClick={() => download(token.order_item_id)}
      >
        <Download size={16} className="shrink-0" />
        Download
      </Button>
    </div>
  )
}
