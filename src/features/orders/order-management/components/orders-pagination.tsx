'use client'

import { ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPageItems } from '../lib/pagination'

type Props = { page: number; totalPages: number; onPageChange: (page: number) => void }

export function OrdersPagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null

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
                aria-label={`Page ${item}`}
                aria-current={item === page ? 'page' : undefined}
                className={cn(
                  'flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border font-poppins text-body-s font-medium transition-colors',
                  item === page
                    ? 'border-2 border-primary-500 text-gray-500'
                    : 'border-gray-50 text-gray-400 hover:border-gray-100 hover:bg-secondary-50',
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
