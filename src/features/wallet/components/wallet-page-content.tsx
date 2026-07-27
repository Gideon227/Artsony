'use client'

import * as React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Pagination } from '@/components/ui/pagination'
import { useWalletSummary, useWalletActivity } from '@/hooks/queries/use-wallet'
import { applyWalletFilters, hasActiveWalletFilters, type WalletActivityFilters } from '@/lib/wallet/filters'
import { walletFiltersFromSearchParams, walletFiltersToSearchParams, walletPeriodFromSearchParams } from '@/lib/wallet/url-filters'
import type { WalletPeriod } from '@/types/wallet'
import { WalletSummaryCards, WalletSummaryHeader } from './wallet-summary-cards'
import { WalletFilterBar } from './wallet-filter-bar'
import { WalletActivityTable } from './wallet-activity-table'
import { WithdrawModal } from './withdraw-modal'

export function WalletPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isWithdrawOpen, setIsWithdrawOpen] = React.useState(false)

  const period = React.useMemo(() => walletPeriodFromSearchParams(searchParams), [searchParams])
  const filters = React.useMemo(() => walletFiltersFromSearchParams(searchParams), [searchParams])

  const updateSearchParams = React.useCallback(
    (nextPeriod: WalletPeriod, nextFilters: WalletActivityFilters) => {
      const params = walletFiltersToSearchParams(nextFilters)
      if (nextPeriod !== 'WEEK') params.set('period', nextPeriod)
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router]
  )

  const updateFilters = React.useCallback(
    (updater: (prev: WalletActivityFilters) => WalletActivityFilters) => {
      updateSearchParams(period, updater(filters))
    },
    [filters, period, updateSearchParams]
  )

  const handlePeriodChange = React.useCallback(
    (nextPeriod: WalletPeriod) => updateSearchParams(nextPeriod, filters),
    [filters, updateSearchParams]
  )

  const { data: summary, isLoading: isSummaryLoading } = useWalletSummary(period)
  const { data: activity = [], isLoading: isActivityLoading, isError, refetch } = useWalletActivity()

  const { data: pageData, total, totalPages } = React.useMemo(() => applyWalletFilters(activity, filters), [activity, filters])

  return (
    <div style={{ backgroundColor: '#F5FAFA' }} className="flex p-4 flex-col gap-y-4 bg-secondary-50 rounded-2xl">
      <WalletSummaryHeader period={period} onPeriodChange={handlePeriodChange} onWithdrawClick={() => setIsWithdrawOpen(true)} />

      <WalletSummaryCards summary={summary} isLoading={isSummaryLoading} />

      <WalletFilterBar
        filters={filters}
        onFiltersChange={updateFilters}
        resultCount={total}
        isFiltered={hasActiveWalletFilters(filters)}
      />

      <WalletActivityTable
        activity={pageData}
        isLoading={isActivityLoading}
        isError={isError}
        onRetry={() => refetch()}
      />

      {!isActivityLoading && !isError && pageData.length > 0 && (
        <Pagination
          page={filters.page}
          totalPages={totalPages}
          onPageChange={(page) => updateFilters((prev) => ({ ...prev, page }))}
          className="pb-2"
        />
      )}

      <WithdrawModal
        open={isWithdrawOpen}
        onOpenChange={setIsWithdrawOpen}
        availableBalance={summary?.available_balance.amount ?? 0}
      />
    </div>
  )
}
