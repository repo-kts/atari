import { useMemo } from 'react'
import {
    useModuleImageCategories,
    useModuleImageKvks,
    useModuleImages,
} from './useModuleImages'
import {
    useFormAttachmentsGallery,
    useFormAttachmentsGalleryForms,
    useFormAttachmentsGalleryKvks,
} from './useFormAttachments'
import type {
    ModuleImageCategory,
    ModuleImageKvkOption,
    ModuleImageRow,
} from '@/services/moduleImagesApi'
import type { FormAttachmentRow } from '@/services/formAttachmentsApi'

export type GallerySource = 'modules' | 'forms'

export interface GalleryFilters {
    page?: number
    limit?: number
    reportingYear?: number
    kvkId?: number
    moduleId?: number
    formCode?: string
    search?: string
}

interface UseGallerySourceResult {
    images: ModuleImageRow[]
    categories: ModuleImageCategory[]
    kvks: ModuleImageKvkOption[]
    total: number
    isLoading: boolean
    isError: boolean
}

const FORM_LABEL_OVERRIDES: Record<string, string> = {
    oft_result: 'OFT Result',
}

function humanizeFormCode(code: string): string {
    if (FORM_LABEL_OVERRIDES[code]) return FORM_LABEL_OVERRIDES[code]
    return code
        .split(/[_-]/)
        .filter(Boolean)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
        .join(' ')
}

function attachmentToRow(att: FormAttachmentRow, syntheticModuleId: number): ModuleImageRow {
    const reportingYear = att.reportingYearDate
        ? new Date(att.reportingYearDate).getFullYear()
        : new Date(att.createdAt).getFullYear()
    return {
        imageId: att.attachmentId,
        kvkId: att.kvkId,
        kvkName: att.kvk?.kvkName ?? '',
        moduleId: syntheticModuleId,
        moduleCode: att.formCode,
        categoryLabel: humanizeFormCode(att.formCode),
        caption: att.caption ?? '',
        imageDate: att.createdAt,
        reportingYear,
        mimeType: att.mimeType,
        fileName: att.fileName,
        fileUrl: att.fileUrl,
        downloadUrl: att.downloadUrl,
        uploadedBy: att.uploadedBy ?? null,
        createdAt: att.createdAt,
    }
}

export function useGallerySource(
    source: GallerySource,
    filters: GalleryFilters,
    showKvkFilter: boolean,
): UseGallerySourceResult {
    const moduleImagesQuery = useModuleImages(filters as any)
    const moduleCategoriesQuery = useModuleImageCategories()
    const moduleKvksQuery = useModuleImageKvks(showKvkFilter && source === 'modules')

    const formsQuery = useFormAttachmentsGallery({
        page: filters.page,
        limit: filters.limit,
        reportingYear: filters.reportingYear,
        kvkId: filters.kvkId,
        formCode: filters.formCode,
        search: filters.search,
    })
    const formsListQuery = useFormAttachmentsGalleryForms()
    const formsKvksQuery = useFormAttachmentsGalleryKvks()

    const formCodeToId = useMemo(() => {
        const map = new Map<string, number>()
        const list = formsListQuery.data ?? []
        list.forEach((f, i) => {
            map.set(f.formCode, 1_000_000 + i)
        })
        return map
    }, [formsListQuery.data])

    return useMemo<UseGallerySourceResult>(() => {
        if (source === 'forms') {
            const rows = (formsQuery.data?.data ?? []).map((att) => {
                const id = formCodeToId.get(att.formCode) ?? 1_000_000
                return attachmentToRow(att, id)
            })
            const categories: ModuleImageCategory[] = (formsListQuery.data ?? []).map((f) => ({
                moduleId: formCodeToId.get(f.formCode) ?? 1_000_000,
                moduleCode: f.formCode,
                menuName: 'Form Modules',
                subMenuName: humanizeFormCode(f.formCode),
                label: humanizeFormCode(f.formCode),
            }))
            const kvks: ModuleImageKvkOption[] = (formsKvksQuery.data ?? []).map((k) => ({
                kvkId: k.kvkId,
                kvkName: k.kvkName,
            }))
            return {
                images: rows,
                categories,
                kvks,
                total: formsQuery.data?.meta.total ?? 0,
                isLoading: formsQuery.isLoading || formsListQuery.isLoading,
                isError: Boolean(formsQuery.error || formsListQuery.error),
            }
        }
        return {
            images: moduleImagesQuery.data?.data ?? [],
            categories: moduleCategoriesQuery.data ?? [],
            kvks: moduleKvksQuery.data ?? [],
            total: moduleImagesQuery.data?.meta?.total ?? 0,
            isLoading: moduleImagesQuery.isLoading,
            isError: Boolean(moduleImagesQuery.error),
        }
    }, [
        source,
        formCodeToId,
        formsQuery.data,
        formsQuery.isLoading,
        formsQuery.error,
        formsListQuery.data,
        formsListQuery.isLoading,
        formsListQuery.error,
        formsKvksQuery.data,
        moduleImagesQuery.data,
        moduleImagesQuery.isLoading,
        moduleImagesQuery.error,
        moduleCategoriesQuery.data,
        moduleKvksQuery.data,
    ])
}

export function getModuleIdForFormCode(
    formCode: string | undefined,
    categories: ModuleImageCategory[],
): number | undefined {
    if (!formCode) return undefined
    return categories.find((c) => c.moduleCode === formCode)?.moduleId
}

export function getFormCodeForModuleId(
    moduleId: number | undefined,
    categories: ModuleImageCategory[],
): string | undefined {
    if (!moduleId) return undefined
    return categories.find((c) => c.moduleId === moduleId)?.moduleCode ?? undefined
}
