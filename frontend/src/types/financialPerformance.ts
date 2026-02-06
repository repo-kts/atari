export interface BudgetDetail {
    id: number
    kvk_name: string
    salary_allocation: string
    salary_expenditure: string
    general_main_grant_allocation: string
    general_main_grant_expenditure: string
    capital_main_grant_allocation: string
    capital_main_grant_expenditure: string
    reporting_year: string
    deleted_at?: string | null
}

export interface ProjectBudget {
    id: number
    kvk_name: string
    project_name: string
    funding_agency: string
    budget_estimate: string
    budget_allocated: string
    budget_released: string
    expenditure: string
    unspent_balance: string
    reporting_year: string
    deleted_at?: string | null
}

export interface RevolvingFund {
    id: number
    kvk_name: string
    reporting_year: string
    opening_balance: string
    income_during_year: string
    expenditure_during_year: string
    closing_balance: string
    kind: string
    deleted_at?: string | null
}

export interface RevenueGeneration {
    id: number
    kvk_name: string
    reporting_year: string
    name_of_head: string
    income_rs: string
    sponsoring_agency: string
    deleted_at?: string | null
}

export interface ResourceGenerationRecord {
    id: number
    kvk_name: string
    reporting_year: string
    name_of_program: string
    purpose_of_program: string
    sources_of_fund: string
    amount_rs_lakhs: string
    deleted_at?: string | null
}
