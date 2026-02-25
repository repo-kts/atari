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
    useSeasons as useOftFldSeasons,
} from './useOftFldData'
import { useCfldTechnicalParameters } from './useCfldData'
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
import {
    useSeasons,
    useSanctionedPosts,
    useYears,
    useStaffCategories,
    usePayLevels,
    useDisciplines,
    useExtensionActivityTypes,
    useOtherExtensionActivityTypes,
    useImportantDays,
    useTrainingClientele,
    useFundingSources,
    useCropTypes,
    useInfrastructureMasters,
} from './useOtherMastersData'
import { useProjectData } from './useProjectData'
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
    [ENTITY_TYPES.SEASONS]: () => useOftFldSeasons(),

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

    // Other Masters
    [ENTITY_TYPES.SEASON]: () => useSeasons(),
    [ENTITY_TYPES.SANCTIONED_POST]: () => useSanctionedPosts(),
    [ENTITY_TYPES.YEAR]: () => useYears(),
    [ENTITY_TYPES.STAFF_CATEGORY]: () => useStaffCategories(),
    [ENTITY_TYPES.PAY_LEVEL]: () => usePayLevels(),
    [ENTITY_TYPES.DISCIPLINE]: () => useDisciplines(),
    [ENTITY_TYPES.EXTENSION_ACTIVITY_TYPE]: () => useExtensionActivityTypes(),
    [ENTITY_TYPES.OTHER_EXTENSION_ACTIVITY_TYPE]: () => useOtherExtensionActivityTypes(),
    [ENTITY_TYPES.IMPORTANT_DAY]: () => useImportantDays(),
    [ENTITY_TYPES.TRAINING_CLIENTELE]: () => useTrainingClientele(),
    [ENTITY_TYPES.FUNDING_SOURCE]: () => useFundingSources(),
    [ENTITY_TYPES.CROP_TYPE]: () => useCropTypes(),
    [ENTITY_TYPES.INFRASTRUCTURE_MASTER]: () => useInfrastructureMasters(),

    // Projects (Achievements)
    [ENTITY_TYPES.PROJECT_CFLD_TECHNICAL_PARAM]: () => useCfldTechnicalParameters(),
    [ENTITY_TYPES.PROJECT_CFLD_EXTENSION_ACTIVITY]: () => useProjectData(ENTITY_TYPES.PROJECT_CFLD_EXTENSION_ACTIVITY),
    [ENTITY_TYPES.PROJECT_CFLD_BUDGET]: () => useProjectData(ENTITY_TYPES.PROJECT_CFLD_BUDGET),
    [ENTITY_TYPES.PROJECT_CRA_DETAILS]: () => useProjectData(ENTITY_TYPES.PROJECT_CRA_DETAILS),
    [ENTITY_TYPES.PROJECT_CRA_EXTENSION_ACTIVITY]: () => useProjectData(ENTITY_TYPES.PROJECT_CRA_EXTENSION_ACTIVITY),
    [ENTITY_TYPES.PROJECT_FPO_DETAILS]: () => useProjectData(ENTITY_TYPES.PROJECT_FPO_DETAILS),
    [ENTITY_TYPES.PROJECT_FPO_MANAGEMENT]: () => useProjectData(ENTITY_TYPES.PROJECT_FPO_MANAGEMENT),
    [ENTITY_TYPES.PROJECT_DRMR_DETAILS]: () => useProjectData(ENTITY_TYPES.PROJECT_DRMR_DETAILS),
    [ENTITY_TYPES.PROJECT_DRMR_ACTIVITY]: () => useProjectData(ENTITY_TYPES.PROJECT_DRMR_ACTIVITY),
    [ENTITY_TYPES.PROJECT_NARI_NUTRI_GARDEN]: () => useProjectData(ENTITY_TYPES.PROJECT_NARI_NUTRI_GARDEN),
    [ENTITY_TYPES.PROJECT_NARI_BIO_FORTIFIED]: () => useProjectData(ENTITY_TYPES.PROJECT_NARI_BIO_FORTIFIED),
    [ENTITY_TYPES.PROJECT_NARI_VALUE_ADDITION]: () => useProjectData(ENTITY_TYPES.PROJECT_NARI_VALUE_ADDITION),
    [ENTITY_TYPES.PROJECT_NARI_TRAINING]: () => useProjectData(ENTITY_TYPES.PROJECT_NARI_TRAINING),
    [ENTITY_TYPES.PROJECT_NARI_EXTENSION]: () => useProjectData(ENTITY_TYPES.PROJECT_NARI_EXTENSION),
    [ENTITY_TYPES.PROJECT_ARYA_CURRENT]: () => useProjectData(ENTITY_TYPES.PROJECT_ARYA_CURRENT),
    [ENTITY_TYPES.PROJECT_ARYA_EVALUATION]: () => useProjectData(ENTITY_TYPES.PROJECT_ARYA_EVALUATION),
    [ENTITY_TYPES.PROJECT_CSISA]: () => useProjectData(ENTITY_TYPES.PROJECT_CSISA),
    [ENTITY_TYPES.PROJECT_TSP_SCSP]: () => useProjectData(ENTITY_TYPES.PROJECT_TSP_SCSP),
    [ENTITY_TYPES.PROJECT_NICRA_BASIC]: () => useProjectData(ENTITY_TYPES.PROJECT_NICRA_BASIC),
    [ENTITY_TYPES.PROJECT_NICRA_DETAILS]: () => useProjectData(ENTITY_TYPES.PROJECT_NICRA_DETAILS),
    [ENTITY_TYPES.PROJECT_NICRA_TRAINING]: () => useProjectData(ENTITY_TYPES.PROJECT_NICRA_TRAINING),
    [ENTITY_TYPES.PROJECT_NICRA_EXTENSION]: () => useProjectData(ENTITY_TYPES.PROJECT_NICRA_EXTENSION),
    [ENTITY_TYPES.PROJECT_NICRA_INTERVENTION]: () => useProjectData(ENTITY_TYPES.PROJECT_NICRA_INTERVENTION),
    [ENTITY_TYPES.PROJECT_NICRA_REVENUE]: () => useProjectData(ENTITY_TYPES.PROJECT_NICRA_REVENUE),
    [ENTITY_TYPES.PROJECT_NICRA_CUSTOM_HIRING]: () => useProjectData(ENTITY_TYPES.PROJECT_NICRA_CUSTOM_HIRING),
    [ENTITY_TYPES.PROJECT_NICRA_VCRMC]: () => useProjectData(ENTITY_TYPES.PROJECT_NICRA_VCRMC),
    [ENTITY_TYPES.PROJECT_NICRA_SOIL_HEALTH]: () => useProjectData(ENTITY_TYPES.PROJECT_NICRA_SOIL_HEALTH),
    [ENTITY_TYPES.PROJECT_NICRA_CONVERGENCE]: () => useProjectData(ENTITY_TYPES.PROJECT_NICRA_CONVERGENCE),
    [ENTITY_TYPES.PROJECT_NICRA_DIGNITARIES]: () => useProjectData(ENTITY_TYPES.PROJECT_NICRA_DIGNITARIES),
    [ENTITY_TYPES.PROJECT_NICRA_PI_COPI]: () => useProjectData(ENTITY_TYPES.PROJECT_NICRA_PI_COPI),
    [ENTITY_TYPES.PROJECT_NATURAL_FARMING_GEO]: () => useProjectData(ENTITY_TYPES.PROJECT_NATURAL_FARMING_GEO),
    [ENTITY_TYPES.PROJECT_NATURAL_FARMING_PHYSICAL]: () => useProjectData(ENTITY_TYPES.PROJECT_NATURAL_FARMING_PHYSICAL),
    [ENTITY_TYPES.PROJECT_NATURAL_FARMING_DEMO]: () => useProjectData(ENTITY_TYPES.PROJECT_NATURAL_FARMING_DEMO),
    [ENTITY_TYPES.PROJECT_NATURAL_FARMING_FARMERS]: () => useProjectData(ENTITY_TYPES.PROJECT_NATURAL_FARMING_FARMERS),
    [ENTITY_TYPES.PROJECT_NATURAL_FARMING_BENEFICIARIES]: () => useProjectData(ENTITY_TYPES.PROJECT_NATURAL_FARMING_BENEFICIARIES),
    [ENTITY_TYPES.PROJECT_NATURAL_FARMING_SOIL]: () => useProjectData(ENTITY_TYPES.PROJECT_NATURAL_FARMING_SOIL),
    [ENTITY_TYPES.PROJECT_NATURAL_FARMING_BUDGET]: () => useProjectData(ENTITY_TYPES.PROJECT_NATURAL_FARMING_BUDGET),
    [ENTITY_TYPES.PROJECT_AGRI_DRONE]: () => useProjectData(ENTITY_TYPES.PROJECT_AGRI_DRONE),
    [ENTITY_TYPES.PROJECT_AGRI_DRONE_DEMO]: () => useProjectData(ENTITY_TYPES.PROJECT_AGRI_DRONE_DEMO),
    [ENTITY_TYPES.PROJECT_SEED_HUB]: () => useProjectData(ENTITY_TYPES.PROJECT_SEED_HUB),
    [ENTITY_TYPES.PROJECT_OTHER]: () => useProjectData(ENTITY_TYPES.PROJECT_OTHER),

    // Achievements
    [ENTITY_TYPES.ACHIEVEMENT_OFT]: () => useProjectData(ENTITY_TYPES.ACHIEVEMENT_OFT),
    [ENTITY_TYPES.ACHIEVEMENT_FLD]: () => useProjectData(ENTITY_TYPES.ACHIEVEMENT_FLD),
    [ENTITY_TYPES.ACHIEVEMENT_TRAINING]: () => useProjectData(ENTITY_TYPES.ACHIEVEMENT_TRAINING),
    [ENTITY_TYPES.ACHIEVEMENT_EXTENSION]: () => useProjectData(ENTITY_TYPES.ACHIEVEMENT_EXTENSION),
    [ENTITY_TYPES.ACHIEVEMENT_OTHER_EXTENSION]: () => useProjectData(ENTITY_TYPES.ACHIEVEMENT_OTHER_EXTENSION),
    [ENTITY_TYPES.ACHIEVEMENT_TECHNOLOGY_WEEK]: () => useProjectData(ENTITY_TYPES.ACHIEVEMENT_TECHNOLOGY_WEEK),
    [ENTITY_TYPES.ACHIEVEMENT_CELEBRATION_DAYS]: () => useProjectData(ENTITY_TYPES.ACHIEVEMENT_CELEBRATION_DAYS),
    [ENTITY_TYPES.ACHIEVEMENT_PRODUCTION_SUPPLY]: () => useProjectData(ENTITY_TYPES.ACHIEVEMENT_PRODUCTION_SUPPLY),
    [ENTITY_TYPES.ACHIEVEMENT_PUBLICATION_DETAILS]: () => useProjectData(ENTITY_TYPES.ACHIEVEMENT_PUBLICATION_DETAILS),
    [ENTITY_TYPES.ACHIEVEMENT_SOIL_EQUIPMENT]: () => useProjectData(ENTITY_TYPES.ACHIEVEMENT_SOIL_EQUIPMENT),
    [ENTITY_TYPES.ACHIEVEMENT_SOIL_ANALYSIS]: () => useProjectData(ENTITY_TYPES.ACHIEVEMENT_SOIL_ANALYSIS),
    [ENTITY_TYPES.ACHIEVEMENT_WORLD_SOIL_DAY]: () => useProjectData(ENTITY_TYPES.ACHIEVEMENT_WORLD_SOIL_DAY),
    [ENTITY_TYPES.ACHIEVEMENT_HRD]: () => useProjectData(ENTITY_TYPES.ACHIEVEMENT_HRD),
    [ENTITY_TYPES.ACHIEVEMENT_AWARD_KVK]: () => useProjectData(ENTITY_TYPES.ACHIEVEMENT_AWARD_KVK),
    [ENTITY_TYPES.ACHIEVEMENT_AWARD_SCIENTIST]: () => useProjectData(ENTITY_TYPES.ACHIEVEMENT_AWARD_SCIENTIST),
    [ENTITY_TYPES.ACHIEVEMENT_AWARD_FARMER]: () => useProjectData(ENTITY_TYPES.ACHIEVEMENT_AWARD_FARMER),
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
 * IMPORTANT: This hook must always call hooks in the same order to follow Rules of Hooks.
 * The current implementation calls hooks conditionally based on entityType, which can
 * cause hook order violations when entityType changes. However, since entityType is
 * derived from the route pathname and is stable during a render cycle, this should be safe.
 *
 * If you encounter hook order violations, ensure that:
 * 1. entityType is stable and doesn't change unexpectedly
 * 2. All entity types have corresponding hooks in the maps
 * 3. The component using this hook doesn't conditionally render based on entityType
 *
 * @param entityType - The entity type to get the hook for
 * @returns The hook result or null if no hook is available
 */
