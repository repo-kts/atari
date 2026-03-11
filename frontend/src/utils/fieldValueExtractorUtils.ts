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
            const dateVal = item.endDate || item.end_date;
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
        extractor: (item: any) => item.registrationNo || null,
        priority: 9,
    },
    'totalCost (Rs.)': {
        extractor: (item: any) => {
            if (item.totalCost === undefined || item.totalCost === null) return null;
            return `₹${item.totalCost.toLocaleString('en-IN')}`;
        },
        priority: 9,
    },
    'totalCost (Rs)': {
        extractor: (item: any) => {
            if (item.totalCost === undefined || item.totalCost === null) return null;
            return `₹${item.totalCost.toLocaleString('en-IN')}`;
        },
        priority: 9,
    },
    'totalRun (Kms)': {
        extractor: (item: any) => item.totalRun ? `${item.totalRun} Kms` : null,
        priority: 9,
    },
    // Vehicle/Equipment fields - using FIELD_NAMES constants
    [FIELD_NAMES.VEHICLE_NAME]: {
        extractor: (item: any) => item.vehicleName || null,
        priority: 8,
    },
    [FIELD_NAMES.EQUIPMENT_NAME]: {
        extractor: (item: any) => item.equipmentName || null,
        priority: 8,
    },
    [FIELD_NAMES.IMPLEMENT_NAME]: {
        extractor: (item: any) => item.implementName || null,
        priority: 8,
    },
    presentStatus: {
        extractor: (item: any) => {
            if (!item.presentStatus) return null;
            return item.presentStatus
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (char: string) => char.toUpperCase());
        },
        priority: 8,
    },

    // Nested hierarchy fields
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
    [FIELD_NAMES.ORGANIZATION_ORG_NAME]: {
        extractor: (item: any) => {
            if (item.org?.orgName) return item.org.orgName;
            if (item.organization?.orgName) return item.organization.orgName;
            if (item.organization?.uniName) return item.organization.uniName; // Legacy
            if (item.uniName) return item.uniName; // Legacy
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
        extractor: (item: any) => item.category?.categoryName || null,
        priority: 5,
    },
    [FIELD_NAMES.SUB_CATEGORY_NAME]: {
        extractor: (item: any) => item.subCategory?.subCategoryName || null,
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
        extractor: (item: any) => item.cropName || item.CropName || (typeof item.crop === 'string' ? item.crop : null) || null,
        priority: 5,
    },

    // Training fields
    [FIELD_NAMES.TRAINING_TYPE]: {
        extractor: (item: any) => {
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
    [FIELD_NAMES.TRAINING_AREA_NAME]: {
        extractor: (item: any) => {
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
            if (item['Trail on form']) return item['Trail on form']; // Note: typo in backend
            if (item['Trial On Form']) return item['Trial On Form'];
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
    // Display name fallbacks (for backward compatibility)
    'Name of Extension activities': {
        extractor: (item: any) => item.nameOfExtensionActivities || item['Name of Extension activities'] || item['Name of Extension Activities'] || item.activityName || item.extensionActivityType || item.extension_activity_type || (item.activity?.activityName) || item.activity_name || null,
        priority: 7,
    },
    'Name of Extension Activities': {
        extractor: (item: any) => item.nameOfExtensionActivities || item['Name of Extension Activities'] || item['Name of Extension activities'] || item.activityName || item.extensionActivityType || item.extension_activity_type || (item.activity?.activityName) || item.activity_name || null,
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
    [FIELD_NAMES.IMPORTANT_DAYS]: {
        extractor: (item: any) => item.importantDays || item['Important Days'] || item['Important days'] || (item.importantDay?.dayName) || item.importantDay || item.dayName || item.day_name || null,
        priority: 7,
    },
    // Display name fallbacks (for backward compatibility)
    'Important Days': {
        extractor: (item: any) => item.importantDays || item['Important Days'] || item['Important days'] || (item.importantDay?.dayName) || item.importantDay || item.dayName || item.day_name || null,
        priority: 7,
    },
    'Important days': {
        extractor: (item: any) => item.importantDays || item['Important days'] || item['Important Days'] || (item.importantDay?.dayName) || item.importantDay || item.dayName || item.day_name || null,
        priority: 7,
    },
    [FIELD_NAMES.NO_OF_ACTIVITIES]: {
        extractor: (item: any) => {
            const val = item.noOfActivities || item.numberOfActivities || item.activityCount || item.number_of_activities || item['No. of Activities'] || item['No. of activities'];
            return val !== undefined && val !== null ? String(val) : null;
        },
        priority: 5,
    },
    // Display name fallbacks (for backward compatibility)
    'No. of Activities': {
        extractor: (item: any) => {
            const val = item.noOfActivities || item.numberOfActivities || item.activityCount || item.number_of_activities || item['No. of Activities'] || item['No. of activities'];
            return val !== undefined && val !== null ? String(val) : null;
        },
        priority: 5,
    },
    'No. of activities': {
        extractor: (item: any) => {
            const val = item.noOfActivities || item.numberOfActivities || item.activityCount || item.number_of_activities || item['No. of activities'] || item['No. of Activities'];
            return val !== undefined && val !== null ? String(val) : null;
        },
        priority: 5,
    },
    [FIELD_NAMES.TYPE_OF_ACTIVITIES]: {
        extractor: (item: any) => item.typeOfActivities || item.activityType || item['Type Of Activities'] || item['Type of activities'] || null,
        priority: 5,
    },
    // Display name fallbacks (for backward compatibility)
    'Type Of Activities': {
        extractor: (item: any) => item.typeOfActivities || item.activityType || item['Type Of Activities'] || item['Type of activities'] || null,
        priority: 5,
    },
    'Type of activities': {
        extractor: (item: any) => item.typeOfActivities || item.activityType || item['Type of activities'] || item['Type Of Activities'] || null,
        priority: 5,
    },

    // Production & Projects fields
    productCategoryName: {
        extractor: (item: any) => {
            if (item.productCategoryName) return item.productCategoryName;
            if (item.productCategory?.productCategoryName) return item.productCategory.productCategoryName;
            return null;
        },
        priority: 5,
    },
    productCategoryType: {
        extractor: (item: any) => {
            if (item.productCategoryType) return item.productCategoryType;
            if (item.productType?.productCategoryType) return item.productType.productCategoryType;
            return null;
        },
        priority: 5,
    },
    productName: {
        extractor: (item: any) => item.productName || null,
        priority: 5,
    },
    farmingSystemName: {
        extractor: (item: any) => item.farmingSystemName || null,
        priority: 5,
    },
    enterpriseName: {
        extractor: (item: any) => item.enterpriseName || null,
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
    kvkName: {
        extractor: (item: any) => {
            if (item.kvk?.kvkName) return item.kvk.kvkName;
            if (item.kvkName) return item.kvkName;
            return null;
        },
        priority: 7,
    },

    // Employee/Staff specific fields
    position: {
        extractor: (item: any) => {
            if (item.positionOrder !== undefined && item.positionOrder !== null) {
                return String(item.positionOrder);
            }
            return null;
        },
        priority: 6,
    },
    positionOrder: {
        extractor: (item: any) => {
            if (item.positionOrder !== undefined && item.positionOrder !== null) {
                return String(item.positionOrder);
            }
            return null;
        },
        priority: 6,
    },
    postName: {
        extractor: (item: any) => {
            if (item.sanctionedPost?.postName) return item.sanctionedPost.postName;
            if (item.postName) return item.postName;
            if (item.sanctionedPost?.post_name) return item.sanctionedPost.post_name;
            if (item.post_name) return item.post_name;
            return null;
        },
        priority: 7,
    },
    allowances: {
        extractor: (item: any) => {
            if (item.allowances) return item.allowances;
            return null;
        },
        priority: 6,
    },
    detailsOfAllowences: {
        extractor: (item: any) => {
            if (item.allowances) return item.allowances;
            if (item.detailsOfAllowences) return item.detailsOfAllowences;
            return null;
        },
        priority: 6,
    },
    [FIELD_NAMES.CATEGORY]: {
        extractor: (item: any) => {
            if (item.productCategory) return item.productCategory.productCategoryName;
            if (item.staffCategory?.categoryName) return item.staffCategory.categoryName;
            // Fallback: Check direct field (if backend includes it separately)
            if (item.categoryName) return item.categoryName;
            // Legacy: Check old field name
            if (item.category) return item.category;
            return null;
        },
        priority: 7,
    },
    resume: {
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
    resumePath: {
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
    kvkNameBeforeTransfer: {
        extractor: (item: any) => {
            // Show original KVK name (where staff was first created)
            if (item.originalKvk?.kvkName) return item.originalKvk.kvkName;
            if (item.originalKvkId) return `KVK ${item.originalKvkId}`;
            if (item.kvk?.kvkName) return item.kvk.kvkName;
            return null;
        },
        priority: 7,
    },
    latestKvkName: {
        extractor: (item: any) => {
            // Show current/latest KVK name (where staff is now)
            if (item.kvk?.kvkName) return item.kvk.kvkName;
            if (item.kvkName) return item.kvkName;
            return null;
        },
        priority: 7,
    },

    // Infrastructure specific fields - using camelCase
    [FIELD_NAMES.INFRA_MASTER_NAME]: {
        extractor: (item: any) => {
            if (item.infraMaster?.name) return item.infraMaster.name;
            if (item.infraMasterName) return item.infraMasterName;
            return null;
        },
        priority: 7,
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
        extractor: (item: any) => item.type || item.typeName || null,
    },
    [FIELD_NAMES.SEASON]: {
        extractor: (item: any) => item.seasonName || (item.season?.seasonName) || null,
    },
    // Note: 'Crop' extractor is defined below using FIELD_NAMES.CROP constant
    [FIELD_NAMES.VARIETY]: {
        extractor: (item: any) => {
            if (item.varietyName) return item.variety;
            if (item.speciesName) return item.speciesName;
            return null
        }
    },
    'Name of Variety': {
        extractor: (item: any) => item.varietyName || null,
    },
    [FIELD_NAMES.AREA]: {
        extractor: (item: any) => item.areaHectare !== undefined ? String(item.areaHectare) : (item.areaInHa !== undefined ? String(item.areaInHa) : null),
    },
    'Area (in ha)': {
        extractor: (item: any) => item.areaHectare !== undefined ? String(item.areaHectare) : (item.areaInHa !== undefined ? String(item.areaInHa) : null),
    },
    'Demo Yield (Avg)': {
        extractor: (item: any) => item.yieldAvg !== undefined ? String(item.yieldAvg) : (item.demoYieldAvg !== undefined ? String(item.demoYieldAvg) : null),
    },
    [FIELD_NAMES.PERCENT_INCREASE]: {
        extractor: (item: any) => item.yieldIncreasePercent !== undefined ? `${item.yieldIncreasePercent}%` : (item.percentIncrease !== undefined ? `${item.percentIncrease}%` : null),
    },

    // ARYA fields - using camelCase
    [FIELD_NAMES.YEAR]: {
        extractor: (item: any) => {
            const val = item.reportingYear || item.year;
            if (val !== undefined && val !== null) return String(val);
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
    'Income Before': {
        extractor: (item: any) => item.incomeBefore !== undefined ? `Rs. ${item.incomeBefore}` : null,
    },
    'Income After': {
        extractor: (item: any) => item.incomeAfter !== undefined ? `Rs. ${item.incomeAfter}` : null,
    },
    '% Functional': {
        extractor: (item: any) => item.functionalPercentage !== undefined ? `${item.functionalPercentage}%` : null,
    },

    // CRA & NARI & FPO & NICRA fields - using camelCase
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
    // Activity fields - using camelCase
    'Activity Type': {
        extractor: (item: any) => item.activityType || null,
    },
    [FIELD_NAMES.ACTIVITY]: {
        extractor: (item: any) => item.activity || item.activityName || item['Activity'] || null,
    },
    Activities: {
        extractor: (item: any) => item.noOfActivities !== undefined ? String(item.noOfActivities) : null,
    },
    // FLD Extension Training Fields - using FIELD_NAMES constants (camelCase first, then fallback)
    [FIELD_NAMES.FLD_NAME]: {
        extractor: (item: any) => item.fldName || item['FLD Name'] || item.fld?.fldName || item['FLD'] || null,
    },
    // Name of Technology Demonstrated (for FLD base table display)
    [FIELD_NAMES.NAME_OF_TECHNOLOGY_DEMONSTRATED]: {
        extractor: (item: any) => {
            if (item.nameOfTechnologyDemonstrated) return item.nameOfTechnologyDemonstrated;
            if (item.fldName) return item.fldName;
            if (item.technologyName) return item.technologyName;
            if (item['Name of Technnology Demonstrated']) return item['Name of Technnology Demonstrated']; // Note: typo in backend
            if (item['Name Of Technology Demonstrated']) return item['Name Of Technology Demonstrated'];
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
            if (!item.startDate || !item.endDate) return null;
            try {
                const start = new Date(item.startDate);
                const end = new Date(item.endDate);
                if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return String(diffDays);
            } catch {
                return null;
            }
        },
        priority: 5,
    },
    [FIELD_NAMES.REGISTRATION_NO]: {
        extractor: (item: any) => item.registrationNo || (item.ppvFraPlantVarietiesID ? String(item.ppvFraPlantVarietiesID) : null),
    },
    [FIELD_NAMES.RELATED_CROP_LIVESTOCK_TECHNOLOGY]: {
        extractor: (item: any) => {
            // Check display name first (as it exists in the response)
            const value = item['Related Crop/Live Stock Technology'] || item['Related crop/livestock technology'] || item['Related Crop Livestock Technology'] || item.relatedTechnology || item.relatedCropLivestockTechnology;
            return value !== undefined && value !== null ? String(value) : null;
        },
    },
    // Display name fallbacks for Related Crop Livestock Technology
    'Related Crop/Live Stock Technology': {
        extractor: (item: any) => {
            const value = item.relatedTechnology || item.relatedCropLivestockTechnology || item['Related Crop/Live Stock Technology'] || item['Related crop/livestock technology'] || item['Related Crop Livestock Technology'];
            return value !== undefined && value !== null ? String(value) : null;
        },
    },
    'Related crop/livestock technology': {
        extractor: (item: any) => {
            const value = item.relatedTechnology || item.relatedCropLivestockTechnology || item['Related Crop/Live Stock Technology'] || item['Related crop/livestock technology'] || item['Related Crop Livestock Technology'];
            return value !== undefined && value !== null ? String(value) : null;
        },
    },
    'Related Crop Livestock Technology': {
        extractor: (item: any) => {
            const value = item.relatedTechnology || item.relatedCropLivestockTechnology || item['Related Crop/Live Stock Technology'] || item['Related crop/livestock technology'] || item['Related Crop Livestock Technology'];
            return value !== undefined && value !== null ? String(value) : null;
        },
    },
    // Display name fallbacks for No Of Participants
    'No. of Participants': {
        extractor: (item: any) => {
            const value = item.numberOfParticipants || item.noOfParticipants || item.totalParticipants || item.participants || item['No. of Participant'] || item['No. of Participants'] || item['No Of Participants'];
            return value !== undefined && value !== null ? String(value) : null;
        },
    },
    'No Of Participants': {
        extractor: (item: any) => {
            const value = item.numberOfParticipants || item.noOfParticipants || item.totalParticipants || item.participants || item['No. of Participant'] || item['No. of Participants'] || item['No Of Participants'];
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
                item.participants
            ].map(v => Number(v || 0));

            const total = counts.reduce((sum, val) => sum + val, 0);
            return total > 0 ? String(total) : (item.noOfParticipants || item.numberOfParticipants || null);
        }
    },
    [FIELD_NAMES.REMARK]: {
        extractor: (item: any) => item.remark || item.remarks || item['Remark'] || null,
    },
    // FLD Technical Feedback Fields - using FIELD_NAMES constants (camelCase first, then fallback)
    [FIELD_NAMES.FLD]: {
        extractor: (item: any) => item.fldName || (item.fld?.fldName) || item.fld || item['FLD'] || null,
    },
    [FIELD_NAMES.CROP]: {
        extractor: (item: any) => item.cropName || (item.crop?.cropName) || item.crop || item['Crop'] || null,
    },
    [FIELD_NAMES.FEEDBACK]: {
        extractor: (item: any) => item.feedback || item.feedBack || item['Feedback'] || null,
    },
    // NARI fields - using camelCase
    [FIELD_NAMES.GARDENS]: {
        extractor: (item: any) => item.noOfGardens !== undefined ? String(item.noOfGardens) : null,
    },
    [FIELD_NAMES.BENEFICIARIES]: {
        extractor: (item: any) => item.noOfBeneficiaries !== undefined ? String(item.noOfBeneficiaries) : null,
    },
    // Other fields (keeping display names for backward compatibility where no camelCase equivalent exists)
    'Name of FPO': {
        extractor: (item: any) => item.fpoName || null,
    },
    'Crop/Enterprise': {
        extractor: (item: any) => item.cropOrEnterprise || null,
    },
    Intervention: {
        extractor: (item: any) => item.intervention || null,
    },
    Theme: {
        extractor: (item: any) => item.theme || null,
    },
    // Note: 'FLD' extractor is defined above using FIELD_NAMES.FLD constant
    Courses: {
        extractor: (item: any) => item.noOfCourses !== undefined ? String(item.noOfCourses) : null,
    },
    // Soil and Water Testing - display name fallbacks (for backward compatibility)
    'KVK NAME': {
        extractor: (item: any) => item.kvkName || item.kvk?.kvkName || null,
        priority: 7,
    },
    'KVK Name': {
        extractor: (item: any) => item.kvkName || item.kvk?.kvkName || null,
        priority: 7,
    },
    'KVK': {
        extractor: (item: any) => item.kvk?.kvkName || item.kvkName || null,
        priority: 7,
    },
    'Equipment Name': {
        extractor: (item: any) => item.equipmentName || null,
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

    [FIELD_NAMES.TYPE_OF_ACTIVITIES]: {
        extractor: (item: any) => item.activityType || item.typeOfActivities || null,
        priority: 7,
    },
    // Award Fields - using camelCase
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
    // FPO Management mappings - using camelCase
    'Registration No': {
        extractor: (item: any) => item.registrationNumber || null,
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
    // FPO Details mappings - using camelCase
    [FIELD_NAMES.NO_OF_BLOCKS_ALLOCATED]: {
        extractor: (item: any) => item.blocksAllocated !== undefined ? String(item.blocksAllocated) : null,
    },
    [FIELD_NAMES.NO_OF_FPOS_REGISTERED_AS_CBBO]: {
        extractor: (item: any) => item.fposRegisteredAsCbbo !== undefined ? String(item.fposRegisteredAsCbbo) : null,
    },
    [FIELD_NAMES.AVERAGE_MEMBERS_PER_FPO]: {
        extractor: (item: any) => item.avgMembersPerFpo !== undefined ? String(item.avgMembersPerFpo) : null,
    },
    // Seed Hub mappings - using camelCase (CROP_NAME already defined above)
    [FIELD_NAMES.AREA_HA]: {
        extractor: (item: any) => item.areaCoveredHa !== undefined ? String(item.areaCoveredHa) : (item.area !== undefined ? String(item.area) : null),
    },
    'Area(ha)': {
        extractor: (item: any) => item.areaCoveredHa !== undefined ? String(item.areaCoveredHa) : (item.area !== undefined ? String(item.area) : null),
    },
    'Yield (ha)': {
        extractor: (item: any) => item.yieldQPerHa !== undefined ? String(item.yieldQPerHa) : (item.yield !== undefined ? String(item.yield) : null),
    },
    'Yield(ha)': {
        extractor: (item: any) => item.yieldQPerHa !== undefined ? String(item.yieldQPerHa) : (item.yield !== undefined ? String(item.yield) : null),
    },
    [FIELD_NAMES.FARMERS_INFLUENCED]: {
        extractor: (item: any) => item.farmersPurchased !== undefined ? String(item.farmersPurchased) : null,
    },

    // NICRA specific fields
    'RF(mm) district Normal': {
        extractor: (item: any) => item.rfNormal !== undefined ? String(item.rfNormal) : null,
    },
    'RF(mm) district Received': {
        extractor: (item: any) => item.rfReceived !== undefined ? String(item.rfReceived) : null,
    },
    'Max temperature 0C': {
        extractor: (item: any) => item.tempMax !== undefined ? String(item.tempMax) : null,
    },
    'Min temperature 0C': {
        extractor: (item: any) => item.tempMin !== undefined ? String(item.tempMin) : null,
    },
    'Title': {
        extractor: (item: any) => item.titleOfTraining || item.title || null,
    },
    'Activity Name': {
        extractor: (item: any) => item.activityName || item.activity || null,
    },
    'Places': {
        extractor: (item: any) => item.venue || item.place || null,
    },
    'Number of farmers attended': {
        extractor: (item: any) => {
            const sum = (item.generalM || 0) + (item.generalF || 0) +
                (item.obcM || 0) + (item.obcF || 0) +
                (item.scM || 0) + (item.scF || 0) +
                (item.stM || 0) + (item.stF || 0) +
                (item.participants || 0); // fallback to participants if exists
            return sum > 0 ? String(sum) : '0';
        }
    },
    'Category': {
        extractor: (item: any) => item.category?.categoryName || item.categoryName || null,
    },
    'Sub Category': {
        extractor: (item: any) => item.subCategory?.subCategoryName || item.subCategoryName || null,
    },
    'Technology Demonstrated': {
        extractor: (item: any) => item.technologyDemonstrated || null,
    },
    'Area (ha)/ Unit': {
        extractor: (item: any) => item.areaOrUnit !== undefined ? String(item.areaOrUnit) : null,
    },

    'Blocks Covered': {
        extractor: (item: any) => item.blocksCovered !== undefined ? String(item.blocksCovered) : (item.noOfBlocks !== undefined ? String(item.noOfBlocks) : null),
    },
    'Villages Covered': {
        extractor: (item: any) => item.villagesCovered !== undefined ? String(item.villagesCovered) : (item.noOfVillages !== undefined ? String(item.noOfVillages) : null),
    },
    'Total Trained Farmers': {
        extractor: (item: any) => item.totalTrainedFarmers !== undefined ? String(item.totalTrainedFarmers) : null,
    },
    'Farmers Influenced': {
        extractor: (item: any) => item.farmersInfluenced !== undefined ? String(item.farmersInfluenced) : (item.farmersPurchased !== undefined ? String(item.farmersPurchased) : null),
    },
    'Normal Crops grown': {
        extractor: (item: any) => item.croppingPattern || null,
    },
    'Practicing year of natural farming': {
        extractor: (item: any) => item.farmerPracticeDetails || null,
    },
    'Farming Situation of selected farmer': {
        extractor: (item: any) => item.farmingSituation || null,
    },
    'Latitude': {
        extractor: (item: any) => item.latitude !== undefined ? String(item.latitude) : null,
    },
    'Longitude': {
        extractor: (item: any) => item.longitude !== undefined ? String(item.longitude) : null,
    },
    'Name of activity': {
        extractor: (item: any) => item.activityName || null,
    },
    'Crop': {
        extractor: (item: any) => item.crop || null,
    },
    'Variety': {
        extractor: (item: any) => item.variety || null,
    },
    'Season': {
        extractor: (item: any) => item.season?.seasonName || item.seasonName || item.season?.name || item.season_name || item.Season || null,
    },
    'Type': {
        extractor: (item: any) => item.soilParameter || item.type || null,
    },
    'Before pH': {
        extractor: (item: any) => item.phBefore !== undefined ? String(item.phBefore) : null,
    },
    'Before EC (ds/m)': {
        extractor: (item: any) => item.ecBefore !== undefined ? String(item.ecBefore) : null,
    },
    'Before EC OC(%)': {
        extractor: (item: any) => item.ocBefore !== undefined ? String(item.ocBefore) : null,
    },
    'After pH': {
        extractor: (item: any) => item.phAfter !== undefined ? String(item.phAfter) : null,
    },
    'After EC (ds/m)': {
        extractor: (item: any) => item.ecAfter !== undefined ? String(item.ecAfter) : null,
    },
    'After EC OC(%)': {
        extractor: (item: any) => item.ocAfter !== undefined ? String(item.ocAfter) : null,
    },
    'Number of Activities Organised': {
        extractor: (item: any) => item.numberOfActivities !== undefined ? String(item.numberOfActivities) : null,
    },
    'Budget Sanctioned(Rs)': {
        extractor: (item: any) => item.budgetSanction !== undefined ? String(item.budgetSanction) : null,
    },
    'Budget Expenditure(Rs)': {
        extractor: (item: any) => item.budgetExpenditure !== undefined ? String(item.budgetExpenditure) : null,
    },
    'Total Budget Expenditure(Rs)': {
        extractor: (item: any) => item.totalBudgetExpenditure !== undefined ? String(item.totalBudgetExpenditure) : null,
    },
    'Agro Climatic Zone': {
        extractor: (item: any) => item.agroClimaticZone || null,
    },
    'Name of the programme': {
        extractor: (item: any) => item.programmeName || item.name_of_programme || null,
    },
    'Date of the programme': {
        extractor: (item: any) => {
            const dateVal = item.programmeDate || item.programme_date;
            if (!dateVal) return null;
            try {
                const date = new Date(dateVal);
                return date.toLocaleDateString('en-GB');
            } catch { return null; }
        }
    },
    'Venue': {
        extractor: (item: any) => item.venue || null,
        priority: 7,
    },
    'Purpose': {
        extractor: (item: any) => item.purpose || null,
    },
    'No. of participants': {
        extractor: (item: any) => {
            const sum = (item.farmersGeneralM || 0) + (item.farmersGeneralF || 0) +
                (item.farmersObcM || 0) + (item.farmersObcF || 0) +
                (item.farmersScM || 0) + (item.farmersScF || 0) +
                (item.farmersStM || 0) + (item.farmersStF || 0) +
                (item.gen_m || 0) + (item.gen_f || 0) +
                (item.obc_m || 0) + (item.obc_f || 0) +
                (item.sc_m || 0) + (item.sc_f || 0) +
                (item.st_m || 0) + (item.st_f || 0) +
                (item.participants || 0);
            return sum > 0 ? String(sum) : '0';
        }
    },

    // Prevalent Diseases fields
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
        extractor: (item: any) => String(item.farmerCount ?? item.noOfFarmers ?? 0),
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
    [FIELD_NAMES.PRODUCT_NAME]: {
        extractor: (item: any) => item.productName || null,
        priority: 6,
    },
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
        extractor: (item: any) => item.trainingProgrammes !== undefined && item.trainingProgrammes !== null ? String(item.trainingProgrammes) : null,
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
    [FIELD_NAMES.FUNDING_AGENCY]: {
        extractor: (item: any) => item.fundingAgency || null,
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
