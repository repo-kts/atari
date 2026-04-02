/**
 * Data Transformation Utilities
 *
 * Centralized utilities for sanitizing and transforming form data
 * before sending to the backend API. This ensures Prisma-compatible
 * data structures and prevents "Unknown argument" errors.
 */

import { ENTITY_TYPES } from '../constants/entityConstants';
import type { ExtendedEntityType } from './masterUtils';

// ============================================
// Type Definitions
// ============================================

export interface TransformationRule {
    /** Fields to exclude from the payload */
    excludeFields?: string[];
    /** Fields to include (whitelist approach) */
    includeFields?: string[];
    /** Custom transformation function */
    transform?: (data: any) => any;
}

// ============================================
// Configuration: Entity-Specific Rules
// ============================================

/**
 * Entity-specific transformation rules
 * This configuration makes it easy to add/modify rules for any entity
 */
const ENTITY_TRANSFORMATION_RULES: Partial<Record<ExtendedEntityType, TransformationRule>> = {
    [ENTITY_TYPES.KVKS]: {
        transform: (data: any) => {
            const transformed = { ...data };
            // Ensure primitive FK IDs are present and numeric
            const coerce = (v: any) => (v === '' || v === null || v === undefined ? undefined : Number(v));
            transformed.zoneId = coerce(transformed.zoneId ?? transformed.district?.state?.zone?.zoneId);
            transformed.stateId = coerce(transformed.stateId ?? transformed.district?.state?.stateId);
            transformed.districtId = coerce(transformed.districtId ?? transformed.district?.districtId);
            transformed.orgId = coerce(transformed.orgId ?? transformed.org?.orgId ?? transformed.organization?.orgId);
            transformed.universityId = coerce(transformed.universityId ?? transformed.university?.universityId);
            return transformed;
        },
    },
    [ENTITY_TYPES.UNIVERSITIES]: {
        includeFields: ['universityName', 'orgId'],
    },
    [ENTITY_TYPES.ORGANIZATIONS]: {
        excludeFields: ['zoneId', 'stateId'],
    },
    [ENTITY_TYPES.FLD_CROPS]: {
        excludeFields: ['sectorId'],
    },
    [ENTITY_TYPES.CFLD_CROPS]: {
        transform: (data: any) => {
            if (data.CropName) {
                data.cropName = data.CropName;
                delete data.CropName;
            }
            return data;
        },
    },
    [ENTITY_TYPES.TRAINING_AREAS]: {
        excludeFields: ['trainingType', 'trainingAreaId', 'trainingThematicAreaId', 'kvkId'],
    },
    [ENTITY_TYPES.TRAINING_THEMATIC_AREAS]: {
        excludeFields: ['trainingArea', 'kvkId'],
    },
    [ENTITY_TYPES.PRODUCT_TYPES]: {
        excludeFields: ['productCategory'],
    },
    [ENTITY_TYPES.PRODUCTS]: {
        excludeFields: ['productCategory', 'productType'],
    },
    [ENTITY_TYPES.SEASON]: {
        excludeFields: ['seasonId', '_count'],
    },
    [ENTITY_TYPES.SANCTIONED_POST]: {
        excludeFields: ['sanctionedPostId', '_count'],
    },
    [ENTITY_TYPES.PROJECT_CFLD_EXTENSION_ACTIVITY]: {
        transform: (data: any) => {
            if (data.date) {
                data.activityDate = data.date;
                delete data.date;
            }
            return data;
        },
    },
    [ENTITY_TYPES.PROJECT_NICRA_BASIC]: {
        excludeFields: ['id', 'kvkName'],
    },
    [ENTITY_TYPES.KVK_VEHICLE_DETAILS]: {
        transform: (data: any) => {
            const transformed = { ...data };
            if (transformed.reportingYear) {
                transformed.reportingYear = new Date(transformed.reportingYear).toISOString();
            }
            return transformed;
        },
    },
    [ENTITY_TYPES.KVK_EQUIPMENT_DETAILS]: {
        transform: (data: any) => {
            const transformed = { ...data };
            if (transformed.reportingYear) {
                transformed.reportingYear = new Date(transformed.reportingYear).toISOString();
            }
            return transformed;
        },
    },
    [ENTITY_TYPES.KVK_EMPLOYEES]: {
        transform: (data: any) => {
            const transformed = { ...data };
            if (Array.isArray(data.photoPath)) {
                const photos = data.photoPath.map((p: any) => ({
                    image: p.image,
                    caption: p.caption || ''
                }));
                transformed.photoPath = JSON.stringify(photos);
            }
            return transformed;
        }
    },
    [ENTITY_TYPES.KVK_STAFF_TRANSFERRED]: {
        transform: (data: any) => {
            const transformed = { ...data };
            if (Array.isArray(data.photoPath)) {
                const photos = data.photoPath.map((p: any) => ({
                    image: p.image,
                    caption: p.caption || ''
                }));
                transformed.photoPath = JSON.stringify(photos);
            }
            return transformed;
        }
    },
    [ENTITY_TYPES.PROJECT_CFLD_TECHNICAL_PARAM]: {
        transform: (data: any) => {
            const transformed = { ...data };

            // Map training photos
            if (transformed.trainingPhotos || transformed.trainingPhotos_caption) {
                transformed.trainingPhotoPath = JSON.stringify({
                    image: transformed.trainingPhotos ?? transformed.trainingPhotoPath ?? null,
                    caption: transformed.trainingPhotos_caption ?? ""
                });
            }

            // Map action photos
            if (transformed.actionPhotos || transformed.actionPhotos_caption) {
                transformed.qualityActionPhotoPath = JSON.stringify({
                    image: transformed.actionPhotos ?? transformed.qualityActionPhotoPath ?? null,
                    caption: transformed.actionPhotos_caption ?? ""
                });
            }

            // Clean up temporary frontend fields
            delete transformed.trainingPhotos;
            delete transformed.trainingPhotos_preview;
            delete transformed.trainingPhotos_caption;
            delete transformed.actionPhotos;
            delete transformed.actionPhotos_preview;
            delete transformed.actionPhotos_caption;

            return transformed;
        }
    },
    [ENTITY_TYPES.PROJECT_ARYA_CURRENT]: {
        transform: (data: any) => {
            const transformed = { ...data };
            if (Array.isArray(data.arya_photos)) {
                const photos = data.arya_photos.map((p: any) => ({
                    image: p.image,
                    caption: p.caption || ''
                }));
                transformed.imagePath = JSON.stringify(photos);
            }
            delete transformed.arya_photos;
            return transformed;
        }
    },
    [ENTITY_TYPES.PROJECT_ARYA_EVALUATION]: {
        transform: (data: any) => {
            const transformed = { ...data };
            if (Array.isArray(data.arya_photos)) {
                const photos = data.arya_photos.map((p: any) => ({
                    image: p.image,
                    caption: p.caption || ''
                }));
                transformed.imagePath = JSON.stringify(photos);
            }
            delete transformed.arya_photos;
            return transformed;
        }
    },
    [ENTITY_TYPES.MISC_MEETINGS_SAC]: {
        transform: (data: any) => {
            const transformed = { ...data };
            if (Array.isArray(transformed.uploadedFile)) {
                transformed.uploadedFile = JSON.stringify(transformed.uploadedFile);
            }
            return transformed;
        }
    },
    [ENTITY_TYPES.PROJECT_NICRA_DETAILS]: {
        transform: (data: any) => {
            const transformed = { ...data };
            if (Array.isArray(data.photographs)) {
                transformed.photographs = JSON.stringify(data.photographs.map((p: any) => ({
                    image: p.image,
                    caption: p.caption || ''
                })));
            }
            return transformed;
        }
    },
    [ENTITY_TYPES.PROJECT_NICRA_CUSTOM_HIRING]: {
        transform: (data: any) => {
            const transformed = { ...data };
            if (Array.isArray(data.photographs)) {
                transformed.photographs = JSON.stringify(data.photographs.map((p: any) => ({
                    image: p.image,
                    caption: p.caption || ''
                })));
            }
            return transformed;
        }
    },
    [ENTITY_TYPES.PROJECT_NICRA_VCRMC]: {
        transform: (data: any) => {
            const transformed = { ...data };
            if (Array.isArray(data.photographs)) {
                transformed.photographs = JSON.stringify(data.photographs.map((p: any) => ({
                    image: p.image,
                    caption: p.caption || ''
                })));
            }
            return transformed;
        }
    },
    [ENTITY_TYPES.PROJECT_NICRA_CONVERGENCE]: {
        transform: (data: any) => {
            const transformed = { ...data };
            if (Array.isArray(data.photographs)) {
                transformed.photographs = JSON.stringify(data.photographs.map((p: any) => ({
                    image: p.image,
                    caption: p.caption || ''
                })));
            }
            return transformed;
        }
    },
    [ENTITY_TYPES.PROJECT_NICRA_DIGNITARIES]: {
        transform: (data: any) => {
            const transformed = { ...data };
            if (Array.isArray(data.photographs)) {
                transformed.photographs = JSON.stringify(data.photographs.map((p: any) => ({
                    image: p.image,
                    caption: p.caption || ''
                })));
            }
            return transformed;
        }
    },
    [ENTITY_TYPES.PROJECT_NICRA_SOIL_HEALTH]: {
        transform: (data: any) => {
            const transformed = { ...data };
            if (Array.isArray(data.photographs)) {
                transformed.photographs = JSON.stringify(data.photographs.map((p: any) => ({
                    image: p.image,
                    caption: p.caption || ''
                })));
            }
            return transformed;
        }
    },
    [ENTITY_TYPES.PROJECT_NATURAL_FARMING_PHYSICAL]: {
        transform: (data: any) => {
            const transformed = { ...data };
            if (Array.isArray(data.images)) {
                transformed.images = JSON.stringify(data.images.map((p: any) => ({
                    image: p.image,
                    caption: p.caption || ''
                })));
            }
            return transformed;
        }
    },
    [ENTITY_TYPES.PROJECT_NATURAL_FARMING_DEMO]: {
        transform: (data: any) => {
            const transformed = { ...data };
            if (Array.isArray(data.images)) {
                transformed.images = JSON.stringify(data.images.map((p: any) => ({
                    image: p.image,
                    caption: p.caption || ''
                })));
            }
            return transformed;
        }
    },
    [ENTITY_TYPES.ACHIEVEMENT_AWARD_FARMER]: {
        transform: (data: any) => {
            const transformed = { ...data };
            if (Array.isArray(data.image)) {
                transformed.image = JSON.stringify(data.image.map((p: any) => ({
                    image: p.image,
                    caption: p.caption || ''
                })));
            }
            return transformed;
        }
    },
    [ENTITY_TYPES.PERFORMANCE_IMPACT_SUCCESS_STORIES]: {
        transform: (data: any) => {
            const transformed = { ...data };
            if (Array.isArray(data.supportingImages)) {
                transformed.supportingImages = JSON.stringify(data.supportingImages.map((p: any) => ({
                    image: p.image,
                    caption: p.caption || ''
                })));
            }
            return transformed;
        }
    },
};

