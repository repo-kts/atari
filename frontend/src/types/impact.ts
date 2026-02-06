export interface KVKImpact {
    id: number;
    kvk_id: number;
    kvk_name: string;
    reporting_year: string;
    specific_area: string; // Name of Specific Area
    brief_details: string; // Brief Details of the Area
    farmers_benefitted: number; // No. of Farmers Benefitted
    horizontal_spread: string; // Horizontal Spread(in area/no.)
    adoption_percentage: string; // % of Adoption
    created_at?: string;
    updated_at?: string;
}

export interface Entrepreneurship {
    id: number;
    kvk_id: number;
    kvk_name: string;
    reporting_year: string;
    entrepreneur_name: string; // Name of the Entrepreneur/Name of the Enterprise/Firm
    enterprise_type: string; // Type of Enterprise
    members_associated: number; // No of members associated
    annual_income: string; // Annual Income/Revenue of the Enterprise
    created_at?: string;
    updated_at?: string;
}

export interface SuccessStory {
    id: number;
    kvk_id: number;
    kvk_name: string;
    reporting_year: string;

    // Personal Information
    farmer_name: string; // Name of the Farmer/Entrepreneur
    state_of_farmer: string; // State of farmer
    education: string;
    farming_experience: string; // Farming Experience/Experience in Enterprise
    mobile_number: string;
    address: string;
    professional_membership: string;
    major_achievement: string; // Major Achievement of the Farmers
    awards_received: string;

    // Professional Information
    title: string; // Title of the Success Story/Case Study
    situation_analysis: string; // Situation Analysis/Problem Statement
    plan_implement_support: string; // Plan, Implement and Support/KVK Intervention
    technology_details: string; // Details of Technology/Practice Followed by the Farmer
    results_output: string; // Results/Output(Economic & Social Impact)
    impact_outcome: string; // Impact/Outcome
    future_plans: string;
    supporting_images?: string[]; // Array of image URLs/names

    // Economic Information
    enterprise: string;
    gross_income: string;
    net_income: string;
    cost_benefit_ratio: string;

    created_at?: string;
    updated_at?: string;
}
