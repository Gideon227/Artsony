'use client'

import { ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPageItems } from '../lib/pagination'

type Props = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  /**
   * Keep the bar on screen even with a single page (or none): Previous / Next
   * are disabled and the lone page number is shown but not clickable.
   * Without it the bar is hidden when there's nothing to paginate.
   */
  alwaysVisible?: boolean
}

export function OrdersPagination({ page: rawPage, totalPages: rawTotalPages, onPageChange, alwaysVisible = false }: Props) {
  if (rawTotalPages <= 1 && !alwaysVisible) return null

  const totalPages = Math.max(1, rawTotalPages)
  const page = Math.min(Math.max(1, rawPage), totalPages)
  const isSinglePage = totalPages === 1

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-2 px-4 py-5">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="inline-flex cursor-pointer items-center gap-3 font-poppins text-body-m font-medium tracking-wide text-gray-300 transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-400 text-white">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <span className="max-sm:sr-only">Previous</span>
      </button>

      <ul className="flex items-center gap-2 sm:gap-3">
        {getPageItems(page, totalPages).map((item) =>
          typeof item === 'number' ? (
            <li key={item}>
              <button
                type="button"
                onClick={() => onPageChange(item)}
                disabled={isSinglePage}
                aria-label={`Page ${item}`}
                aria-current={item === page ? 'page' : undefined}
                className={cn(
                  'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-gray-50 text-body font-poppins text-body-s font-medium transition-colors disabled:cursor-not-allowed',
                  item === page
                    ? 'ring-2 ring-offset-2 ring-primary-500 text-gray-500'
                    : ' hover:border-gray-100 hover:bg-secondary-50',
                )}
              >
                {item}
              </button>
            </li>
          ) : (
            <li key={item} aria-hidden="true" className="px-1 text-gray-300">
              …
            </li>
          ),
        )}
      </ul>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="inline-flex cursor-pointer items-center gap-3 font-poppins text-body-m font-medium tracking-wide text-primary-500 transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span className="max-sm:sr-only">Next</span>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white">
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </button>
    </nav>
  )
}