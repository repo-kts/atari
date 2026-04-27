import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    formAttachmentsApi,
    uploadFileToS3,
    type ConfirmUploadInput,
    type FormAttachmentKind,
    type FormAttachmentRow,
    type GalleryFilters,
} from '@/services/formAttachmentsApi'

const recordKey = (formCode: string, recordId: number | null | undefined, kvkId?: number, kind?: FormAttachmentKind) =>
    ['form-attachments', formCode, recordId ?? null, kvkId ?? null, kind ?? null] as const

export function useFormAttachments(params: {
    formCode: string
    recordId?: number | null
    kvkId?: number
    kind?: FormAttachmentKind
    enabled?: boolean
}) {
    const { formCode, recordId, kvkId, kind, enabled = true } = params
    return useQuery<FormAttachmentRow[]>({
        queryKey: recordKey(formCode, recordId, kvkId, kind),
        queryFn: () => formAttachmentsApi.listByRecord({ formCode, recordId, kvkId, kind }),
        enabled: enabled && Boolean(formCode),
        staleTime: 30_000,
    })
}

export function useUploadAttachment() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (input: {
            file: File
            formCode: string
            kind: FormAttachmentKind
            kvkId: number
            recordId?: number | null
            caption?: string | null
            sortOrder?: number
            reportingYearDate?: string | null
        }) => {
            const { file, formCode, kind, kvkId, recordId, caption, sortOrder, reportingYearDate } = input
            const presign = await formAttachmentsApi.presign({
                formCode,
                kind,
                fileName: file.name,
                mimeType: file.type || 'application/octet-stream',
                size: file.size,
                kvkId,
            })
            await uploadFileToS3(presign.uploadUrl, file, presign.headers)
            const confirmInput: ConfirmUploadInput = {
                s3Key: presign.s3Key,
                formCode,
                kind,
                recordId: recordId ?? null,
                kvkId,
                fileName: file.name,
                mimeType: file.type || 'application/octet-stream',
                size: file.size,
                caption: caption ?? null,
                sortOrder,
                reportingYearDate: reportingYearDate ?? null,
            }
            return formAttachmentsApi.confirm(confirmInput)
        },
        onSuccess: (row) => {
            qc.invalidateQueries({ queryKey: ['form-attachments', row.formCode] })
            qc.invalidateQueries({ queryKey: ['form-attachments-gallery'] })
            qc.invalidateQueries({ queryKey: ['form-attachments-gallery-forms'] })
            qc.invalidateQueries({ queryKey: ['form-attachments-gallery-kvks'] })
        },
    })
}

export function useUpdateAttachment() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ attachmentId, ...patch }: { attachmentId: number; caption?: string | null; sortOrder?: number }) =>
            formAttachmentsApi.update(attachmentId, patch),
        onSuccess: (row) => {
            qc.invalidateQueries({ queryKey: ['form-attachments', row.formCode] })
            qc.invalidateQueries({ queryKey: ['form-attachments-gallery'] })
        },
    })
}

export function useDeleteAttachment(formCode: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (attachmentId: number) => formAttachmentsApi.remove(attachmentId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['form-attachments', formCode] })
            qc.invalidateQueries({ queryKey: ['form-attachments-gallery'] })
            qc.invalidateQueries({ queryKey: ['form-attachments-gallery-forms'] })
        },
    })
}

export function useFormAttachmentsGallery(filters: GalleryFilters) {
    return useQuery({
        queryKey: ['form-attachments-gallery', filters],
        queryFn: () => formAttachmentsApi.gallery(filters),
        staleTime: 30_000,
        placeholderData: (prev) => prev,
    })
}

export function useFormAttachmentsGalleryForms() {
    return useQuery({
        queryKey: ['form-attachments-gallery-forms'],
        queryFn: () => formAttachmentsApi.galleryForms(),
        staleTime: 60_000,
    })
}

export function useFormAttachmentsGalleryKvks() {
    return useQuery({
        queryKey: ['form-attachments-gallery-kvks'],
        queryFn: () => formAttachmentsApi.galleryKvks(),
        staleTime: 60_000,
    })
}
