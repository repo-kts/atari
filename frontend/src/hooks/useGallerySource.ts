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

export interface GalleryFilters {
    page?: number
    limit?: number
    reportingYear?: number
    kvkId?: number
    moduleId?: number
    formCode?: string
    search?: string
}

export type GalleryItem = ModuleImageRow & { source: 'module' | 'form' }

interface UseGallerySourceResult {
    images: GalleryItem[]
    categories: ModuleImageCategory[]
    kvks: ModuleImageKvkOption[]
    total: number
    isLoading: boolean
    isError: boolean
}

const FORM_LABEL_OVERRIDES: Record<string, string> = {
    oft_result: 'OFT Result',
}

// Maps a formCode to the sidebar group it should appear under. Falls back to
// "Form Attachments" so unknown forms still show up.
const FORM_MENU_BY_CODE: Record<string, string> = {
    oft_result: 'Achievements',
}

const DEFAULT_FORMS_MENU_NAME = 'Form Attachments'
const FORM_ID_OFFSET = 1_000_000

function menuForFormCode(code: string): string {
    return FORM_MENU_BY_CODE[code] ?? DEFAULT_FORMS_MENU_NAME
}

function humanizeFormCode(code: string): string {
    if (FORM_LABEL_OVERRIDES[code]) return FORM_LABEL_OVERRIDES[code]
    return code
        .split(/[_-]/)
        .filter(Boolean)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
        .join(' ')
}

function attachmentToRow(att: FormAttachmentRow, syntheticModuleId: number): GalleryItem {
    const reportingYear = att.reportingYearDate
        ? new Date(att.reportingYearDate).getFullYear()
        : new Date(att.createdAt).getFullYear()
    return {
        imageId: att.attachmentId + FORM_ID_OFFSET,
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
        source: 'form',
    }
}

function moduleImageToRow(img: ModuleImageRow): GalleryItem {
    return { ...img, source: 'module' }
}

export function useGallerySource(
    filters: GalleryFilters,
    showKvkFilter: boolean,
): UseGallerySourceResult {
    // Translate selected synthetic moduleId to formCode if it belongs to forms.
    // Module-image queries should not pass a synthetic id (out of range), so
    // strip moduleId when it's >= FORM_ID_OFFSET.
    const isFormSelection = (filters.moduleId ?? 0) >= FORM_ID_OFFSET
    const moduleImageFilters = {
        ...filters,
        moduleId: isFormSelection ? undefined : filters.moduleId,
    }
    const formAttachmentsFilters = {
        page: filters.page,
        limit: filters.limit,
        reportingYear: filters.reportingYear,
        kvkId: filters.kvkId,
        formCode: filters.formCode,
        search: filters.search,
    }

    const moduleImagesQuery = useModuleImages(moduleImageFilters as any)
    const moduleCategoriesQuery = useModuleImageCategories()
    const moduleKvksQuery = useModuleImageKvks(showKvkFilter)

    const formsQuery = useFormAttachmentsGallery(formAttachmentsFilters)
    const formsListQuery = useFormAttachmentsGalleryForms()
    const formsKvksQuery = useFormAttachmentsGalleryKvks()

    const formCodeToId = useMemo(() => {
        const map = new Map<string, number>()
        const list = formsListQuery.data ?? []
        list.forEach((f, i) => {
            map.set(f.formCode, FORM_ID_OFFSET + i)
        })
        return map
    }, [formsListQuery.data])

    return useMemo<UseGallerySourceResult>(() => {
        const moduleRows = (moduleImagesQuery.data?.data ?? []).map(moduleImageToRow)
        // If user selected a module-image module, hide form rows; if user
        // selected a form, hide module-image rows. No selection -> show both.
        const formRows = (formsQuery.data?.data ?? []).map((att) => {
            const id = formCodeToId.get(att.formCode) ?? FORM_ID_OFFSET
            return attachmentToRow(att, id)
        })

        let images: GalleryItem[]
        if (isFormSelection) {
            images = formRows
        } else if (filters.moduleId && !isFormSelection) {
            images = moduleRows
        } else {
            images = [...moduleRows, ...formRows].sort((a, b) => {
                const ad = new Date(a.imageDate || a.createdAt).getTime()
                const bd = new Date(b.imageDate || b.createdAt).getTime()
                return bd - ad
            })
        }

        const moduleCategories = moduleCategoriesQuery.data ?? []
        const formCategories: ModuleImageCategory[] = (formsListQuery.data ?? []).map((f) => ({
            moduleId: formCodeToId.get(f.formCode) ?? FORM_ID_OFFSET,
            moduleCode: f.formCode,
            menuName: menuForFormCode(f.formCode),
            subMenuName: humanizeFormCode(f.formCode),
            label: humanizeFormCode(f.formCode),
        }))
        const categories: ModuleImageCategory[] = [...moduleCategories, ...formCategories]

        const kvkMap = new Map<number, ModuleImageKvkOption>()
        for (const k of moduleKvksQuery.data ?? []) kvkMap.set(k.kvkId, k)
        for (const k of formsKvksQuery.data ?? []) {
            if (!kvkMap.has(k.kvkId)) kvkMap.set(k.kvkId, { kvkId: k.kvkId, kvkName: k.kvkName })
        }
        const kvks = Array.from(kvkMap.values()).sort((a, b) => a.kvkName.localeCompare(b.kvkName))

        const total =
            (moduleImagesQuery.data?.meta?.total ?? 0) + (formsQuery.data?.meta.total ?? 0)

        return {
            images,
            categories,
            kvks,
            total,
            isLoading: moduleImagesQuery.isLoading || formsQuery.isLoading,
            isError: Boolean(moduleImagesQuery.error || formsQuery.error),
        }
    }, [
        formCodeToId,
        formsQuery.data,
        formsQuery.isLoading,
        formsQuery.error,
        formsListQuery.data,
        formsKvksQuery.data,
        moduleImagesQuery.data,
        moduleImagesQuery.isLoading,
        moduleImagesQuery.error,
        moduleCategoriesQuery.data,
        moduleKvksQuery.data,
        filters.moduleId,
        isFormSelection,
    ])
}

export function getFormCodeForModuleId(
    moduleId: number | undefined,
    categories: ModuleImageCategory[],
): string | undefined {
    if (!moduleId) return undefined
    return categories.find((c) => c.moduleId === moduleId)?.moduleCode ?? undefined
}
