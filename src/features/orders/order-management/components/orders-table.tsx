'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronsRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { formatOrderDate } from '@/lib/orders/format'
import type { SellerSaleLine } from '@/types/seller-sales'
import { ORDER_PAGE_SIZE } from '../lib/filters'
import { formatMoney } from '../lib/format'
import { OrdersPagination } from './orders-pagination'
import { SalesStatusPill } from './sales-status-pill'

const GRID = 'grid-cols-[138fr_104fr_104fr_104fr_140fr_74fr_54fr_79fr_40fr]'
const HEADERS = ['Order ID', 'Artwork Title', 'Type', 'Buyers Name', 'Date Purchased', 'Status', 'Quantity', 'Price', 'Action']

type Props = {
  rows: SellerSaleLine[]
  isFetching: boolean
  isRefreshError: boolean
  onRetry: () => void
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  getRowHref: (row: SellerSaleLine) => string
}

function PackageBadge() {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-gray-50 bg-white">
      <Image src="/home/box-black.svg" width={24} height={24} alt="" aria-hidden="true" />
    </span>
  )
}

function ActionLink({ href, code }: { href: string; code: string }) {
  return (
    <Link
      href={href}
      aria-label={`View order ${code}`}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-50 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 active:scale-95"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-400 text-white">
        <ChevronsRight className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
    </Link>
  )
}

function RefreshBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="flex items-center justify-between gap-4 border-b border-error-100 bg-error-50 px-4 py-3 font-poppins text-body-xs text-error-700">
      <span>We couldn&apos;t refresh your orders.</span>
      <button type="button" onClick={onRetry} className="cursor-pointer font-medium text-primary-500 hover:underline">
        Retry
      </button>
    </div>
  )
}

export function OrdersTable({ rows, isFetching, isRefreshError, onRetry, page, totalPages, onPageChange, getRowHref }: Props) {
  return (
    <div className="flex flex-col gap-2.5" aria-busy={isFetching}>
      <div className="hidden xl:block">
        <div role="table" aria-label="Orders" className="flex flex-col gap-2.5">
          <div role="row" className={cn('grid gap-4 h-12 items-center rounded-full border border-gray-50 bg-white p-4', GRID)}>
            {HEADERS.map((header) => (
              <div key={header} role="columnheader" className={cn('truncate font-poppins text-[12px] text-body', header === 'Quantity' && 'text-center')}>
                {header}
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-[32px] border border-gray-50 bg-white">
            {isRefreshError && <RefreshBanner onRetry={onRetry} />}
            <div role="rowgroup" className={cn('transition-opacity', isFetching && 'opacity-60')}>
              {rows.map((row, index) => (
                <div key={row.order_item_id} role="row" className={cn('grid h-16 items-center gap-4 px-4 py-3 font-poppins text-body-s tracking-wide text-body', GRID, `${rows.length > 1 && 'border-b border-gray-50'}`)}>
                  <div role="cell" className="flex min-w-0 items-center gap-2">
                    <PackageBadge />
                    <span className="truncate font-poppins text-body-xs text-center text-heading">{row.order_code}</span>
                  </div>
                  <div role="cell" className="truncate font-poppins text-body-xs text-center text-body" title={row.artwork_title}>{row.artwork_title}</div>
                  <div role="cell" className="truncate font-poppins text-body-xs text-center text-body">{row.artwork_format === 'PHYSICAL' ? 'Physical' : 'Digital'}</div>
                  <div role="cell" className="truncate font-poppins text-body-xs text-center text-body" title={row.buyer_name}>{row.buyer_name}</div>
                  <div role="cell" className="truncate font-poppins text-body-xs text-center text-body">{formatOrderDate(row.purchased_at)}</div>
                  <div role="cell"><SalesStatusPill status={row.seller_status} /></div>
                  <div role="cell" className="text-center">{row.quantity}</div>
                  <div role="cell" className="truncate font-poppins text-body-xs text-center text-body">{formatMoney(row.line_total, row.currency)}</div>
                  <div role="cell"><ActionLink href={getRowHref(row)} code={row.order_code} /></div>
                </div>
              ))}
            </div>
            <OrdersPagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 xl:hidden">
        {isRefreshError && <RefreshBanner onRetry={onRetry} />}
        <ul className={cn('flex flex-col gap-3 transition-opacity', isFetching && 'opacity-60')}>
          {rows.map((row) => (
            <li key={row.order_item_id} className="flex flex-col gap-4 rounded-[24px] border border-gray-50 bg-white p-4 font-poppins tracking-wide">
              <div className="flex items-center gap-3">
                <PackageBadge />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body-s font-medium text-gray-500">{row.order_code}</p>
                  <p className="truncate text-body-xs text-gray-300">{row.artwork_title}</p>
                </div>
                <SalesStatusPill status={row.seller_status} />
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-body-xs">
                {[
                  ['Type', row.artwork_format === 'PHYSICAL' ? 'Physical' : 'Digital'],
                  ['Buyer', row.buyer_name],
                  ['Purchased', formatOrderDate(row.purchased_at)],
                  ['Quantity', String(row.quantity)],
                ].map(([label, value]) => (
                  <div key={label} className="min-w-0">
                    <dt className="text-gray-300">{label}</dt>
                    <dd className="truncate text-body-s text-gray-400">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                <span className="text-body-m font-medium text-gray-500">{formatMoney(row.line_total, row.currency)}</span>
                <ActionLink href={getRowHref(row)} code={row.order_code} />
              </div>
            </li>
          ))}
        </ul>
        <div className="max-lg:hidden rounded-[24px] border border-gray-50 bg-white">
          <OrdersPagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      </div>
    </div>
  )
}

export function OrdersTableSkeleton() {
  return (
    <div className="flex flex-col gap-2.5" aria-busy="true" aria-label="Loading orders">
      <Skeleton className="hidden h-[46px] rounded-full xl:block" />
      <div className="overflow-hidden rounded-[24px] border border-gray-50 bg-white xl:rounded-[32px]">
        {Array.from({ length: ORDER_PAGE_SIZE }).map((_, index) => (
          <div key={index} className="flex h-16 items-center gap-4 border-b border-gray-50 px-4 last:border-b-0">
            <Skeleton className="h-10 w-10 shrink-0 rounded-[12px]" />
            <Skeleton className="h-3 w-24 rounded-full" />
            <Skeleton className="ml-auto h-3 w-1/3 rounded-full" />
            <Skeleton className="hidden h-6 w-[74px] rounded-[8px] xl:block" />
          </div>
        ))}
      </div>
    </div>
  )
}
