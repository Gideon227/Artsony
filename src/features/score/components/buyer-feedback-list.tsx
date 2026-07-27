'use client'

import * as React from 'react'
import Image from 'next/image'
import { Star } from 'lucide-react'
import { Dropdown, type DropdownOption } from '@/components/ui/dropdown'
import { DateRangePicker } from '@/components/ui/date-picker'
import { useBuyerFeedback } from '@/hooks/queries/use-score'
import { formatFeedbackTimestamp } from '@/lib/score/format'
import type { BuyerFeedbackSort } from '@/types/score'

const SORT_OPTIONS: DropdownOption[] = [
  { id: 'NEWEST', label: 'Newest' },
  { id: 'OLDEST', label: 'Oldest' },
  { id: 'HIGHEST_RATING', label: 'Highest Rating' },
  { id: 'LOWEST_RATING', label: 'Lowest Rating' },
]

function FeedbackRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-6 py-4">
      <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-gray-50" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-1/5 animate-pulse rounded bg-gray-50" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-gray-50" />
      </div>
    </div>
  )
}

export function BuyerFeedbackList() {
  const [sort, setSort] = React.useState<BuyerFeedbackSort>('NEWEST')
  const [dateFrom, setDateFrom] = React.useState<Date | null>(null)
  const [dateTo, setDateTo] = React.useState<Date | null>(null)

  const { data: feedback, isLoading, isError, refetch } = useBuyerFeedback(sort, dateFrom, dateTo)

  return (
    <div className="rounded-2xl border border-gray-50 bg-white">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-raleway text-h5 font-semibold text-heading">Buyer Feedback</h2>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Dropdown
            options={SORT_OPTIONS}
            value={SORT_OPTIONS.find((opt) => opt.id === sort)}
            onChange={(option) => setSort(option.id as BuyerFeedbackSort)}
            placeholder="Rating"
            className="w-44"
          />
          <DateRangePicker value={{ from: dateFrom, to: dateTo }} onChange={(range) => { setDateFrom(range.from); setDateTo(range.to) }} />
        </div>
      </div>

      {isError ? (
        <div className="flex flex-col items-center gap-3 border-t border-gray-50 py-14 text-center">
          <p className="text-body-s text-body">Couldn't load buyer feedback.</p>
          <button type="button" onClick={() => refetch()} className="text-body-s font-semibold text-primary-500">
            Retry
          </button>
        </div>
      ) : isLoading ? (
        <div className="divide-y divide-border border-t border-gray-50">
          {Array.from({ length: 5 }).map((_, i) => (
            <FeedbackRowSkeleton key={i} />
          ))}
        </div>
      ) : !feedback || feedback.length === 0 ? (
        <div className="border-t border-gray-50 py-14 text-center text-body-s text-body">
          No feedback yet for this range.
        </div>
      ) : (
        <div className="max-h-[420px] divide-y divide-gray-50 overflow-y-auto border-t border-gray-50">
          {feedback.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-6 py-4">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                <Image
                  src={item.avatar_url}
                  alt=""
                  aria-hidden="true"
                  fill
                  className="object-cover"
                  onError={(e) => {
                    ;(e.currentTarget as HTMLImageElement).src = '/images/placeholder-art.jpg'
                  }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-body-s font-medium text-heading">{item.reviewer_name}</p>
                <p className="line-clamp-2 text-body-s text-body">{item.comment}</p>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <span className="font-raleway text-body-m font-semibold text-[#FFC400]">{item.rating.toFixed(1)}</span>
                <Star className="h-4 w-4 fill-[#FFC400] text-[#FFC400]" strokeWidth={0} />
              </div>

              <div className="hidden shrink-0 text-body-s text-body sm:block">{formatFeedbackTimestamp(item.created_at)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
