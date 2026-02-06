export interface ExtensionActivity {
    id: number
    kvk_id: number
    kvk_name: string
    reporting_year: string
    start_date: string
    end_date: string
    nature_of_activity: string
    no_of_activities: number
    no_of_participants: number
    created_at?: string
    updated_at?: string
    deleted_at?: string | null
}
