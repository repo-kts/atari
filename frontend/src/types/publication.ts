export interface Publication {
    id: number
    kvk_id: number
    kvk_name: string
    year: string
    publication_item: string
    title: string
    author_name: string
    journal_name: string
    created_at?: string
    updated_at?: string
    deleted_at?: string | null
}