export function useEntityHook(entityType: ExtendedEntityType | null) {
    const { isBasicMaster } = getEntityTypeChecks(entityType)
    const isAboutKvkEntity = entityType && ABOUT_KVK_ENTITIES.includes(entityType)

    // Get the basic master entity type (or use a default to ensure hook is always called)
    // We use 'zones' as default to ensure useMasterData is always called with a valid EntityType
    const basicMasterEntityType = entityType && isBasicMaster
        ? BASIC_MASTER_ENTITY_TYPE_MAP[entityType]
        : 'zones' // Default to ensure hook is always called

    // Always call useMasterData to maintain hook order
    // Only fetch when we actually need basic master data (avoids 403 for zones etc. when on About KVK pages)
    const basicMasterHookResult = useMasterData(basicMasterEntityType, { enabled: isBasicMaster })
    const basicMasterHook = entityType && isBasicMaster ? basicMasterHookResult : null

    // Always call useAboutKvkData to maintain hook order
    // Use a stable default entity type if not an About KVK entity
    const aboutKvkEntityType = (entityType && isAboutKvkEntity)
        ? (entityType as AboutKvkEntity)
        : (ABOUT_KVK_ENTITIES[0] as AboutKvkEntity) // Default to first About KVK entity
    const aboutKvkHookResult = useAboutKvkData(aboutKvkEntityType)
    const aboutKvkHook = isAboutKvkEntity ? aboutKvkHookResult : null

    // Get the hook factory for other entity types
    const hookFactory = entityType && !isBasicMaster && !isAboutKvkEntity
        ? ENTITY_HOOK_MAP[entityType]
        : null

    // IMPORTANT: To maintain hook order, we need to always call the same hooks.
    // We'll call a default hook (useSeasons) if no hook factory exists, but won't use its result.
    // This ensures hooks are always called in the same order regardless of entityType.
    const defaultHookFactory = () => useSeasons()
    const hookToCall = hookFactory || defaultHookFactory
    const otherHookResult = hookToCall()
    const otherHook = hookFactory ? otherHookResult : null

    // Return the appropriate hook result
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
