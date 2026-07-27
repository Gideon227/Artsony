import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { statsService } from '@/services/stats.service'
import type { WalletPeriod } from '@/types/wallet'
import type { ArtworkRankSort, EarningsOverviewRange, MiniStatPeriod } from '@/types/stats'

export function useStatsSummary(period: WalletPeriod) {
  return useQuery({
    queryKey: ['studio-stats-summary', period],
    queryFn: () => statsService.getSummary(period),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: 2,
  })
}

export function useMiniStat(metric: 'CR' | 'AOV', period: MiniStatPeriod) {
  return useQuery({
    queryKey: ['studio-mini-stat', metric, period],
    queryFn: () => statsService.getMiniStat(metric, period),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: 2,
  })
}

export function useFeaturedArtworks(sort: ArtworkRankSort) {
  return useQuery({
    queryKey: ['studio-featured-artworks', sort],
    queryFn: () => statsService.getFeaturedArtworks(sort),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: 2,
  })
}

export function useEarningsOverview(range: EarningsOverviewRange) {
  return useQuery({
    queryKey: ['studio-earnings-overview', range],
    queryFn: () => statsService.getEarningsOverview(range),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: 2,
  })
}
