import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { scoreService } from '@/services/score.service'
import type { BuyerFeedbackSort } from '@/types/score'

export function useScoreOverview() {
  return useQuery({
    queryKey: ['score-overview'],
    queryFn: () => scoreService.getOverview(),
    staleTime: 60_000,
    retry: 2,
  })
}

export function useScoreMetrics() {
  return useQuery({
    queryKey: ['score-metrics'],
    queryFn: () => scoreService.getMetrics(),
    staleTime: 60_000,
    retry: 2,
  })
}

export function useBuyerFeedback(sort: BuyerFeedbackSort, from: Date | null, to: Date | null) {
  return useQuery({
    queryKey: ['buyer-feedback', sort, from?.toISOString() ?? null, to?.toISOString() ?? null],
    queryFn: () => scoreService.getBuyerFeedback(sort, from, to),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    retry: 2,
  })
}
