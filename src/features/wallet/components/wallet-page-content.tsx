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
import { StudioMobileHeader } from '@/features/studio/components/studio-mobile-header'
import { Button } from '@/components'

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

      // Keep the Studio `section` param. On mobile it is what keeps the wallet
      // screen open; dropping it sends the user back to the Studio menu.
      const section = searchParams.get('section')
      if (section) params.set('section', section)

      const query = params.toString()
      // replace (not push): filter tweaks shouldn't pile up in history
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams]
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

  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    error: summaryError,
    refetch: refetchSummary,
    isRefetching: isSummaryRefetching,
  } = useWalletSummary(period)
  const { data: activity = [], isLoading: isActivityLoading, isError, refetch } = useWalletActivity()

  const { data: pageData, total, totalPages } = React.useMemo(() => applyWalletFilters(activity, filters), [activity, filters])

  return (
    <div className="flex min-h-0 flex-col lg:h-full w-full overflow-hidden">
      <StudioMobileHeader
        title="Wallet"
        action={
          <Button variant="primary" onClick={() => setIsWithdrawOpen(true)} className="h-10 w-37 shrink-0 gap-2 px-4" leftIcon="/icons/plus-white-bg.svg">
            Withdraw
          </Button>
        }
      />

      <div className="flex flex-col gap-y-4 bg-white p-4 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:rounded-2xl lg:bg-[#F5FAFA]">
        <div className="flex shrink-0 flex-col gap-y-4">
          <WalletSummaryHeader period={period} onPeriodChange={handlePeriodChange} onWithdrawClick={() => setIsWithdrawOpen(true)} />

          <WalletSummaryCards
            summary={summary}
            isLoading={isSummaryLoading}
            isError={isSummaryError}
            error={summaryError}
            onRetry={() => void refetchSummary()}
            isRetrying={isSummaryRefetching}
          />

          <WalletFilterBar
            filters={filters}
            onFiltersChange={updateFilters}
            resultCount={total}
            isFiltered={hasActiveWalletFilters(filters)}
          />
        </div>

        <div className="flex flex-col gap-y-4 lg:min-h-[240px] lg:flex-1 lg:overflow-y-auto">
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
        </div>

        <WithdrawModal
          open={isWithdrawOpen}
          onOpenChange={setIsWithdrawOpen}
          availableBalance={summary?.available_balance.amount ?? 0}
        />
      </div>
    </div>
  )
}