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
    [FIELD_NAMES.DATE_OF_JOINING]: {
        extractor: (item) => {
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
        extractor: (item) => {
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
        extractor: (item) => item.registrationNo || null,
        priority: 9,
    },
    'totalCost (Rs.)': {
        extractor: (item) => {
            if (item.totalCost === undefined || item.totalCost === null) return null;
            return `₹${item.totalCost.toLocaleString('en-IN')}`;
        },
        priority: 9,
    },
    'totalCost (Rs)': {
        extractor: (item) => {
            if (item.totalCost === undefined || item.totalCost === null) return null;
            return `₹${item.totalCost.toLocaleString('en-IN')}`;
        },
        priority: 9,
    },
    'totalRun (Kms)': {
        extractor: (item) => item.totalRun ? `${item.totalRun} Kms` : null,
        priority: 9,
    },
    // Vehicle/Equipment fields - using FIELD_NAMES constants
    [FIELD_NAMES.VEHICLE_NAME]: {
        extractor: (item) => item.vehicleName || null,
        priority: 8,
    },
    [FIELD_NAMES.EQUIPMENT_NAME]: {
        extractor: (item) => item.equipmentName || null,
        priority: 8,
    },
    [FIELD_NAMES.IMPLEMENT_NAME]: {
        extractor: (item) => item.implementName || null,
        priority: 8,
    },
    presentStatus: {
        extractor: (item) => {
            if (!item.presentStatus) return null;
            return item.presentStatus
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (char: string) => char.toUpperCase());
        },
        priority: 8,
    },

    // Nested hierarchy fields
    [FIELD_NAMES.ZONE_NAME]: {
        extractor: (item) => {
            if (item.zone?.zoneName) return item.zone.zoneName;
            if (item.district?.state?.zone?.zoneName) return item.district.state.zone.zoneName;
            if (item.state?.zone?.zoneName) return item.state.zone.zoneName; // Legacy
            return null;
        },
        priority: 7,
    },
    [FIELD_NAMES.STATE_NAME]: {
        extractor: (item) => {
            if (item.state?.stateName) return item.state.stateName;
            if (item.district?.state?.stateName) return item.district.state.stateName;
            return null;
        },
        priority: 7,
    },
    [FIELD_NAMES.DISTRICT_NAME]: {
        extractor: (item) => {
            if (item.districtName) return item.districtName;
            if (item.district?.districtName) return item.district.districtName;
            return null;
        },
        priority: 7,
    },
    [FIELD_NAMES.ORGANIZATION_ORG_NAME]: {
        extractor: (item) => {
            if (item.org?.orgName) return item.org.orgName;
            if (item.organization?.orgName) return item.organization.orgName;
            if (item.organization?.uniName) return item.organization.uniName; // Legacy
            if (item.uniName) return item.uniName; // Legacy
            return null;
        },
        priority: 7,
    },
    [FIELD_NAMES.ORGANIZATION_NAME]: {
        extractor: (item) => {
            if (item.org?.orgName) return item.org.orgName;
            if (item.organization?.orgName) return item.organization.orgName;
            if (item.organization?.uniName) return item.organization.uniName; // Legacy
            if (item.uniName) return item.uniName; // Legacy
            return null;
        },
        priority: 7,
    },

    // Direct fields with fallback
    [FIELD_NAMES.ORG_NAME]: {
        extractor: (item) => item.orgName || null,
        priority: 6,
    },
    [FIELD_NAMES.UNIVERSITY_NAME]: {
        extractor: (item) => item.universityName || null,
        priority: 6,
    },

    // OFT/FLD fields
    [FIELD_NAMES.SUBJECT_NAME]: {
        extractor: (item) => item.subject?.subjectName || null,
        priority: 5,
    },
    [FIELD_NAMES.SECTOR_NAME]: {
        extractor: (item) => {
            if (item.sector?.sectorName) return item.sector.sectorName;
            if (item.category?.sector?.sectorName) return item.category.sector.sectorName;
            return null;
        },
        priority: 5,
    },
    [FIELD_NAMES.CATEGORY_NAME]: {
        extractor: (item) => item.category?.categoryName || null,
        priority: 5,
    },
    [FIELD_NAMES.SUB_CATEGORY_NAME]: {
        extractor: (item) => item.subCategory?.subCategoryName || null,
        priority: 5,
    },
    // Sub Category (for FLD table display)
    [FIELD_NAMES.SUB_CATEGORY]: {
        extractor: (item) => {
            if (item.subCategoryName) return item.subCategoryName;
            if (item.subCategory?.subCategoryName) return item.subCategory.subCategoryName;
            if (item['Sub-Category']) return item['Sub-Category'];
            if (item['Sub Category']) return item['Sub Category'];
            return null;
        },
        priority: 5,
    },
    [FIELD_NAMES.SEASON_NAME]: {
        extractor: (item) => {
            if (item.seasonName) return item.seasonName;
            if (item.season?.seasonName) return item.season.seasonName;
            return null;
        },
        priority: 5,
    },
    [FIELD_NAMES.SANCTIONED_POST]: {
        extractor: (item) => {
            if (item.postName) return item.postName;
            if (item.sanctionedPostName) return item.sanctionedPostName;
            if (item.sanctionedPost?.postName) return item.sanctionedPost.postName;
            return null;
        },
        priority: 5,
    },
    [FIELD_NAMES.YEAR_NAME]: {
        extractor: (item) => item.yearName || null,
        priority: 5,
    },
    [FIELD_NAMES.PUBLICATION_ITEM]: {
        extractor: (item) => item.publicationName || null,
        priority: 5,
    },
    [FIELD_NAMES.CROP_TYPE_NAME]: {
        extractor: (item) => item.cropType?.typeName || null,
        priority: 5,
    },
    // Crop field - using FIELD_NAMES constant (note: FIELD_NAMES.CROP_NAME = 'cropName')
    [FIELD_NAMES.CROP_NAME]: {
        extractor: (item) => item.cropName || item.CropName || null,
        priority: 5,
    },

    // Training fields
    [FIELD_NAMES.TRAINING_TYPE]: {
        extractor: (item) => {
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
        extractor: (item) => {
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
        extractor: (item) => {
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
        extractor: (item) => {
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
        extractor: (item) => {
            if (item.titleOfTraining) return item.titleOfTraining;
            if (item.title) return item.title;
            if (item.trainingTitle) return item.trainingTitle;
            return null;
        },
        priority: 5,
    },
    [FIELD_NAMES.TRAINING_DISCIPLINE]: {
        extractor: (item) => {
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
        extractor: (item) => {
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
        extractor: (item) => {
            if (item.extensionName) return item.extensionName;
            if (item.otherExtensionName) return item.otherExtensionName;
            return null;
        },
        priority: 5,
    },
    // Trial On Form (for OFT table display)
    [FIELD_NAMES.TRIAL_ON_FORM]: {
        extractor: (item) => {
            if (item.trialOnForm) return item.trialOnForm;
            if (item.title) return item.title; // OFT uses 'title' field
            if (item['Trail on form']) return item['Trail on form']; // Note: typo in backend
            if (item['Trial On Form']) return item['Trial On Form'];
            return null;
        },
        priority: 5,
    },
    [FIELD_NAMES.EVENT_NAME]: {
        extractor: (item) => item.eventName || null,
        priority: 5,
    },
    // Extension Activity fields - using camelCase
    [FIELD_NAMES.NAME_OF_EXTENSION_ACTIVITIES]: {
        extractor: (item) => item.nameOfExtensionActivities || item['Name of Extension activities'] || item['Name of Extension Activities'] || item.activityName || item.extensionActivityType || item.extension_activity_type || (item.activity?.activityName) || item.activity_name || null,
        priority: 7,
    },
    // Display name fallbacks (for backward compatibility)
    'Name of Extension activities': {
        extractor: (item) => item.nameOfExtensionActivities || item['Name of Extension activities'] || item['Name of Extension Activities'] || item.activityName || item.extensionActivityType || item.extension_activity_type || (item.activity?.activityName) || item.activity_name || null,
        priority: 7,
    },
    'Name of Extension Activities': {
        extractor: (item) => item.nameOfExtensionActivities || item['Name of Extension Activities'] || item['Name of Extension activities'] || item.activityName || item.extensionActivityType || item.extension_activity_type || (item.activity?.activityName) || item.activity_name || null,
        priority: 7,
    },
    [FIELD_NAMES.NATURE_OF_EXTENSION_ACTIVITY]: {
        extractor: (item) => item.natureOfExtensionActivity || item['Nature of Extension Activity'] || item['Nature of Extension activity'] || item.extensionActivityType || item.extensionActivityName || item.activity_name || (item.activity?.activityName) || null,
        priority: 7,
    },
    // Display name fallbacks (for backward compatibility)
    'Nature of Extension Activity': {
        extractor: (item) => item.natureOfExtensionActivity || item['Nature of Extension Activity'] || item['Nature of Extension activity'] || item.extensionActivityType || item.extensionActivityName || item.activity_name || (item.activity?.activityName) || null,
        priority: 7,
    },
    'Nature of Extension activity': {
        extractor: (item) => item.natureOfExtensionActivity || item['Nature of Extension activity'] || item['Nature of Extension Activity'] || item.extensionActivityType || item.extensionActivityName || item.activity_name || (item.activity?.activityName) || null,
        priority: 7,
    },
    [FIELD_NAMES.IMPORTANT_DAYS]: {
        extractor: (item) => item.importantDays || item['Important Days'] || item['Important days'] || item.importantDay || (item.importantDay?.dayName) || item.dayName || item.day_name || null,
        priority: 7,
    },
    // Display name fallbacks (for backward compatibility)
    'Important Days': {
        extractor: (item) => item.importantDays || item['Important Days'] || item['Important days'] || item.importantDay || (item.importantDay?.dayName) || item.dayName || item.day_name || null,
        priority: 7,
    },
    'Important days': {
        extractor: (item) => item.importantDays || item['Important days'] || item['Important Days'] || item.importantDay || (item.importantDay?.dayName) || item.dayName || item.day_name || null,
        priority: 7,
    },
    [FIELD_NAMES.NO_OF_ACTIVITIES]: {
        extractor: (item) => {
            const val = item.noOfActivities || item.numberOfActivities || item.activityCount || item.number_of_activities || item['No. of Activities'] || item['No. of activities'];
            return val !== undefined && val !== null ? String(val) : null;
        },
        priority: 5,
    },
    // Display name fallbacks (for backward compatibility)
    'No. of Activities': {
        extractor: (item) => {
            const val = item.noOfActivities || item.numberOfActivities || item.activityCount || item.number_of_activities || item['No. of Activities'] || item['No. of activities'];
            return val !== undefined && val !== null ? String(val) : null;
        },
        priority: 5,
    },
    'No. of activities': {
        extractor: (item) => {
            const val = item.noOfActivities || item.numberOfActivities || item.activityCount || item.number_of_activities || item['No. of activities'] || item['No. of Activities'];
            return val !== undefined && val !== null ? String(val) : null;
        },
        priority: 5,
    },
    [FIELD_NAMES.TYPE_OF_ACTIVITIES]: {
        extractor: (item) => item.typeOfActivities || item.activityType || item['Type Of Activities'] || item['Type of activities'] || null,
        priority: 5,
    },
    // Display name fallbacks (for backward compatibility)
    'Type Of Activities': {
        extractor: (item) => item.typeOfActivities || item.activityType || item['Type Of Activities'] || item['Type of activities'] || null,
        priority: 5,
    },
    'Type of activities': {
        extractor: (item) => item.typeOfActivities || item.activityType || item['Type of activities'] || item['Type Of Activities'] || null,
        priority: 5,
    },

    // Production & Projects fields
    productCategoryName: {
        extractor: (item) => {
            if (item.productCategoryName) return item.productCategoryName;
            if (item.productCategory?.productCategoryName) return item.productCategory.productCategoryName;
            return null;
        },
        priority: 5,
    },
    productCategoryType: {
        extractor: (item) => {
            if (item.productCategoryType) return item.productCategoryType;
            if (item.productType?.productCategoryType) return item.productType.productCategoryType;
            return null;
        },
        priority: 5,
    },
    productName: {
        extractor: (item) => item.productName || null,
        priority: 5,
    },
    farmingSystemName: {
        extractor: (item) => item.farmingSystemName || null,
        priority: 5,
    },
    enterpriseName: {
        extractor: (item) => item.enterpriseName || null,
        priority: 5,
    },

    // About KVK fields
    kvk: {
        extractor: (item) => {
            if (item.kvk?.kvkName) return item.kvk.kvkName;
            if (item.kvkName) return item.kvkName;
            return null;
        },
        priority: 7,
    },
    kvkName: {
        extractor: (item) => {
            if (item.kvk?.kvkName) return item.kvk.kvkName;
            if (item.kvkName) return item.kvkName;
            return null;
        },
        priority: 7,
    },

    // Employee/Staff specific fields
    position: {
        extractor: (item) => {
            if (item.positionOrder !== undefined && item.positionOrder !== null) {
                return String(item.positionOrder);
            }
            return null;
        },
        priority: 6,
    },
    positionOrder: {
        extractor: (item) => {
            if (item.positionOrder !== undefined && item.positionOrder !== null) {
                return String(item.positionOrder);
            }
            return null;
        },
        priority: 6,
    },
    postName: {
        extractor: (item) => {
            if (item.sanctionedPost?.postName) return item.sanctionedPost.postName;
            if (item.postName) return item.postName;
            if (item.sanctionedPost?.post_name) return item.sanctionedPost.post_name;
            if (item.post_name) return item.post_name;
            return null;
        },
        priority: 7,
    },
    allowances: {
        extractor: (item) => {
            if (item.allowances) return item.allowances;
            return null;
        },
        priority: 6,
    },
    detailsOfAllowences: {
        extractor: (item) => {
            if (item.allowances) return item.allowances;
            if (item.detailsOfAllowences) return item.detailsOfAllowences;
            return null;
        },
        priority: 6,
    },
    category: {
        extractor: (item) => {
            // Primary: Check nested relation object (preferred - backend should include this)
            if (item.staffCategory?.categoryName) return item.staffCategory.categoryName;
            // Fallback: Check direct field (if backend includes it separately)
            if (item.categoryName) return item.categoryName;
            // Legacy: Check old field name
            if (item.category) return item.category;
            // Note: If staffCategoryId exists but staffCategory relation is null,
            // the backend query should include the staffCategory relation in the 'include' clause.
            // Check backend/repositories/forms/aboutKvkRepository.js line 59-61 for includes config.
            return null;
        },
        priority: 7,
    },
    resume: {
        extractor: (item) => {
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
        extractor: (item) => {
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
        extractor: (item) => {
            // Show original KVK name (where staff was first created)
            if (item.originalKvk?.kvkName) return item.originalKvk.kvkName;
            if (item.originalKvkId) return `KVK ${item.originalKvkId}`;
            if (item.kvk?.kvkName) return item.kvk.kvkName;
            return null;
        },
        priority: 7,
    },
    latestKvkName: {
        extractor: (item) => {
            // Show current/latest KVK name (where staff is now)
            if (item.kvk?.kvkName) return item.kvk.kvkName;
            if (item.kvkName) return item.kvkName;
            return null;
        },
        priority: 7,
    },

    // Infrastructure specific fields - using camelCase
    [FIELD_NAMES.INFRA_MASTER_NAME]: {
        extractor: (item) => {
            if (item.infraMaster?.name) return item.infraMaster.name;
            if (item.infraMasterName) return item.infraMasterName;
            return null;
        },
        priority: 7,
    },
    [FIELD_NAMES.SOURCE_OF_FUNDING]: {
        extractor: (item) => {
            if (item.sourceOfFunding) return item.sourceOfFunding;
            return null;
        },
        priority: 6,
    },
    [FIELD_NAMES.SOURCE_OF_FUND]: {
        extractor: (item) => {
            // Map sourceOfFund to sourceOfFunding (for equipment and farm implements)
            if (item.sourceOfFunding) return item.sourceOfFunding;
            if (item.sourceOfFund) return item.sourceOfFund;
            return null;
        },
        priority: 6,
    },

    // CFLD Technical Parameter fields - using camelCase
    [FIELD_NAMES.MONTH]: {
        extractor: (item) => {
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
        extractor: (item) => item.type || item.typeName || null,
    },
    [FIELD_NAMES.SEASON]: {
        extractor: (item) => item.seasonName || (item.season?.seasonName) || null,
    },
    // Note: 'Crop' extractor is defined below using FIELD_NAMES.CROP constant
    [FIELD_NAMES.VARIETY]: {
        extractor: (item) => item.varietyName || item.variety || null,
    },
    'Name of Variety': {
        extractor: (item) => item.varietyName || null,
    },
    [FIELD_NAMES.AREA]: {
        extractor: (item) => item.areaHectare !== undefined ? String(item.areaHectare) : (item.areaInHa !== undefined ? String(item.areaInHa) : null),
    },
    'Area (in ha)': {
        extractor: (item) => item.areaHectare !== undefined ? String(item.areaHectare) : (item.areaInHa !== undefined ? String(item.areaInHa) : null),
    },
    'Demo Yield (Avg)': {
        extractor: (item) => item.yieldAvg !== undefined ? String(item.yieldAvg) : (item.demoYieldAvg !== undefined ? String(item.demoYieldAvg) : null),
    },
    [FIELD_NAMES.PERCENT_INCREASE]: {
        extractor: (item) => item.yieldIncreasePercent !== undefined ? `${item.yieldIncreasePercent}%` : (item.percentIncrease !== undefined ? `${item.percentIncrease}%` : null),
    },

    // ARYA fields - using camelCase
    [FIELD_NAMES.YEAR]: {
        extractor: (item) => item.yearName || (item.year?.yearName) || null,
    },
    [FIELD_NAMES.ENTERPRISE]: {
        extractor: (item) => item.enterpriseName || (item.enterprise?.enterpriseName) || null,
    },
    // ARYA fields - using camelCase
    Trainings: {
        extractor: (item) => item.noOfTraining !== undefined ? String(item.noOfTraining) : null,
    },
    [FIELD_NAMES.PARTICIPANTS]: {
        extractor: (item) => item.noOfParticipants !== undefined ? String(item.noOfParticipants) : null,
    },
    Units: {
        extractor: (item) => item.noOfUnitsEstablished !== undefined ? String(item.noOfUnitsEstablished) : null,
    },
    Entrepreneurs: {
        extractor: (item) => item.noOfEntrepreneurs !== undefined ? String(item.noOfEntrepreneurs) : null,
    },
    'Income Before': {
        extractor: (item) => item.incomeBefore !== undefined ? `Rs. ${item.incomeBefore}` : null,
    },
    'Income After': {
        extractor: (item) => item.incomeAfter !== undefined ? `Rs. ${item.incomeAfter}` : null,
    },
    '% Functional': {
        extractor: (item) => item.functionalPercentage !== undefined ? `${item.functionalPercentage}%` : null,
    },

    // CRA & NARI & FPO & NICRA fields - using camelCase
    [FIELD_NAMES.VILLAGES]: {
        extractor: (item) => item.noOfVillages !== undefined ? String(item.noOfVillages) : null,
    },
    [FIELD_NAMES.VILLAGE_NAME]: {
        extractor: (item) => item.villageName || null,
    },
    [FIELD_NAMES.FARMERS]: {
        extractor: (item) => item.noOfFarmers !== undefined ? String(item.noOfFarmers) : null,
    },
    [FIELD_NAMES.HOUSEHOLDS]: {
        extractor: (item) => item.noOfHouseholds !== undefined ? String(item.noOfHouseholds) : null,
    },
    // Activity fields - using camelCase
    'Activity Type': {
        extractor: (item) => item.activityType || null,
    },
    [FIELD_NAMES.ACTIVITY]: {
        extractor: (item) => item.activity || item.activityName || item['Activity'] || null,
    },
    Activities: {
        extractor: (item) => item.noOfActivities !== undefined ? String(item.noOfActivities) : null,
    },
    // FLD Extension Training Fields - using FIELD_NAMES constants (camelCase first, then fallback)
    [FIELD_NAMES.FLD_NAME]: {
        extractor: (item) => item.fldName || item['FLD Name'] || item.fld?.fldName || item['FLD'] || null,
    },
    // Name of Technology Demonstrated (for FLD base table display)
    [FIELD_NAMES.NAME_OF_TECHNOLOGY_DEMONSTRATED]: {
        extractor: (item) => {
            if (item.nameOfTechnologyDemonstrated) return item.nameOfTechnologyDemonstrated;
            if (item.fldName) return item.fldName;
            if (item.technologyName) return item.technologyName;
            if (item['Name of Technnology Demonstrated']) return item['Name of Technnology Demonstrated']; // Note: typo in backend
            if (item['Name Of Technology Demonstrated']) return item['Name Of Technology Demonstrated'];
            return null;
        },
        priority: 5,
    },
    [FIELD_NAMES.DATE]: {
        extractor: (item) => {
            const dateVal = item.date || item.activityDate || item.eventDate || item['Date'];
            if (!dateVal) return null;
            try {
                const date = new Date(dateVal);
                return date.toLocaleDateString('en-GB');
            } catch { return null; }
        },
    },
    [FIELD_NAMES.NUMBER_OF_ACTIVITIES]: {
        extractor: (item) => {
            const value = item.numberOfActivities || item.noOfActivities || item.activityCount || item['No. of Activity'];
            return value !== undefined && value !== null ? String(value) : null;
        },
    },
    [FIELD_NAMES.NUMBER_OF_PARTICIPANTS]: {
        extractor: (item) => {
            const value = item.numberOfParticipants || item.noOfParticipants || item.totalParticipants || item.participants || item['No. of Participant'];
            return value !== undefined && value !== null ? String(value) : null;
        },
    },
    [FIELD_NAMES.REMARK]: {
        extractor: (item) => item.remark || item.remarks || item['Remark'] || null,
    },
    // FLD Technical Feedback Fields - using FIELD_NAMES constants (camelCase first, then fallback)
    [FIELD_NAMES.FLD]: {
        extractor: (item) => item.fld || item.fldName || item.fld?.fldName || item['FLD'] || null,
    },
    [FIELD_NAMES.CROP]: {
        extractor: (item) => item.crop || item.cropName || item.crop?.cropName || item['Crop'] || null,
    },
    [FIELD_NAMES.FEEDBACK]: {
        extractor: (item) => item.feedback || item.feedBack || item['Feedback'] || null,
    },
    // NARI fields - using camelCase
    [FIELD_NAMES.GARDENS]: {
        extractor: (item) => item.noOfGardens !== undefined ? String(item.noOfGardens) : null,
    },
    [FIELD_NAMES.BENEFICIARIES]: {
        extractor: (item) => item.noOfBeneficiaries !== undefined ? String(item.noOfBeneficiaries) : null,
    },
    // Other fields (keeping display names for backward compatibility where no camelCase equivalent exists)
    'Name of FPO': {
        extractor: (item) => item.fpoName || null,
    },
    'Crop/Enterprise': {
        extractor: (item) => item.cropOrEnterprise || null,
    },
    Intervention: {
        extractor: (item) => item.intervention || null,
    },
    Theme: {
        extractor: (item) => item.theme || null,
    },
    // Note: 'FLD' extractor is defined above using FIELD_NAMES.FLD constant
    Courses: {
        extractor: (item) => item.noOfCourses !== undefined ? String(item.noOfCourses) : null,
    },
    // Soil and Water Testing - display name fallbacks (for backward compatibility)
    'KVK NAME': {
        extractor: (item) => item.kvkName || item.kvk?.kvkName || null,
        priority: 7,
    },
    'KVK Name': {
        extractor: (item) => item.kvkName || item.kvk?.kvkName || null,
        priority: 7,
    },
    // Equipment and Analysis fields - using camelCase (already defined above)
    [FIELD_NAMES.QUANTITY]: {
        extractor: (item) => item.quantity !== undefined ? String(item.quantity) : null,
    },
    [FIELD_NAMES.ANALYSIS]: {
        extractor: (item) => item.analysisName || null,
    },
    [FIELD_NAMES.NO_OF_SAMPLES_ANALYZED]: {
        extractor: (item) => item.samplesAnalysed !== undefined ? String(item.samplesAnalysed) : null,
    },
    [FIELD_NAMES.NO_OF_VILLAGES_COVERED]: {
        extractor: (item) => item.villagesNumber !== undefined ? String(item.villagesNumber) : null,
    },
    [FIELD_NAMES.AMOUNT_RELEASED]: {
        extractor: (item) => item.amountRealized !== undefined ? `₹${item.amountRealized.toLocaleString('en-IN')}` : null,
    },
    [FIELD_NAMES.NO_OF_ACTIVITIES_CONDUCTED]: {
        extractor: (item) => item.activitiesConducted !== undefined ? String(item.activitiesConducted) : null,
    },
    [FIELD_NAMES.SOIL_HEALTH_CARDS_DISTRIBUTED]: {
        extractor: (item) => item.soilHealthCardDistributed !== undefined ? String(item.soilHealthCardDistributed) : null,
    },
    [FIELD_NAMES.VIP_NAMES]: {
        extractor: (item) => item.vipNames || null,
    },
    [FIELD_NAMES.TOTAL_PARTICIPANTS_ATTENDED]: {
        extractor: (item) => item.participants !== undefined ? String(item.participants) : null,
    },
    [FIELD_NAMES.NO_OF_VIPS]: {
        extractor: (item) => item.vipNames ? String(item.vipNames.split(',').length) : '0',
    },
    // Reporting and Date fields - using camelCase
    [FIELD_NAMES.REPORTING_YEAR]: {
        extractor: (item) => {
            // Handle relation object (YearMaster)
            if (item.reportingYear?.yearName) {
                return item.reportingYear.yearName;
            }
            // Handle reportingYearLabel (if backend provides it)
            if (item.reportingYearLabel) {
                return item.reportingYearLabel;
            }
            // Handle direct reportingYear string (backward compatibility)
            if (item.reportingYear && typeof item.reportingYear === 'string') {
                return item.reportingYear;
            }
            // Handle reportingYearId (if we need to look it up, but this shouldn't happen)
            return null;
        },
    },
    [FIELD_NAMES.START_DATE]: {
        extractor: (item) => {
            if (!item.startDate) return null;
            try {
                const date = new Date(item.startDate);
                return date.toLocaleDateString('en-GB');
            } catch { return null; }
        }
    },
    [FIELD_NAMES.END_DATE]: {
        extractor: (item) => {
            if (!item.endDate) return null;
            try {
                const date = new Date(item.endDate);
                return date.toLocaleDateString('en-GB');
            } catch { return null; }
        }
    },
    [FIELD_NAMES.EVENT_DATE]: {
        extractor: (item) => {
            const dateVal = item.eventDate || item.event_date || item['Event Date'];
            if (!dateVal) return null;
            try {
                const date = new Date(dateVal);
                return date.toLocaleDateString('en-GB');
            } catch { return null; }
        }
    },
    // Award Fields - using camelCase
    [FIELD_NAMES.AWARD]: {
        extractor: (item) => item.awardName || item.award_name || null,
        priority: 5,
    },
    [FIELD_NAMES.AMOUNT]: {
        extractor: (item) => {
            if (item.amount === undefined || item.amount === null) return null;
            return `₹${Number(item.amount).toLocaleString('en-IN')}`;
        },
        priority: 5,
    },
    [FIELD_NAMES.ACHIEVEMENT]: {
        extractor: (item) => item.achievement || null,
        priority: 5,
    },
    [FIELD_NAMES.CONFERRING_AUTHORITY]: {
        extractor: (item) => item.conferringAuthority || item.conferring_authority || null,
        priority: 5,
    },
    [FIELD_NAMES.HEAD_SCIENTIST]: {
        extractor: (item) => item.headScientist || item.head_scientist || null,
    },
    [FIELD_NAMES.FARMER_NAME]: {
        extractor: (item) => item.farmerName || item.farmer_name || null,
    },
    [FIELD_NAMES.ADDRESS]: {
        extractor: (item) => item.address || null,
    },
    [FIELD_NAMES.CONTACT_NUMBER]: {
        extractor: (item) => item.contactNumber || item.contact_number || null,
    },
    [FIELD_NAMES.STAFF]: {
        extractor: (item) => item.staffName || item.staff_name || null,
    },
    [FIELD_NAMES.COURSE]: {
        extractor: (item) => item.courseName || item.course_name || null,
    },
    [FIELD_NAMES.ORGANIZER]: {
        extractor: (item) => item.organizerVenue || item.organizer_venue || null,
    },
    // FPO Management mappings - using camelCase
    'Registration No': {
        extractor: (item) => item.registrationNumber || null,
    },
    [FIELD_NAMES.DATE_OF_REGISTRATION]: {
        extractor: (item) => {
            if (!item.registrationDate) return null;
            try {
                const date = new Date(item.registrationDate);
                return date.toLocaleDateString('en-GB');
            } catch { return null; }
        }
    },
    [FIELD_NAMES.NAME_OF_THE_FPO]: {
        extractor: (item) => item.fpoName || null,
    },
    [FIELD_NAMES.ADDRESS_OF_FPO]: {
        extractor: (item) => item.address || null,
    },
    [FIELD_NAMES.TOTAL_NUMBER_OF_BOM_MEMBERS]: {
        extractor: (item) => item.totalBomMembers !== undefined ? String(item.totalBomMembers) : null,
    },
    [FIELD_NAMES.FINANCIAL_POSITION]: {
        extractor: (item) => item.financialPositionLakh !== undefined ? `Rs. ${item.financialPositionLakh} Lakh` : null,
    },
    // FPO Details mappings - using camelCase
    [FIELD_NAMES.NO_OF_BLOCKS_ALLOCATED]: {
        extractor: (item) => item.blocksAllocated !== undefined ? String(item.blocksAllocated) : null,
    },
    [FIELD_NAMES.NO_OF_FPOS_REGISTERED_AS_CBBO]: {
        extractor: (item) => item.fposRegisteredAsCbbo !== undefined ? String(item.fposRegisteredAsCbbo) : null,
    },
    [FIELD_NAMES.AVERAGE_MEMBERS_PER_FPO]: {
        extractor: (item) => item.avgMembersPerFpo !== undefined ? String(item.avgMembersPerFpo) : null,
    },
    // Seed Hub mappings - using camelCase (CROP_NAME already defined above)
    [FIELD_NAMES.AREA_HA]: {
        extractor: (item) => item.areaCoveredHa !== undefined ? String(item.areaCoveredHa) : (item.area !== undefined ? String(item.area) : null),
    },
    'Area(ha)': {
        extractor: (item) => item.areaCoveredHa !== undefined ? String(item.areaCoveredHa) : (item.area !== undefined ? String(item.area) : null),
    },
    'Yield (ha)': {
        extractor: (item) => item.yieldQPerHa !== undefined ? String(item.yieldQPerHa) : (item.yield !== undefined ? String(item.yield) : null),
    },
    'Yield(ha)': {
        extractor: (item) => item.yieldQPerHa !== undefined ? String(item.yieldQPerHa) : (item.yield !== undefined ? String(item.yield) : null),
    },
    [FIELD_NAMES.FARMERS_INFLUENCED]: {
        extractor: (item) => item.farmersPurchased !== undefined ? String(item.farmersPurchased) : null,
    },
};

// ============================================
// Main Field Value Getter
// ============================================

/**
 * Get field value from item using configuration-driven approach
 * Falls back to direct field access if no extractor is configured
 */
export function getFieldValueConfig(item: any, field: string): string {
    // Try configured extractor first
    const config = fieldExtractors[field];
    if (config) {
        const value = config.extractor(item);
        if (value !== null) return value;
    }

    // Direct field access (fallback)
    if (item[field] !== undefined && item[field] !== null && typeof item[field] !== 'object') {
        return String(item[field]);
    }

    // Default fallback
    return '-';
}
