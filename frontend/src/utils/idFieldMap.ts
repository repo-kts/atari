/**
 * ID Field Mapping
 *
 * Map-based lookup for entity ID fields
 * Replaces large switch statement with maintainable configuration
 */

import { ENTITY_TYPES } from '../constants/entityTypes';
import type { ExtendedEntityType } from './masterUtils';

/**
 * Map of entity types to their ID field names
 */
export const ENTITY_ID_FIELD_MAP: Record<string, string> = {
    // Basic Masters
    [ENTITY_TYPES.ZONES]: 'zoneId',
    [ENTITY_TYPES.STATES]: 'stateId',
    [ENTITY_TYPES.DISTRICTS]: 'districtId',
    [ENTITY_TYPES.ORGANIZATIONS]: 'orgId',
    [ENTITY_TYPES.UNIVERSITIES]: 'universityId',

    // OFT/FLD Masters
    [ENTITY_TYPES.OFT_SUBJECTS]: 'oftSubjectId',
    [ENTITY_TYPES.OFT_THEMATIC_AREAS]: 'oftThematicAreaId',
    [ENTITY_TYPES.FLD_SECTORS]: 'sectorId',
    [ENTITY_TYPES.FLD_THEMATIC_AREAS]: 'thematicAreaId',
    [ENTITY_TYPES.FLD_CATEGORIES]: 'categoryId',
    [ENTITY_TYPES.FLD_SUBCATEGORIES]: 'subCategoryId',
    [ENTITY_TYPES.FLD_CROPS]: 'cropId',
    [ENTITY_TYPES.CFLD_CROPS]: 'cfldId',
    [ENTITY_TYPES.SEASONS]: 'seasonId',
    [ENTITY_TYPES.SEASON]: 'seasonId',
    [ENTITY_TYPES.SANCTIONED_POST]: 'sanctionedPostId',
    [ENTITY_TYPES.YEAR]: 'yearId',

    // Employee Masters
    [ENTITY_TYPES.STAFF_CATEGORY]: 'staffCategoryId',
    [ENTITY_TYPES.PAY_LEVEL]: 'payLevelId',
    [ENTITY_TYPES.DISCIPLINE]: 'disciplineId',

    // Extension Masters
    [ENTITY_TYPES.EXTENSION_ACTIVITY_TYPE]: 'activityId',
    [ENTITY_TYPES.OTHER_EXTENSION_ACTIVITY_TYPE]: 'activityTypeId',
    [ENTITY_TYPES.IMPORTANT_DAY]: 'importantDayId',

    // Other Masters
    [ENTITY_TYPES.CROP_TYPE]: 'typeId',
    [ENTITY_TYPES.INFRASTRUCTURE_MASTER]: 'infraMasterId',

    // Training, Extension & Events
    [ENTITY_TYPES.TRAINING_TYPES]: 'trainingTypeId',
    [ENTITY_TYPES.TRAINING_AREAS]: 'trainingAreaId',
    [ENTITY_TYPES.TRAINING_THEMATIC_AREAS]: 'trainingThematicAreaId',
    [ENTITY_TYPES.TRAINING_CLIENTELE]: 'clienteleId',
    [ENTITY_TYPES.FUNDING_SOURCE]: 'fundingSourceId',
    [ENTITY_TYPES.EXTENSION_ACTIVITIES]: 'extensionActivityId',
    [ENTITY_TYPES.OTHER_EXTENSION_ACTIVITIES]: 'otherExtensionActivityId',
    [ENTITY_TYPES.EVENTS]: 'eventId',

    // Production & Projects
    [ENTITY_TYPES.PRODUCT_CATEGORIES]: 'productCategoryId',
    [ENTITY_TYPES.PRODUCT_TYPES]: 'productTypeId',
    [ENTITY_TYPES.PRODUCTS]: 'productId',
    [ENTITY_TYPES.CRA_CROPPING_SYSTEMS]: 'craCropingSystemId',
    [ENTITY_TYPES.CRA_FARMING_SYSTEMS]: 'craFarmingSystemId',
    [ENTITY_TYPES.ARYA_ENTERPRISES]: 'aryaEnterpriseId',

    // Publications
    [ENTITY_TYPES.PUBLICATION_ITEMS]: 'publicationId',

    // About KVK entities
    [ENTITY_TYPES.KVKS]: 'kvkId',
    [ENTITY_TYPES.KVK_BANK_ACCOUNTS]: 'bankAccountId',
    [ENTITY_TYPES.KVK_EMPLOYEES]: 'kvkStaffId',
    [ENTITY_TYPES.KVK_STAFF_TRANSFERRED]: 'kvkStaffId',
    [ENTITY_TYPES.KVK_INFRASTRUCTURE]: 'infraId',
    [ENTITY_TYPES.KVK_VEHICLES]: 'vehicleId',
    [ENTITY_TYPES.KVK_VEHICLE_DETAILS]: 'vehicleId',
    [ENTITY_TYPES.KVK_EQUIPMENTS]: 'equipmentId',
    [ENTITY_TYPES.KVK_EQUIPMENT_DETAILS]: 'equipmentId',
    [ENTITY_TYPES.KVK_FARM_IMPLEMENTS]: 'implementId',

    // Achievements
    [ENTITY_TYPES.ACHIEVEMENT_OFT]: 'id',
    [ENTITY_TYPES.ACHIEVEMENT_FLD]: 'id',
    [ENTITY_TYPES.ACHIEVEMENT_TRAINING]: 'id',
    [ENTITY_TYPES.ACHIEVEMENT_EXTENSION]: 'id',
    [ENTITY_TYPES.ACHIEVEMENT_OTHER_EXTENSION]: 'id',
    [ENTITY_TYPES.ACHIEVEMENT_TECHNOLOGY_WEEK]: 'id',
    [ENTITY_TYPES.ACHIEVEMENT_CELEBRATION_DAYS]: 'id',
    [ENTITY_TYPES.ACHIEVEMENT_PRODUCTION_SUPPLY]: 'id',
    [ENTITY_TYPES.ACHIEVEMENT_PUBLICATION_DETAILS]: 'id',
    [ENTITY_TYPES.ACHIEVEMENT_SOIL_EQUIPMENT]: 'id',
    [ENTITY_TYPES.ACHIEVEMENT_SOIL_ANALYSIS]: 'id',
    [ENTITY_TYPES.ACHIEVEMENT_WORLD_SOIL_DAY]: 'id',
    [ENTITY_TYPES.ACHIEVEMENT_HRD]: 'id',
    [ENTITY_TYPES.ACHIEVEMENT_AWARD_KVK]: 'id',
    [ENTITY_TYPES.ACHIEVEMENT_AWARD_SCIENTIST]: 'id',
    [ENTITY_TYPES.ACHIEVEMENT_AWARD_FARMER]: 'id',
};

/**
 * Get ID field name for entity type using map lookup
 */
export function getIdFieldFromMap(entityType: ExtendedEntityType): string {
    return ENTITY_ID_FIELD_MAP[entityType] || 'id';
}
