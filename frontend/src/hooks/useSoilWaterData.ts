import { useQuery } from '@tanstack/react-query';
import { soilWaterApi } from '../services/soilWaterApi';

export function useSoilWaterAnalysisMasters() {
    return useQuery({
        queryKey: ['soil-water-analysis-masters'],
        queryFn: () => soilWaterApi.getAnalysisMasters().then((res: any) => res.data),
        staleTime: 5 * 60 * 1000,
    });
}
