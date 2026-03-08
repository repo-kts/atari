/**
 * Utility functions for extracting and transforming form data from API responses
 * Handles nested object extraction for form pre-population
 */

import { ENTITY_TYPES } from '@/constants/entityConstants';
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
    [ENTITY_TYPES.ACHIEVEMENT_HRD]: (item: any, formData: any) => {
        // Ensure kvkStaffId is mapped correctly for selection
        if (item.kvkStaffId) formData.kvkStaffId = String(item.kvkStaffId);

        // Format dates for HTML date input (YYYY-MM-DD)
        if (item.startDate) {
            formData.startDate = new Date(item.startDate).toISOString().split('T')[0];
        }
        if (item.endDate) {
            formData.endDate = new Date(item.endDate).toISOString().split('T')[0];
        }
    },
    [ENTITY_TYPES.ACHIEVEMENT_TRAINING]: (item: any, formData: any) => {
        // Extract trainingTypeId
        if (item.trainingTypeId) formData.trainingTypeId = item.trainingTypeId;

        // Extract trainingAreaId
        if (item.trainingAreaId) formData.trainingAreaId = item.trainingAreaId;

        // Extract thematicAreaId - can come as thematicAreaId or trainingThematicAreaId
        if (item.thematicAreaId) {
            formData.thematicAreaId = item.thematicAreaId;
            formData.trainingThematicAreaId = item.thematicAreaId; // Map for frontend compatibility
        } else if (item.trainingThematicAreaId) {
            formData.thematicAreaId = item.trainingThematicAreaId;
            formData.trainingThematicAreaId = item.trainingThematicAreaId;
        }

        // Extract campusType - convert from enum to display format
        if (item.campusType) {
            // Backend returns "ON_CAMPUS" or "OFF_CAMPUS", convert to "On Campus" or "Off Campus"
            if (item.campusType === 'ON_CAMPUS' || item.campusType === 'on_campus') {
                formData.campusType = 'On Campus';
            } else if (item.campusType === 'OFF_CAMPUS' || item.campusType === 'off_campus') {
                formData.campusType = 'Off Campus';
            } else {
                formData.campusType = item.campusType;
            }
        }

        // Extract coordinatorId - can come as coordinatorId or staffId
        if (item.coordinatorId) {
            formData.coordinatorId = item.coordinatorId;
            // If we have coordinatorId, we need to find the corresponding staffId
            // The backend should provide this, but if not, we'll use coordinatorId as staffId
            if (!item.staffId) {
                formData.staffId = item.coordinatorId; // Coordinator ID might be the staff ID
            }
        }
        // Also check for staffId (if coordinator was selected via staff)
        if (item.staffId) {
            formData.staffId = item.staffId;
            // If we have staffId but no coordinatorId, use staffId as coordinatorId
            if (!formData.coordinatorId) {
                formData.coordinatorId = item.staffId;
            }
        }
        // Extract coordinator name for display
        if (item.coordinator) {
            formData.coordinator = typeof item.coordinator === 'string' ? item.coordinator : item.coordinator.name;
            formData.coordinatorName = formData.coordinator;
            formData.staffName = formData.coordinator; // Also set staffName for dropdown compatibility
        }
        // Extract staff name if available
        if (item.staffName) {
            formData.staffName = item.staffName;
            formData.coordinator = item.staffName; // Also set coordinator for dropdown compatibility
        }

        // Format dates for HTML date input (YYYY-MM-DD)
        if (item.startDate) {
            formData.startDate = new Date(item.startDate).toISOString().split('T')[0];
        }
        if (item.endDate) {
            formData.endDate = new Date(item.endDate).toISOString().split('T')[0];
        }

        // Extract other training fields
        if (item.titleOfTraining) formData.title = item.titleOfTraining;
        if (item.title) formData.title = item.title;
        if (item.venue) formData.venue = item.venue;
        if (item.fundingAgencyName) formData.fundingAgency = item.fundingAgencyName;
        if (item.fundingAgency) formData.fundingAgency = item.fundingAgency;
        if (item.clienteleId) formData.clienteleId = item.clienteleId;
        if (item.fundingSourceId) formData.fundingSourceId = item.fundingSourceId;

        // Extract farmer counts
        if (item.generalM !== undefined) formData.gen_m = String(item.generalM);
        if (item.generalF !== undefined) formData.gen_f = String(item.generalF);
        if (item.obcM !== undefined) formData.obc_m = String(item.obcM);
        if (item.obcF !== undefined) formData.obc_f = String(item.obcF);
        if (item.scM !== undefined) formData.sc_m = String(item.scM);
        if (item.scF !== undefined) formData.sc_f = String(item.scF);
        if (item.stM !== undefined) formData.st_m = String(item.stM);
        if (item.stF !== undefined) formData.st_f = String(item.stF);
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
