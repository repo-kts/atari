import { QueryClient } from '@tanstack/react-query';
import { ENTITY_TYPES } from '@/constants/entityTypes';

/**
 * Entity dependency configuration
 * Defines which entities depend on which other entities and their relationship fields
 */
export interface EntityDependency {
    /** Entity types that depend on this entity */
    dependents: string[];
    /** Field name that creates the dependency (e.g., 'zoneId', 'stateId') */
    dependencyField?: string;
    /** Related query patterns (e.g., 'states-by-zone') */
    relatedQueryPatterns?: string[];
}

/**
 * Dependency map for master data entities
 * When an entity is mutated, all dependent entities should be invalidated
 */
export const ENTITY_DEPENDENCY_MAP: Record<string, EntityDependency> = {
    // Zones: Top-level entity, no dependencies
    [ENTITY_TYPES.ZONES]: {
        dependents: [
            ENTITY_TYPES.STATES,
            ENTITY_TYPES.DISTRICTS,
            ENTITY_TYPES.ORGANIZATIONS,
            ENTITY_TYPES.UNIVERSITIES,
            ENTITY_TYPES.KVKS,
        ],
        dependencyField: 'zoneId',
        relatedQueryPatterns: ['states-by-zone'],
    },

    // States: Depend on Zones
    [ENTITY_TYPES.STATES]: {
        dependents: [
            ENTITY_TYPES.DISTRICTS,
            ENTITY_TYPES.ORGANIZATIONS,
            ENTITY_TYPES.UNIVERSITIES,
            ENTITY_TYPES.KVKS,
        ],
        dependencyField: 'stateId',
        relatedQueryPatterns: ['districts-by-state'],
    },

    // Districts: Depend on States and Zones (via state)
    [ENTITY_TYPES.DISTRICTS]: {
        dependents: [
            ENTITY_TYPES.ORGANIZATIONS,
            ENTITY_TYPES.UNIVERSITIES,
            ENTITY_TYPES.KVKS,
        ],
        dependencyField: 'districtId',
        relatedQueryPatterns: ['organizations-by-district'],
    },

    // Organizations: Depend on Districts
    [ENTITY_TYPES.ORGANIZATIONS]: {
        dependents: [
            ENTITY_TYPES.UNIVERSITIES,
            ENTITY_TYPES.KVKS,
        ],
        dependencyField: 'orgId',
        relatedQueryPatterns: ['universities-by-organization'],
    },

    // Universities: Depend on Organizations
    [ENTITY_TYPES.UNIVERSITIES]: {
        dependents: [
            ENTITY_TYPES.KVKS,
        ],
        dependencyField: 'universityId',
        relatedQueryPatterns: [],
    },

    // KVKs: Depend on Zones, States, Districts, Organizations, Universities
    [ENTITY_TYPES.KVKS]: {
        dependents: [
            ENTITY_TYPES.KVK_EMPLOYEES,
            ENTITY_TYPES.KVK_BANK_ACCOUNTS,
            ENTITY_TYPES.KVK_INFRASTRUCTURE,
            ENTITY_TYPES.KVK_VEHICLES,
            ENTITY_TYPES.KVK_EQUIPMENTS,
            ENTITY_TYPES.KVK_FARM_IMPLEMENTS,
        ],
        dependencyField: 'kvkId',
        relatedQueryPatterns: [],
    },

    // OFT/FLD Dependencies
    [ENTITY_TYPES.OFT_SUBJECTS]: {
        dependents: [ENTITY_TYPES.OFT_THEMATIC_AREAS],
        dependencyField: 'subjectId',
        relatedQueryPatterns: [],
    },

    [ENTITY_TYPES.OFT_THEMATIC_AREAS]: {
        dependents: [],
        dependencyField: 'thematicAreaId',
        relatedQueryPatterns: [],
    },

    [ENTITY_TYPES.FLD_SECTORS]: {
        dependents: [
            ENTITY_TYPES.FLD_THEMATIC_AREAS,
            ENTITY_TYPES.FLD_CATEGORIES,
        ],
        dependencyField: 'sectorId',
        relatedQueryPatterns: [],
    },

    [ENTITY_TYPES.FLD_THEMATIC_AREAS]: {
        dependents: [],
        dependencyField: 'thematicAreaId',
        relatedQueryPatterns: [],
    },

    [ENTITY_TYPES.FLD_CATEGORIES]: {
        dependents: [
            ENTITY_TYPES.FLD_SUBCATEGORIES,
        ],
        dependencyField: 'categoryId',
        relatedQueryPatterns: [],
    },

    [ENTITY_TYPES.FLD_SUBCATEGORIES]: {
        dependents: [
            ENTITY_TYPES.FLD_CROPS,
        ],
        dependencyField: 'subcategoryId',
        relatedQueryPatterns: [],
    },

    [ENTITY_TYPES.FLD_CROPS]: {
        dependents: [],
        dependencyField: 'cropId',
        relatedQueryPatterns: [],
    },

    // Production & Projects Dependencies
    [ENTITY_TYPES.PRODUCT_CATEGORIES]: {
        dependents: [
            ENTITY_TYPES.PRODUCT_TYPES,
            ENTITY_TYPES.PRODUCTS,
        ],
        dependencyField: 'categoryId',
        relatedQueryPatterns: [],
    },

    [ENTITY_TYPES.PRODUCT_TYPES]: {
        dependents: [ENTITY_TYPES.PRODUCTS],
        dependencyField: 'typeId',
        relatedQueryPatterns: [],
    },

    [ENTITY_TYPES.PRODUCTS]: {
        dependents: [],
        dependencyField: 'productId',
        relatedQueryPatterns: [],
    },

    // KVK Entity Dependencies
    [ENTITY_TYPES.KVK_VEHICLES]: {
        dependents: [ENTITY_TYPES.KVK_VEHICLE_DETAILS],
        dependencyField: 'vehicleId',
        relatedQueryPatterns: ['kvk-vehicles-dropdown'],
    },

    [ENTITY_TYPES.KVK_EQUIPMENTS]: {
        dependents: [ENTITY_TYPES.KVK_EQUIPMENT_DETAILS],
        dependencyField: 'equipmentId',
        relatedQueryPatterns: ['kvk-equipments-dropdown'],
    },

    [ENTITY_TYPES.KVK_EMPLOYEES]: {
        dependents: [ENTITY_TYPES.KVK_STAFF_TRANSFERRED],
        dependencyField: 'employeeId',
        relatedQueryPatterns: [],
    },

    // Training, Extension & Events Dependencies
    [ENTITY_TYPES.TRAINING_TYPES]: {
        dependents: [ENTITY_TYPES.TRAINING_AREAS],
        dependencyField: 'trainingTypeId',
        relatedQueryPatterns: [],
    },

    [ENTITY_TYPES.TRAINING_AREAS]: {
        dependents: [ENTITY_TYPES.TRAINING_THEMATIC_AREAS],
        dependencyField: 'trainingAreaId',
        relatedQueryPatterns: [],
    },

    [ENTITY_TYPES.TRAINING_THEMATIC_AREAS]: {
        dependents: [],
        dependencyField: 'thematicAreaId',
        relatedQueryPatterns: [],
    },
};

