'use client'

import { PackageSearch, AlertTriangle } from 'lucide-react'
import { useMyDownloads } from '@/hooks/use-delivery'
import { DownloadCard } from './download-card'
import { Skeleton } from '@/components/ui/skeleton'

function DownloadCardSkeleton() {
  return (
    <div className="w-full border border-gray-50 rounded-xl p-4 flex items-center gap-x-4" aria-hidden="true">
      <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
      <div className="min-w-0 flex-1 flex flex-col gap-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-12 w-28 rounded-[var(--radius-2xl)] shrink-0" />
    </div>
  )
}

export function DownloadsPageContent() {
  const { data: downloads, isLoading, isError, refetch } = useMyDownloads()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-y-3 w-full">
        {Array.from({ length: 3 }).map((_, i) => (
          <DownloadCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="border-2 border-gray-50 rounded-xl bg-white min-h-[300px] flex flex-col items-center justify-center gap-y-3 text-center">
        <AlertTriangle size={40} className="text-error-500" />
        <p className="font-poppins text-body-s text-body">Couldn&apos;t load your downloads</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="font-poppins text-body-s text-primary-500 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!downloads || downloads.length === 0) {
    return (
      <div className="border-2 border-gray-50 rounded-xl bg-white min-h-[300px] flex flex-col items-center justify-center gap-y-3 text-center">
        <PackageSearch size={40} className="text-gray-200" />
        <p className="font-poppins text-body-s text-body">No digital purchases yet</p>
        <p className="font-poppins text-body-xs text-gray-200">
          Digital artwork you buy will show up here, ready to download.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-y-3 w-full">
      {downloads.map((token) => (
        <DownloadCard key={token.id} token={token} />
      ))}
    </div>
  )
}
