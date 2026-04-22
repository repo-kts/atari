/**
 * Field Value Utilities
 *
 * Configuration-driven approach for extracting field values from items
 * Replaces 250+ lines of if statements with maintainable configuration
 */

import { FIELD_NAMES } from '../constants/fieldNames';

// ============================================
// Type Definitions
// ============================================

type FieldExtractor = (item: any) => string | null;

interface FieldExtractorConfig {
    extractor: FieldExtractor;
    priority?: number; // Higher priority = checked first
}

function getRegistrationValue(item: any): string | null {
    const value = item.registrationNo
        ?? item.registrationNumber
        ?? item.registration_no
        ?? item.registration_number
        ?? item.regNo
        ?? item.reg_no
        ?? item.vehicle?.registrationNo
        ?? item.fpoRegistrationNo
        ?? item.fpoRegistrationNumber
        ?? item.ppvFraPlantVarietiesID;

    if (value === undefined || value === null || value === '') {
        return null;
    }

    return String(value);
}

// ============================================
// Field Extractor Functions
// ============================================

const fieldExtractors: Record<string, FieldExtractorConfig> = {
    // Date fields
    [FIELD_NAMES.DATE]: {
        extractor: (item: any) => {
            const dateVal = item.date || item.meetingDate || item.eventDate || item.activityDate || item.observationDate || item.programmeDate || item['Date'];
            if (!dateVal) return null;
            try {
                const date = new Date(dateVal);
                if (isNaN(date.getTime())) return null;
                return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
            } catch { return null; }
        },
        priority: 10,
    },
    [FIELD_NAMES.START_DATE]: {
        extractor: (item: any) => {
            const dateVal = item.startDate || item.start_date;
            if (!dateVal) return null;
            try {
                const date = new Date(dateVal);
                if (isNaN(date.getTime())) return null;
                return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
            } catch { return null; }
        },
        priority: 10,
    },
    [FIELD_NAMES.END_DATE]: {
        extractor: (item: any) => {
            // Keep END_DATE column, but fall back to first completion date when end date is absent.
            const dateVal =
                item.endDate ||
                item.end_date ||
                item.completedAt ||
                item.completed_at;
            if (!dateVal) return null;
            try {
                const date = new Date(dateVal);
                if (isNaN(date.getTime())) return null;
                return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
            } catch { return null; }
        },
        priority: 10,
    },
    [FIELD_NAMES.EVENT_DATE]: {
        extractor: (item: any) => {
            const dateVal = item.eventDate || item.event_date || item.date || item['Event Date'];
            if (!dateVal) return null;
            try {
                const date = new Date(dateVal);
                if (isNaN(date.getTime())) return null;
                return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
            } catch { return null; }
        },
        priority: 10,
    },
    [FIELD_NAMES.CONSTITUTION_DATE]: {
        extractor: (item: any) => {
            const dateVal = item.constitutionDate || item.constitution_date;
            if (!dateVal) return null;
            try {
                const date = new Date(dateVal);
                if (isNaN(date.getTime())) return null;
                return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
            } catch { return null; }
        },
        priority: 10,
    },
    [FIELD_NAMES.MEETING_DATE]: {
        extractor: (item: any) => {
            const dateVal = item.meetingDate || item.meeting_date;
            if (!dateVal) return null;
            try {
                const date = new Date(dateVal);
                if (isNaN(date.getTime())) return null;
                return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
            } catch { return null; }
        },
        priority: 10,
    },
    [FIELD_NAMES.AMOUNT_RS]: {
        extractor: (item: any) => {
            if (item.amountRs === undefined || item.amountRs === null) return null;
            return `₹${item.amountRs.toLocaleString('en-IN')}`;
        },
        priority: 6,
    },
    [FIELD_NAMES.QUANTITY_Q]: {
        extractor: (item: any) => {
            const val = item.quantityQ !== undefined ? item.quantityQ : item.quantity;
            return val !== undefined && val !== null ? String(val) : null;
        },
        priority: 6,
    },
    [FIELD_NAMES.DATE_OF_JOINING]: {
        extractor: (item: any) => {
            if (!item.dateOfJoining) return null;
            try {
                const date = new Date(item.dateOfJoining);
                if (isNaN(date.getTime())) return null;
                return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
            } catch {
                return null;
            }
        },
        priority: 10,
    },
    [FIELD_NAMES.DATE_OF_BIRTH]: {
        extractor: (item: any) => {
            if (!item.dateOfBirth) return null;
            try {
                const date = new Date(item.dateOfBirth);
                if (isNaN(date.getTime())) return null;
                return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
            } catch {
                return null;
            }
        },
        priority: 10,
    },

    // Vehicle field mappings
    [FIELD_NAMES.REGISTRATION_NUMBER]: {
        extractor: (item: any) => item.registrationNo || item.vehicle?.registrationNo || null,
        priority: 9,
    },
    [FIELD_NAMES.VEHICLE_NAME]: {
        extractor: (item: any) => item.vehicleName || item.vehicle?.vehicleName || null,
        priority: 8,
    },
    [FIELD_NAMES.EQUIPMENT_NAME]: {
        extractor: (item: any) => item.equipmentName || item.equipment?.equipmentName || null,
        priority: 8,
    },
    [FIELD_NAMES.IMPLEMENT_NAME]: {
        extractor: (item: any) => item.implementName || null,
        priority: 8,
    },
    [FIELD_NAMES.PRESENT_STATUS]: {
        extractor: (item: any) => {
            if (item.vehicleStatus?.statusLabel) return item.vehicleStatus.statusLabel;
            if (item.equipmentStatus?.statusLabel) return item.equipmentStatus.statusLabel;
            if (!item.presentStatus) return null;
            return item.presentStatus
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (char: string) => char.toUpperCase());
        },
        priority: 8,
    },
    [FIELD_NAMES.TOTAL_RUN_KMS]: {
        extractor: (item: any) => {
            const run = item.totalRun ?? item.vehicle?.totalRun ?? item.equipment?.totalRun;
            if (run === undefined || run === null || run === '') return null;
            return `${run} Kms`;
        },
        priority: 9,
    },
    [FIELD_NAMES.TOTAL_COST_RS]: {
        extractor: (item: any) => {
            const cost = item.totalCost ?? item.vehicle?.totalCost ?? item.equipment?.totalCost;
            if (cost === undefined || cost === null) return null;
            return `₹${Number(cost).toLocaleString('en-IN')}`;
        },
        priority: 9,
    },
    [FIELD_NAMES.TOTAL_COST_RS_DOT]: {
        extractor: (item: any) => {
            const cost = item.totalCost ?? item.vehicle?.totalCost ?? item.equipment?.totalCost;
            if (cost === undefined || cost === null) return null;
            return `₹${Number(cost).toLocaleString('en-IN')}`;
        },
        priority: 9,
    },
    [FIELD_NAMES.YEAR_OF_PURCHASE]: {
        extractor: (item: any) => {
            if (item.yearOfPurchase !== undefined && item.yearOfPurchase !== null) return item.yearOfPurchase;
            if (item.vehicle?.yearOfPurchase !== undefined && item.vehicle?.yearOfPurchase !== null) return item.vehicle.yearOfPurchase;
            if (item.equipment?.yearOfPurchase !== undefined && item.equipment?.yearOfPurchase !== null) return item.equipment.yearOfPurchase;

            return null;
        },
        priority: 8,
    },
    [FIELD_NAMES.ZONE_NAME]: {
        extractor: (item: any) => {
            if (item.zone?.zoneName) return item.zone.zoneName;
            if (item.district?.state?.zone?.zoneName) return item.district.state.zone.zoneName;
            if (item.state?.zone?.zoneName) return item.state.zone.zoneName; // Legacy
            return null;
        },
        priority: 7,
    },
    [FIELD_NAMES.STATE_NAME]: {
        extractor: (item: any) => {
            if (item.state?.stateName) return item.state.stateName;
            if (item.district?.state?.stateName) return item.district.state.stateName;
            return null;
        },
        priority: 7,
    },
    [FIELD_NAMES.DISTRICT_NAME]: {
        extractor: (item: any) => {
            const val = item.district || item.districtName || item.District || item.DistrictName || item.district_name;
            if (typeof val === 'string') return val;
            if (val && typeof val === 'object' && val.districtName) return val.districtName;
            if (item.kvk?.district?.districtName) return item.kvk.district.districtName;
            return null;
        },
        priority: 7,
    },
    [FIELD_NAMES.ORGANIZATION_NAME]: {
        extractor: (item: any) => {
            if (item.org?.orgName) return item.org.orgName;
            if (item.organization?.orgName) return item.organization.orgName;
            if (item.organization?.uniName) return item.organization.uniName; // Legacy
            if (item.uniName) return item.uniName; // Legacy
            return null;
        },
        priority: 7,
    },

    [FIELD_NAMES.DISTRICT]: {
        extractor: (item: any) => {
            const val = item.district || item.districtName || item.District;
            if (typeof val === 'string' && val.trim() !== '') return val;
            if (val && typeof val === 'object' && val.districtName) return val.districtName;
            if (item.kvk?.district?.districtName) return item.kvk.district.districtName;
            return null;
        },
        priority: 7,
    },
    [FIELD_NAMES.ORG_NAME]: {
        extractor: (item: any) => item.orgName || null,
        priority: 6,
    },
    [FIELD_NAMES.UNIVERSITY_NAME]: {
        extractor: (item: any) => item.universityName || null,
        priority: 6,
    },
    [FIELD_NAMES.HOST_ORG]: {
        extractor: (item: any) => {
            // Prefer university.hostOrg if available
            if (item.university?.hostOrg) return item.university.hostOrg;
            // Some APIs may flatten this onto the item
            if (item.hostOrg) return item.hostOrg;
            // Fallback to universityName if hostOrg is not set
            if (item.university?.universityName) return item.university.universityName;
            if (item.universityName) return item.universityName;
            return null;
        },
        priority: 7,
    },

    // OFT/FLD fields
    [FIELD_NAMES.SUBJECT_NAME]: {
        extractor: (item: any) => item.subject?.subjectName || null,
        priority: 5,
    },
    [FIELD_NAMES.SECTOR_NAME]: {
        extractor: (item: any) => {
            if (item.sector?.sectorName) return item.sector.sectorName;
            if (item.category?.sector?.sectorName) return item.category.sector.sectorName;
            return null;
        },
        priority: 5,
    },
    [FIELD_NAMES.CATEGORY_NAME]: {
        extractor: (item: any) => item.category?.categoryName || item.categoryName || null,
        priority: 5,
    },
    [FIELD_NAMES.SUB_CATEGORY_NAME]: {
        extractor: (item: any) => item.subCategory?.subCategoryName || item.subCategoryName || null,
        priority: 5,
    },
    // Sub Category (for FLD table display)
    [FIELD_NAMES.SUB_CATEGORY]: {
        extractor: (item: any) => {
            if (item.subCategoryName) return item.subCategoryName;
            if (item.subCategory?.subCategoryName) return item.subCategory.subCategoryName;
            if (item['Sub-Category']) return item['Sub-Category'];
            if (item['Sub Category']) return item['Sub Category'];
            return null;
        },
        priority: 5,
    },
    [FIELD_NAMES.SEASON_NAME]: {
        extractor: (item: any) => {
            if (item.seasonName) return item.seasonName;
            if (item.season?.seasonName) return item.season.seasonName;
            if (item.season_name) return item.season_name;
            if (item.season?.name) return item.season.name;
            return null;
        },
        priority: 5,
    },
    [FIELD_NAMES.SEED_BANK_FODDER_BANK]: {
        extractor: (item: any) => item.seedBankFodderBank || item.name || null,
        priority: 5,
    },
    [FIELD_NAMES.SANCTIONED_POST]: {
        extractor: (item: any) => {
            if (item.postName) return item.postName;
            if (item.sanctionedPostName) return item.sanctionedPostName;
            if (item.sanctionedPost?.postName) return item.sanctionedPost.postName;
            return null;
        },
        priority: 5,
    },
    [FIELD_NAMES.YEAR_NAME]: {
        extractor: (item: any) => item.yearName || null,
        priority: 5,
    },
    [FIELD_NAMES.REPORTING_YEAR]: {
        extractor: (item: any) => {
            if (item.reportingYear) {
                if (typeof item.reportingYear === 'object' && item.reportingYear.yearName) {
                    return item.reportingYear.yearName;
                }
                const reportingYearDate = new Date(item.reportingYear);
                if (!Number.isNaN(reportingYearDate.getTime())) {
                    return String(reportingYearDate.getUTCFullYear());
                }
                return item.reportingYear;
            }
            if (item.yearName) return item.yearName;
            if (item.reportingYearName) return item.reportingYearName;
            return null;
        },
        priority: 5,
    },
    [FIELD_NAMES.PUBLICATION_ITEM]: {
        extractor: (item: any) => {
            if (item.publication) return item.publication;
            if (item.publicationItem) return item.publicationItem;
            if (item.publicationName) return item.publicationName;
            if (item.publication?.publicationName) return item.publication.publicationName;
            return null;
        },
        priority: 5,
    },
    [FIELD_NAMES.CROP_TYPE_NAME]: {
        extractor: (item: any) => item.cropType?.typeName || null,
        priority: 5,
    },
    [FIELD_NAMES.ANALYSIS_NAME]: {
        extractor: (item: any) => item.analysisName || null,
        priority: 5,
    },
    // Crop field - using FIELD_NAMES constant (note: FIELD_NAMES.CROP_NAME = 'cropName')
    // Also handles the `crop` plain-string field used by prevalent diseases
    [FIELD_NAMES.CROP_NAME]: {
        extractor: (item: any) =>
            item.cropName ||
            item.nameOfCrop ||
            item.CropName ||
            (typeof item.crop === 'string' ? item.crop : null) ||
            null,
        priority: 5,
    },
    [FIELD_NAMES.NAME_OF_NUTRI_SMART_VILLAGE]: {
        extractor: (item: any) => item.nameOfNutriSmartVillage || item.villageName || null,
        priority: 6,
    },
    [FIELD_NAMES.NAME_OF_VALUE_ADDED_PRODUCT]: {
        extractor: (item: any) => item.nameOfValueAddedProduct || item.productName || null,
        priority: 6,
    },

    // Training fields
    [FIELD_NAMES.TRAINING_TYPE]: {
        extractor: (item: any) => {
            // Handle nested object first (for master tables)
            if (item.trainingType && typeof item.trainingType === 'object') {
                if (item.trainingType.typeName) return item.trainingType.typeName;
                if (item.trainingType.name) return item.trainingType.name;
                if (item.trainingType.trainingTypeName) return item.trainingType.trainingTypeName;
            }
            // Handle direct string value (for achievement tables)
            if (typeof item.trainingType === 'string') return item.trainingType;
            // Handle direct field
            if (item.trainingTypeName) return item.trainingTypeName;
            return null;
        },
        priority: 5,
    },
    [FIELD_NAMES.TRAINING_AREA_NAME]: {
        extractor: (item: any) => {
            // Handle direct field first (for Training Area entities themselves)
            if (item.trainingAreaName) return item.trainingAreaName;
            // Handle nested object (for when Training Area is nested in other entities)
            if (item.trainingArea && typeof item.trainingArea === 'object') {
                if (item.trainingArea.trainingAreaName) return item.trainingArea.trainingAreaName;
                if (item.trainingArea.name) return item.trainingArea.name;
            }
            // Handle direct string value (for achievement tables)
            if (typeof item.trainingArea === 'string') return item.trainingArea;
            return null;
        },
        priority: 5,
    },
    [FIELD_NAMES.TRAINING_THEMATIC_AREA]: {
        extractor: (item: any) => {
            // Handle nested object first (for master tables)
            if (item.trainingThematicArea && typeof item.trainingThematicArea === 'object') {
                if (item.trainingThematicArea.trainingThematicAreaName) return item.trainingThematicArea.trainingThematicAreaName;
                if (item.trainingThematicArea.name) return item.trainingThematicArea.name;
            }
            // Handle direct string value (for achievement tables)
            if (typeof item.trainingThematicArea === 'string') return item.trainingThematicArea;
            // Handle thematicArea (for achievement tables)
            if (typeof item.thematicArea === 'string') return item.thematicArea;
            if (item.thematicArea?.name) return item.thematicArea.name;
            // Handle direct field
            if (item.trainingThematicAreaName) return item.trainingThematicAreaName;
            return null;
        },
        priority: 5,
    },
    [FIELD_NAMES.TRAINING_PROGRAM]: {
        extractor: (item: any) => {
            // Training Program = Training Type
            // Handle nested object first (for master tables)
            if (item.trainingType && typeof item.trainingType === 'object') {
                if (item.trainingType.name) return item.trainingType.name;
                if (item.trainingType.trainingTypeName) return item.trainingType.trainingTypeName;
            }
            // Handle direct string value (for achievement tables)
            if (typeof item.trainingType === 'string') return item.trainingType;
            // Handle direct field
            if (item.trainingTypeName) return item.trainingTypeName;
            return null;
        },
        priority: 5,
    },
    [FIELD_NAMES.TRAINING_TITLE]: {
        extractor: (item: any) => {
            if (item.titleOfTraining) return item.titleOfTraining;
            if (item.title) return item.title;
            if (item.trainingTitle) return item.trainingTitle;
            return null;
        },
        priority: 5,
    },
    [FIELD_NAMES.TRAINING_DISCIPLINE]: {
        extractor: (item: any) => {
            // Training Discipline = Training Area
            // Handle nested object first (for master tables)
            if (item.trainingArea && typeof item.trainingArea === 'object') {
                if (item.trainingArea.name) return item.trainingArea.name;
                if (item.trainingArea.trainingAreaName) return item.trainingArea.trainingAreaName;
            }
            // Handle direct string value (for achievement tables)
            if (typeof item.trainingArea === 'string') return item.trainingArea;
            // Handle direct field
            if (item.trainingAreaName) return item.trainingAreaName;
            return null;
        },
        priority: 5,
    },
    [FIELD_NAMES.THEMATIC_AREA]: {
        extractor: (item: any) => {
            // Thematic Area for training - can come from thematicArea or trainingThematicArea
            if (item.thematicArea) {
                if (typeof item.thematicArea === 'string') return item.thematicArea;
                if (item.thematicArea.name) return item.thematicArea.name;
            }
            if (item.trainingThematicArea) {
                if (typeof item.trainingThematicArea === 'string') return item.trainingThematicArea;
                if (item.trainingThematicArea.trainingThematicAreaName) return item.trainingThematicArea.trainingThematicAreaName;
                if (item.trainingThematicArea.name) return item.trainingThematicArea.name;
            }
            if (item.trainingThematicAreaName) return item.trainingThematicAreaName;
            if (item.thematicAreaName) return item.thematicAreaName;
            return null;
        },
        priority: 5,
    },

    // Extension & Events fields
    name: {
        extractor: (item: any) => {
            if (item.extensionName) return item.extensionName;
            if (item.otherExtensionName) return item.otherExtensionName;
            return null;
        },
        priority: 5,
    },
    // Trial On Form (for OFT table display)
    [FIELD_NAMES.TRIAL_ON_FORM]: {
        extractor: (item: any) => {
            if (item.trialOnForm) return item.trialOnForm;
            if (item.title) return item.title; // OFT uses 'title' field
            return null;
        },
        priority: 5,
    },
    [FIELD_NAMES.EVENT_NAME]: {
        extractor: (item: any) => item.eventName || null,
        priority: 5,
    },
    // Extension Activity fields - using camelCase
    [FIELD_NAMES.NAME_OF_EXTENSION_ACTIVITIES]: {
        extractor: (item: any) => item.nameOfExtensionActivities || item['Name of Extension activities'] || item['Name of Extension Activities'] || item.activityName || item.extensionActivityType || item.extension_activity_type || (item.activity?.activityName) || item.activity_name || null,
        priority: 7,
    },
    [FIELD_NAMES.WITHIN_STATE_WITHOUT_STATE]: {
        extractor: (item: any) =>
            item.withinStateWithoutState ||
            item.withinStateOrWithoutState ||
            item.withinState ||
            item.withinWithoutState ||
            item.activityName ||
            item.nameOfExtensionActivities ||
            item.extensionActivityType ||
            item.stateScope ||
            null,
        priority: 7,
    },
    [FIELD_NAMES.EXPOSURE_VISIT_NO]: {
        extractor: (item: any) => {
            const val = item.exposureVisitNo ?? item.exposureVisit;
            return val !== undefined && val !== null ? String(val) : null;
        },
        priority: 7,
    },
    [FIELD_NAMES.NATURE_OF_EXTENSION_ACTIVITY]: {
        extractor: (item: any) => item.natureOfExtensionActivity || item['Nature of Extension Activity'] || item['Nature of Extension activity'] || item.extensionActivityType || item.extensionActivityName || item.activity_name || (item.activity?.activityName) || null,
        priority: 7,
    },
    // Display name fallbacks (for backward compatibility)
    'Nature of Extension Activity': {
        extractor: (item: any) => item.natureOfExtensionActivity || item['Nature of Extension Activity'] || item['Nature of Extension activity'] || item.extensionActivityType || item.extensionActivityName || item.activity_name || (item.activity?.activityName) || null,
        priority: 7,
    },
    'Nature of Extension activity': {
        extractor: (item: any) => item.natureOfExtensionActivity || item['Nature of Extension activity'] || item['Nature of Extension Activity'] || item.extensionActivityType || item.extensionActivityName || item.activity_name || (item.activity?.activityName) || null,
        priority: 7,
    },
    [FIELD_NAMES.PLACE_OF_ACTIVITY]: {
        extractor: (item: any) => item.placeOfActivity || item.venue || item.PlaceOfActivity || null,
        priority: 7,
    },
    [FIELD_NAMES.IMPORTANT_DAYS]: {
        extractor: (item: any) => item.importantDays || item['Important Days'] || item['Important days'] || (item.importantDay?.dayName) || item.importantDay || item.dayName || item.day_name || null,
        priority: 7,
    },
    [FIELD_NAMES.NO_OF_ACTIVITIES]: {
        extractor: (item: any) => {
            const val = item.noOfActivities || item.numberOfActivities || item.activityCount || item.number_of_activities || item['No. of Activities'] || item['No. of activities'];
            return val !== undefined && val !== null ? String(val) : null;
        },
        priority: 5,
    },
    [FIELD_NAMES.TYPE_OF_ACTIVITIES]: {
        extractor: (item: any) => item.typeOfActivities || item.activityType || item['Type Of Activities'] || item['Type of activities'] || null,
        priority: 5,
    },

    // Production & Projects fields
    [FIELD_NAMES.PRODUCT_CATEGORY_NAME]: {
        extractor: (item: any) => {
            if (item.productCategoryName) return item.productCategoryName;
            if (item.productCategory?.productCategoryName) return item.productCategory.productCategoryName;
            return null;
        },
        priority: 5,
    },
    [FIELD_NAMES.PRODUCT_CATEGORY_TYPE]: {
        extractor: (item: any) => {
            if (item.productCategoryType) return item.productCategoryType;
            if (item.productType?.productCategoryType) return item.productType.productCategoryType;
            return null;
        },
        priority: 5,
    },
    [FIELD_NAMES.PRODUCT_NAME]: {
        extractor: (item: any) => item.productName || null,
        priority: 5,
    },
    [FIELD_NAMES.FARMING_SYSTEM_NAME]: {
        extractor: (item: any) => item.farmingSystemName || null,
        priority: 5,
    },
    [FIELD_NAMES.ENTERPRISE_NAME]: {
        extractor: (item: any) => item.enterpriseName || null,
        priority: 5,
    },
    [FIELD_NAMES.SPECIFIC_AREA_NAME]: {
        extractor: (item: any) => item.specificAreaName || null,
        priority: 5,
    },

    // About KVK fields
    kvk: {
        extractor: (item: any) => {
            if (item.kvk?.kvkName) return item.kvk.kvkName;
            if (item.kvkName) return item.kvkName;
            return null;
        },
        priority: 7,
    },
    [FIELD_NAMES.PROJECT_NAME]: {
        extractor: (item: any) => {
            const masterName = item.projectName?.projectName || item.projectName;
            const specifyName = item.specifyProjectName;
            if (masterName === 'Others' && specifyName) {
                return specifyName;
            }
            if (typeof masterName === 'string') return masterName;
            // Fallback for budget where projectName is the relation
            return item.projectName?.projectName || null;
        },
        priority: 7,
    },
    [FIELD_NAMES.SPECIFY_PROJECT_NAME]: {
        extractor: (item: any) => item.specifyProjectName || null,
        priority: 7,
    },
    [FIELD_NAMES.KVK_NAME]: {
        extractor: (item: any) => {
            if (item.kvk?.kvkName) return item.kvk.kvkName;
            if (item.kvkName) return item.kvkName;
            return null;
        },
        priority: 7,
    },

    // Employee/Staff specific fields
    [FIELD_NAMES.POSITION]: {
        extractor: (item: any) => {
            if (item.positionOrder !== undefined && item.positionOrder !== null) {
                return String(item.positionOrder);
            }
            return null;
        },
        priority: 6,
    },
    [FIELD_NAMES.POSITION_ORDER]: {
        extractor: (item: any) => {
            if (item.positionOrder !== undefined && item.positionOrder !== null) {
                return String(item.positionOrder);
            }
            return null;
        },
        priority: 6,
    },
    [FIELD_NAMES.POST_NAME]: {
        extractor: (item: any) => {
            if (item.sanctionedPost?.postName) return item.sanctionedPost.postName;
            if (item.postName) return item.postName;
            if (item.sanctionedPost?.post_name) return item.sanctionedPost.post_name;
            if (item.post_name) return item.post_name;
            return null;
        },
        priority: 7,
    },
    [FIELD_NAMES.ALLOWANCES]: {
        extractor: (item: any) => {
            if (item.allowances) return item.allowances;
            return null;
        },
        priority: 6,
    },
    [FIELD_NAMES.DETAILS_OF_ALLOWENCES]: {
        extractor: (item: any) => {
            if (item.allowances) return item.allowances;
            if (item.detailsOfAllowences) return item.detailsOfAllowences;
            return null;
        },
        priority: 6,
    },
    [FIELD_NAMES.CATEGORY]: {
        extractor: (item: any) => {
            // Production Supply: backend returns category directly
            if (item.category) return item.category;
            // Product Category relation
            if (item.productCategory?.productCategoryName) return item.productCategory.productCategoryName;
            // Staff Category relation
            if (item.staffCategory?.categoryName) return item.staffCategory.categoryName;
            // Fallback: Check direct field name
            if (item.categoryName) return item.categoryName;
            return null;
        },
        priority: 7,
    },
    [FIELD_NAMES.RESUME]: {
        extractor: (item: any) => {
            // Handle resumePath - show value even if it's "NA" or empty string
            if (item.resumePath !== null && item.resumePath !== undefined && item.resumePath !== '') {
                return String(item.resumePath);
            }
            if (item.resume !== null && item.resume !== undefined && item.resume !== '') {
                return String(item.resume);
            }
            return null;
        },
        priority: 6,
    },
    [FIELD_NAMES.PAY_SCALE]: {
        extractor: (item: any) => {
            if (item?.payScale?.scaleName) return item.payScale.scaleName;
            if (typeof item?.payScale === 'string' && item.payScale) return item.payScale;
            return null;
        },
        priority: 7,
    },
    [FIELD_NAMES.RESUME_PATH]: {
        extractor: (item: any) => {
            // Handle resumePath - show value even if it's "NA" or empty string
            if (item.resumePath !== null && item.resumePath !== undefined && item.resumePath !== '') {
                return String(item.resumePath);
            }
            if (item.resume !== null && item.resume !== undefined && item.resume !== '') {
                return String(item.resume);
            }
            return null;
        },
        priority: 6,
    },

    // Staff Transferred specific fields
    [FIELD_NAMES.KVK_NAME_BEFORE_TRANSFER]: {
        extractor: (item: any) => {
            // Show original KVK name (where staff was first created)
            if (item.originalKvk?.kvkName) return item.originalKvk.kvkName;
            if (item.originalKvkId) return `KVK ${item.originalKvkId}`;
            if (item.kvk?.kvkName) return item.kvk.kvkName;
            return null;
        },
        priority: 7,
    },
    [FIELD_NAMES.LATEST_KVK_NAME]: {
        extractor: (item: any) => {
            // Show current/latest KVK name (where staff is now)
            if (item.kvk?.kvkName) return item.kvk.kvkName;
            if (item.kvkName) return item.kvkName;
            return null;
        },
        priority: 7,
    },

    [FIELD_NAMES.INFRA_MASTER_NAME]: {
        extractor: (item: any) => {
            if (item.infraMaster?.name) return item.infraMaster.name;
            if (item.infraMasterName) return item.infraMasterName;
            return null;
        },
        priority: 7,
    },
    [FIELD_NAMES.NOT_YET_STARTED]: {
        extractor: (item: any) => {
            if (item.notYetStarted === true || item.notYetStarted === false) {
                return item.notYetStarted ? 'Yes' : 'No';
            }
            return null;
        },
    },
    [FIELD_NAMES.COMPLETED_PLINTH_LEVEL]: {
        extractor: (item: any) => {
            if (item.completedPlinthLevel === true || item.completedPlinthLevel === false) {
                return item.completedPlinthLevel ? 'Yes' : 'No';
            }
            return null;
        },
    },
    [FIELD_NAMES.COMPLETED_LINTEL_LEVEL]: {
        extractor: (item: any) => {
            if (item.completedLintelLevel === true || item.completedLintelLevel === false) {
                return item.completedLintelLevel ? 'Yes' : 'No';
            }
            return null;
        },
    },
    [FIELD_NAMES.COMPLETED_ROOF_LEVEL]: {
        extractor: (item: any) => {
            if (item.completedRoofLevel === true || item.completedRoofLevel === false) {
                return item.completedRoofLevel ? 'Yes' : 'No';
            }
            return null;
        },
    },
    [FIELD_NAMES.TOTALLY_COMPLETED]: {
        extractor: (item: any) => {
            if (item.totallyCompleted === true || item.totallyCompleted === false) {
                return item.totallyCompleted ? 'Yes' : 'No';
            }
            return null;
        },
    },
    [FIELD_NAMES.PLINTH_AREA_SQ_M]: {
        extractor: (item: any) => {
            if (item.plinthAreaSqM !== null && item.plinthAreaSqM !== undefined) {
                return String(item.plinthAreaSqM);
            }
            return null;
        },
    },
    [FIELD_NAMES.UNDER_USE]: {
        extractor: (item: any) => {
            if (item.underUse === true || item.underUse === false) {
                return item.underUse ? 'Yes' : 'No';
            }
            return null;
        },
    },
    [FIELD_NAMES.SOURCE_OF_FUNDING]: {
        extractor: (item: any) => {
            if (item.sourceOfFunding) return item.sourceOfFunding;
            return null;
        },
        priority: 6,
    },
    [FIELD_NAMES.SOURCE_OF_FUND]: {
        extractor: (item: any) => {
            // Map sourceOfFund to sourceOfFunding (for equipment and farm implements)
            if (item.sourceOfFunding) return item.sourceOfFunding;
            if (item.vehicle?.sourceOfFunding) return item.vehicle.sourceOfFunding;
            if (item.equipment?.sourceOfFunding) return item.equipment.sourceOfFunding;
            if (item.sourceOfFund) return item.sourceOfFund;
            return null;
        },
        priority: 6,
    },

    // CFLD Technical Parameter fields - using camelCase
    [FIELD_NAMES.MONTH]: {
        extractor: (item: any) => {
            if (!item.month) return null;
            try {
                const date = new Date(item.month);
                if (isNaN(date.getTime())) return String(item.month);
                return date.toLocaleString('default', { month: 'long' });
            } catch {
                return String(item.month);
            }
        },
    },
    [FIELD_NAMES.TYPE]: {
        extractor: (item: any) => {
            // Handle relation first (Master tables)
            if (item.trainingType && typeof item.trainingType === 'object') {
                if (item.trainingType.typeName) return item.trainingType.typeName;
                if (item.trainingType.name) return item.trainingType.name;
            }
            // Direct field evaluation
            return item.type || item.typeName || item.name || item.parameterName || item.activityName || null;
        },
        priority: 7,
    },
    [FIELD_NAMES.SEASON]: {
        extractor: (item: any) => item.seasonName || (item.season?.seasonName) || null,
    },
    // Note: 'Crop' extractor is defined below using FIELD_NAMES.CROP constant
    [FIELD_NAMES.VARIETY]: {
        extractor: (item: any) => {
            // Production Supply: backend returns variety directly
            if (item.variety) return item.variety;
            // Species/Breed/Variety field
            if (item.speciesName) return item.speciesName;
            // Species Breed Variety field
            if (item.speciesBreedVariety) return item.speciesBreedVariety;
            // Variety name field
            if (item.varietyName) return item.varietyName;
            return null;
        },
        priority: 7,
    },
    [FIELD_NAMES.AREA]: {
        extractor: (item: any) => item.areaHectare !== undefined ? String(item.areaHectare) : (item.areaInHa !== undefined ? String(item.areaInHa) : null),
    },
    [FIELD_NAMES.PERCENT_INCREASE]: {
        extractor: (item: any) => item.yieldIncreasePercent !== undefined ? `${item.yieldIncreasePercent}%` : (item.percentIncrease !== undefined ? `${item.percentIncrease}%` : null),
    },
    [FIELD_NAMES.YEAR]: {
        extractor: (item: any) => {
            const val = item.reportingYear || item.year;
            if (val !== undefined && val !== null) {
                const dt = new Date(val);
                if (!Number.isNaN(dt.getTime())) return String(dt.getUTCFullYear());
                return String(val);
            }
            return item.yearName || item.year?.yearName || item.reportingYear?.yearName || null;
        },
    },
    [FIELD_NAMES.ENTERPRISE]: {
        extractor: (item: any) => item.enterpriseName || (item.enterprise?.enterpriseName) || null,
    },
    // ARYA fields - using camelCase
    Trainings: {
        extractor: (item: any) => item.noOfTraining !== undefined ? String(item.noOfTraining) : null,
    },
    [FIELD_NAMES.PARTICIPANTS]: {
        extractor: (item: any) => {
            const sum = (Number(item.generalM || 0)) + (Number(item.generalF || 0)) +
                (Number(item.obcM || 0)) + (Number(item.obcF || 0)) +
                (Number(item.scM || 0)) + (Number(item.scF || 0)) +
                (Number(item.stM || 0)) + (Number(item.stF || 0));
            if (sum > 0) return String(sum);
            const value = item.numberOfParticipants || item.noOfParticipants || item.totalParticipants || item.participants || item['No. of Participant'] || item['No. of Participants'] || item['No Of Participants'];
            return value !== undefined && value !== null ? String(value) : null;
        },
    },
    Units: {
        extractor: (item: any) => item.noOfUnitsEstablished !== undefined ? String(item.noOfUnitsEstablished) : null,
    },
    Entrepreneurs: {
        extractor: (item: any) => item.noOfEntrepreneurs !== undefined ? String(item.noOfEntrepreneurs) : null,
    },
    [FIELD_NAMES.VILLAGES]: {
        extractor: (item: any) => item.noOfVillages !== undefined ? String(item.noOfVillages) : null,
    },
    [FIELD_NAMES.VILLAGE_NAME]: {
        extractor: (item: any) => item.villageName || item.village || null,
    },
    [FIELD_NAMES.FARMERS]: {
        extractor: (item: any) => item.noOfFarmers !== undefined ? String(item.noOfFarmers) : null,
    },
    [FIELD_NAMES.HOUSEHOLDS]: {
        extractor: (item: any) => item.noOfHouseholds !== undefined ? String(item.noOfHouseholds) : null,
    },
    [FIELD_NAMES.TRAINING_RECEIVED_BY_FPO_MEMBERS]: {
        extractor: (item: any) => {
            if (item.trainingReceivedByFpoMembers !== undefined && item.trainingReceivedByFpoMembers !== null) {
                return String(item.trainingReceivedByFpoMembers)
            }
            if (item.trainingReceivedByMembers !== undefined && item.trainingReceivedByMembers !== null) {
                // Backend returns 'Yes'/'No' for trainingReceivedByMembers
                return String(item.trainingReceivedByMembers)
            }
            return null
        },
        priority: 6,
    },
    [FIELD_NAMES.IS_BUSINESS_PLAN_PREPARED]: {
        extractor: (item: any) => {
            if (item.isBusinessPlanPrepared !== undefined && item.isBusinessPlanPrepared !== null) {
                return String(item.isBusinessPlanPrepared)
            }

            // Backend provides businessPlanPreparedWithCbbo/WithoutCbbo (bool) and businessPlanCbbo/WithoutCbbo ('Yes'/'No')
            const withCbbo = item.businessPlanPreparedWithCbbo ?? item.businessPlanCbbo
            const withoutCbbo = item.businessPlanPreparedWithoutCbbo ?? item.businessPlanWithoutCbbo

            const normalize = (v: any) => {
                if (v === true || v === 'true' || v === 1 || v === '1') return true
                if (v === 'Yes' || v === 'YES' || v === 'Y') return true
                return false
            }

            return normalize(withCbbo) || normalize(withoutCbbo) ? 'Yes' : 'No'
        },
        priority: 6,
    },
    [FIELD_NAMES.NO_OF_FPO_RECEIVED_MANAGEMENT_COST]: {
        extractor: (item: any) => {
            if (item.noOfFpoReceivedManagementCost !== undefined && item.noOfFpoReceivedManagementCost !== null) {
                return String(item.noOfFpoReceivedManagementCost)
            }
            if (item.fposReceivedManagementCost !== undefined && item.fposReceivedManagementCost !== null) {
                return String(item.fposReceivedManagementCost)
            }
            if (item.fposReceivedMgmtCost !== undefined && item.fposReceivedMgmtCost !== null) {
                return String(item.fposReceivedMgmtCost)
            }
            return null
        },
        priority: 6,
    },
    [FIELD_NAMES.ACTIVITY]: {
        extractor: (item: any) => item.activity || item.activityName || item['Activity'] || null,
    },
    Activities: {
        extractor: (item: any) => item.noOfActivities !== undefined ? String(item.noOfActivities) : null,
    },
    [FIELD_NAMES.FLD_NAME]: {
        extractor: (item: any) => item.fldName || item['FLD Name'] || item.fld?.fldName || item['FLD'] || null,
    },
    [FIELD_NAMES.NAME_OF_TECHNOLOGY_DEMONSTRATED]: {
        extractor: (item: any) => {
            if (item.nameOfTechnologyDemonstrated) return item.nameOfTechnologyDemonstrated;
            if (item.fldName) return item.fldName;
            if (item.technologyName) return item.technologyName;
            return null;
        },
        priority: 5,
    },

    [FIELD_NAMES.NUMBER_OF_ACTIVITIES]: {
        extractor: (item: any) => {
            const value = item.numberOfActivities || item.noOfActivities || item.activityCount || item['No. of Activity'];
            return value !== undefined && value !== null ? String(value) : null;
        },
    },
    [FIELD_NAMES.NUMBER_OF_PARTICIPANTS]: {
        extractor: (item: any) => {
            const sum = (Number(item.generalM || 0)) + (Number(item.generalF || 0)) +
                (Number(item.obcM || 0)) + (Number(item.obcF || 0)) +
                (Number(item.scM || 0)) + (Number(item.scF || 0)) +
                (Number(item.stM || 0)) + (Number(item.stF || 0));
            if (sum > 0) return String(sum);
            const value = item.numberOfParticipants || item.noOfParticipants || item.totalParticipants || item.participants || item['No. of Participant'] || item['No. of Participants'] || item['No Of Participants'];
            return value !== undefined && value !== null ? String(value) : null;
        },
    },
    [FIELD_NAMES.ATTACHMENT_TYPE]: {
        extractor: (item: any) => typeof item.attachmentType === 'string' ? item.attachmentType : (item.attachmentType?.name || item.attachmentType?.attachmentName || null),
        priority: 5,
    },
    [FIELD_NAMES.NUMBER_OF_STUDENT]: {
        extractor: (item: any) => {
            const male = Number(item.maleStudents || 0);
            const female = Number(item.femaleStudents || 0);
            if (male === 0 && female === 0) return item.numberOfStudent || null;
            return String(male + female);
        },
        priority: 5,
    },
    [FIELD_NAMES.NO_OF_DAYS_STAYED]: {
        extractor: (item: any) => {
            const startRaw = item.startDate || item.start_date;
            const endRaw = item.endDate || item.end_date;
            if (!startRaw || !endRaw) return null;
            try {
                const start = new Date(startRaw);
                const end = new Date(endRaw);
                if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

                // Normalize to UTC midnight to avoid timezone drift.
                const startUtc = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
                const endUtc = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
                if (endUtc < startUtc) return null;

                const diffDays = Math.floor((endUtc - startUtc) / (1000 * 60 * 60 * 24)) + 1;
                return String(diffDays);
            } catch {
                return null;
            }
        },
        priority: 5,
    },
    [FIELD_NAMES.REGISTRATION_NO]: {
        extractor: (item: any) => getRegistrationValue(item),
    },
    'Registration No': {
        extractor: (item: any) => getRegistrationValue(item),
    },
    [FIELD_NAMES.RELATED_CROP_LIVESTOCK_TECHNOLOGY]: {
        extractor: (item: any) => {
            // Check display name first (as it exists in the response)
            const value = item['Related Crop/Live Stock Technology'] || item['Related crop/livestock technology'] || item['Related Crop Livestock Technology'] || item.relatedTechnology || item.relatedCropLivestockTechnology;
            return value !== undefined && value !== null ? String(value) : null;
        },
    },
    [FIELD_NAMES.ATTACHMENT]: {
        extractor: (item: any) => {
            const path = item.attachment || item.attachmentPath || item.filePath || item.file;
            if (path && typeof path === 'string') return path;
            if (item.attachmentType?.name) return item.attachmentType.name;
            return null;
        }
    },
    [FIELD_NAMES.NO_OF_PARTICIPANTS]: {
        extractor: (item: any) => {
            const counts = [
                item.generalM, item.generalF,
                item.obcM, item.obcF,
                item.scM, item.scF,
                item.stM, item.stF,
                item.male, item.female,
                item.participants,
                item.farmersGeneralM, item.farmersGeneralF,
                item.farmersObcM, item.farmersObcF,
                item.farmersScM, item.farmersScF,
                item.farmersStM, item.farmersStF
            ].map(v => Number(v || 0));

            const total = counts.reduce((sum, val) => sum + val, 0);
            return total > 0 ? String(total) : (item.noOfParticipants || item.numberOfParticipants || null);
        }
    },
    [FIELD_NAMES.NO_OF_FARMERS_ATTENDED]: {
        extractor: (item: any) => {
            const counts = [
                item.generalM, item.generalF,
                item.obcM, item.obcF,
                item.scM, item.scF,
                item.stM, item.stF,
                item.genMale, item.genFemale,
                item.obcMale, item.obcFemale,
                item.scMale, item.scFemale,
                item.stMale, item.stFemale,
                item.participants,
            ].map(v => Number(v || 0));

            const total = counts.reduce((sum, val) => sum + val, 0);
            if (total > 0) return String(total);

            const value = item.noOfFarmersAttended || item.numberOfFarmersAttended || item.noOfParticipants || item.numberOfParticipants;
            return value !== undefined && value !== null ? String(value) : null;
        }
    },
    [FIELD_NAMES.REMARK]: {
        extractor: (item: any) => item.remark || item.remarks || item['Remark'] || null,
    },
    [FIELD_NAMES.FLD]: {
        extractor: (item: any) => item.fldName || (item.fld?.fldName) || item.fld || null,
    },
    [FIELD_NAMES.CROP]: {
        extractor: (item: any) => item.cropName || (item.crop?.cropName) || item.crop || null,
    },
    [FIELD_NAMES.FEEDBACK]: {
        extractor: (item: any) => item.feedback || item.feedBack || null,
    },
    [FIELD_NAMES.GARDENS]: {
        extractor: (item: any) => item.noOfGardens !== undefined ? String(item.noOfGardens) : null,
    },
    [FIELD_NAMES.BENEFICIARIES]: {
        extractor: (item: any) => item.noOfBeneficiaries !== undefined ? String(item.noOfBeneficiaries) : null,
    },
    [FIELD_NAMES.NUMBERS]: {
        extractor: (item: any) => item.number !== undefined ? String(item.number) : null,
    },
    [FIELD_NAMES.CATEGORY_OF_CROP]: {
        extractor: (item: any) => item.cropCategory?.name || item.cropCategoryName || null,
    },
    [FIELD_NAMES.NUTRITION_GARDEN_CROP_RESULTS]: {
        extractor: (item: any) => {
            const rows = item.results;
            const n = typeof item.resultCount === 'number' ? item.resultCount : Array.isArray(rows) ? rows.length : 0;
            if (n === 0) return '—';
            const first = Array.isArray(rows) && rows[0];
            const crop = first?.cropName ? String(first.cropName) : '';
            if (n === 1 && crop) return crop;
            return crop ? `${n} entries (${crop}${n > 1 ? '…' : ''})` : `${n} entr${n === 1 ? 'y' : 'ies'}`;
        },
    },
    [FIELD_NAMES.TYPE_OF_NUTRITIONAL_GARDEN]: {
        extractor: (item: any) => item.typeOfNutritionalGarden?.name || item.typeOfNutritionalGardenName || null,
    },
    [FIELD_NAMES.ACTIVITY_NAME]: {
        extractor: (item: any) => item.nameOfActivity || item.activityName || item.activityMaster?.activityName || null,
    },
    [FIELD_NAMES.TITLE_OF_NATURAL_FARMING_TRAINING_PROGRAMME]: {
        extractor: (item: any) => item.titleOfNaturalFarmingTrainingProgramme || item.trainingTitle || null,
    },
    [FIELD_NAMES.DATE_OF_TRAINING]: {
        extractor: (item: any) => item.dateOfTraining || item.trainingDate || null,
    },
    [FIELD_NAMES.VENUE_OF_PROGRAMME]: {
        extractor: (item: any) => item.venueOfProgramme || item.venue || null,
    },
    [FIELD_NAMES.NORMAL_CROPS_GROWN]: {
        extractor: (item: any) => item.normalCropsGrown || item.croppingPattern || null,
    },
    [FIELD_NAMES.PRACTICING_YEAR_OF_NATURAL_FARMING]: {
        extractor: (item: any) => item.practicingYearOfNaturalFarming || item.farmerPracticeDetails || null,
    },
    [FIELD_NAMES.NAME_OF_INNOVATIVE_PROGRAMME]: {
        extractor: (item: any) => item.innovativeProgrammeName || item.nameOfInnovativeProgramme || null,
    },
    [FIELD_NAMES.SIGNIFICANCE_OF_INNOVATIVE_PROGRAMME]: {
        extractor: (item: any) => item.significanceOfInnovativeProgramme || null,
    },
    [FIELD_NAMES.QUANTITY]: {
        extractor: (item: any) => item.quantity !== undefined ? String(item.quantity) : null,
    },
    [FIELD_NAMES.ANALYSIS]: {
        extractor: (item: any) => item.analysisName || null,
    },
    [FIELD_NAMES.NO_OF_SAMPLES_ANALYZED]: {
        extractor: (item: any) => item.samplesAnalysed !== undefined ? String(item.samplesAnalysed) : null,
    },
    [FIELD_NAMES.NO_OF_VILLAGES_COVERED]: {
        extractor: (item: any) => item.villagesNumber !== undefined ? String(item.villagesNumber) : null,
    },
    [FIELD_NAMES.AMOUNT_RELEASED]: {
        extractor: (item: any) => item.amountRealized !== undefined ? `₹${item.amountRealized.toLocaleString('en-IN')}` : null,
    },
    [FIELD_NAMES.NO_OF_ACTIVITIES_CONDUCTED]: {
        extractor: (item: any) => item.activitiesConducted !== undefined ? String(item.activitiesConducted) : null,
    },
    [FIELD_NAMES.SOIL_HEALTH_CARDS_DISTRIBUTED]: {
        extractor: (item: any) => item.soilHealthCardDistributed !== undefined ? String(item.soilHealthCardDistributed) : null,
    },
    [FIELD_NAMES.VIP_NAMES]: {
        extractor: (item: any) => item.vipNames || null,
    },
    [FIELD_NAMES.TOTAL_PARTICIPANTS_ATTENDED]: {
        extractor: (item: any) => item.participants !== undefined ? String(item.participants) : null,
    },
    [FIELD_NAMES.NO_OF_VIPS]: {
        extractor: (item: any) => item.vipNames ? String(item.vipNames.split(',').length) : '0',
    },
    [FIELD_NAMES.AWARD]: {
        extractor: (item: any) => item.awardName || item.award_name || null,
        priority: 5,
    },
    [FIELD_NAMES.AMOUNT]: {
        extractor: (item: any) => {
            if (item.amount === undefined || item.amount === null) return null;
            return `₹${Number(item.amount).toLocaleString('en-IN')}`;
        },
        priority: 5,
    },
    [FIELD_NAMES.ACHIEVEMENT]: {
        extractor: (item: any) => item.achievement || null,
        priority: 5,
    },
    [FIELD_NAMES.CONFERRING_AUTHORITY]: {
        extractor: (item: any) => item.conferringAuthority || item.conferring_authority || null,
        priority: 5,
    },
    [FIELD_NAMES.HEAD_SCIENTIST]: {
        extractor: (item: any) => {
            if (item.staffName) return item.staffName;
            if (item.headScientist) return item.headScientist;
            if (item.scientistName) return item.scientistName;
            return null;
        }
    },
    [FIELD_NAMES.FARMER_NAME]: {
        extractor: (item: any) => item.farmerName || item.farmer_name || null,
    },
    [FIELD_NAMES.ADDRESS]: {
        extractor: (item: any) => item.address || null,
    },
    [FIELD_NAMES.CONTACT_NUMBER]: {
        extractor: (item: any) => item.contactNo || item.contactNumber || item.contact_number || null,
    },
    [FIELD_NAMES.STAFF]: {
        extractor: (item: any) => {
            if (item.staffName) return item.staffName;
            if (item.staff_name) return item.staff_name;
            if (item.staff?.staffName) return item.staff.staffName;
            return null;
        }
    },
    [FIELD_NAMES.COURSE]: {
        extractor: (item: any) => item.courseName || item.course_name || null,
    },
    [FIELD_NAMES.ORGANIZER]: {
        extractor: (item: any) => item.organizerVenue || item.organizer_venue || null,
    },
    [FIELD_NAMES.DATE_OF_REGISTRATION]: {
        extractor: (item: any) => {
            if (!item.registrationDate) return null;
            try {
                const date = new Date(item.registrationDate);
                return date.toLocaleDateString('en-GB');
            } catch { return null; }
        }
    },
    [FIELD_NAMES.NAME_OF_THE_FPO]: {
        extractor: (item: any) => item.fpoName || null,
    },
    [FIELD_NAMES.ADDRESS_OF_FPO]: {
        extractor: (item: any) => item.address || null,
    },
    [FIELD_NAMES.TOTAL_NUMBER_OF_BOM_MEMBERS]: {
        extractor: (item: any) => item.totalBomMembers !== undefined ? String(item.totalBomMembers) : null,
    },
    [FIELD_NAMES.FINANCIAL_POSITION]: {
        extractor: (item: any) => item.financialPositionLakh !== undefined ? `Rs. ${item.financialPositionLakh} Lakh` : null,
    },
    [FIELD_NAMES.NO_OF_BLOCKS_ALLOCATED]: {
        extractor: (item: any) => item.blocksAllocated !== undefined ? String(item.blocksAllocated) : null,
    },
    [FIELD_NAMES.NO_OF_FPOS_REGISTERED_AS_CBBO]: {
        extractor: (item: any) => item.fposRegisteredAsCbbo !== undefined ? String(item.fposRegisteredAsCbbo) : null,
    },
    [FIELD_NAMES.AVERAGE_MEMBERS_PER_FPO]: {
        extractor: (item: any) => item.avgMembersPerFpo !== undefined ? String(item.avgMembersPerFpo) : null,
    },
    [FIELD_NAMES.AREA_HA]: {
        extractor: (item: any) => {
            if (item.areaCoveredHa !== undefined) return String(item.areaCoveredHa);
            if (item.areaInHa !== undefined) return String(item.areaInHa);
            if (item.area !== undefined) return String(item.area);
            if (item.areaInAcre) return `${item.areaInAcre} acre`;
            return null;
        },
    },
    [FIELD_NAMES.AREA_IN_ACRE]: {
        extractor: (item: any) => {
            if (item.areaInAcre) return `${item.areaInAcre} acre`;
            return null;
        },
    },
    [FIELD_NAMES.FARMERS_INFLUENCED]: {
        extractor: (item: any) => item.farmersPurchased !== undefined ? String(item.farmersPurchased) : null,
    },
    [FIELD_NAMES.RF_MM_DISTRICT_NORMAL]: {
        extractor: (item: any) => item.rfNormal !== undefined ? String(item.rfNormal) : null,
    },
    [FIELD_NAMES.RF_MM_DISTRICT_RECEIVED]: {
        extractor: (item: any) => item.rfReceived !== undefined ? String(item.rfReceived) : null,
    },
    [FIELD_NAMES.MAX_TEMPERATURE]: {
        extractor: (item: any) => item.tempMax !== undefined ? String(item.tempMax) : null,
    },
    [FIELD_NAMES.MIN_TEMPERATURE]: {
        extractor: (item: any) => item.tempMin !== undefined ? String(item.tempMin) : null,
    },
    [FIELD_NAMES.NO_OF_TRAINING]: {
        extractor: (item: any) => {
            if (item.noOfTrainings !== undefined && item.noOfTrainings !== null) return String(item.noOfTrainings);
            if (item.noOfTraining !== undefined && item.noOfTraining !== null) return String(item.noOfTraining);
            return null;
        },
    },
    [FIELD_NAMES.TECHNOLOGY_DEMONSTRATED]: {
        extractor: (item: any) => {
            if (item.technologyDemonstrated) return item.technologyDemonstrated;
            if (item.interventions) return item.interventions;
            return null;
        },
        priority: 5,
    },
    [FIELD_NAMES.DISTRICT_YIELD]: {
        extractor: (item: any) => item.districtYield !== undefined && item.districtYield !== null ? String(item.districtYield) : null,
        priority: 5,
    },
    [FIELD_NAMES.STATE_YIELD]: {
        extractor: (item: any) => item.stateYield !== undefined && item.stateYield !== null ? String(item.stateYield) : null,
        priority: 5,
    },
    [FIELD_NAMES.POTENTIAL_YIELD]: {
        extractor: (item: any) => item.potentialYield !== undefined && item.potentialYield !== null ? String(item.potentialYield) : null,
        priority: 5,
    },
    [FIELD_NAMES.NAME_OF_THE_DISEASE]: {
        extractor: (item: any) => item.nameOfTheDisease || item.diseaseName || null,
    },
    [FIELD_NAMES.DATE_OF_OUTBREAK]: {
        extractor: (item: any) => {
            if (!item.dateOfOutbreak) return null;
            try {
                const date = new Date(item.dateOfOutbreak);
                return date.toLocaleDateString('en-GB');
            } catch { return null; }
        },
    },
    [FIELD_NAMES.PERCENT_COMMODITY_LOSS]: {
        extractor: (item: any) => {
            const val = item.percentCommodityLoss || item.commodityLossPercent;
            return val !== undefined && val !== null ? `${val}%` : null;
        },
    },
    [FIELD_NAMES.SPECIES_AFFECTED]: {
        extractor: (item: any) => item.speciesAffected || item.livestockType || null,
    },
    [FIELD_NAMES.NUMBER_OF_DEATH]: {
        extractor: (item: any) => {
            const val = item.numberOfDeath || item.mortalityCount;
            return val !== undefined && val !== null ? String(val) : null;
        },
    },
    [FIELD_NAMES.MORBIDITY_RATE]: {
        extractor: (item: any) => {
            const val = item.morbidityRate || item.mortalityCount;
            return val !== undefined && val !== null ? `${val}%` : null;
        },
    },
    [FIELD_NAMES.NUMBER_OF_ANIMALS_VACCINATED]: {
        extractor: (item: any) => {
            const val = item.numberOfAnimalsVaccinated || item.animalsTreated;
            return val !== undefined && val !== null ? String(val) : null;
        },
    },
    [FIELD_NAMES.PREVENTIVE_MEASURES_TAKEN]: {
        extractor: (item: any) => {
            const val = item.preventiveMeasuresTaken || item.preventiveMeasuresArea || item.preventiveMeasures;
            if (typeof val === 'number') return `${val} ha`;
            return val || null;
        },
    },
    // NYK Training fields
    [FIELD_NAMES.TITLE_OF_THE_TRAINING_PROGRAMME]: {
        extractor: (item: any) => item.titleOfTheTrainingProgramme || item.title || null,
    },
    [FIELD_NAMES.MALE]: {
        extractor: (item: any) => {
            // Sum of all male participants for NYK training
            const total = (item.generalM || 0) + (item.obcM || 0) + (item.scM || 0) + (item.stM || 0);
            if (total > 0) return String(total);
            if (item.male !== undefined && item.male !== null) return String(item.male);
            return null;
        },
    },
    [FIELD_NAMES.FEMALE]: {
        extractor: (item: any) => {
            // Sum of all female participants for NYK training
            const total = (item.generalF || 0) + (item.obcF || 0) + (item.scF || 0) + (item.stF || 0);
            if (total > 0) return String(total);
            if (item.female !== undefined && item.female !== null) return String(item.female);
            return null;
        },
    },
    [FIELD_NAMES.AMOUNT_OF_FUND_RECEIVED]: {
        extractor: (item: any) => {
            const val = item.amountOfFundReceived ?? item.fundReceived;
            return val !== undefined && val !== null ? `₹${Number(val).toLocaleString('en-IN')}` : null;
        },
    },

    // VIP Visitors fields
    [FIELD_NAMES.DATE_OF_VISIT]: {
        extractor: (item: any) => {
            const dateVal = item.dateOfVisit || item.date_of_visit;
            if (!dateVal) return null;
            try {
                const date = new Date(dateVal);
                if (isNaN(date.getTime())) return null;
                return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
            } catch { return null; }
        },
        priority: 7,
    },
    [FIELD_NAMES.TYPE_OF_DIGNITARIES]: {
        extractor: (item: any) => {
            // Backend returns dignitaryType as a relation object { name: '...' }
            if (item.dignitaryType && typeof item.dignitaryType === 'object' && item.dignitaryType.name) {
                return item.dignitaryType.name;
            }
            // Fallback for string form data
            if (typeof item.dignitaryType === 'string') return item.dignitaryType;
            if (item.typeOfDignitaries) return item.typeOfDignitaries;
            return null;
        },
        priority: 6,
    },
    [FIELD_NAMES.NAME_OF_HONBLE_MINISTER]: {
        extractor: (item: any) => item.ministerName || item.nameOfHonbleMinister || null,
        priority: 6,
    },
    [FIELD_NAMES.SALIENT_POINTS]: {
        extractor: (item: any) => item.salientPoints || item.observations || null,
        priority: 6,
    },

    // Swachhta Bharat Abhiyaan fields
    [FIELD_NAMES.DATE_DURATION_OF_OBSERVATION]: {
        extractor: (item: any) => {
            const dateVal = item.observationDate || item.dateDurationOfObservation;
            if (!dateVal) return null;
            try {
                const date = new Date(dateVal);
                if (isNaN(date.getTime())) return null;
                return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
            } catch { return null; }
        },
        priority: 7,
    },
    [FIELD_NAMES.TOTAL_NO_OF_ACTIVITIES_UNDERTAKEN]: {
        extractor: (item: any) => String(item.totalActivities ?? item.totalNoOfActivitiesUndertaken ?? 0),
        priority: 6,
    },
    [FIELD_NAMES.NO_OF_STAFFS]: {
        extractor: (item: any) => String(item.staffCount ?? item.noOfStaffs ?? 0),
        priority: 6,
    },
    [FIELD_NAMES.NO_OF_FARMERS]: {
        extractor: (item: any) => {
            // Calculate from farmer category counts if available
            const sum = (Number(item.generalM || 0)) + (Number(item.generalF || 0)) +
                (Number(item.obcM || 0)) + (Number(item.obcF || 0)) +
                (Number(item.scM || 0)) + (Number(item.scF || 0)) +
                (Number(item.stM || 0)) + (Number(item.stF || 0));
            if (sum > 0) return String(sum);
            // Fallback to direct field
            return String(item.farmerCount ?? item.noOfFarmers ?? item.numberOfFarmers ?? 0);
        },
        priority: 6,
    },
    [FIELD_NAMES.NUMBER_OF_FARMERS]: {
        extractor: (item: any) => {
            // Prioritize the calculated field from backend if available
            if (item.numberOfFarmers !== undefined && item.numberOfFarmers !== null) {
                return String(item.numberOfFarmers);
            }
            // Calculate from farmer category counts if available
            const sum = (Number(item.generalM || 0)) + (Number(item.generalF || 0)) +
                (Number(item.obcM || 0)) + (Number(item.obcF || 0)) +
                (Number(item.scM || 0)) + (Number(item.scF || 0)) +
                (Number(item.stM || 0)) + (Number(item.stF || 0));
            if (sum > 0) return String(sum);
            // Fallback to other field names
            return String(item.farmerCount ?? item.noOfFarmers ?? 0);
        },
        priority: 6,
    },
    [FIELD_NAMES.NUMBER_OF_FARMERS_UNDER_EXPOSURE]: {
        extractor: (item: any) => {
            // Prefer explicit backend field if present
            if (item.numberOfFarmersUnderExposure !== undefined && item.numberOfFarmersUnderExposure !== null) {
                return String(item.numberOfFarmersUnderExposure);
            }
            // Otherwise calculate from category counts (same as NUMBER_OF_FARMERS)
            const sum = (Number(item.generalM || 0)) + (Number(item.generalF || 0)) +
                (Number(item.obcM || 0)) + (Number(item.obcF || 0)) +
                (Number(item.scM || 0)) + (Number(item.scF || 0)) +
                (Number(item.stM || 0)) + (Number(item.stF || 0));
            if (sum > 0) return String(sum);
            return String(item.farmerCount ?? item.noOfFarmers ?? 0);
        },
        priority: 6,
    },
    [FIELD_NAMES.NO_OF_OTHERS]: {
        extractor: (item: any) => String(item.othersCount ?? item.noOfOthers ?? 0),
        priority: 6,
    },

    // Meeting fields
    [FIELD_NAMES.NO_OF_PARTICIPANTS_PERF]: {
        extractor: (item: any) => String(item.numberOfParticipants ?? item.noOfParticipants ?? 0),
        priority: 6,
    },
    [FIELD_NAMES.TOTAL_STATUTORY_MEMBERS_PRESENT]: {
        extractor: (item: any) => String(item.statutoryMembersPresent ?? item.totalStatutoryMembersPresent ?? 0),
        priority: 6,
    },
    [FIELD_NAMES.SALIENT_RECOMMENDATIONS]: {
        extractor: (item: any) => item.salientRecommendations || null,
        priority: 6,
    },
    [FIELD_NAMES.TYPE_OF_MEETING]: {
        extractor: (item: any) => item.typeOfMeeting || null,
        priority: 6,
    },
    [FIELD_NAMES.REPRESENTATIVE_FROM_ATARI]: {
        extractor: (item: any) => item.representativeFromAtari || null,
        priority: 6,
    },
    [FIELD_NAMES.ACTION_TAKEN]: {
        extractor: (item: any) => item.actionTaken || null,
        priority: 6,
    },
    [FIELD_NAMES.REASON]: {
        extractor: (item: any) => item.reason || null,
        priority: 6,
    },
    [FIELD_NAMES.FILE]: {
        extractor: (item: any) => item.uploadedFile || item.file || null,
        priority: 6,
    },
    [FIELD_NAMES.VERMICOMPOSTING_NO_OF_VILLAGE_COVERED]: {
        extractor: (item: any) => String(item.vermiVillageCovered ?? item.vermicompostingNoOfVillageCovered ?? 0),
        priority: 6,
    },
    [FIELD_NAMES.VERMICOMPOSTING_TOTAL_EXPENDITURE]: {
        extractor: (item: any) => {
            const val = item.vermiTotalExpenditure ?? item.vermicompostingTotalExpenditure;
            return val !== undefined && val !== null ? String(val) : '0';
        },
        priority: 6,
    },
    [FIELD_NAMES.OTHER_NO_OF_VILLAGE_COVERED]: {
        extractor: (item: any) => String(item.otherVillageCovered ?? item.otherNoOfVillageCovered ?? 0),
        priority: 6,
    },
    [FIELD_NAMES.OTHER_TOTAL_EXPENDITURE]: {
        extractor: (item: any) => {
            const val = item.otherTotalExpenditure ?? item.otherTotalExpenditure;
            return val !== undefined && val !== null ? String(val) : '0';
        },
        priority: 6,
    },

    // Performance Impact - KVK Activities
    [FIELD_NAMES.NAME_OF_SPECIFIC_AREA]: {
        extractor: (item: any) => item.specificArea || null,
        priority: 6,
    },
    [FIELD_NAMES.BRIEF_DETAILS_OF_THE_AREA]: {
        extractor: (item: any) => item.briefDetails || null,
        priority: 6,
    },
    [FIELD_NAMES.NO_OF_FARMERS_BENEFITTED]: {
        extractor: (item: any) => item.farmersBenefitted !== undefined ? String(item.farmersBenefitted) : null,
        priority: 6,
    },
    [FIELD_NAMES.HORIZONTAL_SPREAD]: {
        extractor: (item: any) => item.horizontalSpread || null,
        priority: 6,
    },
    [FIELD_NAMES.PERCENT_OF_ADOPTION]: {
        extractor: (item: any) => item.adoptionPercentage !== undefined ? `${item.adoptionPercentage}%` : null,
        priority: 6,
    },

    // Performance Impact - Entrepreneurship
    [FIELD_NAMES.NAME_OF_THE_ENTREPRENEUR]: {
        extractor: (item: any) => item.entrepreneurName || null,
        priority: 6,
    },
    [FIELD_NAMES.NAME_OF_THE_ENTERPRISE]: {
        extractor: (item: any) => item.entrepreneurName || null,
        priority: 6,
    },
    [FIELD_NAMES.TYPE_OF_ENTERPRISE]: {
        extractor: (item: any) => item.enterpriseType || null,
        priority: 6,
    },
    [FIELD_NAMES.NO_OF_MEMBERS_ASSOCIATED]: {
        extractor: (item: any) => item.membersAssociated !== undefined ? String(item.membersAssociated) : null,
        priority: 6,
    },
    [FIELD_NAMES.REVENUE_OF_THE_ENTERPRISE]: {
        extractor: (item: any) => item.annualIncome !== undefined ? `₹${item.annualIncome.toLocaleString('en-IN')}` : null,
        priority: 6,
    },

    // Performance Impact - Success Stories
    [FIELD_NAMES.FARMING_EXPERIENCE]: {
        extractor: (item: any) => item.experience || null,
        priority: 6,
    },
    [FIELD_NAMES.EXPERIENCE_IN_ENTERPRISE]: {
        extractor: (item: any) => item.experience || null,
        priority: 6,
    },
    [FIELD_NAMES.TITLE_OF_THE_SUCCESS_STORY]: {
        extractor: (item: any) => item.storyTitle || null,
        priority: 6,
    },

    // Performance Infrastructure - Demonstration Units
    [FIELD_NAMES.NAME_OF_DEMO_UNIT]: {
        extractor: (item: any) => item.demoUnitName || null,
        priority: 6,
    },
    [FIELD_NAMES.YEAR_OF_ESTT]: {
        extractor: (item: any) => item.yearOfEstablishment || null,
        priority: 6,
    },
    [FIELD_NAMES.AREA_SQ_MT]: {
        extractor: (item: any) => item.area !== undefined && item.area !== null ? `${item.area} sq mt` : null,
        priority: 6,
    },
    [FIELD_NAMES.VARIETY_BREED]: {
        extractor: (item: any) => item.varietyBreed || null,
        priority: 6,
    },
    [FIELD_NAMES.PRODUCE]: {
        extractor: (item: any) => item.produce || null,
        priority: 6,
    },
    [FIELD_NAMES.COST_OF_INPUTS]: {
        extractor: (item: any) => item.costOfInputs !== undefined && item.costOfInputs !== null ? `₹${item.costOfInputs.toLocaleString('en-IN')}` : null,
        priority: 6,
    },
    [FIELD_NAMES.GROSS_INCOME]: {
        extractor: (item: any) => item.grossIncome !== undefined && item.grossIncome !== null ? `₹${item.grossIncome.toLocaleString('en-IN')}` : null,
        priority: 6,
    },

    // Performance Infrastructure - Production Units

    [FIELD_NAMES.QTY_KG]: {
        extractor: (item: any) => item.quantity !== undefined && item.quantity !== null ? `${item.quantity} kg` : null,
        priority: 6,
    },

    // Performance Infrastructure - Instructional Farm Livestock
    [FIELD_NAMES.NAME_OF_THE_ANIMAL]: {
        extractor: (item: any) => item.animalName || null,
        priority: 6,
    },
    [FIELD_NAMES.SPECIES_BREED_VARIETY]: {
        extractor: (item: any) => item.speciesBreed || null,
        priority: 6,
    },
    [FIELD_NAMES.TYPE_OF_PRODUCE]: {
        extractor: (item: any) => item.typeOfProduce || null,
        priority: 6,
    },

    // Performance Infrastructure - Hostel
    [FIELD_NAMES.REASON_FOR_SHORT_FALL]: {
        extractor: (item: any) => item.reasonForShortFall || null,
        priority: 6,
    },
    [FIELD_NAMES.MONTHS]: {
        extractor: (item: any) => item.months || null,
        priority: 6,
    },
    [FIELD_NAMES.NO_OF_TRAINEES_STAYED]: {
        extractor: (item: any) => item.traineesStayed !== undefined && item.traineesStayed !== null ? String(item.traineesStayed) : null,
        priority: 6,
    },
    [FIELD_NAMES.TRAINEE_DAYS]: {
        extractor: (item: any) => item.traineeDays !== undefined && item.traineeDays !== null ? String(item.traineeDays) : null,
        priority: 6,
    },

    // Performance Infrastructure - Staff Quarters
    [FIELD_NAMES.DATE_OF_COMPLETION]: {
        extractor: (item: any) => item.dateOfCompletion ? new Date(item.dateOfCompletion).toLocaleDateString('en-IN') : null,
        priority: 6,
    },
    [FIELD_NAMES.WHETHER_STAFF_QUARTERS_COMPLETED]: {
        extractor: (item: any) => item.isCompleted || null,
        priority: 6,
    },
    [FIELD_NAMES.NO_OF_STAFF_QUARTERS]: {
        extractor: (item: any) => item.numberOfQuarters !== undefined && item.numberOfQuarters !== null ? String(item.numberOfQuarters) : null,
        priority: 6,
    },
    [FIELD_NAMES.OCCUPANCY_DETAILS]: {
        extractor: (item: any) => item.occupancyDetails || null,
        priority: 6,
    },

    // Performance Infrastructure - Rainwater Harvesting
    [FIELD_NAMES.NO_OF_TRAINING_PROGRAMME_CONDUCTED]: {
        extractor: (item: any) => {
            if (item.trainingProgrammes !== undefined && item.trainingProgrammes !== null) {
                return String(item.trainingProgrammes);
            }
            if (item.noOfTrainingProgrammeConducted !== undefined && item.noOfTrainingProgrammeConducted !== null) {
                return String(item.noOfTrainingProgrammeConducted);
            }
            if (item.noOfTrainings) {
                return String(item.noOfTrainings);
            }
            if (item.noOfTraining !== undefined && item.noOfTraining !== null) {
                return String(item.noOfTraining);
            }
            return null;
        },
        priority: 6,
    },
    [FIELD_NAMES.NO_OF_DEMONSTRATIONS]: {
        extractor: (item: any) => item.demonstrations !== undefined && item.demonstrations !== null ? String(item.demonstrations) : null,
        priority: 6,
    },
    [FIELD_NAMES.NO_OF_PLANT_MATERIAL_PRODUCED]: {
        extractor: (item: any) => item.plantMaterial !== undefined && item.plantMaterial !== null ? String(item.plantMaterial) : null,
        priority: 6,
    },
    [FIELD_NAMES.VISIT_BY_THE_FARMERS]: {
        extractor: (item: any) => item.farmerVisits !== undefined && item.farmerVisits !== null ? String(item.farmerVisits) : null,
        priority: 6,
    },
    [FIELD_NAMES.VISIT_BY_THE_OFFICIALS]: {
        extractor: (item: any) => item.officialVisits !== undefined && item.officialVisits !== null ? String(item.officialVisits) : null,
        priority: 6,
    },
    // Performance - Linkages
    [FIELD_NAMES.NAME_OF_ORGANIZATION]: {
        extractor: (item: any) => item.organizationName || null,
        priority: 6,
    },
    [FIELD_NAMES.NATURE_OF_LINKAGE]: {
        extractor: (item: any) => item.natureOfLinkage || null,
        priority: 6,
    },
    [FIELD_NAMES.PROGRAMME_TYPE]: {
        extractor: (item: any) => item.programmeType || null,
        priority: 6,
    },
    [FIELD_NAMES.NAME_OF_THE_PROGRAMME_SCHEME]: {
        extractor: (item: any) => item.programmeName || null,
        priority: 6,
    },
    [FIELD_NAMES.DATE_MONTH_OF_INITIATION]: {
        extractor: (item: any) => {
            const dateVal = item.initiationDate || item.dateMonthOfInitiation;
            if (!dateVal) return null;
            try {
                const date = new Date(dateVal);
                if (isNaN(date.getTime())) return null;
                return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
            } catch { return null; }
        },
        priority: 6,
    },
    // Performance - District & Village
    [FIELD_NAMES.TALUK]: {
        extractor: (item: any) => item.taluk || null,

        priority: 6,
    },
    [FIELD_NAMES.BLOCK]: {
        extractor: (item: any) => item.block || null,
        priority: 6,
    },
    [FIELD_NAMES.MAJOR_CROPS]: {
        extractor: (item: any) => item.majorCrops || null,
        priority: 6,
    },
    [FIELD_NAMES.MAJOR_PROBLEMS_IDENTIFIED]: {
        extractor: (item: any) => item.majorProblems || item.majorProblemsIdentified || null,
        priority: 6,
    },
    [FIELD_NAMES.IDENTIFIED_THRUST_AREAS]: {
        extractor: (item: any) => item.thrustAreas || item.identifiedThrustAreas || null,
        priority: 6,
    },
    [FIELD_NAMES.ACTION_TAKEN_FOR_DEVELOPMENT]: {
        extractor: (item: any) => item.actionTaken || item.actionTakenForDevelopment || null,
        priority: 6,
    },
    [FIELD_NAMES.THRUST_AREA]: {
        extractor: (item: any) => item.thrustArea || null,
        priority: 6,
    },
    // Performance - Financial
    [FIELD_NAMES.SALARY_ALLOCATION]: {
        extractor: (item: any) => item.salaryAllocation ?? null,
        priority: 6,
    },
    [FIELD_NAMES.SALARY_EXPENDITURE]: {
        extractor: (item: any) => item.salaryExpenditure ?? null,
        priority: 6,
    },
    [FIELD_NAMES.GENERAL_MAIN_GRANT_ALLOCATION]: {
        extractor: (item: any) => item.generalMainGrantAllocation ?? null,
        priority: 6,
    },
    [FIELD_NAMES.GENERAL_MAIN_GRANT_EXPENDITURE]: {
        extractor: (item: any) => item.generalMainGrantExpenditure ?? null,
        priority: 6,
    },
    [FIELD_NAMES.CAPITAL_MAIN_GRANT_ALLOCATION]: {
        extractor: (item: any) => item.capitalMainGrantAllocation ?? null,
        priority: 6,
    },
    [FIELD_NAMES.CAPITAL_MAIN_GRANT_EXPENDITURE]: {
        extractor: (item: any) => item.capitalMainGrantExpenditure ?? null,
        priority: 6,
    },
    [FIELD_NAMES.OPENING_BALANCE]: {
        extractor: (item: any) => item.openingBalance ?? null,
        priority: 6,
    },
    [FIELD_NAMES.INCOME_DURING_THE_YEAR]: {
        extractor: (item: any) => item.incomeDuringYear ?? item.incomeDuringTheYear ?? null,
        priority: 6,
    },
    [FIELD_NAMES.EXPENDITURE_DURING_THE_YEAR]: {
        extractor: (item: any) => item.expenditureDuringYear ?? item.expenditureDuringTheYear ?? null,
        priority: 6,
    },
    [FIELD_NAMES.CLOSING]: {
        extractor: (item: any) => {
            if (item.closing !== undefined && item.closing !== null) return item.closing;
            const opening = parseFloat(item.openingBalance || 0);
            const income = parseFloat(item.incomeDuringYear || item.incomeDuringTheYear || 0);
            const expenditure = parseFloat(item.expenditureDuringYear || item.expenditureDuringTheYear || 0);
            return (opening + income - expenditure).toFixed(2);
        },
        priority: 6,
    },
    [FIELD_NAMES.KIND]: {
        extractor: (item: any) => item.kind || null,
        priority: 6,
    },
    [FIELD_NAMES.NAME_OF_HEAD]: {
        extractor: (item: any) => item.headName || item.nameOfHead || null,
        priority: 6,
    },
    [FIELD_NAMES.INCOME_RS]: {
        extractor: (item: any) => (item.income ?? item.incomeRs) || null,
        priority: 6,
    },
    [FIELD_NAMES.SPONSORING_AGENCY]: {
        extractor: (item: any) => item.sponsoringAgency || null,
        priority: 6,
    },
    [FIELD_NAMES.NAME_OF_THE_PROGRAMME_PERF]: {
        extractor: (item: any) => item.programmeName || item.nameOfTheProgrammePerf || null,
        priority: 6,
    },
    [FIELD_NAMES.PURPOSE_OF_THE_PROGRAMME]: {
        extractor: (item: any) => item.programmePurpose || item.purposeOfTheProgramme || null,
        priority: 6,
    },
    [FIELD_NAMES.SOURCES_OF_FUND]: {
        extractor: (item: any) => item.sourcesOfFund || null,
        priority: 6,
    },
    [FIELD_NAMES.AMOUNT_RS_LAKHS]: {
        extractor: (item: any) => (item.amount ?? item.amountRsLakhs) || null,
        priority: 6,
    },
    [FIELD_NAMES.INFRASTRUCTURE_CREATED]: {
        extractor: (item: any) => item.infrastructureCreated || null,
        priority: 6,
    },

    // ARYA Fields

    [FIELD_NAMES.VIABLE_UNITS]: {
        extractor: (item: any) => item.viableUnits !== undefined && item.viableUnits !== null ? String(item.viableUnits) : null,
        priority: 6,
    },
    [FIELD_NAMES.CLOSED_UNITS]: {
        extractor: (item: any) => item.closedUnits !== undefined && item.closedUnits !== null ? String(item.closedUnits) : null,
        priority: 6,
    },
    [FIELD_NAMES.NO_OF_GROUPS_FORMED]: {
        extractor: (item: any) => item.groupsFormed !== undefined && item.groupsFormed !== null ? String(item.groupsFormed) : null,
        priority: 6,
    },
    [FIELD_NAMES.NO_OF_GROUPS_ACTIVE]: {
        extractor: (item: any) => item.groupsActive !== undefined && item.groupsActive !== null ? String(item.groupsActive) : null,
        priority: 6,
    },
    [FIELD_NAMES.TOTAL_CLOSED]: {
        extractor: (item: any) => item.nonFunctionalUnitsClosed !== undefined && item.nonFunctionalUnitsClosed !== null ? String(item.nonFunctionalUnitsClosed) : null,
        priority: 6,
    },
    [FIELD_NAMES.TOTAL_RESTARTED]: {
        extractor: (item: any) => item.nonFunctionalUnitsRestarted !== undefined && item.nonFunctionalUnitsRestarted !== null ? String(item.nonFunctionalUnitsRestarted) : null,
        priority: 6,
    },

    // CSISA Fields
    [FIELD_NAMES.VILLAGE_COVERED_NO]: {
        extractor: (item: any) => {
            const val = item.villagesCovered ?? item.villageCoveredNo ?? item.villageCovered ?? item['Village Covered(no.)'];
            return val !== undefined && val !== null ? String(val) : null;
        },
        priority: 6,
    },
    [FIELD_NAMES.BLOCK_COVERED_NO]: {
        extractor: (item: any) => {
            const val = item.blocksCovered ?? item.blockCoveredNo ?? item.blockCovered ?? item['Block Covered(no.)'];
            return val !== undefined && val !== null ? String(val) : null;
        },
        priority: 6,
    },
    [FIELD_NAMES.DISTRICT_COVERED_NO]: {
        extractor: (item: any) => {
            const val = item.districtsCovered ?? item.districtCoveredNo ?? item.districtCovered ?? item['District Covered(no.)'];
            return val !== undefined && val !== null ? String(val) : null;
        },
        priority: 6,
    },

    // Date Fields for ARYA Prev Year
    [FIELD_NAMES.CLOSING_DATE]: {
        extractor: (item: any) => {
            const dateVal = item.closingDate || item.dateOfClosing || item['Closing Date'];
            if (!dateVal) return null;
            try {
                const date = new Date(dateVal);
                if (isNaN(date.getTime())) return null;
                return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
            } catch { return null; }
        },
        priority: 6,
    },
    [FIELD_NAMES.RESTARTED_DATE]: {
        extractor: (item: any) => {
            const dateVal = item.restartDate || item.dateOfRestart || item['Restarted Date'];
            if (!dateVal) return null;
            try {
                const date = new Date(dateVal);
                if (isNaN(date.getTime())) return null;
                return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
            } catch { return null; }
        },
        priority: 6,
    },

    // Agri-Drone Fields (using camelCase only - table labels removed from backend)
    [FIELD_NAMES.PROJECT_IMPLEMENTING_CENTRE_NAME]: {
        extractor: (item: any) => item.projectImplementingCentre || null,
        priority: 5,
    },
    [FIELD_NAMES.COMPANY_OF_DRONE]: {
        extractor: (item: any) => item.droneCompany || null,
        priority: 5,
    },
    [FIELD_NAMES.MODEL_OF_DRONE]: {
        extractor: (item: any) => item.droneModel || null,
        priority: 5,
    },
    [FIELD_NAMES.NO_OF_AGRI_DRONES_SANCTIONED]: {
        extractor: (item: any) => item.dronesSanctioned !== undefined ? String(item.dronesSanctioned) : null,
        priority: 5,
    },
    [FIELD_NAMES.NO_OF_AGRI_DRONES_PURCHASED]: {
        extractor: (item: any) => item.dronesPurchased !== undefined ? String(item.dronesPurchased) : null,
        priority: 5,
    },
    [FIELD_NAMES.COST_SANCTIONED]: {
        extractor: (item: any) => {
            const val = item.amountSanctioned;
            return val !== undefined && val !== null ? `₹${val.toLocaleString('en-IN')}` : null;
        },
        priority: 5,
    },
    [FIELD_NAMES.PLACE_OF_DEMONS]: {
        extractor: (item: any) => item.placeOfDemons || item.placeOfDemonstration || item['Place of Demonstration'] || null,
        priority: 5,
    },
    [FIELD_NAMES.DATE_OF_DEMONS]: {
        extractor: (item: any) => {
            const dateVal = item.dateOfDemons || item.dateOfDemonstration || item['Date of Demonstration'];
            if (!dateVal) return null;
            try {
                const date = new Date(dateVal);
                if (isNaN(date.getTime())) return null;
                return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
            } catch { return null; }
        },
        priority: 10,
    },
    [FIELD_NAMES.DEMONSTRATIONS_ON]: {
        extractor: (item: any) =>
            item.demonstrationsOnName ||
            item.demonstrationsOn ||
            item.demonstrationsOnMaster?.demonstrationsOnName ||
            item.demonstrationsOnMaster?.name ||
            null,
        priority: 5,
    },
    [FIELD_NAMES.NO_OF_DEMOS]: {
        extractor: (item: any) => {
            const val = item.noOfDemos ?? item.demoCount ?? item['No. of demos'] ?? item['No. of Demos'];
            return val !== undefined && val !== null && val !== '' ? String(val) : null;
        },
        priority: 5,
    },
    [FIELD_NAMES.AREA_COVERED_UNDER_DEMOS]: {
        extractor: (item: any) => {
            const val = item.areaCoveredUnderDemos ?? item.areaHa ?? item.area ?? item['Area covered under demos'] ?? item['Area covered under demos.'];
            if (val === undefined || val === null || val === '') return null;
            const num = Number(val);
            return Number.isFinite(num) ? `${num} ha` : String(val);
        },
        priority: 5,
    },
    [FIELD_NAMES.DEMO_AMOUNT_SANCTIONED]: {
        extractor: (item: any) => {
            const val = item.demoAmountSanctioned;
            return val !== undefined && val !== null ? `₹${val.toLocaleString('en-IN')}` : null;
        },
        priority: 5,
    },
    [FIELD_NAMES.DEMO_AMOUNT_UTILISED]: {
        extractor: (item: any) => {
            const val = item.demoAmountUtilised;
            return val !== undefined && val !== null ? `₹${val.toLocaleString('en-IN')}` : null;
        },
        priority: 5,
    },
    [FIELD_NAMES.PILOT_NAME]: {
        extractor: (item: any) => item.pilotName || null,
        priority: 5,
    },
    [FIELD_NAMES.PILOT_CONTACT]: {
        extractor: (item: any) => item.pilotContact || null,
        priority: 5,
    },
    [FIELD_NAMES.TARGET_AREA_HA]: {
        extractor: (item: any) => {
            if (item.targetAreaHa) return `${item.targetAreaHa} ha`;
            if (item.targetArea) return `${item.targetArea} ha`;
            if (item.areaInAcre) return `${item.areaInAcre} acre`;
            return null;
        },
        priority: 5,
    },
    [FIELD_NAMES.OPERATION_TYPE]: {
        extractor: (item: any) => item.operationType || null,
        priority: 5,
    },
    [FIELD_NAMES.ADVANTAGES_OBSERVED]: {
        extractor: (item: any) => item.advantagesObserved || null,
        priority: 5,
    },
    // Other Programmes
    [FIELD_NAMES.NAME_OF_THE_PROGRAMME]: {
        extractor: (item: any) => item.programmeName || null,
        priority: 5,
    },
    [FIELD_NAMES.DATE_OF_THE_PROGRAMME]: {
        extractor: (item: any) => {
            const dateVal = item.programmeDate;
            if (!dateVal) return null;
            try {
                const date = new Date(dateVal);
                if (isNaN(date.getTime())) return null;
                return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
            } catch { return null; }
        },
        priority: 5,
    },
    [FIELD_NAMES.FUNDING_AGENCY_NAME]: {
        extractor: (item: any) => {
            const masterName = item.fundingAgency?.agencyName || item.agencyName;
            const specifyName = item.specifyAgencyName;
            if (masterName === 'Others' && specifyName) {
                return specifyName;
            }
            return masterName || null;
        },
        priority: 5,
    },
    [FIELD_NAMES.FUNDING_AGENCY]: {
        extractor: (item: any) => {
            const masterName = item.fundingAgency?.agencyName || item.agencyName;
            const specifyName = item.specifyAgencyName;
            if (masterName === 'Others' && specifyName) {
                return specifyName;
            }
            return masterName || null;
        },
        priority: 5,
    },
    [FIELD_NAMES.SPECIFY_AGENCY_NAME]: {
        extractor: (item: any) => item.specifyAgencyName || null,
        priority: 5,
    },
    [FIELD_NAMES.BUDGET_ESTIMATE]: {
        extractor: (item: any) => {
            const val = item.budgetEstimate;
            return (val !== undefined && val !== null) ? `₹${Number(val).toLocaleString('en-IN')}` : null;
        },
        priority: 5,
    },
    [FIELD_NAMES.BUDGET_ALLOCATED]: {
        extractor: (item: any) => {
            const val = item.budgetAllocated;
            return (val !== undefined && val !== null) ? `₹${Number(val).toLocaleString('en-IN')}` : null;
        },
        priority: 5,
    },
    [FIELD_NAMES.BUDGET_RELEASED]: {
        extractor: (item: any) => {
            const val = item.budgetReleased;
            return (val !== undefined && val !== null) ? `₹${Number(val).toLocaleString('en-IN')}` : null;
        },
        priority: 5,
    },
    [FIELD_NAMES.EXPENDITURE]: {
        extractor: (item: any) => {
            const val = item.expenditure;
            return (val !== undefined && val !== null) ? `₹${Number(val).toLocaleString('en-IN')}` : null;
        },
        priority: 5,
    },
    [FIELD_NAMES.UNSPENT_BALANCE]: {
        extractor: (item: any) => {
            const val = item.unspentBalance;
            return (val !== undefined && val !== null) ? `₹${Number(val).toLocaleString('en-IN')}` : null;
        },
        priority: 5,
    },
    [FIELD_NAMES.COMPLETED_AT]: {
        extractor: (item: any) => {
            if (!item?.completedAt) return null;
            const date = new Date(item.completedAt);
            return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString('en-GB');
        },
        priority: 8,
    },
} as any;

// ============================================
// Main Field Value Getter
// ============================================

/**
 * Get field value from item using configuration-driven approach
 * Falls back to direct field access if no extractor is configured
 */
export function getFieldValueConfig(item: any, field: string): any {
    // Try configured extractor first
    const config = fieldExtractors[field];
    if (config) {
        const value = config.extractor(item);
        if (value !== null) return value;
    }

    // Direct field access (fallback)
    if (item[field] !== undefined && item[field] !== null) {
        return item[field];
    }

    // Default fallback
    return '-';
}