/**
 * Options for invalidation
 */
export interface InvalidationOptions {
    /** User context for user-scoped queries */
    user?: {
        userId?: number | null;
        role?: string | null;
    };
    /** Entity ID for related query invalidation */
    entityId?: number;
    /** Whether to invalidate related queries (e.g., states-by-zone) */
    invalidateRelatedQueries?: boolean;
    /** Additional query keys to invalidate */
    additionalKeys?: string[][];
}

/**
 * Centralized query invalidation utility
 * Invalidates queries for the mutated entity and all dependent entities
 */
export function invalidateEntityQueries(
    queryClient: QueryClient,
    entityType: string,
    options: InvalidationOptions = {}
): void {
    const {
        user,
        entityId,
        invalidateRelatedQueries = true,
        additionalKeys = [],
    } = options;

    // Get dependency configuration for this entity
    const dependency = ENTITY_DEPENDENCY_MAP[entityType];

    // 1. Invalidate the mutated entity itself
    invalidateQueryKey(queryClient, ['master-data', entityType], user);

    // Also invalidate non-master-data query keys (for entities that don't use master-data prefix)
    if (!entityType.startsWith('master-data')) {
        invalidateQueryKey(queryClient, [entityType], user);
    }

    // 2. Invalidate all dependent entities
    if (dependency?.dependents) {
        for (const dependentEntity of dependency.dependents) {
            // Check if dependent entity uses master-data prefix
            const isMasterDataEntity = [
                ENTITY_TYPES.ZONES,
                ENTITY_TYPES.STATES,
                ENTITY_TYPES.DISTRICTS,
                ENTITY_TYPES.ORGANIZATIONS,
                ENTITY_TYPES.UNIVERSITIES,
            ].includes(dependentEntity as any);

            if (isMasterDataEntity) {
                invalidateQueryKey(queryClient, ['master-data', dependentEntity], user);
            } else {
                // For non-master-data entities, use their direct query key
                invalidateQueryKey(queryClient, [dependentEntity], user);
            }
        }
    }

    // 3. Invalidate related queries (e.g., states-by-zone, districts-by-state)
    if (invalidateRelatedQueries && dependency?.relatedQueryPatterns) {
        for (const pattern of dependency.relatedQueryPatterns) {
            // Always invalidate the pattern without entityId to catch all related queries
            invalidateQueryKey(queryClient, ['master-data', pattern], user);
            // If entityId is provided, also invalidate the specific entity query
            if (entityId !== undefined) {
                invalidateQueryKey(queryClient, ['master-data', pattern, entityId], user);
            }
        }
    }

    // 4. Invalidate additional keys provided
    for (const key of additionalKeys) {
        invalidateQueryKey(queryClient, key, user);
    }
}

