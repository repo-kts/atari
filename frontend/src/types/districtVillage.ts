export interface DistrictLevelData {
    id: number;
    kvk_id: number;
    kvk_name: string;
    reporting_year: string;
    item: string; // Items
    information: string; // Information
    created_at?: string;
    updated_at?: string;
}

export interface OperationalArea {
    id: number;
    kvk_id: number;
    kvk_name: string;
    reporting_year: string;
    taluk: string;
    block: string;
    village: string;
    major_crops: string;
    major_problems: string; // Major problems identified (crop-wise)
    identified_thrust_areas: string;
    created_at?: string;
    updated_at?: string;
}

export interface VillageAdoption {
    id: number;
    kvk_id: number;
    kvk_name: string;
    reporting_year: string;
    village: string;
    block: string;
    action_taken: string; // Action taken for development
    created_at?: string;
    updated_at?: string;
}

export interface PriorityThrustArea {
    id: number;
    kvk_id: number;
    kvk_name: string;
    reporting_year: string;
    thrust_area: string;
    created_at?: string;
    updated_at?: string;
}
