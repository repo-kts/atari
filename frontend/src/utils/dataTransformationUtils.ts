/**
 * Data Transformation Utilities
 *
 * Centralized utilities for sanitizing and transforming form data
 * before sending to the backend API. This ensures Prisma-compatible
 * data structures and prevents "Unknown argument" errors.
 */

import { ENTITY_TYPES } from '../constants/entityTypes';
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
        excludeFields: ['trainingType'],
    },
    [ENTITY_TYPES.TRAINING_THEMATIC_AREAS]: {
        excludeFields: ['trainingArea'],
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
    [ENTITY_TYPES.YEAR]: {
        excludeFields: ['yearId', '_count'],
    },
    [ENTITY_TYPES.ACHIEVEMENT_EXTENSION]: {
        transform: (data: any) => ({ ...data, isOther: false }),
    },
    [ENTITY_TYPES.ACHIEVEMENT_OTHER_EXTENSION]: {
        transform: (data: any) => ({ ...data, isOther: true }),
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
    // Extension Activity nested objects
    'staff',
    'activity',
    'fld',
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

    // Remove all common nested objects
    const nestedObjectsToRemove = [...COMMON_NESTED_OBJECTS, ...additionalExclusions];
    const cleaned: any = { ...restData };

    nestedObjectsToRemove.forEach((key) => {
        delete cleaned[key];
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
 * Complete data transformation pipeline for create operations
 */
export function transformDataForCreate(
    entityType: ExtendedEntityType | null,
    formData: any
): any {
    let transformed = removeNestedObjects(formData);
    transformed = removeCategoryIfNeeded(entityType, transformed);
    transformed = applyEntityTransformation(entityType, transformed);
    transformed = sanitizeEnumFields(entityType, transformed);
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
    transformed = removeCategoryIfNeeded(entityType, transformed);
    transformed = applyEntityTransformation(entityType, transformed);
    transformed = sanitizeEnumFields(entityType, transformed);
    return transformed;
}
