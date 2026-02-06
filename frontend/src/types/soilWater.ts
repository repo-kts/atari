export interface SoilEquipment {
    id: number;
    kvk_id: number;
    kvk_name: string;
    reporting_year: string;
    analysis: string;
    equipment_name: string;
    quantity: number;
    created_at?: string;
    updated_at?: string;
}

export interface SoilAnalysis {
    id: number;
    kvk_id: number;
    kvk_name: string;
    start_date: string;
    end_date: string;
    analysis_type: string; // Mapped to "Analysis" column
    samples_analyzed: number;
    villages_covered: number;
    amount_realized: number;
    created_at?: string;
    updated_at?: string;
}

export interface WorldSoilDay {
    id: number;
    kvk_id: number;
    kvk_name: string;
    reporting_year: string;
    activities_conducted: number;
    soil_health_cards_distributed: number;
    vip_count: number;
    vip_names: string;
    participants_count: number;
    created_at?: string;
    updated_at?: string;
}