// ============================================
// Common Nested Objects to Filter
// ============================================

/**
 * List of nested objects that should always be filtered out
 * These are read-only relation objects from the API response
 */
const COMMON_NESTED_OBJECTS = [
    // Basic master nested objects
    'zone',
    'state',
    'subject',
    'sector',
    'subCategory',
    'season',
    'cropType',
    // About KVK nested objects
    'kvk',
    'organization',
    'district',
    'org',
    'sanctionedPost',
    'discipline',
    'infraMaster',
    'vehicle',
    'equipment',
    // Training/Extension nested objects
    'trainingType',
    'trainingArea',
    // Production/Projects nested objects
    'productCategory',
    'productType',
    // ARYA / CSISA nested relation objects
    'enterprise',
    'reportingYear',
    'cropDetails',
    'dignitaryType',
] as const;

// ============================================
// Core Transformation Functions
// ============================================

/**
 * Removes nested objects and read-only fields from form data
 * Keeps foreign key IDs but removes the full relation objects
 */
export function removeNestedObjects(
    data: any,
    additionalExclusions: string[] = []
): any {
    const {
        _count,
        // Timestamps
        createdAt,
        updatedAt,
        ...restData
    } = data;

    // Remove all common nested objects Only if they are actually objects
    // This preserves string fields that share names with nested objects (like 'district')
    const nestedObjectsToRemove = [...COMMON_NESTED_OBJECTS, ...additionalExclusions];
    const cleaned: any = { ...restData };

    nestedObjectsToRemove.forEach((key) => {
        if (cleaned[key] && typeof cleaned[key] === 'object') {
            delete cleaned[key];
        }
    });

    return cleaned;
}

