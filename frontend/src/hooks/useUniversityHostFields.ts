import { useQuery } from '@tanstack/react-query'
import { masterDataApi } from '@/services/masterDataApi'
import type { University } from '@/types/masterData'
import { useAuth } from '@/contexts/AuthContext'

export function useUniversityHostFields(universityId?: number | null) {
    const { user } = useAuth()

    const query = useQuery({
        queryKey: ['university-host-fields', universityId, user?.userId, user?.role],
        queryFn: async () => {
            if (!universityId) return null as unknown as University
            const resp = await masterDataApi.getUniversityById(universityId)
            return resp.data
        },
        enabled: !!universityId,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    })

    const uni = query.data as University | undefined
    const host = uni
        ? {
              universityName: uni.universityName,
              hostOrg: uni.hostOrg,
              hostMobile: uni.hostMobile ?? null,
              hostLandline: uni.hostLandline ?? null,
              hostFax: uni.hostFax ?? null,
              hostEmail: uni.hostEmail ?? null,
              hostAddress: uni.hostAddress ?? null,
          }
        : {
              universityName: '',
              hostOrg: '',
              hostMobile: null,
              hostLandline: null,
              hostFax: null,
              hostEmail: null,
              hostAddress: null,
          }

    return {
        data: host,
        loading: query.isLoading,
        error: query.error ? (query.error as Error).message : null,
        refetch: query.refetch,
    }
}

