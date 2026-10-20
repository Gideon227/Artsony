'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components'
import { useMediaQuery } from '@/hooks'
import { Dropdown, type DropdownOption } from '@/components/ui/dropdown'
import { DynamicTooltip } from '@/components/ui/dynamic-tooltip'
import { TrendIndicator as SharedTrendIndicator } from '@/components/ui/metric-card'
import { formatUsd } from '@/lib/wallet/format'
import { STUDIO_HELP, type StudioHelp } from '@/lib/studio/help-copy'
import type { WalletMetric, WalletPeriod, WalletSummary } from '@/types/wallet'
import Image from 'next/image'
import { StudioCardError } from '@/features/studio/components/studio-card-error'

const PERIOD_OPTIONS: DropdownOption[] = [
  { id: 'TODAY', label: 'Today' },
  { id: 'WEEK', label: 'Week' },
  { id: 'MONTH', label: 'Month' },
  { id: 'YEAR', label: 'Year' },
  { id: 'ALL_TIME', label: 'All Time' },
]

export type WalletSummaryHeaderProps = {
  period: WalletPeriod
  onPeriodChange: (period: WalletPeriod) => void
  onWithdrawClick: () => void
}

export function WalletSummaryHeader({ period, onPeriodChange, onWithdrawClick }: WalletSummaryHeaderProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  // Below `lg` the Withdraw action lives in the screen header (StudioMobileHeader).
  return (
    <div className="flex items-center justify-between gap-4">
      <Dropdown
        options={PERIOD_OPTIONS}
        value={PERIOD_OPTIONS.find((opt) => opt.id === period)}
        onChange={(option) => onPeriodChange(option.id as WalletPeriod)}
        rightIcon={isDesktop ? '/icons/alt-arrow-down.svg' : undefined}
        arrow="triangle"
        className="w-33 lg:w-54"
        // triggerClassName="h-10 lg:h-12"
      />

      <Button variant="primary" size="lg" onClick={onWithdrawClick} className="h-12 gap-2 max-lg:hidden" leftIcon='/icons/plus-white-bg.svg'>
        Withdrawal
      </Button>
    </div>
  )
}

type MetricCardConfig = {
  key: keyof Omit<WalletSummary, 'period'>
  label: string
  icon: string;
  iconBg: string
  valueClassName?: string
  help?: StudioHelp
}

const CARDS: MetricCardConfig[] = [
  { key: 'total_earnings', label: 'Total Earnings', icon: '/wallet/money-wad.svg', iconBg: 'bg-gray-100', valueClassName: 'text-primary-500' },
  { key: 'available_balance', label: 'Available Balance', icon: '/wallet/dollar.svg', iconBg: 'bg-successful-100', help: STUDIO_HELP.availableBalance },
  { key: 'pending_balance', label: 'Pending Balance', icon: '/wallet/money-wad-yellow.svg', iconBg: 'bg-warning-100', help: STUDIO_HELP.pendingBalance },
  { key: 'total_withdrawals', label: 'Total Withdrawals', icon: 'wallet/debit-card.svg', iconBg: 'bg-primary-50' },
]

function MetricCardSkeleton() {
  return (
    <div className="flex-1 rounded-2xl bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 animate-pulse rounded bg-gray-50" />
        <div className="h-9 w-9 animate-pulse rounded-full bg-gray-50" />
      </div>
      <div className="mt-6 h-7 w-32 animate-pulse rounded bg-gray-50" />
      <div className="mt-4 h-3 w-20 animate-pulse rounded bg-gray-50" />
    </div>
  )
}

export function TrendIndicator({ metric }: { metric: WalletMetric }) {
  return <SharedTrendIndicator trend={metric} />
}

export type WalletSummaryCardsProps = {
  summary: WalletSummary | undefined
  isLoading: boolean
  isError?: boolean
  error?: unknown
  onRetry?: () => void
  isRetrying?: boolean
}

export function WalletSummaryCards({ summary, isLoading, isError = false, error, onRetry, isRetrying }: WalletSummaryCardsProps) {
  if (isError && !summary && onRetry) {
    return <StudioCardError error={error} onRetry={onRetry} isRetrying={isRetrying ?? false} className="flex-none" />
  }

  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((c) => (
          <MetricCardSkeleton key={c.key} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {CARDS.map((card) => {
        const metric = summary[card.key]
        return (
          <div key={card.key} className="flex flex-1 flex-col gap-y-2 rounded-xl border border-gray-50 bg-white p-4 lg:gap-y-8">
            <div className="flex items-center justify-between">
              <span className="text-body-s font-poppins leading-6 text-body">{card.label}</span>
              <span className={cn('flex h-10 w-10 p-2 shrink-0 items-center justify-center rounded-full', card.iconBg)}>
                <Image src={card.icon} width={24} height={24} alt='icon' />
              </span>
            </div>

            <p className={cn('font-raleway text-h4 leading-10 font-medium text-heading', card.valueClassName)}>
              <span className="mr-1 font-normal text-h4 text-text-alt-grey">$</span>
              {formatUsd(metric.amount)}
            </p>

            <div className="flex items-center w-full justify-between">
              <TrendIndicator metric={metric} />
              {card.help && <DynamicTooltip title={card.help.title} content={card.help.content} iconSize={20} className="w-[212px]" />}
            </div>
          </div>
        )
      })}
    </div>
  )
}
