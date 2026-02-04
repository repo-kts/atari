import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productionProjectsApi } from '../services/productionProjectsApi';
import type {
    ProductCategoryFormData,
    ProductTypeFormData,
    ProductFormData,
    CraCroppingSystemFormData,
    CraFarmingSystemFormData,
    AryaEnterpriseFormData,
} from '../types/productionProjects';

// ============================================
// Product Category Hooks
// ============================================

export function useProductCategories() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['product-categories'],
        queryFn: () => productionProjectsApi.getProductCategories().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: ProductCategoryFormData) => productionProjectsApi.createProductCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-categories'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<ProductCategoryFormData> }) =>
            productionProjectsApi.updateProductCategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-categories'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => productionProjectsApi.deleteProductCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-categories'] });
        },
    });

    return {
        data: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        create: createMutation.mutateAsync,
        update: updateMutation.mutateAsync,
        remove: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}

// ============================================
// Product Type Hooks
// ============================================

export function useProductTypes() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['product-types'],
        queryFn: () => productionProjectsApi.getProductTypes().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: ProductTypeFormData) => productionProjectsApi.createProductType(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-types'] });
            queryClient.invalidateQueries({ queryKey: ['product-categories'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<ProductTypeFormData> }) =>
            productionProjectsApi.updateProductType(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-types'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => productionProjectsApi.deleteProductType(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-types'] });
            queryClient.invalidateQueries({ queryKey: ['product-categories'] });
        },
    });

    return {
        data: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        create: createMutation.mutateAsync,
        update: updateMutation.mutateAsync,
        remove: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}

// ============================================
// Product Hooks
// ============================================

export function useProducts() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['products'],
        queryFn: () => productionProjectsApi.getProducts().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: ProductFormData) => productionProjectsApi.createProduct(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product-categories'] });
            queryClient.invalidateQueries({ queryKey: ['product-types'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<ProductFormData> }) =>
            productionProjectsApi.updateProduct(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => productionProjectsApi.deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product-categories'] });
            queryClient.invalidateQueries({ queryKey: ['product-types'] });
        },
    });

    return {
        data: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        create: createMutation.mutateAsync,
        update: updateMutation.mutateAsync,
        remove: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}

// ============================================
// CRA Cropping System Hooks
// ============================================

export function useCraCroppingSystems() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['cra-cropping-systems'],
        queryFn: () => productionProjectsApi.getCraCroppingSystems().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: CraCroppingSystemFormData) => productionProjectsApi.createCraCroppingSystem(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cra-cropping-systems'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<CraCroppingSystemFormData> }) =>
            productionProjectsApi.updateCraCroppingSystem(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cra-cropping-systems'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => productionProjectsApi.deleteCraCroppingSystem(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cra-cropping-systems'] });
        },
    });

    return {
        data: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        create: createMutation.mutateAsync,
        update: updateMutation.mutateAsync,
        remove: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}

// ============================================
// CRA Farming System Hooks
// ============================================

export function useCraFarmingSystems() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['cra-farming-systems'],
        queryFn: () => productionProjectsApi.getCraFarmingSystems().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: CraFarmingSystemFormData) => productionProjectsApi.createCraFarmingSystem(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cra-farming-systems'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<CraFarmingSystemFormData> }) =>
            productionProjectsApi.updateCraFarmingSystem(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cra-farming-systems'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => productionProjectsApi.deleteCraFarmingSystem(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cra-farming-systems'] });
        },
    });

    return {
        data: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        create: createMutation.mutateAsync,
        update: updateMutation.mutateAsync,
        remove: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}

// ============================================
// Arya Enterprise Hooks
// ============================================

export function useAryaEnterprises() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['arya-enterprises'],
        queryFn: () => productionProjectsApi.getAryaEnterprises().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: AryaEnterpriseFormData) => productionProjectsApi.createAryaEnterprise(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['arya-enterprises'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<AryaEnterpriseFormData> }) =>
            productionProjectsApi.updateAryaEnterprise(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['arya-enterprises'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => productionProjectsApi.deleteAryaEnterprise(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['arya-enterprises'] });
        },
    });

    return {
        data: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        create: createMutation.mutateAsync,
        update: updateMutation.mutateAsync,
        remove: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}

// ============================================
// Statistics Hook
// ============================================

export function useProductionProjectsStats() {
    return useQuery({
        queryKey: ['production-projects-stats'],
        queryFn: () => productionProjectsApi.getStats().then((res) => res.data),
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}
