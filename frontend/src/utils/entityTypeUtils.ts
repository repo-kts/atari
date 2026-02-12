/**
 * Entity Type Utilities
 *
 * Centralized utilities for entity type checking and categorization
 * Reduces repetitive array checks and improves maintainability
 */

import { ENTITY_TYPES } from '../constants/entityTypes';
import type { ExtendedEntityType } from './masterUtils';

// ============================================
// Entity Type Categories
// ============================================

/**
 * Configuration for entity type categories
 * Makes it easy to add new entity types to categories
 */
export const ENTITY_CATEGORIES = {
    BASIC_MASTERS: [
        ENTITY_TYPES.ZONES,
        ENTITY_TYPES.STATES,
        ENTITY_TYPES.DISTRICTS,
        ENTITY_TYPES.ORGANIZATIONS,
        ENTITY_TYPES.UNIVERSITIES,
    ] as ExtendedEntityType[],

    OFT_FLD: [
        ENTITY_TYPES.OFT_SUBJECTS,
        ENTITY_TYPES.OFT_THEMATIC_AREAS,
        ENTITY_TYPES.FLD_SECTORS,
        ENTITY_TYPES.FLD_THEMATIC_AREAS,
        ENTITY_TYPES.FLD_CATEGORIES,
        ENTITY_TYPES.FLD_SUBCATEGORIES,
        ENTITY_TYPES.FLD_CROPS,
        ENTITY_TYPES.CFLD_CROPS,
    ] as ExtendedEntityType[],

    TRAINING_EXTENSION: [
        ENTITY_TYPES.TRAINING_TYPES,
        ENTITY_TYPES.TRAINING_AREAS,
        ENTITY_TYPES.TRAINING_THEMATIC_AREAS,
        ENTITY_TYPES.EXTENSION_ACTIVITIES,
        ENTITY_TYPES.OTHER_EXTENSION_ACTIVITIES,
        ENTITY_TYPES.EVENTS,
    ] as ExtendedEntityType[],

    PRODUCTION_PROJECTS: [
        ENTITY_TYPES.PRODUCT_CATEGORIES,
        ENTITY_TYPES.PRODUCT_TYPES,
        ENTITY_TYPES.PRODUCTS,
        ENTITY_TYPES.CRA_CROPPING_SYSTEMS,
        ENTITY_TYPES.CRA_FARMING_SYSTEMS,
        ENTITY_TYPES.ARYA_ENTERPRISES,
    ] as ExtendedEntityType[],

    ABOUT_KVK: [
        ENTITY_TYPES.KVK_BANK_ACCOUNTS,
        ENTITY_TYPES.KVK_EMPLOYEES,
        ENTITY_TYPES.KVK_STAFF_TRANSFERRED,
        ENTITY_TYPES.KVK_INFRASTRUCTURE,
        ENTITY_TYPES.KVK_VEHICLES,
        ENTITY_TYPES.KVK_VEHICLE_DETAILS,
        ENTITY_TYPES.KVK_EQUIPMENTS,
        ENTITY_TYPES.KVK_EQUIPMENT_DETAILS,
        ENTITY_TYPES.KVK_FARM_IMPLEMENTS,
        ENTITY_TYPES.KVKS,
    ] as ExtendedEntityType[],
} as const;

// ============================================
// Entity Type Checkers
// ============================================

/**
 * Check if entity type belongs to a category
 */
export function isEntityInCategory(
    entityType: ExtendedEntityType | null,
    category: keyof typeof ENTITY_CATEGORIES
): boolean {
    if (!entityType) return false;
    return ENTITY_CATEGORIES[category].includes(entityType);
}

/**
 * Get all entity type checkers as a single object
 * Useful for destructuring in components
 */
export function getEntityTypeChecks(entityType: ExtendedEntityType | null) {
    return {
        isBasicMaster: isEntityInCategory(entityType, 'BASIC_MASTERS'),
        isOftFld: isEntityInCategory(entityType, 'OFT_FLD'),
        isTrainingExtension: isEntityInCategory(entityType, 'TRAINING_EXTENSION'),
        isProductionProject: isEntityInCategory(entityType, 'PRODUCTION_PROJECTS'),
        isAboutKvk: isEntityInCategory(entityType, 'ABOUT_KVK'),
    };
}

// ============================================
// Path to Entity Type Mapping
// ============================================

/**
 * Map of path patterns to entity types
 * More maintainable than long if-else chains
 */
