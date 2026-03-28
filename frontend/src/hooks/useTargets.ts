import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { targetsApi, TargetFilters, UpdateTargetPayload } from '@/services/targetsApi'

function invalidateTargetQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['targets'] })
}

export function useTargets(filters: TargetFilters) {
  return useQuery({
    queryKey: ['targets', filters],
    queryFn: () => targetsApi.list(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000,
  })
}

export function useTargetTypes(enabled = true) {
  return useQuery({
    queryKey: ['target-types'],
    queryFn: () => targetsApi.listTypes(),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useTargetKvks(enabled = true) {
  return useQuery({
    queryKey: ['target-kvks'],
    queryFn: () => targetsApi.listKvks(),
    enabled,
    staleTime: 60 * 1000,
    refetchOnMount: 'always',
  })
}

export function useCreateTarget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: targetsApi.create,
    onSuccess: () => invalidateTargetQueries(queryClient),
  })
}

export function useUpdateTarget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ targetId, ...data }: UpdateTargetPayload & { targetId: number }) =>
      targetsApi.update(targetId, data),
    onSuccess: () => invalidateTargetQueries(queryClient),
  })
}

export function useDeleteTarget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (targetId: number) => targetsApi.remove(targetId),
    onSuccess: () => invalidateTargetQueries(queryClient),
  })
}
