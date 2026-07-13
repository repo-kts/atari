// OFT Types
export interface OftSubject {
    oftSubjectId: number;
    subjectName: string;
    isOther?: boolean;
    _count?: {
        thematicAreas: number;
    };
}

export interface OftThematicArea {
    oftThematicAreaId: number;
    thematicAreaName: string;
    oftSubjectId: number;
    isOther?: boolean;
    subject?: {
        oftSubjectId: number;
        subjectName: string;
    };
}

// FLD Types
export interface Sector {
    sectorId: number;
    sectorName: string;
    isOther?: boolean;
    _count?: {
        thematicAreas: number;
        categories: number;
    };
}

export interface FldThematicArea {
    thematicAreaId: number;
    thematicAreaName: string;
    sectorId: number;
    isOther?: boolean;
    sector?: {
        sectorId: number;
        sectorName: string;
    };
}

export interface FldCategory {
    categoryId: number;
    categoryName: string;
    sectorId: number;
    isOther?: boolean;
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
    isOther?: boolean;
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
    isOther?: boolean;
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

export interface FldActivity {
    activityId: number;
    activityName: string;
    isOther?: boolean;
    _count?: {
        extensions: number;
        kvkExtensionActivities: number;
    };
}

// CFLD Types
export interface Season {
    seasonId: number;
    seasonName: string;
    isOther?: boolean;
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
    isOther?: boolean;
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
    isOther?: boolean;
}

export interface OftThematicAreaFormData {
    thematicAreaName: string;
    oftSubjectId: number;
    isOther?: boolean;
}

export interface SectorFormData {
    sectorName: string;
    isOther?: boolean;
}

export interface FldThematicAreaFormData {
    thematicAreaName: string;
    sectorId: number;
    isOther?: boolean;
}

export interface FldCategoryFormData {
    categoryName: string;
    sectorId: number;
    isOther?: boolean;
}

export interface FldSubcategoryFormData {
    subCategoryName: string;
    categoryId: number;
    isOther?: boolean;
}

export interface FldCropFormData {
    cropName: string;
    subCategoryId: number;
    isOther?: boolean;
}

export interface FldActivityFormData {
    activityName: string;
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
    isOther?: boolean;
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