/**
 * Helper function to invalidate a query key with user context
 * Uses partial matching to invalidate all variants (with/without params, user context)
 * Forces immediate refetch of active queries to update DOM in real-time
 */
function invalidateQueryKey(
    queryClient: QueryClient,
    baseKey: (string | number)[],
    user?: {
        userId?: number | null;
        role?: string | null;
    }
): void {
    // Invalidate with partial matching to catch all variants
    // This will match:
    // - ['master-data', 'zones']
    // - ['master-data', 'zones', params]
    // - ['master-data', 'zones', params, userId, role]
    // refetchType: 'all' ensures ALL queries (active and inactive) are refetched immediately
    // This guarantees real-time updates even if queries are considered "fresh" due to staleTime
    queryClient.invalidateQueries({
        queryKey: baseKey,
        exact: false, // Partial matching
        refetchType: 'all', // Refetch ALL queries (active and inactive) immediately to update DOM
    });

    // Also invalidate with user context if provided
    if (user) {
        const keyWithUser = [...baseKey, user.userId ?? null, user.role ?? null];
        queryClient.invalidateQueries({
            queryKey: keyWithUser,
            exact: false,
            refetchType: 'all', // Refetch ALL queries immediately to update DOM
        });
    }
}

/**
 * Map entity types to their actual query keys used in hooks
 * Handles plural/singular mismatches (e.g., 'season' -> 'seasons')
 */
const ENTITY_TO_QUERY_KEY_MAP: Record<string, string[]> = {
    [ENTITY_TYPES.SEASON]: ['seasons'], // Other Masters - singular
    [ENTITY_TYPES.SANCTIONED_POST]: ['sanctioned-posts'],
    [ENTITY_TYPES.YEAR]: ['years'],
    [ENTITY_TYPES.SEASONS]: ['seasons'], // OFT/FLD - plural
    [ENTITY_TYPES.OFT_SUBJECTS]: ['oft-subjects'],
    [ENTITY_TYPES.OFT_THEMATIC_AREAS]: ['oft-thematic-areas'],
    [ENTITY_TYPES.FLD_SECTORS]: ['fld-sectors'],
    [ENTITY_TYPES.FLD_THEMATIC_AREAS]: ['fld-thematic-areas'],
    [ENTITY_TYPES.FLD_CATEGORIES]: ['fld-categories'],
    [ENTITY_TYPES.FLD_SUBCATEGORIES]: ['fld-subcategories'],
    [ENTITY_TYPES.FLD_CROPS]: ['fld-crops'],
    [ENTITY_TYPES.CFLD_CROPS]: ['cfld-crops'],
    [ENTITY_TYPES.PUBLICATION_ITEMS]: ['publication-items'],
    [ENTITY_TYPES.TRAINING_TYPES]: ['training-types'],
    [ENTITY_TYPES.TRAINING_AREAS]: ['training-areas'],
    [ENTITY_TYPES.TRAINING_THEMATIC_AREAS]: ['training-thematic-areas'],
    [ENTITY_TYPES.TRAINING_CLIENTELE]: ['training-clientele'],
    [ENTITY_TYPES.FUNDING_SOURCE]: ['funding-sources'],
    [ENTITY_TYPES.EXTENSION_ACTIVITIES]: ['extension-activities'],
    [ENTITY_TYPES.OTHER_EXTENSION_ACTIVITIES]: ['other-extension-activities'],
    [ENTITY_TYPES.EVENTS]: ['events'],
    [ENTITY_TYPES.PRODUCT_CATEGORIES]: ['product-categories'],
    [ENTITY_TYPES.PRODUCT_TYPES]: ['product-types'],
    [ENTITY_TYPES.PRODUCTS]: ['products'],
    [ENTITY_TYPES.CRA_CROPPING_SYSTEMS]: ['cra-cropping-systems'],
    [ENTITY_TYPES.CRA_FARMING_SYSTEMS]: ['cra-farming-systems'],
    [ENTITY_TYPES.ARYA_ENTERPRISES]: ['arya-enterprises'],
    // Employee Masters
    [ENTITY_TYPES.STAFF_CATEGORY]: ['staff-categories'],
    [ENTITY_TYPES.PAY_LEVEL]: ['pay-levels'],
    [ENTITY_TYPES.DISCIPLINE]: ['disciplines'],
    // Extension Masters
    [ENTITY_TYPES.EXTENSION_ACTIVITY_TYPE]: ['extension-activity-types'],
    [ENTITY_TYPES.OTHER_EXTENSION_ACTIVITY_TYPE]: ['other-extension-activity-types'],
    [ENTITY_TYPES.IMPORTANT_DAY]: ['important-days'],

    // Other Masters
    [ENTITY_TYPES.CROP_TYPE]: ['crop-types'],
    [ENTITY_TYPES.INFRASTRUCTURE_MASTER]: ['infrastructure-masters'],
};

