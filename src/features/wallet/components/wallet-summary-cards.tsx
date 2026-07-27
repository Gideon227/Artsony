'use client'

import * as React from 'react'
import { ArrowDown, ArrowUp, BarChart3, Clock, CreditCard, DollarSign, HelpCircle, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components'
import { Dropdown, type DropdownOption } from '@/components/ui/dropdown'
import { formatUsd } from '@/lib/wallet/format'
import type { WalletMetric, WalletPeriod, WalletSummary } from '@/types/wallet'
import Image from 'next/image'

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
  return (
    <div className="flex items-center justify-between gap-4">
      <Dropdown
        options={PERIOD_OPTIONS}
        value={PERIOD_OPTIONS.find((opt) => opt.id === period)}
        onChange={(option) => onPeriodChange(option.id as WalletPeriod)}
        rightIcon='/icons/alt-arrow-down.svg'
        className="w-54 h-12"
      />

      <Button variant="primary" size="lg" onClick={onWithdrawClick} className="gap-2 h-12" leftIcon='/icons/plus-white-bg.svg'>
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
  showHelp?: boolean
}

const CARDS: MetricCardConfig[] = [
  { key: 'total_earnings', label: 'Total Earnings', icon: '/wallet/money-wad.svg', iconBg: 'bg-gray-100', valueClassName: 'text-primary-500' },
  { key: 'available_balance', label: 'Available Balance', icon: '/wallet/dollar.svg', iconBg: 'bg-successful-100', showHelp: true },
  { key: 'pending_balance', label: 'Pending Balance', icon: '/wallet/money-wad-yellow.svg', iconBg: 'bg-warning-100', showHelp: true },
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
  const isUp = metric.direction === 'UP'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-body-xs font-medium',
        isUp ? 'text-success-600' : 'text-error-600'
      )}
    >
      {isUp ? <ArrowUp className="h-3.5 w-3.5" strokeWidth={2} /> : <ArrowDown className="h-3.5 w-3.5" strokeWidth={2} />}
      {metric.change_percent}% {isUp ? 'Up' : 'Down'}
    </span>
  )
}

export type WalletSummaryCardsProps = {
  summary: WalletSummary | undefined
  isLoading: boolean
}

export function WalletSummaryCards({ summary, isLoading }: WalletSummaryCardsProps) {
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
          <div key={card.key} className="flex-1 rounded-xl border border-gray-50 bg-white p-4 flex flex-col gap-y-8">
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
              {card.showHelp && (
                <button type="button" aria-label={`About ${card.label.toLowerCase()}`} className="text-info-500">
                  <HelpCircle className="h-4 w-4" strokeWidth={1.75} />
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
