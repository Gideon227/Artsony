'use client'

import * as React from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type PaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

function getPageList(page: number, totalPages: number): (number | 'ellipsis')[] {
    if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1)

    const pages = new Set<number>([1, 2, totalPages - 1, totalPages, page - 1, page, page + 1])
    const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b)

    const result: (number | 'ellipsis')[] = []
    sorted?.forEach((p, i) => {
      if (i > 0 && p - sorted[i - 1]! > 1) result.push('ellipsis')
      result.push(p)
    })
    return result
  }

  function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
    if (totalPages <= 1) return null
    const pages = getPageList(page, totalPages)

    return (
      <nav aria-label="Pagination" className={cn('flex items-center justify-between', className)}>
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={cn(
            'flex items-center gap-2 text-body-s font-medium transition-colors',
            page <= 1 ? 'cursor-not-allowed text-text-disabled' : 'text-body hover:text-heading'
          )}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-50">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          </span>
          Previous
        </button>

        <ul className="flex items-center gap-2">
          {pages.map((p, i) =>
            p === 'ellipsis' ? (
              <li key={`ellipsis-${i}`} className="px-1 text-body-s text-text-alt-grey">
                …
              </li>
            ) : (
              <li key={p}>
                <button
                  type="button"
                  aria-current={p === page ? 'page' : undefined}
                  onClick={() => onPageChange(p)}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full text-body-s font-medium transition-colors',
                    p === page
                      ? 'border border-primary-500 text-primary-500'
                      : 'text-body hover:bg-neutral-50'
                  )}
                >
                  {p}
                </button>
              </li>
            )
          )}
        </ul>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className={cn(
            'flex items-center gap-2 text-body-s font-medium transition-colors',
            page >= totalPages ? 'cursor-not-allowed text-text-disabled' : 'text-primary-500 hover:text-primary-600'
          )}
        >
          Next
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-white">
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </span>
        </button>
      </nav>
    )
}

export { Pagination }