/**
 * Applies entity-specific transformation rules
 */
export function applyEntityTransformation(
    entityType: ExtendedEntityType | null,
    data: any
): any {
    if (!entityType) return data;

    const rule = ENTITY_TRANSFORMATION_RULES[entityType];
    if (!rule) return data;

    let transformed = { ...data };

    // Apply custom transformation function if provided
    if (rule.transform) {
        transformed = rule.transform(transformed);
    }

    // Apply field exclusions
    if (rule.excludeFields) {
        rule.excludeFields.forEach((field) => {
            delete transformed[field];
        });
    }

    // Apply field inclusions (whitelist approach)
    if (rule.includeFields) {
        const whitelisted: any = {};
        rule.includeFields.forEach((field) => {
            if (transformed[field] !== undefined) {
                whitelisted[field] = transformed[field];
            }
        });
        transformed = whitelisted;
    }

    return transformed;
}

/**
 * Removes empty string ID fields from data
 * Empty strings for ID fields should not be sent to the backend
 */
export function removeEmptyIdFields(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const cleaned = { ...data };
    Object.keys(cleaned).forEach((key) => {
        if (key.endsWith('Id') && cleaned[key] === '') {
            delete cleaned[key];
        }
    });

    return cleaned;
}

/**
 * Normalizes legacy year fields to canonical reportingYear (Date string).
 * Accepts year-like numeric inputs (e.g. 2024) and converts to YYYY-01-01.
 */