const PATH_TO_ENTITY_MAP: Record<string, ExtendedEntityType> = {
    // Basic masters (prefix matching)
    '/all-master/zones': ENTITY_TYPES.ZONES,
    '/all-master/states': ENTITY_TYPES.STATES,
    '/all-master/districts': ENTITY_TYPES.DISTRICTS,
    '/all-master/organizations': ENTITY_TYPES.ORGANIZATIONS,
    '/all-master/universities': ENTITY_TYPES.UNIVERSITIES,

    // OFT/FLD masters (exact matching)
    '/all-master/oft/subject': ENTITY_TYPES.OFT_SUBJECTS,
    '/all-master/oft/thematic-area': ENTITY_TYPES.OFT_THEMATIC_AREAS,
    '/all-master/fld/sector': ENTITY_TYPES.FLD_SECTORS,
    '/all-master/fld/thematic-area': ENTITY_TYPES.FLD_THEMATIC_AREAS,
    '/all-master/fld/category': ENTITY_TYPES.FLD_CATEGORIES,
    '/all-master/fld/sub-category': ENTITY_TYPES.FLD_SUBCATEGORIES,
    '/all-master/fld/crop': ENTITY_TYPES.FLD_CROPS,
    '/all-master/cfld-crop': ENTITY_TYPES.CFLD_CROPS,

    // Training, Extension & Events masters
    '/all-master/training-type': ENTITY_TYPES.TRAINING_TYPES,
    '/all-master/training-area': ENTITY_TYPES.TRAINING_AREAS,
    '/all-master/training-thematic': ENTITY_TYPES.TRAINING_THEMATIC_AREAS,
    '/all-master/extension-activity': ENTITY_TYPES.EXTENSION_ACTIVITIES,
    '/all-master/other-extension-activity': ENTITY_TYPES.OTHER_EXTENSION_ACTIVITIES,
    '/all-master/events': ENTITY_TYPES.EVENTS,

    // Production & Projects masters
    '/all-master/product-category': ENTITY_TYPES.PRODUCT_CATEGORIES,
    '/all-master/product-type': ENTITY_TYPES.PRODUCT_TYPES,
    '/all-master/product': ENTITY_TYPES.PRODUCTS,
    '/all-master/cra-croping-system': ENTITY_TYPES.CRA_CROPPING_SYSTEMS,
    '/all-master/cra-farming-system': ENTITY_TYPES.CRA_FARMING_SYSTEMS,
    '/all-master/arya-enterprise': ENTITY_TYPES.ARYA_ENTERPRISES,

    // Publication masters
    '/all-master/publication-item': ENTITY_TYPES.PUBLICATION_ITEMS,

    // About KVK entities
    '/forms/about-kvk/bank-account': ENTITY_TYPES.KVK_BANK_ACCOUNTS,
    '/forms/about-kvk/employee-details': ENTITY_TYPES.KVK_EMPLOYEES,
    '/forms/about-kvk/staff-transferred': ENTITY_TYPES.KVK_STAFF_TRANSFERRED,
    '/forms/about-kvk/infrastructure': ENTITY_TYPES.KVK_INFRASTRUCTURE,
    '/forms/about-kvk/vehicles': ENTITY_TYPES.KVK_VEHICLES,
    '/forms/about-kvk/vehicle-details': ENTITY_TYPES.KVK_VEHICLE_DETAILS,
    '/forms/about-kvk/equipments': ENTITY_TYPES.KVK_EQUIPMENTS,
    '/forms/about-kvk/equipment-details': ENTITY_TYPES.KVK_EQUIPMENT_DETAILS,
    '/forms/about-kvk/farm-implements': ENTITY_TYPES.KVK_FARM_IMPLEMENTS,
    '/forms/about-kvk/details': ENTITY_TYPES.KVKS,
    '/forms/about-kvk/view-kvks': ENTITY_TYPES.KVKS,
};

/**
 * Get entity type from path using map-based lookup
 * More efficient and maintainable than if-else chain
 */
export function getEntityTypeFromPathMap(path: string): ExtendedEntityType | null {
    // First try exact match
    if (PATH_TO_ENTITY_MAP[path]) {
        return PATH_TO_ENTITY_MAP[path];
    }

    // Then try prefix matching (for paths like /all-master/zones/create or /all-master/zones/edit/1)
    for (const [pattern, entityType] of Object.entries(PATH_TO_ENTITY_MAP)) {
        if (path.startsWith(pattern)) {
            // Match if path starts with the pattern (handles /create, /edit/:id suffixes)
            return entityType;
        }
    }

    return null;
}
