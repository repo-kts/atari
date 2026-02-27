/**
 * Utility functions for extracting and transforming form data from API responses
 * Handles nested object extraction for form pre-population
 */

import { ENTITY_TYPES } from '@/constants/entityTypes';
import type { ExtendedEntityType } from './masterUtils';

/**
 * Common nested field extractors that apply to multiple entity types
 */
const COMMON_EXTRACTORS = {
    sanctionedPostId: (item: any, formData: any) => {
        if (item.sanctionedPost?.sanctionedPostId) {
            formData.sanctionedPostId = item.sanctionedPost.sanctionedPostId;
        }
    },
    disciplineId: (item: any, formData: any) => {
        if (item.discipline?.disciplineId) {
            formData.disciplineId = item.discipline.disciplineId;
        }
    },
    kvkId: (item: any, formData: any) => {
        if (item.kvk?.kvkId) {
            formData.kvkId = item.kvk.kvkId;
        }
    },
};

/**
 * Entity-specific extractors
 */
const ENTITY_EXTRACTORS: Record<string, (item: any, formData: any) => void> = {
    [ENTITY_TYPES.FLD_CROPS]: (item: any, formData: any) => {
        // Extract categoryId directly from the crop (it's a direct field in the database)
        if (item.categoryId) {
            formData.categoryId = item.categoryId;
        }
        // Also try to extract from nested category if categoryId is not directly available
        if (!formData.categoryId && item.category?.categoryId) {
            formData.categoryId = item.category.categoryId;
        }
        // Also try to extract from nested subCategory.category if available
        if (!formData.categoryId && item.subCategory?.category?.categoryId) {
            formData.categoryId = item.subCategory.category.categoryId;
        }
        // Note: sectorId will be derived from categoryId in the form component (OftFldForms)
        // because the backend doesn't include sectorId in the crop response
    },
    [ENTITY_TYPES.CFLD_CROPS]: (item: any, formData: any) => {
        // Ensure CropName is preserved (check both capital C and lowercase for compatibility)
        if (item.CropName) {
            formData.CropName = item.CropName;
        } else if (item.cropName && !formData.CropName) {
            formData.CropName = item.cropName;
        }
        // Extract seasonId from nested season object if not directly available
        if (!formData.seasonId && item.season?.seasonId) {
            formData.seasonId = item.season.seasonId;
        }
        // Extract typeId from nested cropType object if not directly available
        if (!formData.typeId && item.cropType?.typeId) {
            formData.typeId = item.cropType.typeId;
        }
    },
    [ENTITY_TYPES.PUBLICATION_ITEMS]: (item: any, formData: any) => {
        // Ensure publicationName is preserved (it's a direct field)
        if (item.publicationName) {
            formData.publicationName = item.publicationName;
        }
    },
    [ENTITY_TYPES.ACHIEVEMENT_EXTENSION]: (item: any, formData: any) => {
        if (item.farmersGeneralM !== undefined) formData.gen_m = item.farmersGeneralM;
        if (item.farmersGeneralF !== undefined) formData.gen_f = item.farmersGeneralF;
        if (item.farmersObcM !== undefined) formData.obc_m = item.farmersObcM;
        if (item.farmersObcF !== undefined) formData.obc_f = item.farmersObcF;
        if (item.farmersScM !== undefined) formData.sc_m = item.farmersScM;
        if (item.farmersScF !== undefined) formData.sc_f = item.farmersScF;
        if (item.farmersStM !== undefined) formData.st_m = item.farmersStM;
        if (item.farmersStF !== undefined) formData.st_f = item.farmersStF;

        if (item.officialsGeneralM !== undefined) formData.ext_gen_m = item.officialsGeneralM;
        if (item.officialsGeneralF !== undefined) formData.ext_gen_f = item.officialsGeneralF;
        if (item.officialsObcM !== undefined) formData.ext_obc_m = item.officialsObcM;
        if (item.officialsObcF !== undefined) formData.ext_obc_f = item.officialsObcF;
        if (item.officialsScM !== undefined) formData.ext_sc_m = item.officialsScM;
        if (item.officialsScF !== undefined) formData.ext_sc_f = item.officialsScF;
        if (item.officialsStM !== undefined) formData.ext_st_m = item.officialsStM;
        if (item.officialsStF !== undefined) formData.ext_st_f = item.officialsStF;

        if (item.numberOfActivities !== undefined) formData.activityCount = item.numberOfActivities;
        if (item.extensionActivityType) formData.extensionActivityType = item.extensionActivityType;
    },
    [ENTITY_TYPES.ACHIEVEMENT_OTHER_EXTENSION]: (item: any, formData: any) => {
        if (item.farmersGeneralM !== undefined) formData.gen_m = item.farmersGeneralM;
        if (item.farmersGeneralF !== undefined) formData.gen_f = item.farmersGeneralF;
        if (item.farmersObcM !== undefined) formData.obc_m = item.farmersObcM;
        if (item.farmersObcF !== undefined) formData.obc_f = item.farmersObcF;
        if (item.farmersScM !== undefined) formData.sc_m = item.farmersScM;
        if (item.farmersScF !== undefined) formData.sc_f = item.farmersScF;
        if (item.farmersStM !== undefined) formData.st_m = item.farmersStM;
        if (item.farmersStF !== undefined) formData.st_f = item.farmersStF;

        if (item.officialsGeneralM !== undefined) formData.ext_gen_m = item.officialsGeneralM;
        if (item.officialsGeneralF !== undefined) formData.ext_gen_f = item.officialsGeneralF;
        if (item.officialsObcM !== undefined) formData.ext_obc_m = item.officialsObcM;
        if (item.officialsObcF !== undefined) formData.ext_obc_f = item.officialsObcF;
        if (item.officialsScM !== undefined) formData.ext_sc_m = item.officialsScM;
        if (item.officialsScF !== undefined) formData.ext_sc_f = item.officialsScF;
        if (item.officialsStM !== undefined) formData.ext_st_m = item.officialsStM;
        if (item.officialsStF !== undefined) formData.ext_st_f = item.officialsStF;

        if (item.numberOfActivities !== undefined) formData.activityCount = item.numberOfActivities;
        if (item.extensionActivityType) formData.extensionActivityType = item.extensionActivityType;
        if (item.startDate) {
            formData.startDate = new Date(item.startDate).toISOString().split('T')[0];
        }
        if (item.endDate) {
            formData.endDate = new Date(item.endDate).toISOString().split('T')[0];
        }
    },
    [ENTITY_TYPES.ACHIEVEMENT_CELEBRATION_DAYS]: (item: any, formData: any) => {
        if (item.farmersGeneralM !== undefined) formData.gen_m = item.farmersGeneralM;
        if (item.farmersGeneralF !== undefined) formData.gen_f = item.farmersGeneralF;
        if (item.farmersObcM !== undefined) formData.obc_m = item.farmersObcM;
        if (item.farmersObcF !== undefined) formData.obc_f = item.farmersObcF;
        if (item.farmersScM !== undefined) formData.sc_m = item.farmersScM;
        if (item.farmersScF !== undefined) formData.sc_f = item.farmersScF;
        if (item.farmersStM !== undefined) formData.st_m = item.farmersStM;
        if (item.farmersStF !== undefined) formData.st_f = item.farmersStF;

        if (item.officialsGeneralM !== undefined) formData.ext_gen_m = item.officialsGeneralM;
        if (item.officialsGeneralF !== undefined) formData.ext_gen_f = item.officialsGeneralF;
        if (item.officialsObcM !== undefined) formData.ext_obc_m = item.officialsObcM;
        if (item.officialsObcF !== undefined) formData.ext_obc_f = item.officialsObcF;
        if (item.officialsScM !== undefined) formData.ext_sc_m = item.officialsScM;
        if (item.officialsScF !== undefined) formData.ext_sc_f = item.officialsScF;
        if (item.officialsStM !== undefined) formData.ext_st_m = item.officialsStM;
        if (item.officialsStF !== undefined) formData.ext_st_f = item.officialsStF;

        if (item.numberOfActivities !== undefined) formData.activityCount = item.numberOfActivities;
        if (item.dayName || item.importantDay) formData.importantDay = item.dayName || item.importantDay;
        if (item.eventDate) {
            formData.eventDate = new Date(item.eventDate).toISOString().split('T')[0];
        }
    },
};

/**
 * Extracts and transforms form data from an item for editing
 * Handles nested object extraction and entity-specific transformations
 *
 * @param item - The item to extract data from
 * @param entityType - The entity type (optional, for entity-specific extraction)
 * @returns Transformed form data ready for form pre-population
 *
 * @example
 * const formData = extractFormData(item, ENTITY_TYPES.FLD_CROPS);
 * // Returns: { ...item, categoryId: item.category?.categoryId, ... }
 */
export function extractFormData(item: any, entityType?: ExtendedEntityType | null): any {
    // Start with a copy of the item
    const formData = { ...item };

    // Apply common extractors
    Object.values(COMMON_EXTRACTORS).forEach(extractor => {
        extractor(item, formData);
    });

    // Apply entity-specific extractor if available
    if (entityType && ENTITY_EXTRACTORS[entityType]) {
        ENTITY_EXTRACTORS[entityType](item, formData);
    }

    return formData;
}
