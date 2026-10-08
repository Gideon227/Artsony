import React from 'react'

interface AssetOpenLinkProps {
  asset: { media_type: string; original_url: string }
}

export function AssetOpenLink({ asset }: AssetOpenLinkProps) {
  if (asset.media_type !== 'PDF') return null

  return (
    <a
      href={asset.original_url}
      target="_blank"
      rel="noopener noreferrer"
      className="absolute bottom-4 right-4 z-10 rounded-full bg-black/60 px-4 py-2 font-poppins text-body-s font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-white"
    >
      Open PDF
    </a>
  )
}
