/**
 * Utility functions for extracting and transforming form data from API responses
 * Handles nested object extraction for form pre-population
 */

import { ENTITY_TYPES } from '@/constants/entityConstants';
import type { ExtendedEntityType } from './masterUtils';

function toDateInputValue(value: unknown): unknown {
    if (value === null || value === undefined || value === '') return value;

    if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) return '';
        return value.toISOString().split('T')[0];
    }

    if (typeof value === 'object' && value !== null) {
        const candidate =
            (value as any).yearName ??
            (value as any).reportingYear ??
            (value as any).year ??
            (value as any).value;
        if (candidate !== undefined && candidate !== null && candidate !== value) {
            return toDateInputValue(candidate);
        }
        return value;
    }

    const asString = String(value).trim();
    if (!asString) return '';

    if (/^\d{4}$/.test(asString)) {
        return `${asString}-01-01`;
    }

    if (/^\d{4}-\d{2}-\d{2}/.test(asString)) {
        return asString.slice(0, 10);
    }

    const parsed = new Date(asString);
    if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
    }

    return value;
}

function normalizeCommonDateFields(item: any, formData: any): void {
    const reportingYearSource =
        formData.reportingYear ??
        item.reportingYear ??
        item.yearName ??
        item.year;

    if (reportingYearSource !== undefined && reportingYearSource !== null && reportingYearSource !== '') {
        formData.reportingYear = toDateInputValue(reportingYearSource);
    }

    Object.keys(formData).forEach((field) => {
        if (field === 'reportingYear') return;
        if (!field.toLowerCase().endsWith('date')) return;
        if (formData[field] === undefined || formData[field] === null || formData[field] === '') return;
        formData[field] = toDateInputValue(formData[field]);
    });
}

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
        // Backend now returns both, prioritize trainingThematicAreaId if available
        if (item.trainingThematicAreaId) {
            formData.trainingThematicAreaId = item.trainingThematicAreaId;
            // Also set thematicAreaId for backward compatibility
            if (item.thematicAreaId) {
                formData.thematicAreaId = item.thematicAreaId;
            } else {
                formData.thematicAreaId = item.trainingThematicAreaId;
            }
        } else if (item.thematicAreaId) {
            formData.thematicAreaId = item.thematicAreaId;
            // Try to use thematicAreaId as trainingThematicAreaId (fallback)
            formData.trainingThematicAreaId = item.thematicAreaId;
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
        if (item.fundingAgencyName) formData.fundingAgency = item.fundingAgency;
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
    [ENTITY_TYPES.PROJECT_NICRA_BASIC]: (item: any, formData: any) => {
        if (item.reportingDate) {
            formData.monthYear = new Date(item.reportingDate).toISOString().substring(0, 7); // YYYY-MM
        }
        if (item.drySpell10Days !== undefined) formData.dry10 = item.drySpell10Days;
        if (item.drySpell15Days !== undefined) formData.dry15 = item.drySpell15Days;
        if (item.drySpell20Days !== undefined) formData.dry20 = item.drySpell20Days;
        if (item.intensiveRainAbove60mm !== undefined) formData.intensiveRain = item.intensiveRainAbove60mm;
        if (item.waterDepthCm !== undefined) formData.waterDepth = item.waterDepthCm;
        if (item.startDate) formData.startDate = new Date(item.startDate).toISOString().split('T')[0];
        if (item.endDate) formData.endDate = new Date(item.endDate).toISOString().split('T')[0];
    },
    [ENTITY_TYPES.PROJECT_NICRA_TRAINING]: (item: any, formData: any) => {
        if (item.titleOfTraining) formData.trainingTitle = item.titleOfTraining;
        if (item.startDate) formData.startDate = new Date(item.startDate).toISOString().split('T')[0];
        if (item.endDate) formData.endDate = new Date(item.endDate).toISOString().split('T')[0];
        if (item.generalM !== undefined) formData.genMale = item.generalM;
        if (item.generalF !== undefined) formData.genFemale = item.generalF;
        if (item.obcM !== undefined) formData.obcMale = item.obcM;
        if (item.obcF !== undefined) formData.obcFemale = item.obcF;
        if (item.scM !== undefined) formData.scMale = item.scM;
        if (item.scF !== undefined) formData.scFemale = item.scF;
        if (item.stM !== undefined) formData.stMale = item.stM;
        if (item.stF !== undefined) formData.stFemale = item.stF;
    },
    [ENTITY_TYPES.PROJECT_NICRA_EXTENSION]: (item: any, formData: any) => {
        if (item.activityName) formData.activityName = item.activityName;
        if (item.startDate) formData.startDate = new Date(item.startDate).toISOString().split('T')[0];
        if (item.endDate) formData.endDate = new Date(item.endDate).toISOString().split('T')[0];
        if (item.generalM !== undefined) formData.genMale = item.generalM;
        if (item.generalF !== undefined) formData.genFemale = item.generalF;
        if (item.obcM !== undefined) formData.obcMale = item.obcM;
        if (item.obcF !== undefined) formData.obcFemale = item.obcF;
        if (item.scM !== undefined) formData.scMale = item.scM;
        if (item.scF !== undefined) formData.scFemale = item.scF;
        if (item.stM !== undefined) formData.stMale = item.stM;
        if (item.stF !== undefined) formData.stFemale = item.stF;
    },
    [ENTITY_TYPES.PROJECT_NICRA_DETAILS]: (item: any, formData: any) => {
        if (item.generalM !== undefined) formData.genMale = item.generalM;
        if (item.generalF !== undefined) formData.genFemale = item.generalF;
        if (item.obcM !== undefined) formData.obcMale = item.obcM;
        if (item.obcF !== undefined) formData.obcFemale = item.obcF;
        if (item.scM !== undefined) formData.scMale = item.scM;
        if (item.scF !== undefined) formData.scFemale = item.scF;
        if (item.stM !== undefined) formData.stMale = item.stM;
        if (item.stF !== undefined) formData.stFemale = item.stF;
        // Season extraction handled by COMMON_EXTRACTORS/default behavior mostly,
        // but let's ensure category/subCategory IDs are mapped if they are nested
        if (item.category?.nicraCategoryId) formData.nicraCategoryId = item.category.nicraCategoryId;
        if (item.subCategory?.nicraSubCategoryId) formData.nicraSubCategoryId = item.subCategory.nicraSubCategoryId;
    },

    // Natural Farming
    [ENTITY_TYPES.PROJECT_NATURAL_FARMING_GEO]: (item: any, formData: any) => {
        if (item.startDate) formData.startDate = new Date(item.startDate).toISOString().split('T')[0];
        if (item.endDate) formData.endDate = new Date(item.endDate).toISOString().split('T')[0];
        if (item.reportingYear) formData.reportingYear = new Date(item.reportingYear).toISOString().split('T')[0];
    },
    [ENTITY_TYPES.PROJECT_NATURAL_FARMING_PHYSICAL]: (item: any, formData: any) => {
        if (item.trainingDate) formData.trainingDate = new Date(item.trainingDate).toISOString().split('T')[0];
        if (item.generalM !== undefined) formData.genMale = item.generalM;
        if (item.generalF !== undefined) formData.genFemale = item.generalF;
        if (item.obcM !== undefined) formData.obcMale = item.obcM;
        if (item.obcF !== undefined) formData.obcFemale = item.obcF;
        if (item.scM !== undefined) formData.scMale = item.scM;
        if (item.scF !== undefined) formData.scFemale = item.scF;
        if (item.stM !== undefined) formData.stMale = item.stM;
        if (item.stF !== undefined) formData.stFemale = item.stF;
    },
    [ENTITY_TYPES.PROJECT_NATURAL_FARMING_DEMO]: (item: any, formData: any) => {
        if (item.startDate) formData.startDate = new Date(item.startDate).toISOString().split('T')[0];
        if (item.endDate) formData.endDate = new Date(item.endDate).toISOString().split('T')[0];
        if (item.season?.seasonId) formData.seasonId = item.season.seasonId;
        if (item.croppingPattern) formData.croppingSystem = item.croppingPattern;
        if (item.areaInHa !== undefined) formData.area = item.areaInHa;
        if (item.farmerPracticeDetails) formData.motivationFactors = item.farmerPracticeDetails;
        if (item.farmerFeedback) formData.farmersFeedback = item.farmerFeedback;
    },
    [ENTITY_TYPES.PROJECT_NATURAL_FARMING_FARMERS]: (item: any, formData: any) => {
        if (item.startDate) formData.startDate = new Date(item.startDate).toISOString().split('T')[0];
        if (item.endDate) formData.endDate = new Date(item.endDate).toISOString().split('T')[0];
        if (item.season?.seasonId) formData.seasonId = item.season.seasonId;
        if (item.croppingPattern) formData.croppingSystem = item.croppingPattern;
        if (item.areaInHa !== undefined) formData.area = item.areaInHa;
        if (item.farmerFeedback) formData.farmersFeedback = item.farmerFeedback;
    },
    [ENTITY_TYPES.PROJECT_NATURAL_FARMING_BENEFICIARIES]: (item: any, formData: any) => {
        if (item.reportingYear !== undefined) {
            formData.reportingYear = String(item.reportingYear).slice(0, 10);
        }
        if (item.blocksCovered !== undefined) formData.noOfBlocks = item.blocksCovered;
        if (item.villagesCovered !== undefined) formData.noOfVillages = item.villagesCovered;
    },
    [ENTITY_TYPES.PROJECT_NATURAL_FARMING_SOIL]: (item: any, formData: any) => {
        if (item.reportingYear !== undefined) {
            formData.reportingYear = String(item.reportingYear).slice(0, 10);
        }
        if (item.season?.seasonId) formData.seasonId = item.season.seasonId;
        else if (item.seasonId) formData.seasonId = item.seasonId;
        if (item.phBefore !== undefined) formData.beforePh = item.phBefore;
        if (item.ecBefore !== undefined) formData.beforeEc = item.ecBefore;
        if (item.ocBefore !== undefined) formData.beforeOc = item.ocBefore;
        if (item.nBefore !== undefined) formData.beforeN = item.nBefore;
        if (item.pBefore !== undefined) formData.beforeP = item.pBefore;
        if (item.kBefore !== undefined) formData.beforeK = item.kBefore;
        if (item.soilMicrobesBefore !== undefined) formData.beforeMicrobes = item.soilMicrobesBefore;
        if (item.phAfter !== undefined) formData.afterPh = item.phAfter;
        if (item.ecAfter !== undefined) formData.afterEc = item.ecAfter;
        if (item.ocAfter !== undefined) formData.afterOc = item.ocAfter;
        if (item.nAfter !== undefined) formData.afterN = item.nAfter;
        if (item.pAfter !== undefined) formData.afterP = item.pAfter;
        if (item.kAfter !== undefined) formData.afterK = item.kAfter;
        if (item.soilMicrobesAfter !== undefined) formData.afterMicrobes = item.soilMicrobesAfter;
    },
    [ENTITY_TYPES.PROJECT_NATURAL_FARMING_BUDGET]: (item: any, formData: any) => {
        if (item.reportingYear !== undefined) {
            formData.reportingYear = String(item.reportingYear).slice(0, 10);
        }
        if (item.activity) formData.activityName = item.activity;
        if (item.numberOfActivities !== undefined) formData.noOfActivities = item.numberOfActivities;
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

    // Normalize common date-like fields for entities without dedicated extractors.
    // This keeps HTML date inputs stable in edit mode across modules.
    normalizeCommonDateFields(item, formData);

    return formData;
}
