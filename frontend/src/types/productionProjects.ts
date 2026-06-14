/**
 * Production & Projects Master Data Types
 */

// ============================================
// Product Types
// ============================================

export interface ProductCategory {
    productCategoryId: number;
    productCategoryName: string;
    isOther?: boolean;
    _count?: {
        productTypes: number;
        products: number;
    };
}

export interface ProductType {
    productTypeId: number;
    productCategoryType: string;
    productCategoryId: number;
    isOther?: boolean;
    productCategory?: {
        productCategoryId: number;
        productCategoryName: string;
    };
    _count?: {
        products: number;
    };
}

export interface Product {
    productId: number;
    productName: string;
    productCategoryId: number;
    isOther?: boolean;
    productCategory?: {
        productCategoryId: number;
        productCategoryName: string;
    };
    productTypeId: number;
    productType?: {
        productTypeId: number;
        productCategoryType: string;
    };
}

// ============================================
// CRA Types
// ============================================

export interface CraCroppingSystem {
    craCropingSystemId: number;
    cropName: string;
    seasonId: number;
    isOther?: boolean;
    season?: {
        seasonId: number;
        seasonName: string;
    };
}

export interface CraFarmingSystem {
    craFarmingSystemId: number;
    farmingSystemName: string;
    seasonId: number;
    isOther?: boolean;
    season?: {
        seasonId: number;
        seasonName: string;
    };
}

// ============================================
// Arya Types
// ============================================

export interface AryaEnterprise {
    aryaEnterpriseId: number;
    enterpriseId?: number;
    enterpriseName: string;
    isOther?: boolean;
}

export interface TspScspType {
    tspScspTypeId: number;
    typeName: string;
}

export interface TspScspActivity {
    tspScspActivityId: number;
    activityName: string;
    isOther?: boolean;
}

export interface NaturalFarmingActivity {
    naturalFarmingActivityId: number;
    activityName: string;
}

export interface NaturalFarmingSoilParameter {
    naturalFarmingSoilParameterId: number;
    parameterName: string;
    isOther?: boolean;
}

// ============================================
// Agri Drone Masters
// ============================================

export interface AgriDroneDemonstrationsOn {
    agriDroneDemonstrationsOnId: number;
    demonstrationsOnName: string;
    isOther?: boolean;
    // common aliases from backend
    id?: number;
    name?: string;
}

// ============================================
// Form Data Types
// ============================================

export interface ProductCategoryFormData {
    productCategoryName: string;
    isOther?: boolean;
}

export interface ProductTypeFormData {
    productCategoryType: string;
    productCategoryId: number;
    isOther?: boolean;
}

export interface ProductFormData {
    productName: string;
    productCategoryId: number;
    productTypeId: number;
    isOther?: boolean;
}

export interface CraCroppingSystemFormData {
    cropName: string;
    seasonId: number;
    isOther?: boolean;
}

export interface CraFarmingSystemFormData {
    farmingSystemName: string;
    seasonId: number;
    isOther?: boolean;
}

export interface AryaEnterpriseFormData {
    enterpriseName: string;
    isOther?: boolean;
}

export interface TspScspTypeFormData {
    typeName: string;
}

export interface TspScspActivityFormData {
    activityName: string;
    isOther?: boolean;
}

export interface NaturalFarmingActivityFormData {
    activityName: string;
}

export interface NaturalFarmingSoilParameterFormData {
    parameterName: string;
    isOther?: boolean;
}

export interface AgriDroneDemonstrationsOnFormData {
    demonstrationsOnName: string;
    isOther?: boolean;
}

// ============================================
// Statistics Types
// ============================================

export interface ProductionProjectsStats {
    products: {
        categories: number;
        types: number;
        items: number;
    };
    cra: {
        croppingSystems: number;
        farmingSystems: number;
    };
    arya: {
        enterprises: number;
    };
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
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