/**
 * Invalidate queries for a specific entity type (simpler API)
 * Handles query key mismatches and ensures all related queries are invalidated
 */
export function invalidateEntityType(
    queryClient: QueryClient,
    entityType: string,
    user?: {
        userId?: number | null;
        role?: string | null;
    }
): void {
    // First, use the standard invalidation
    invalidateEntityQueries(queryClient, entityType, { user });

    // Also invalidate query keys that might use different naming (plural/singular)
    // This ensures hooks using different query key formats are also invalidated
    if (ENTITY_TO_QUERY_KEY_MAP[entityType]) {
        for (const queryKey of ENTITY_TO_QUERY_KEY_MAP[entityType]) {
            invalidateQueryKey(queryClient, [queryKey], user);
        }
    } else {
        // Fallback: also try invalidating the entity type directly
        invalidateQueryKey(queryClient, [entityType], user);
    }
}

/**
 * Invalidate queries for master data entities with related queries
 */
export function invalidateMasterDataEntity(
    queryClient: QueryClient,
    entityType: string,
    entityId?: number,
    user?: {
        userId?: number | null;
        role?: string | null;
    }
): void {
    invalidateEntityQueries(queryClient, entityType, {
        user,
        entityId,
        invalidateRelatedQueries: true,
    });
}

/**
 * Invalidate queries for KVK entities
 */
export function invalidateKvkEntity(
    queryClient: QueryClient,
    entityType: string,
    user?: {
        userId?: number | null;
        role?: string | null;
    },
    additionalKeys: string[][] = []
): void {
    invalidateEntityQueries(queryClient, entityType, {
        user,
        invalidateRelatedQueries: false, // KVK entities don't use related query patterns
        additionalKeys,
    });
}

/**
 * Invalidate queries for OFT/FLD entities
 */
export function invalidateOftFldEntity(
    queryClient: QueryClient,
    entityType: string,
    user?: {
        userId?: number | null;
        role?: string | null;
    }
): void {
    invalidateEntityQueries(queryClient, entityType, {
        user,
        invalidateRelatedQueries: false,
    });
}

/**
 * Helper function to invalidate queries with refetchType: 'all'
 * Use this instead of direct queryClient.invalidateQueries for real-time updates
 */
export function invalidateQueriesWithRefetch(
    queryClient: QueryClient,
    queryKey: (string | number)[],
    user?: {
        userId?: number | null;
        role?: string | null;
    }
): void {
    invalidateQueryKey(queryClient, queryKey, user);
}

/**
 * Invalidate queries for Production/Projects entities
 */
export function invalidateProductionProjectsEntity(
    queryClient: QueryClient,
    entityType: string,
    user?: {
        userId?: number | null;
        role?: string | null;
    }
): void {
    invalidateEntityQueries(queryClient, entityType, {
        user,
        invalidateRelatedQueries: false,
    });
}
