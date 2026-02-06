export interface Training {
    id: number
    kvk_id: number
    kvk_name: string
    reporting_year: string
    start_date: string
    end_date: string
    training_program: string
    training_title: string
    venue: string
    training_discipline: string
    thematic_area: string
    created_at?: string
    updated_at?: string
    deleted_at?: string | null
}
