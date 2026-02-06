export interface FunctionalLinkage {
    id: number;
    kvk_id: number;
    kvk_name: string;
    reporting_year: string;
    organization_name: string;
    linkage_nature: string; // Nature of Linkage
    created_at?: string;
    updated_at?: string;
}

export interface SpecialProgram {
    id: number;
    kvk_id: number;
    kvk_name: string;
    reporting_year: string;
    program_type: string;
    program_name: string; // Name of the Programme/Scheme
    initiation_date: string; // Date/Month of initiation
    created_at?: string;
    updated_at?: string;
}
