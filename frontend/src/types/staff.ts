import { KVKDetails } from './kvk'

export interface Staff {
    id: number
    kvk_id: number
    staff_name: string
    post_id: number
    position: number
    mobile: string
    email: string
    designation?: string | null
    discipline: string
    pay_scale: string
    date_of_joining: string
    releaving_date?: string | null
    pay_band: string
    dob: string
    job_type: string
    alliances: string
    specialization: string
    cast_category: string
    photo?: string
    resume?: string
    is_transferred: number
    deleted_at?: string | null
    created_at: string
    updated_at: string
    // Relations
    kvks?: KVKDetails
    post?: {
        id: number
        post_name: string
        chart_label: string
        deleted_at?: string | null
        created_at: string
        updated_at: string
    }
    caste?: {
        id: number
        caste_name: string
        deleted_at?: string | null
        created_at?: string | null
        updated_at?: string | null
    }
    progress_status?: string
}

export interface SearchFilters {
    zone_id?: number
    state_id?: number
    district_id?: number
    university_id?: number
    account_type?: string
    job_type?: string
    cast_category?: string
    is_transferred?: boolean
    date_range?: {
        start: string
        end: string
    }
}
