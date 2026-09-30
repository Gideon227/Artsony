'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMarketplaceArtworks } from '@/hooks/use-artwork'
import { useOpenArtwork } from '@/hooks/use-artwork-viewer'
import type { Artwork } from '@/types/artwork'

function resolveThumbnail(artwork: Artwork) {
  const first = artwork.assets[0]
  return first?.thumbnail_url ?? first?.optimized_url ?? first?.original_url ?? '/placeholder.png'
}

export function AlsoLikeSection() {
  const { data, isLoading } = useMarketplaceArtworks(4)
  const artworks = data?.data ?? []
  const openArtwork = useOpenArtwork()

  if (!isLoading && artworks.length === 0) return null

  return (
    <section className="mt-16 flex flex-col gap-6 px-8">
      <div className="flex items-center justify-between">
        <h2 className="font-raleway text-[22px] font-semibold text-gray-900 tracking-wide">
          You may also like
        </h2>
        <Link
          href="/shop"
          className="rounded-full border border-primary-500 px-5 py-2 font-poppins text-[13px] font-medium text-primary-500 transition-colors hover:bg-primary-50"
        >
          See more
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-[24px] bg-gray-50" />
            ))
          : artworks.map((artwork) => {
              const artistName =
                artwork.creator?.profile?.display_name ?? artwork.creator?.username ?? 'Unknown artist'
              const avatarUrl = artwork.creator?.profile?.avatar_url ?? '/images/image-avatar.svg'

              return (
                <button
                  key={artwork.id}
                  type="button"
                  onClick={() => openArtwork(artwork, { siblings: artworks, variant: 'shop' })}
                  className="group relative aspect-square overflow-hidden rounded-[24px] bg-gray-50 text-left"
                >
                  <Image
                    src={resolveThumbnail(artwork)}
                    alt={artwork.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0" />

                  <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-white/50">
                        <Image src={avatarUrl} alt={artistName} fill className="object-cover" />
                      </span>
                      <span className="truncate font-poppins text-[12px] font-medium text-white">
                        {artistName}
                      </span>
                    </div>
                    {artwork.price != null && (
                      <span className="shrink-0 font-poppins text-[12px] font-semibold text-white">
                        $ {artwork.price.toLocaleString('en-US')}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
      </div>
    </section>
  )
}
