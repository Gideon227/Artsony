'use client'

import * as React from 'react'
import Image from 'next/image'
import { ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = { src: string | null; alt: string; sizes: string; className?: string }

export function ArtworkThumb({ src, alt, sizes, className }: Props) {
  const [failed, setFailed] = React.useState(false)
  const [loaded, setLoaded] = React.useState(false)

  React.useEffect(() => {
    setFailed(false)
    setLoaded(false)
  }, [src])

  return (
    <div className={cn('relative shrink-0 overflow-hidden bg-secondary-100', className)}>
      {src && !failed ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn('object-cover transition-opacity duration-300', loaded ? 'opacity-100' : 'opacity-0')}
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-gray-200">
          <ImageOff className="h-5 w-5" aria-label={alt} />
        </span>
      )}
    </div>
  )
}
