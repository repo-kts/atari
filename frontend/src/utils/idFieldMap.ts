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
export const ENTITY_ID_FIELD_MAP: Record<ExtendedEntityType, string> = {
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

    // Training, Extension & Events
    [ENTITY_TYPES.TRAINING_TYPES]: 'trainingTypeId',
    [ENTITY_TYPES.TRAINING_AREAS]: 'trainingAreaId',
    [ENTITY_TYPES.TRAINING_THEMATIC_AREAS]: 'trainingThematicAreaId',
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
};

/**
 * Get ID field name for entity type using map lookup
 */
export function getIdFieldFromMap(entityType: ExtendedEntityType): string {
    return ENTITY_ID_FIELD_MAP[entityType] || 'id';
}
