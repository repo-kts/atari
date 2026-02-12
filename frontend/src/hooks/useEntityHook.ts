/**
 * Entity Hook Factory
 *
 * Centralized hook selection based on entity type
 * Eliminates repetitive hook declarations and simplifies hook management
 */

import { ExtendedEntityType } from '../utils/masterUtils'
import { ENTITY_TYPES } from '../constants/entityTypes'
import { useMasterData } from './useMasterData'
import type { EntityType } from '../types/masterData'
import {
    useOftSubjects,
    useOftThematicAreas,
    useSectors,
    useFldThematicAreas,
    useFldCategories,
    useFldSubcategories,
    useFldCrops,
    useCfldCrops,
    useSeasons,
} from './useOftFldData'
import { usePublicationItems } from './usePublicationData'
import {
    useTrainingTypes,
    useTrainingAreas,
    useTrainingThematicAreas,
    useExtensionActivities,
    useOtherExtensionActivities,
    useEvents,
} from './useTrainingExtensionEventsData'
import {
    useProductCategories,
    useProductTypes,
    useProducts,
    useCraCroppingSystems,
    useCraFarmingSystems,
    useAryaEnterprises,
} from './useProductionProjectsData'
import { useAboutKvkData, AboutKvkEntity } from './forms/useAboutKvkData'
import { getEntityTypeChecks } from '../utils/entityTypeUtils'

/**
 * Hook factory function type
 */
type HookFactory = () => any

/**
 * Map basic master entity types to their EntityType strings
 */
const BASIC_MASTER_ENTITY_TYPE_MAP: Record<string, EntityType> = {
    [ENTITY_TYPES.ZONES]: 'zones',
    [ENTITY_TYPES.STATES]: 'states',
    [ENTITY_TYPES.DISTRICTS]: 'districts',
    [ENTITY_TYPES.ORGANIZATIONS]: 'organizations',
    [ENTITY_TYPES.UNIVERSITIES]: 'universities',
}

/**
 * Map entity types to their corresponding hooks
 */
const ENTITY_HOOK_MAP: Record<string, HookFactory> = {
    // Basic Masters - handled separately in useEntityHook

    // OFT/FLD
    [ENTITY_TYPES.OFT_SUBJECTS]: () => useOftSubjects(),
    [ENTITY_TYPES.OFT_THEMATIC_AREAS]: () => useOftThematicAreas(),
    [ENTITY_TYPES.FLD_SECTORS]: () => useSectors(),
    [ENTITY_TYPES.FLD_THEMATIC_AREAS]: () => useFldThematicAreas(),
    [ENTITY_TYPES.FLD_CATEGORIES]: () => useFldCategories(),
    [ENTITY_TYPES.FLD_SUBCATEGORIES]: () => useFldSubcategories(),
    [ENTITY_TYPES.FLD_CROPS]: () => useFldCrops(),
    [ENTITY_TYPES.CFLD_CROPS]: () => useCfldCrops(),
    [ENTITY_TYPES.SEASONS]: () => useSeasons(),

    // Training & Extension
    [ENTITY_TYPES.TRAINING_TYPES]: () => useTrainingTypes(),
    [ENTITY_TYPES.TRAINING_AREAS]: () => useTrainingAreas(),
    [ENTITY_TYPES.TRAINING_THEMATIC_AREAS]: () => useTrainingThematicAreas(),
    [ENTITY_TYPES.EXTENSION_ACTIVITIES]: () => useExtensionActivities(),
    [ENTITY_TYPES.OTHER_EXTENSION_ACTIVITIES]: () => useOtherExtensionActivities(),
    [ENTITY_TYPES.EVENTS]: () => useEvents(),

    // Production & Projects
    [ENTITY_TYPES.PRODUCT_CATEGORIES]: () => useProductCategories(),
    [ENTITY_TYPES.PRODUCT_TYPES]: () => useProductTypes(),
    [ENTITY_TYPES.PRODUCTS]: () => useProducts(),
    [ENTITY_TYPES.CRA_CROPPING_SYSTEMS]: () => useCraCroppingSystems(),
    [ENTITY_TYPES.CRA_FARMING_SYSTEMS]: () => useCraFarmingSystems(),
    [ENTITY_TYPES.ARYA_ENTERPRISES]: () => useAryaEnterprises(),

    // Publications
    [ENTITY_TYPES.PUBLICATION_ITEMS]: () => usePublicationItems(),
}

/**
 * About KVK entity types
 */
const ABOUT_KVK_ENTITIES: string[] = [
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
]

/**
 * Get the appropriate hook for an entity type
 *
 * @param entityType - The entity type to get the hook for
 * @returns The hook result or null if no hook is available
 */
export function useEntityHook(entityType: ExtendedEntityType | null) {
    const { isBasicMaster } = getEntityTypeChecks(entityType)
    const isAboutKvkEntity = entityType && ABOUT_KVK_ENTITIES.includes(entityType)

    // Handle basic masters separately
    const basicMasterEntityType = entityType && isBasicMaster
        ? BASIC_MASTER_ENTITY_TYPE_MAP[entityType]
        : null
    const basicMasterHook = basicMasterEntityType ? useMasterData(basicMasterEntityType) : null

    // Handle About KVK entities
    const aboutKvkHook = isAboutKvkEntity ? useAboutKvkData(entityType as AboutKvkEntity) : null

    // Handle other entity types - must call hooks conditionally at top level
    // This is acceptable as long as the conditions are stable
    const hookFactory = entityType && !isBasicMaster && !isAboutKvkEntity
        ? ENTITY_HOOK_MAP[entityType]
        : null
    const otherHook = hookFactory ? hookFactory() : null

    return basicMasterHook || aboutKvkHook || otherHook
}

/**
 * Check if an entity type is a basic master entity
 */
export function isBasicMasterEntity(entityType: ExtendedEntityType | null): boolean {
    if (!entityType) return false
    const basicMasterTypes: ExtendedEntityType[] = [
        ENTITY_TYPES.ZONES,
        ENTITY_TYPES.STATES,
        ENTITY_TYPES.DISTRICTS,
        ENTITY_TYPES.ORGANIZATIONS,
        ENTITY_TYPES.UNIVERSITIES,
    ]
    return basicMasterTypes.includes(entityType)
}

/**
 * Check if an entity type is an About KVK entity
 */
export function isAboutKvkEntityType(entityType: ExtendedEntityType | null): boolean {
    if (!entityType) return false
    return ABOUT_KVK_ENTITIES.includes(entityType)
}
