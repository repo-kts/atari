import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api';

export function useNicraCategories() {
    return useQuery({
        queryKey: ['nicra-categories'],
        queryFn: async () => {
            const res = await apiClient.get<any[]>('/forms/achievements/projects/nicra/masters/categories');
            return res || [];
        },
        staleTime: 5 * 60 * 1000,
    });
}

export function useNicraSubCategories(categoryId?: number) {
    return useQuery({
        queryKey: ['nicra-subcategories', categoryId],
        queryFn: async () => {
            const res = await apiClient.get<any[]>(`/forms/achievements/projects/nicra/masters/subcategories${categoryId ? `?categoryId=${categoryId}` : ''}`);
            return res || [];
        },
        enabled: categoryId !== undefined,
        staleTime: 5 * 60 * 1000,
    });
}
