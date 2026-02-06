export interface FLD {
    id: number
    kvk_id: number
    kvk_name: string
    year: string
    category: string
    sub_category: string
    technology_name: string
    start_date: string
    end_date: string
    status: 'Ongoing' | 'Completed'
    deleted_at?: string | null
    created_at?: string
    updated_at?: string
}
