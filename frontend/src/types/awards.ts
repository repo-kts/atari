export interface KVKAward {
    id: number;
    kvk_id: number;
    kvk_name: string;
    reporting_year: string;
    award_name: string;
    amount: number;
    achievement: string;
    conferring_authority: string;
    created_at?: string;
    updated_at?: string;
}

export interface ScientistAward {
    id: number;
    kvk_id: number;
    kvk_name: string;
    reporting_year: string;
    scientist_name: string;
    award_name: string;
    amount: number;
    achievement: string;
    conferring_authority: string;
    created_at?: string;
    updated_at?: string;
}

export interface FarmerAward {
    id: number;
    kvk_id: number;
    kvk_name: string;
    reporting_year: string;
    farmer_name: string;
    address: string;
    contact_no: string;
    award_name: string;
    amount: number;
    achievement: string;
    conferring_authority: string;
    created_at?: string;
    updated_at?: string;
}
