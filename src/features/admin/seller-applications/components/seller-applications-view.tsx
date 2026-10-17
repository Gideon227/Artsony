'use client'

import { useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useAdminSellerRegistrations } from '@/hooks/use-seller'
import { getCountryName } from '@/hooks/use-location-data'
import type { SellerRegistrationStatus } from '@/services/seller.service'
import { ApplicationDialog, STATUS_BADGE } from './application-dialog'

const STATUS_TABS: Array<{ value: SellerRegistrationStatus; label: string }> = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'SUSPENDED', label: 'Suspended' },
]

const PAGE_SIZE = 10

const isStatus = (value: string | null): value is SellerRegistrationStatus =>
  STATUS_TABS.some((tab) => tab.value === value)

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

export function SellerApplicationsView() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const statusParam = searchParams.get('status')
  const status: SellerRegistrationStatus = isStatus(statusParam) ? statusParam : 'PENDING'
  const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1)

  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data, isLoading, isError, isFetching, refetch } = useAdminSellerRegistrations({
    status,
    page,
    limit: PAGE_SIZE,
  })

  const items = useMemo(() => data?.data ?? [], [data])
  const selected = useMemo(() => items.find((item) => item.id === selectedId), [items, selectedId])

  const navigate = (next: { status?: SellerRegistrationStatus; page?: number }) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('status', next.status ?? status)
    params.set('page', String(next.page ?? 1))
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <section className='mx-auto flex w-full max-w-5xl flex-col gap-y-8'>
      <header className='flex flex-col gap-y-2'>
        <h4 className='font-raleway font-semibold text-h4 text-primary-500 leading-10 tracking-wide'>Seller Applications</h4>
        <p className='font-poppins text-body-s text-heading leading-6 tracking-wide'>
          Review people who have applied to sell on Artsony, and manage existing sellers.
        </p>
      </header>

      <div role='tablist' aria-label='Application status' className='flex gap-2 overflow-x-auto pb-1'>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type='button'
            role='tab'
            aria-selected={status === tab.value}
            onClick={() => navigate({ status: tab.value })}
            className={cn(
              'shrink-0 rounded-full border px-5 py-2 font-poppins text-body-s font-medium tracking-wide transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
              status === tab.value
                ? 'border-primary-500 bg-primary-500 text-white'
                : 'border-gray-50 bg-white text-body hover:border-primary-500 hover:text-primary-500',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className='flex flex-col gap-y-4' aria-busy='true' aria-label='Loading applications'>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className='h-28 w-full rounded-2xl' />
          ))}
        </div>
      )}

      {isError && !data && (
        <div role='alert' className='flex flex-col items-start gap-y-4 rounded-2xl border border-gray-50 p-6'>
          <p className='font-poppins text-body-s text-heading'>We couldn&apos;t load the applications.</p>
          <Button size='lg' className='w-full sm:w-auto' onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {data && items.length === 0 && (
        <div className='rounded-2xl border border-gray-50 p-10 text-center'>
          <p className='font-poppins text-body-s text-body tracking-wide'>
            No {STATUS_TABS.find((tab) => tab.value === status)?.label.toLowerCase()} applications.
          </p>
        </div>
      )}

      {items.length > 0 && (
        <ul className={cn('flex flex-col gap-y-4 transition-opacity', isFetching && 'opacity-60')}>
          {items.map((item) => {
            const badge = STATUS_BADGE[item.status]
            return (
              <li
                key={item.id}
                className='flex flex-col gap-4 rounded-2xl border border-gray-50 bg-white p-4 sm:p-6 md:flex-row md:items-center md:justify-between'
              >
                <div className='flex min-w-0 flex-col gap-y-1'>
                  <p className='truncate font-poppins text-body-m font-semibold text-heading tracking-wide'>{item.full_name}</p>
                  <p className='break-all font-poppins text-body-xs text-body tracking-wide'>
                    @{item.username} · {item.email}
                  </p>
                  <p className='font-poppins text-body-xs text-text-disabled tracking-wide'>
                    {[item.state, getCountryName(item.country) ?? item.country].filter(Boolean).join(', ')} ·{' '}
                    {formatDate(item.created_at)}
                  </p>
                </div>

                <div className='flex items-center justify-between gap-4 md:justify-end'>
                  <Badge variant={badge.variant} size='lg'>{badge.label}</Badge>
                  <Button
                    size='lg'
                    variant='outline'
                    className='w-auto'
                    aria-label={`Review application from ${item.full_name}`}
                    onClick={() => setSelectedId(item.id)}
                  >
                    Review
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {data && (
        <Pagination
          page={data.page}
          totalPages={data.total_pages}
          onPageChange={(next) => navigate({ page: next })}
        />
      )}

      <ApplicationDialog registration={selected} onClose={() => setSelectedId(null)} />
    </section>
  )
}