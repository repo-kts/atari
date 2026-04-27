import { apiClient } from './api'

export type FormAttachmentKind = 'PHOTO' | 'DATASHEET' | 'DOCUMENT'

export interface FormAttachmentRow {
    attachmentId: number
    kvkId: number
    formCode: string
    recordId: number | null
    kind: FormAttachmentKind
    s3Key: string
    fileName: string | null
    mimeType: string
    size: number
    caption: string | null
    sortOrder: number
    reportingYearDate: string | null
    uploadedByUserId: number | null
    createdAt: string
    updatedAt: string
    fileUrl: string
    downloadUrl: string
    kvk?: { kvkId: number; kvkName: string }
    uploadedBy?: { userId: number; name: string; email: string } | null
}

export interface PresignResponse {
    s3Key: string
    uploadUrl: string
    expiresIn: number
    headers: Record<string, string>
}

export interface ConfirmUploadInput {
    s3Key: string
    formCode: string
    kind: FormAttachmentKind
    recordId?: number | null
    kvkId: number
    fileName: string
    mimeType: string
    size: number
    caption?: string | null
    sortOrder?: number
    reportingYearDate?: string | null
}

export interface PresignInput {
    formCode: string
    kind: FormAttachmentKind
    fileName: string
    mimeType: string
    size: number
    kvkId: number
}

export interface GalleryFilters {
    page?: number
    limit?: number
    kvkId?: number
    formCode?: string
    reportingYear?: number
    search?: string
}

export interface GalleryListResponse {
    data: FormAttachmentRow[]
    meta: { page: number; limit: number; total: number; totalPages: number }
}

export interface GalleryFormGroup {
    formCode: string
    count: number
}

export interface GalleryKvkOption {
    kvkId: number
    kvkName: string
    count: number
}

const BASE = '/forms/attachments'

export const formAttachmentsApi = {
    presign: (body: PresignInput) =>
        apiClient.post<PresignResponse>(`${BASE}/presign`, body),

    confirm: (body: ConfirmUploadInput) =>
        apiClient.post<FormAttachmentRow>(`${BASE}/confirm`, body),

    attach: (body: { attachmentIds: number[]; formCode: string; recordId: number; kvkId: number }) =>
        apiClient.post<{ count: number }>(`${BASE}/attach`, body),

    listByRecord: (params: { formCode: string; recordId?: number | null; kvkId?: number; kind?: FormAttachmentKind }) => {
        const qs = new URLSearchParams()
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') qs.set(k, String(v))
        })
        return apiClient.get<FormAttachmentRow[]>(`${BASE}?${qs.toString()}`)
    },

    update: (attachmentId: number, body: { caption?: string | null; sortOrder?: number }) =>
        apiClient.patch<FormAttachmentRow>(`${BASE}/${attachmentId}`, body),

    remove: (attachmentId: number) =>
        apiClient.delete<{ ok: true }>(`${BASE}/${attachmentId}`),

    gallery: (filters: GalleryFilters) => {
        const qs = new URLSearchParams()
        Object.entries(filters || {}).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') qs.set(k, String(v))
        })
        return apiClient.get<GalleryListResponse>(`${BASE}/gallery?${qs.toString()}`)
    },

    galleryForms: () => apiClient.get<GalleryFormGroup[]>(`${BASE}/gallery/forms`),
    galleryKvks: () => apiClient.get<GalleryKvkOption[]>(`${BASE}/gallery/kvks`),
}

export async function uploadFileToS3(uploadUrl: string, file: File, headers: Record<string, string>): Promise<void> {
    const res = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers,
    })
    if (!res.ok) {
        throw new Error(`S3 upload failed: ${res.status} ${res.statusText}`)
    }
}
