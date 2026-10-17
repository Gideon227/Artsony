import { studioRetry } from '@/lib/studio/query'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { scoreService } from '@/services/score.service'
import type { BuyerFeedbackSort, Score } from '@/types/score'

// One request feeds both the hero and the metric cards: they select their own
// slice of the same cached result instead of each fetching (and recomputing on
// the server) the whole breakdown.
function useScore<T>(select: (score: Score) => T) {
  return useQuery({
    queryKey: ['studio-score'],
    queryFn: () => scoreService.getScore(),
    select,
    staleTime: 60_000,
    retry: studioRetry,
  })
}

const selectOverview = (score: Score) => score.overview
const selectMetrics = (score: Score) => score.metrics

export function useScoreOverview() {
  return useScore(selectOverview)
}

export function useScoreMetrics() {
  return useScore(selectMetrics)
}

export function useBuyerFeedback(sort: BuyerFeedbackSort, from: Date | null, to: Date | null) {
  return useQuery({
    queryKey: ['buyer-feedback', sort, from?.toISOString() ?? null, to?.toISOString() ?? null],
    queryFn: () => scoreService.getBuyerFeedback(sort, from, to),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    retry: studioRetry,
  })
}
