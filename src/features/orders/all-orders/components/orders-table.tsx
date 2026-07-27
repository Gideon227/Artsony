'use client'

import Link from 'next/link'
import { Package, ChevronRight, RotateCcw } from 'lucide-react'
import type { Order } from '@/types/order'
import { OrderStatusBadge } from './order-status-badge'
import {
  formatOrderCode,
  formatOrderDate,
  formatCurrency,
  getArtworkTitleDisplay,
  getArtworkFormatDisplay,
  getBuyerDisplayName,
  getTotalQuantity,
} from '@/lib/orders/format'

const COLUMNS = ['Order ID', 'Artwork Title', 'Type', 'Buyers Name', 'Date Purchased', 'Status', 'Quantity', 'Price', 'Action']

export type OrdersTableProps = {
  orders: Order[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  getDetailHref: (order: Order) => string
}

function OrdersTable({ orders, isLoading, isError, onRetry, getDetailHref }: OrdersTableProps) {
    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-gray-50 py-20 text-center">
                <p className="font-poppins text-body-m font-semibold text-heading">Couldn't load your orders</p>
                <p className="max-w-sm text-body-s text-body">Check your connection and try again. If this keeps happening, refresh the page.</p>
                <button
                    type="button"
                    onClick={onRetry}
                    className="flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-body-s font-semibold text-white transition-colors hover:bg-primary-600"
                >
                    <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
                    Retry
                </button>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="overflow-hidden flex flex-col gap-y-2">
                <div style={{ gridTemplateColumns: "3.5fr 2.5fr 2.5fr 2.5fr 4fr 2fr 54px 2fr 1fr" }} className="p-4 grid w-full gap-4 bg-white rounded-2xl border border-gray-50 grid-cols-[1fr_2fr_100px_1.5fr_1fr_1fr_80px_1fr_80px]">
                    {COLUMNS.map((col) => (
                        <span key={col} className="text-body-xs font-poppins text-start text-body tracking-wide text-nowrap">
                            {col}
                        </span>
                    ))}
                </div>

                <ul>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <li key={i} className="flex items-center gap-4 px-6 py-4">
                            <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-gray-50" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 w-1/4 animate-pulse rounded bg-gray-50" />
                                <div className="h-3 w-1/3 animate-pulse rounded bg-gray-50" />
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        )
    }

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl py-20 text-center">
                <Package className="h-10 w-10 text-text-alt-grey" strokeWidth={1.5} />
                <p className="font-poppins text-body-m font-semibold text-heading">No orders match your filters</p>
                <p className="max-w-sm text-body-s text-body">Try adjusting or clearing your filters to see more results.</p>
            </div>
        )
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-50">
            <table className="w-full table">
                <thead>
                    <tr style={{ gridTemplateColumns: "3.5fr 2.5fr 2.5fr 2.5fr 4fr 2fr 54px 2fr 1fr" }} className="p-4 grid w-full gap-4 bg-white rounded-2xl border border-gray-50 grid-cols-[1fr_2fr_100px_1.5fr_1fr_1fr_80px_1fr_80px]">
                        {COLUMNS.map((col) => (
                            <th key={col} className="text-body-xs font-poppins text-start text-body tracking-wide text-nowrap">
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {orders.map((order) => (
                        <tr key={order.id} className="border-t border-gray-50 transition-colors hover:bg-secondary-50/40">
                        <td className="px-4 py-4 pl-6">
                            <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-50 bg-white">
                                <Package className="h-4 w-4 text-body" strokeWidth={1.5} />
                            </span>
                            <span className="whitespace-nowrap text-body-s font-medium text-heading">{formatOrderCode(order.id)}</span>
                            </div>
                        </td>
                        <td className="max-w-[160px] truncate px-4 py-4 text-body-s text-body">{getArtworkTitleDisplay(order)}</td>
                        <td className="px-4 py-4 text-body-s text-body">{getArtworkFormatDisplay(order)}</td>
                        <td className="max-w-[140px] truncate px-4 py-4 text-body-s text-body">{getBuyerDisplayName(order)}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-body-s text-body">{formatOrderDate(order.created_at)}</td>
                        <td className="px-4 py-4">
                            <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-4 text-body-s text-body">{getTotalQuantity(order)}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-body-s font-semibold text-heading">
                            {formatCurrency(order.subtotal, order.currency)}
                        </td>
                        <td className="px-4 py-4 pr-6">
                            <Link
                            href={getDetailHref(order)}
                            aria-label={`View order ${formatOrderCode(order.id)}`}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-500 text-white transition-colors hover:bg-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                            >
                            <ChevronRight className="h-4 w-4" strokeWidth={2} />
                            </Link>
                        </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <ul className="divide-y divide-border md:hidden">
                {orders.map((order) => (
                    <li key={order.id} className="flex flex-col gap-3 p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-body-s font-semibold text-heading">{formatOrderCode(order.id)}</span>
                            <OrderStatusBadge status={order.status} />
                        </div>
                        <p className="truncate text-body-s text-body">{getArtworkTitleDisplay(order)}</p>
                        <div className="flex items-center justify-between text-body-xs text-text-alt-grey">
                            <span>{getBuyerDisplayName(order)}</span>
                            <span>{formatOrderDate(order.created_at)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-body-s font-semibold text-heading">{formatCurrency(order.subtotal, order.currency)}</span>
                            <Link
                                href={getDetailHref(order)}
                                className="flex items-center gap-1 text-body-xs font-semibold text-primary-500"
                            >
                                View details
                                <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
                            </Link>
                        </div>
                    </li>   
                ))}
            </ul>
        </div>
    )
}

export { OrdersTable }