export function normalizeLegacyReportingYear(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const normalized = { ...data };
    const legacyYear =
        normalized.reportingYear ??
        normalized.year;

    if (legacyYear !== undefined && legacyYear !== null && legacyYear !== '') {
        const asString = String(legacyYear).trim();
        const yearMatch = asString.match(/^\d{4}$/);
        normalized.reportingYear = yearMatch ? `${asString}-01-01` : asString;
    }

    delete normalized.year;

    return normalized;
}

/**
 * Sanitizes optional enum fields (converts empty strings to null)
 * Prisma requires null for optional enum fields, not empty strings
 */
export function sanitizeEnumFields(
    entityType: ExtendedEntityType | null,
    data: any
): any {
    const enumFieldsToSanitize: Record<string, string[]> = {
        [ENTITY_TYPES.KVK_EMPLOYEES]: ['payLevel'],
        [ENTITY_TYPES.KVK_STAFF_TRANSFERRED]: ['payLevel'],
    };

    if (!entityType) return data;

    const fields = enumFieldsToSanitize[entityType];
    if (!fields) return data;

    const sanitized = { ...data };
    fields.forEach((field) => {
        if (sanitized[field] === '') {
            sanitized[field] = null;
        }
    });

    return sanitized;
}

/**
 * Normalizes reporting year aliases and strips ambiguous legacy year strings
 * when a canonical year ID is already present.
 */
