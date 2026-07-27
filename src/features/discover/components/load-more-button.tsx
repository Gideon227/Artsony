'use client'

import { Loader2 } from 'lucide-react'

type LoadMoreButtonProps = {
  onClick: () => void
  isLoading?: boolean
}

export function LoadMoreButton({ onClick, isLoading = false }: LoadMoreButtonProps) {
  return (
    <div className="flex justify-center py-10">
      <button
        type="button"
        onClick={onClick}
        disabled={isLoading}
        className="flex items-center gap-2 rounded-full border border-primary-200 bg-white px-6 py-3 font-poppins text-[14px] font-medium text-neutral-600 transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Loader2 className={`h-4 w-4 text-primary-500 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? 'Loading…' : 'Load more Art ?'}
      </button>
    </div>
  )
}
