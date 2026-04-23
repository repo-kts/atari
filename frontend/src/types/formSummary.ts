export type FormStatus = 'completed' | 'not_started'

export interface FormModuleMeta {
    key: string
    title: string
    category: string
    subcategory: string | null
    moduleCode: string
    path: string | null
}

export interface FormModuleRow extends FormModuleMeta {
    count: number
    status: FormStatus
}

/** kvk_admin / scoped-user response (single KVK). */
export interface KvkFormSummary {
    kvkId: number | null
    kvkName: string | null
    modules: FormModuleRow[]
    completed: number
    total: number
    progress: number
    categoryOrder: string[]
}

/** super_admin response (matrix across KVKs). */
export interface AllKvkFormSummary {
    modules: FormModuleMeta[]
    kvks: Array<{
        kvkId: number
        kvkName: string
        completed: number
        total: number
        progress: number
        countsByKey: Record<string, number>
    }>
    categoryOrder: string[]
}

export type FormSummaryResponse = KvkFormSummary | AllKvkFormSummary

export function isAllKvkSummary(r: FormSummaryResponse): r is AllKvkFormSummary {
    return 'kvks' in r && Array.isArray((r as AllKvkFormSummary).kvks)
}
