export interface ProductionSupply {
    id: number;
    kvk_id: number;
    kvk_name: string; // Displayed in the table
    reporting_year: string;
    category: string; // e.g. "Seeds", "Planting Material", "Bio-products", etc.
    variety: string; // e.g. "Wheat - HD2967", "Paddy - PR126"
    quantity: number; // The numeric value
    created_at?: string;
    updated_at?: string;
}
