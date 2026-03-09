/**
 * Production Supply Types
 */

export interface ProductionSupply {
    productionSupplyId: string;
    id: string;
    kvkId: number;
    reportingYearId?: number;
    yearId?: number;
    productCategoryId?: number;
    prodCategory?: string;
    productTypeId?: number;
    prodSubCategory?: string;
    productId?: number;
    prodType?: string;
    speciesName: string;
    unit: string;
    quantity: number;
    value: number;
    farmersGeneralM: number;
    farmersGeneralF: number;
    farmersObcM: number;
    farmersObcF: number;
    farmersScM: number;
    farmersScF: number;
    farmersStM: number;
    farmersStF: number;
    createdAt: string;
    updatedAt: string;
    // Display fields
    'KVK Name'?: string;
    'Reporting Year'?: string | number;
    reportingYear?: string | number;
    'Product Category'?: string;
    'Product Type'?: string;
    'Product'?: string;
    'Species / Breed / Variety'?: string;
    'Unit'?: string;
    'Quantity'?: number;
    'Value(Rs)'?: number;
    'No. of Participants'?: number;
    // Frontend format
    gen_m?: number;
    gen_f?: number;
    obc_m?: number;
    obc_f?: number;
    sc_m?: number;
    sc_f?: number;
    st_m?: number;
    st_f?: number;
    // Relations
    kvk?: {
        kvkName: string;
    };
    reportingYearRelation?: {
        yearName: string;
        yearId: number;
    };
    productCategory?: {
        productCategoryName: string;
        productCategoryId: number;
    };
    productType?: {
        productCategoryType: string;
        productTypeId: number;
    };
    product?: {
        productName: string;
        productId: number;
    };
}

export interface ProductionSupplyFormData {
    kvkId?: number;
    reportingYearId?: number;
    reportingYear?: string | number;
    yearId?: number;
    productCategoryId?: number;
    prodCategory?: string | number;
    productTypeId?: number;
    prodSubCategory?: string | number;
    productId?: number;
    prodType?: string | number;
    speciesName: string;
    unit: string;
    quantity: number | string;
    value: number | string;
    // Participant fields (frontend format)
    gen_m?: number | string;
    gen_f?: number | string;
    obc_m?: number | string;
    obc_f?: number | string;
    sc_m?: number | string;
    sc_f?: number | string;
    st_m?: number | string;
    st_f?: number | string;
    // Participant fields (backend format)
    farmersGeneralM?: number | string;
    farmersGeneralF?: number | string;
    farmersObcM?: number | string;
    farmersObcF?: number | string;
    farmersScM?: number | string;
    farmersScF?: number | string;
    farmersStM?: number | string;
    farmersStF?: number | string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    count?: number;
}
