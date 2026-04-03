import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { moduleImagesApi, ModuleImageFilters } from '@/services/moduleImagesApi'

function invalidateModuleImagesQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['module-images'] })
  queryClient.invalidateQueries({ queryKey: ['module-image-kvks'] })
}

export function useModuleImages(filters: ModuleImageFilters) {
  return useQuery({
    queryKey: ['module-images', filters],
    queryFn: () => moduleImagesApi.list(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000,
  })
}

export function useModuleImageCategories(enabled = true) {
  return useQuery({
    queryKey: ['module-image-categories'],
    queryFn: () => moduleImagesApi.listCategories(),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useModuleImageKvks(enabled = true) {
  return useQuery({
    queryKey: ['module-image-kvks'],
    queryFn: () => moduleImagesApi.listKvks(),
    enabled,
    staleTime: 60 * 1000,
    refetchOnMount: 'always',
  })
}

export function useCreateModuleImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: moduleImagesApi.create,
    onSuccess: () => invalidateModuleImagesQueries(queryClient),
  })
}
