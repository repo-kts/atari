// OFT Types
export interface OftSubject {
    oftSubjectId: number;
    subjectName: string;
    _count?: {
        thematicAreas: number;
    };
}

export interface OftThematicArea {
    oftThematicAreaId: number;
    thematicAreaName: string;
    oftSubjectId: number;
    subject?: {
        oftSubjectId: number;
        subjectName: string;
    };
}

// FLD Types
export interface Sector {
    sectorId: number;
    sectorName: string;
    _count?: {
        thematicAreas: number;
        categories: number;
    };
}

export interface FldThematicArea {
    thematicAreaId: number;
    thematicAreaName: string;
    sectorId: number;
    sector?: {
        sectorId: number;
        sectorName: string;
    };
}

export interface FldCategory {
    categoryId: number;
    categoryName: string;
    sectorId: number;
    sector?: {
        sectorId: number;
        sectorName: string;
    };
    _count?: {
        subCategories: number;
    };
}

export interface FldSubcategory {
    subCategoryId: number;
    subCategoryName: string;
    categoryId: number;
    category?: {
        categoryId: number;
        categoryName: string;
        sector?: {
            sectorId: number;
            sectorName: string;
        };
    };
    _count?: {
        crops: number;
    };
}

export interface FldCrop {
    cropId: number;
    cropName: string;
    subCategoryId: number;
    subCategory?: {
        subCategoryId: number;
        subCategoryName: string;
        category?: {
            categoryId: number;
            categoryName: string;
            sector?: {
                sectorId: number;
                sectorName: string;
            };
        };
    };
}

// CFLD Types
export interface Season {
    seasonId: number;
    seasonName: string;
    _count?: {
        cfldCrops: number;
    };
}

export interface CropType {
    typeId: number;
    typeName: string;
    _count?: {
        cfldCrops: number;
    };
}

export interface CfldCrop {
    cfldId: number;
    seasonId: number;
    season?: {
        seasonId: number;
        seasonName: string;
    };
    typeId: number;
    cropType?: {
        typeId: number;
        typeName: string;
    };
    CropName: string;
}

// API Response Types
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

// Form Data Types
export interface OftSubjectFormData {
    subjectName: string;
}

export interface OftThematicAreaFormData {
    thematicAreaName: string;
    oftSubjectId: number;
}

export interface SectorFormData {
    sectorName: string;
}

export interface FldThematicAreaFormData {
    thematicAreaName: string;
    sectorId: number;
}

export interface FldCategoryFormData {
    categoryName: string;
    sectorId: number;
}

export interface FldSubcategoryFormData {
    subCategoryName: string;
    categoryId: number;
}

export interface FldCropFormData {
    cropName: string;
    subCategoryId: number;
}

export interface SeasonFormData {
    seasonName: string;
}

export interface CropTypeFormData {
    typeName: string;
}

export interface CfldCropFormData {
    seasonId: number;
    typeId: number;
    CropName: string;
}

// Statistics Types
export interface OftFldStats {
    oft: {
        subjects: number;
        thematicAreas: number;
    };
    fld: {
        sectors: number;
        thematicAreas: number;
        categories: number;
        subcategories: number;
        crops: number;
    };
    cfld: {
        crops: number;
    };
}
