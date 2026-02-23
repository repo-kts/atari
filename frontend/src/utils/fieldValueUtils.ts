/**
 * Field Value Utilities
 *
 * Configuration-driven approach for extracting field values from items
 * Replaces 250+ lines of if statements with maintainable configuration
 */

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
    // Shared fields
    'KVK Name': {
        extractor: (item) => item.kvkName || (item.kvk?.kvkName) || null,
        priority: 10,
    },
    'KVK NAME': {
        extractor: (item) => item.kvkName || (item.kvk?.kvkName) || null,
        priority: 10,
    },
    // Date fields
    dateOfJoining: {
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
    dateOfBirth: {
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
    registrationNumber: {
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
    vehicleName: {
        extractor: (item) => item.vehicleName || null,
        priority: 8,
    },
    equipmentName: {
        extractor: (item) => item.equipmentName || null,
        priority: 8,
    },
    implementName: {
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
    zoneName: {
        extractor: (item) => {
            if (item.zone?.zoneName) return item.zone.zoneName;
            if (item.district?.state?.zone?.zoneName) return item.district.state.zone.zoneName;
            if (item.state?.zone?.zoneName) return item.state.zone.zoneName; // Legacy
            return null;
        },
        priority: 7,
    },
    stateName: {
        extractor: (item) => {
            if (item.state?.stateName) return item.state.stateName;
            if (item.district?.state?.stateName) return item.district.state.stateName;
            return null;
        },
        priority: 7,
    },
    districtName: {
        extractor: (item) => {
            if (item.districtName) return item.districtName;
            if (item.district?.districtName) return item.district.districtName;
            return null;
        },
        priority: 7,
    },
    'organization.orgName': {
        extractor: (item) => {
            if (item.org?.orgName) return item.org.orgName;
            if (item.organization?.orgName) return item.organization.orgName;
            if (item.organization?.uniName) return item.organization.uniName; // Legacy
            if (item.uniName) return item.uniName; // Legacy
            return null;
        },
        priority: 7,
    },
    organizationName: {
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
    orgName: {
        extractor: (item) => item.orgName || null,
        priority: 6,
    },
    universityName: {
        extractor: (item) => item.universityName || null,
        priority: 6,
    },
    uniName: {
        extractor: (item) => item.uniName || null, // Legacy
        priority: 6,
    },

    // OFT/FLD fields
    subjectName: {
        extractor: (item) => item.subject?.subjectName || null,
        priority: 5,
    },
    sectorName: {
        extractor: (item) => {
            if (item.sector?.sectorName) return item.sector.sectorName;
            if (item.category?.sector?.sectorName) return item.category.sector.sectorName;
            return null;
        },
        priority: 5,
    },
    categoryName: {
        extractor: (item) => item.category?.categoryName || null,
        priority: 5,
    },
    subCategoryName: {
        extractor: (item) => item.subCategory?.subCategoryName || null,
        priority: 5,
    },
    seasonName: {
        extractor: (item) => {
            if (item.seasonName) return item.seasonName;
            if (item.season?.seasonName) return item.season.seasonName;
            return null;
        },
        priority: 5,
    },
    sanctionedPostName: {
        extractor: (item) => {
            if (item.postName) return item.postName;
            if (item.sanctionedPostName) return item.sanctionedPostName;
            if (item.sanctionedPost?.postName) return item.sanctionedPost.postName;
            return null;
        },
        priority: 5,
    },
    yearName: {
        extractor: (item) => item.yearName || null,
        priority: 5,
    },
    Staff: {
        extractor: (item) => item.staff?.staffName || item.staffName || null,
        priority: 5,
    },
    Course: {
        extractor: (item) => item.courseName || null,
        priority: 5,
    },
    Organizer: {
        extractor: (item) => item.organizerVenue || null,
        priority: 5,
    },
    'Reporting year': {
        extractor: (item) => item.reportingYear || null,
        priority: 5,
    },
    'Title of On farm Trial (OFT)': {
        extractor: (item) => item.title || null,
        priority: 5,
    },
    'Problem diagnosed': {
        extractor: (item) => item.problemDiagnosed || null,
        priority: 5,
    },
    'Ongoing/Completed': {
        extractor: (item) => {
            if (item.status) return item.status;
            if (item.performanceIndicators && item.performanceIndicators.includes('[Status:')) {
                const match = item.performanceIndicators.match(/\[Status:\s*(.*?)\]/);
                if (match) return match[1];
            }
            return null;
        },
        priority: 5,
    },
    publicationItem: {
        extractor: (item) => item.publicationName || null,
        priority: 5,
    },
    cropTypeName: {
        extractor: (item) => item.cropType?.typeName || null,
        priority: 5,
    },
    cropName: {
        extractor: (item) => item.cropName || item.CropName || null,
        priority: 5,
    },

    // Training fields
    trainingType: {
        extractor: (item) => {
            if (item.trainingTypeName) return item.trainingTypeName;
            if (item.trainingType?.trainingTypeName) return item.trainingType.trainingTypeName;
            return null;
        },
        priority: 5,
    },
    trainingAreaName: {
        extractor: (item) => {
            if (item.trainingAreaName) return item.trainingAreaName;
            if (item.trainingArea?.trainingAreaName) return item.trainingArea.trainingAreaName;
            return null;
        },
        priority: 5,
    },
    trainingThematicArea: {
        extractor: (item) => {
            if (item.trainingThematicAreaName) return item.trainingThematicAreaName;
            if (item.trainingThematicArea?.trainingThematicAreaName) return item.trainingThematicArea.trainingThematicAreaName;
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
    eventName: {
        extractor: (item) => item.eventName || null,
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
    sanctionedPost: {
        extractor: (item) => {
            if (item.sanctionedPost?.postName) return item.sanctionedPost.postName;
            if (item.postName) return item.postName;
            if (item.sanctionedPost?.post_name) return item.sanctionedPost.post_name;
            if (item.post_name) return item.post_name;
            return null;
        },
        priority: 7,
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

    // Infrastructure specific fields
    infraMasterName: {
        extractor: (item) => {
            if (item.infraMaster?.name) return item.infraMaster.name;
            if (item.infraMasterName) return item.infraMasterName;
            return null;
        },
        priority: 7,
    },
    sourceOfFunding: {
        extractor: (item) => {
            if (item.sourceOfFunding) return item.sourceOfFunding;
            return null;
        },
        priority: 6,
    },
    sourceOfFund: {
        extractor: (item) => {
            // Map sourceOfFund to sourceOfFunding (for equipment and farm implements)
            if (item.sourceOfFunding) return item.sourceOfFunding;
            if (item.sourceOfFund) return item.sourceOfFund;
            return null;
        },
        priority: 6,
    },
    // Award and Recognition
    Award: {
        extractor: (item) => item.awardName || null,
        priority: 5,
    },
    awardName: {
        extractor: (item) => item.awardName || null,
        priority: 5,
    },
    'Head Scientist': {
        extractor: (item) => item.headScientist || item.scientistName || null,
        priority: 5,
    },
    'Head/Scientist': {
        extractor: (item) => item.scientistName || null,
        priority: 5,
    },
    scientistName: {
        extractor: (item) => item.scientistName || null,
        priority: 5,
    },
    'Name of Award': {
        extractor: (item) => item.awardName || null,
        priority: 5,
    },
    ' Name of Award': {
        // Handle user's specific label with leading space
        extractor: (item) => item.awardName || null,
        priority: 5,
    },
    'Name of the Award': {
        extractor: (item) => item.awardName || null,
        priority: 5,
    },
    'Reporting Year': {
        extractor: (item) => {
            if (item.year || item.reportingYear) return item.year || item.reportingYear;
            if (item.startDate) {
                const year = new Date(item.startDate).getFullYear();
                return `${year}-${(year + 1).toString().slice(2)}`;
            }
            return null;
        },
        priority: 5,
    },
    year: {
        extractor: (item) => item.year || item.reportingYear || null,
        priority: 5,
    },
    Amount: {
        extractor: (item) => item.amount ? `₹${item.amount.toLocaleString('en-IN')}` : null,
        priority: 5,
    },
    amount: {
        extractor: (item) => item.amount ? `₹${item.amount.toLocaleString('en-IN')}` : null,
        priority: 5,
    },
    Achievement: {
        extractor: (item) => item.achievement || null,
        priority: 5,
    },
    achievement: {
        extractor: (item) => item.achievement || null,
        priority: 5,
    },
    'Conferring Authority': {
        extractor: (item) => item.conferringAuthority || null,
        priority: 5,
    },
    conferringAuthority: {
        extractor: (item) => item.conferringAuthority || null,
        priority: 5,
    },
    'Farmer Name': {
        extractor: (item) => item.farmerName || null,
        priority: 5,
    },
    'Name of Farmer': {
        extractor: (item) => item.farmerName || null,
        priority: 5,
    },
    'Name of the Farmer': {
        extractor: (item) => item.farmerName || null,
        priority: 5,
    },
    Address: {
        extractor: (item) => item.address || null,
        priority: 5,
    },
    'Contact Number': {
        extractor: (item) => item.contactNumber || item.contactNo || null,
        priority: 5,
    },
    'Contact No.': {
        extractor: (item) => item.contactNumber || item.contactNo || null,
        priority: 5,
    },
    Image: {
        extractor: (item) => item.image || null,
        priority: 5,
    },
    'Start Date': {
        extractor: (item) => {
            if (!item.startDate) return null;
            try {
                const date = new Date(item.startDate);
                if (isNaN(date.getTime())) return null;
                return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
            } catch {
                return null;
            }
        },
        priority: 5,
    },
    'End Date': {
        extractor: (item) => {
            if (!item.endDate) return null;
            try {
                const date = new Date(item.endDate);
                if (isNaN(date.getTime())) return null;
                return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
            } catch {
                return null;
            }
        },
        priority: 5,
    },
    'Name of Extension activities': {
        extractor: (item) => item.extensionActivityType || item.activityName || item.activity?.activityName || null,
        priority: 5,
    },
    'Nature of Extension Activity': {
        extractor: (item) => item.extensionActivityType || item.activity?.activityName || item.activityType?.activityName || item.natureOfExtensionActivities || null,
        priority: 5,
    },
    'No. of Activities': {
        extractor: (item) => item.numberOfActivities !== undefined ? String(item.numberOfActivities) : item.activityCount ? String(item.activityCount) : null,
        priority: 5,
    },
    'No. of activities': {
        extractor: (item) => item.numberOfActivities !== undefined ? String(item.numberOfActivities) : item.activityCount ? String(item.activityCount) : null,
        priority: 5,
    },
    // Technology Week Celebration columns
    'KVK': {
        extractor: (item) => item.kvkName || item.kvk?.kvkName || null,
        priority: 5,
    },
    'Type Of Activities': {
        extractor: (item) => item.typeOfActivities || item.activityType || item['Type of activities'] || null,
        priority: 5,
    },
    'Related Crop/Live Stock Technology': {
        extractor: (item) => item.relatedTechnology || item['Related crop/livestock technology'] || null,
        priority: 5,
    },
    'Number of participants': {
        extractor: (item) => item.totalParticipants !== undefined ? String(item.totalParticipants) : null,
        priority: 5,
    },
    'No. of Participants': {
        extractor: (item) => item.totalParticipants !== undefined ? String(item.totalParticipants) : null,
        priority: 5,
    },
    // Celebration Days table columns (unique keys only)
    'Important Days': {
        extractor: (item) => item.importantDay || item.importantDayName || item['Important Days'] || item['Important Dates'] || null,
        priority: 5,
    },
    'Important Dates': {
        extractor: (item) => item.importantDay || item.importantDayName || item['Important Dates'] || item['Important Days'] || null,
        priority: 5,
    },
    'Event Date': {
        extractor: (item) => item.eventDate || item['Event Date'] || item['Event date'] || null,
        priority: 5,
    },
    'Event date': {
        extractor: (item) => item.eventDate || item['Event date'] || item['Event Date'] || null,
        priority: 5,
    },

    // Soil Water Testing columns
    'Analysis': {
        extractor: (item) => item.analysis || item.analysisName || null,
        priority: 5,
    },
    'Equipment Name': {
        extractor: (item) => item.equipmentName || null,
        priority: 5,
    },
    'Quantity': {
        extractor: (item) => item.quantity !== undefined && item.quantity !== null ? String(item.quantity) : null,
        priority: 5,
    },
    // Soil Analysis table columns (matches reference image)
    'No. of Samples analyzed': {
        extractor: (item) => item.numberOfSamples !== undefined ? String(item.numberOfSamples) : null,
        priority: 5,
    },
    'No. of Villages covered': {
        extractor: (item) => item.numberOfVillages !== undefined ? String(item.numberOfVillages) : null,
        priority: 5,
    },
    'Amount realized (Rs.)': {
        extractor: (item) => item.amountRealized !== undefined ? String(item.amountRealized) : null,
        priority: 5,
    },
    'Samples Analyzed Through': {
        extractor: (item) => item.samplesAnalyzedThrough || null,
        priority: 5,
    },
    // World Soil Day table columns
    'No. of Activity conducted': {
        extractor: (item) => item.activityConducted !== undefined ? String(item.activityConducted) : item.activitiesConducted !== undefined ? String(item.activitiesConducted) : null,
        priority: 5,
    },
    'Soil Health Cards distributed': {
        extractor: (item) => item.soilHealthCards !== undefined ? String(item.soilHealthCards) : item.soilHealthCardDistributed !== undefined ? String(item.soilHealthCardDistributed) : null,
        priority: 5,
    },
    'No of VIP': {
        extractor: (item) => item.noOfVip !== undefined ? String(item.noOfVip) : null,
        priority: 5,
    },
    'Name (s) of VIP(s) involved if any': {
        extractor: (item) => item.vipNames || null,
        priority: 5,
    },
    'Total No. of Participants attended the program': {
        extractor: (item) => item.participants !== undefined ? String(item.participants) : null,
        priority: 5,
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
