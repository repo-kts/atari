import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productionSupplyApi } from '../services/productionSupplyApi';
import type { ProductionSupplyFormData } from '../types/productionSupply';

/**
 * Hook for fetching all production supply records
 * @param {object} filters - Optional filters
 * @returns {object} Query result with data, loading state, and error
 */
export function useProductionSupplies(filters?: Record<string, any>) {
    const query = useQuery({
        queryKey: ['production-supplies', filters],
        queryFn: () => productionSupplyApi.getProductionSupplies(filters).then((res) => res.data),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    return {
        data: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
    };
}

/**
 * Hook for fetching a single production supply record by ID
 * @param {string} id - Production supply UUID
 * @param {boolean} enabled - Whether the query should run
 * @returns {object} Query result with data, loading state, and error
 */
export function useProductionSupplyById(id: string | null | undefined, enabled: boolean = true) {
    const query = useQuery({
        queryKey: ['production-supply', id],
        queryFn: () => productionSupplyApi.getProductionSupplyById(id!).then((res) => res.data),
        enabled: enabled && !!id,
        staleTime: 5 * 60 * 1000,
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
    };
}

/**
 * Hook for production supply CRUD operations
 * @returns {object} Mutations and query client
 */
export function useProductionSupplyMutations() {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (data: ProductionSupplyFormData) => productionSupplyApi.createProductionSupply(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['production-supplies'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<ProductionSupplyFormData> }) =>
            productionSupplyApi.updateProductionSupply(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['production-supplies'] });
            queryClient.invalidateQueries({ queryKey: ['production-supply'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => productionSupplyApi.deleteProductionSupply(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['production-supplies'] });
        },
    });

    return {
        create: createMutation.mutateAsync,
        update: updateMutation.mutateAsync,
        remove: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
