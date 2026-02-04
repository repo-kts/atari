/**
 * Production & Projects Master Data Types
 */

// ============================================
// Product Types
// ============================================

export interface ProductCategory {
    productCategoryId: number;
    productCategoryName: string;
    _count?: {
        productTypes: number;
        products: number;
    };
}

export interface ProductType {
    productTypeId: number;
    productCategoryType: string;
    productCategoryId: number;
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
    season?: {
        seasonId: number;
        seasonName: string;
    };
}

export interface CraFarmingSystem {
    craFarmingSystemId: number;
    farmingSystemName: string;
    seasonId: number;
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
    enterpriseName: string;
}

// ============================================
// Form Data Types
// ============================================

export interface ProductCategoryFormData {
    productCategoryName: string;
}

export interface ProductTypeFormData {
    productCategoryType: string;
    productCategoryId: number;
}

export interface ProductFormData {
    productName: string;
    productCategoryId: number;
    productTypeId: number;
}

export interface CraCroppingSystemFormData {
    cropName: string;
    seasonId: number;
}

export interface CraFarmingSystemFormData {
    farmingSystemName: string;
    seasonId: number;
}

export interface AryaEnterpriseFormData {
    enterpriseName: string;
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
