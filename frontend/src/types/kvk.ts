export interface KVKDetails {
    id: number
    state_id: number
    uni_id: number
    district_id: number
    kvk_name: string
    mobile: string
    email: string
    fax?: string
    landline?: string
    address: string
    org_name: string
    org_mobile?: string
    org_landline?: string
    org_fax?: string
    org_email?: string
    org_address: string
    sanction_year: string
    total_land?: string
    deleted_at?: string | null
    created_at: string
    updated_at: string
    // Relations
    district?: {
        id: number
        st_id: string
        uni_id: number
        district_name: string
        created_at: string
        updated_at: string
    }
    university?: {
        id: number
        state_id: number
        university_name: string
        created_at: string
        updated_at: string
    }
    state?: {
        id: number
        zone_id: number
        state_name: string
        created_at: string
        updated_at: string
        zone?: {
            id: number
            zone_name: string
            created_at: string
            updated_at: string
        }
    }
}
