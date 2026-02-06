export interface PrevalentDiseaseCrop {
    id: number
    kvk_name: string
    disease_name: string
    crop: string
    date_of_outbreak: string
    area_affected: string
    commodity_loss_percent: string
    preventive_measures_area: string
    reporting_year: string
    deleted_at?: string | null
}

export interface PrevalentDiseaseLivestock {
    id: number
    kvk_name: string
    disease_name: string
    species_affected: string
    date_of_outbreak: string
    death_morbidity_rate: string
    animals_vaccinated: string
    preventive_measures_area: string
    reporting_year: string
    deleted_at?: string | null
}

export interface NehruYuvaKendraRecord {
    id: number
    kvk_name: string
    training_program_title: string
    start_date: string
    end_date: string
    male_participants: string
    female_participants: string
    fund_received: string
    reporting_year: string
    deleted_at?: string | null
}

export interface PPVFRATraining {
    id: number
    kvk_name: string
    date: string
    title: string
    type: string
    venue: string
    resource_person: string
    participants_count: string
    reporting_year: string
    deleted_at?: string | null
}

export interface PPVFRAFarmerDetail {
    id: number
    kvk_name: string
    year: string
    crop: string
    registration_no: string
    farmer_name: string
    block: string
    district: string
    reporting_year: string
    deleted_at?: string | null
}

export interface RaweFetRecord {
    id: number
    kvk_name: string
    start_date: string
    end_date: string
    attachment_type: string
    attachment: string
    number_of_students: string
    no_of_days_stayed: string
    reporting_year: string
    deleted_at?: string | null
}

export interface VIPVisitor {
    id: number
    kvk_name: string
    date_of_visit: string
    dignitary_type: string
    minister_name: string
    observation_points: string
    reporting_year: string
    deleted_at?: string | null
}

export interface SACMeeting {
    id: number
    kvk_name: string
    start_date: string
    end_date: string
    participants_count: string
    statutory_members_present: string
    recommendations: string
    action_taken: string
    reason: string
    file_path?: string
    reporting_year: string
    deleted_at?: string | null
}

export interface OtherMeeting {
    id: number
    kvk_name: string
    date: string
    meeting_type: string
    agenda: string
    atari_representative: string
    reporting_year: string
    deleted_at?: string | null
}

export interface MobileAppRecord {
    id: number
    kvk_name: string
    apps_count: string
    app_name: string
    language: string
    category: string
    downloads_count: string
    reporting_year: string
    deleted_at?: string | null
}

export interface KVKPortalRecord {
    id: number
    kvk_name: string
    visitors_count: string
    registered_farmers_count: string
    reporting_year: string
    deleted_at?: string | null
}

export interface KisanSarathiRecord {
    id: number
    kvk_name: string
    registered_farmers_count: string
    phone_calls_addressed: string
    answered_calls: string
    reporting_year: string
    deleted_at?: string | null
}

export interface KMASRecord {
    id: number
    kvk_name: string
    farmers_covered: string
    advisories_sent: string
    crop_messages: string
    livestock_messages: string
    weather_messages: string
    marketing_messages: string
    awareness_messages: string
    other_enterprises_messages: string
    any_other_messages: string
    reporting_year: string
    deleted_at?: string | null
}

export interface OtherChannelsRecord {
    id: number
    kvk_name: string
    text_advisories: string
    text_farmers_count: string
    whatsapp_advisories: string
    whatsapp_farmers_count: string
    social_media_advisories: string
    social_media_farmers_count: string
    weather_bulletin_advisories: string
    weather_bulletin_farmers_count: string
    reporting_year: string
    deleted_at?: string | null
}

export interface SwachhtaObservationRecord {
    id: number
    kvk_name: string
    date_duration: string
    activities_count: string
    staffs_count: string
    farmers_count: string
    others_count: string
    total_count: string
    reporting_year: string
    deleted_at?: string | null
}

export interface SwachhtaBudgetRecord {
    id: number
    kvk_name: string
    vermicomposting_villages: string
    vermicomposting_expenditure: string
    other_villages: string
    other_expenditure: string
    reporting_year: string
    deleted_at?: string | null
}
