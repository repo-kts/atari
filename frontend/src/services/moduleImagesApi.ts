import { apiClient, ApiError } from './api'

export interface ModuleImageCategory {
  moduleId: number
  moduleCode: string
  menuName: string
  subMenuName: string
  label: string
}

export interface ModuleImageCategoryGroup {
  menuName: string
  items: ModuleImageCategory[]
}

export interface ModuleImageKvkOption {
  kvkId: number
  kvkName: string
}

export interface ModuleImageRow {
  imageId: number
  kvkId: number
  kvkName: string
  moduleId: number
  moduleCode: string | null
  categoryLabel: string
  caption: string
  imageDate: string
  reportingYear: number
  mimeType: string
  fileName: string | null
  fileUrl: string
  downloadUrl: string
  uploadedBy: {
    userId: number
    name: string
    email: string
  } | null
  createdAt: string
}

export interface ModuleImageListMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ModuleImageListResponse {
  data: ModuleImageRow[]
  meta: ModuleImageListMeta
}

export interface ModuleImageFilters {
  page?: number
  limit?: number
  reportingYear?: number
  kvkId?: number
  moduleId?: number
  search?: string
}

export interface CreateModuleImagePayload {
  moduleId: number
  caption: string
  imageDate: string
  imageBase64: string
  fileName?: string
}

function buildQueryString(params?: Record<string, string | number | undefined>): string {
  if (!params) return ''

  const sp = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      sp.append(key, String(value))
    }
  })
  const query = sp.toString()
  return query ? `?${query}` : ''
}

export const moduleImagesApi = {
  list: async (filters: ModuleImageFilters = {}): Promise<ModuleImageListResponse> => {
    try {
      const query = buildQueryString({
        page: filters.page,
        limit: filters.limit,
        reportingYear: filters.reportingYear,
        kvkId: filters.kvkId,
        moduleId: filters.moduleId,
        search: filters.search,
      })
      return await apiClient.get<ModuleImageListResponse>(`/admin/module-images${query}`)
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.data?.error || 'Failed to fetch module images')
      }
      throw error
    }
  },

  listCategories: async (): Promise<ModuleImageCategory[]> => {
    try {
      return await apiClient.get<ModuleImageCategory[]>('/admin/module-images/categories')
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.data?.error || 'Failed to fetch categories')
      }
      throw error
    }
  },

  listKvks: async (): Promise<ModuleImageKvkOption[]> => {
    try {
      return await apiClient.get<ModuleImageKvkOption[]>('/admin/module-images/kvks')
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.data?.error || 'Failed to fetch KVK options')
      }
      throw error
    }
  },

  create: async (payload: CreateModuleImagePayload) => {
    try {
      return await apiClient.post('/admin/module-images', payload)
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.data?.error || 'Failed to upload image')
      }
      throw error
    }
  },
}
