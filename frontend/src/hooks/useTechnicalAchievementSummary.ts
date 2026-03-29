import { useQuery } from '@tanstack/react-query'
import { technicalAchievementSummaryApi } from '@/services/technicalAchievementSummaryApi'

export function useTechnicalSummaryFilters(enabled = true) {
  return useQuery({
    queryKey: ['technical-summary', 'filters'],
    queryFn: () => technicalAchievementSummaryApi.getFilterOptions(),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useTechnicalSummary(
  params: { reportingYear: number; kvkId?: number },
  enabled = true,
) {
  return useQuery({
    queryKey: ['technical-summary', params],
    queryFn: () => technicalAchievementSummaryApi.getSummary(params),
    enabled,
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000,
  })
}
