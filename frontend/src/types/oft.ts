export interface OFT {
    id: number
    kvk_id?: number
    kvk_name: string
    year: string // Reporting Year
    staff: string
    title: string
    problem_diagnosed: string
    status: 'Ongoing' | 'Completed'
    created_at?: string
    updated_at?: string
    deleted_at?: string | null
}
