import { useQuery } from '@tanstack/react-query'
import { logHistoryApi, LogHistoryFilters } from '@/services/logHistoryApi'

export function useLogHistory(filters: LogHistoryFilters) {
  return useQuery({
    queryKey: ['log-history', filters],
    queryFn: () => logHistoryApi.getLogs(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000,
  })
}

export function useLogHistoryKvks() {
  return useQuery({
    queryKey: ['log-history-kvks'],
    queryFn: () => logHistoryApi.getKvks(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useLogHistoryUsers() {
  return useQuery({
    queryKey: ['log-history-users'],
    queryFn: () => logHistoryApi.getUsers(),
    staleTime: 5 * 60 * 1000,
  })
}