export function normalizeReportingYearFields(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const normalized = { ...data };
    const strictDatePattern = /^\d{4}-\d{2}-\d{2}(?:T.*)?$/;

    const hasReportingYearId =
        normalized.reportingYearId !== undefined &&
        normalized.reportingYearId !== null &&
        normalized.reportingYearId !== '';

    const hasYearId =
        normalized.yearId !== undefined &&
        normalized.yearId !== null &&
        normalized.yearId !== '';

    if (!hasReportingYearId && hasYearId) {
        normalized.reportingYearId = normalized.yearId;
    }

    if (normalized.reportingYearId !== undefined && normalized.reportingYearId !== null && normalized.reportingYearId !== '') {
        if (normalized.yearId === undefined || normalized.yearId === null || normalized.yearId === '') {
            normalized.yearId = normalized.reportingYearId;
        }

        if (
            typeof normalized.reportingYear === 'string' &&
            normalized.reportingYear.trim() !== '' &&
            !/^\d+$/.test(normalized.reportingYear.trim())
        ) {
            delete normalized.reportingYear;
        }

        if (
            typeof normalized.year === 'string' &&
            normalized.year.trim() !== '' &&
            !/^\d+$/.test(normalized.year.trim())
        ) {
            delete normalized.year;
        }
    }

    const hasCanonicalYearId =
        normalized.reportingYearId !== undefined &&
        normalized.reportingYearId !== null &&
        normalized.reportingYearId !== '';

    if (normalized.reportingYear !== undefined && typeof normalized.reportingYear === 'string') {
        const value = normalized.reportingYear.trim();
        if (value && !strictDatePattern.test(value) && !hasCanonicalYearId) {
            delete normalized.reportingYear;
        }
    }

    if (normalized.year !== undefined && typeof normalized.year === 'string') {
        const value = normalized.year.trim();
        if (value && !strictDatePattern.test(value) && !hasCanonicalYearId) {
            delete normalized.year;
        }
    }

    return normalized;
}

/**
 * Removes category field conditionally
 * Category is a direct field for KVK employees, not a nested object
 */
export function removeCategoryIfNeeded(
    entityType: ExtendedEntityType | null,
    data: any
): any {
    const shouldKeepCategory =
        entityType === ENTITY_TYPES.KVK_EMPLOYEES ||
        entityType === ENTITY_TYPES.KVK_STAFF_TRANSFERRED;

    if (shouldKeepCategory || !('category' in data)) {
        return data;
    }

    const { category, ...rest } = data;
    return rest;
}

/**
 * Removes the ID field from data (used for create operations)
 */
export function removeIdField(
    _entityType: ExtendedEntityType | null,
    idField: string,
    data: any
): any {
    const { [idField]: _, ...rest } = data;
    return rest;
}

// ============================================
// Main Transformation Pipeline
// ============================================

/**
 * Recursively finds and converts File/FileList objects to Base64 strings
 * This is used to ensure file data is preserved when sending as JSON
 */
export async function processFiles(data: any): Promise<any> {
    if (!data || typeof data !== 'object') return data;

    // Handle File objects
    if (data instanceof File) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(data);
        });
    }

    // Handle FileList objects
    if (data instanceof FileList) {
        const files = Array.from(data);
        return Promise.all(files.map(file => processFiles(file)));
    }

    // Handle Arrays
    if (Array.isArray(data)) {
        return Promise.all(data.map(item => processFiles(item)));
    }

    // Handle Objects
    const processed: any = {};
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            processed[key] = await processFiles(data[key]);
        }
    }
    return processed;
}

/**
 * Complete data transformation pipeline for create operations
 */
export function transformDataForCreate(
    entityType: ExtendedEntityType | null,
    formData: any
): any {
    let transformed = removeNestedObjects(formData);
    transformed = normalizeReportingYearFields(transformed);
    transformed = removeCategoryIfNeeded(entityType, transformed);
    transformed = applyEntityTransformation(entityType, transformed);
    transformed = normalizeLegacyReportingYear(transformed);
    transformed = sanitizeEnumFields(entityType, transformed);
    transformed = removeEmptyIdFields(transformed); // Remove empty string ID fields
    return transformed;
}

/**
 * Complete data transformation pipeline for update operations
 */
export function transformDataForUpdate(
    entityType: ExtendedEntityType | null,
    idField: string,
    formData: any
): any {
    let transformed = removeIdField(entityType, idField, formData);
    transformed = removeNestedObjects(transformed);
    transformed = normalizeReportingYearFields(transformed);
    transformed = removeCategoryIfNeeded(entityType, transformed);
    transformed = applyEntityTransformation(entityType, transformed);
    transformed = normalizeLegacyReportingYear(transformed);
    transformed = sanitizeEnumFields(entityType, transformed);
    transformed = removeEmptyIdFields(transformed); // Remove empty string ID fields
    return transformed;
}
