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
    'Name of Extension activities': {
        extractor: (item) => item['Name of Extension activities'] || item['Name of Extension Activities'] || item.activityName || item.extensionActivityType || item.extension_activity_type || (item.activity?.activityName) || item.activity_name || null,
        priority: 7,
    },
    'Name of Extension Activities': {
        extractor: (item) => item['Name of Extension Activities'] || item['Name of Extension activities'] || item.activityName || item.extensionActivityType || item.extension_activity_type || (item.activity?.activityName) || item.activity_name || null,
        priority: 7,
    },
    'Nature of Extension Activity': {
        extractor: (item) => item['Nature of Extension Activity'] || item['Nature of Extension activity'] || item.extensionActivityType || item.extensionActivityName || item.activity_name || (item.activity?.activityName) || null,
        priority: 7,
    },
    'Nature of Extension activity': {
        extractor: (item) => item['Nature of Extension activity'] || item['Nature of Extension Activity'] || item.extensionActivityType || item.extensionActivityName || item.activity_name || (item.activity?.activityName) || null,
        priority: 7,
    },
    'Important Days': {
        extractor: (item) => item['Important Days'] || item['Important days'] || item.importantDay || item.importantDays || (item.importantDay?.dayName) || item.dayName || item.day_name || null,
        priority: 7,
    },
    'Important days': {
        extractor: (item) => item['Important days'] || item['Important Days'] || item.importantDay || item.importantDays || (item.importantDay?.dayName) || item.dayName || item.day_name || null,
        priority: 7,
    },
    'No. of Activities': {
        extractor: (item) => {
            const val = item['No. of Activities'] || item['No. of activities'] || item.numberOfActivities || item.activityCount || item.number_of_activities;
            return val !== undefined && val !== null ? String(val) : null;
        },
        priority: 5,
    },
    'No. of activities': {
        extractor: (item) => {
            const val = item['No. of activities'] || item['No. of Activities'] || item.numberOfActivities || item.activityCount || item.number_of_activities;
            return val !== undefined && val !== null ? String(val) : null;
        },
        priority: 5,
    },
    'Type Of Activities': {
        extractor: (item) => item['Type Of Activities'] || item['Type of activities'] || item.typeOfActivities || item.activityType || null,
        priority: 5,
    },
    'Type of activities': {
        extractor: (item) => item['Type of activities'] || item['Type Of Activities'] || item.typeOfActivities || item.activityType || null,
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

    // CFLD Technical Parameter fields
    Month: {
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
    Type: {
        extractor: (item) => item.type || item.typeName || null,
    },
    Season: {
        extractor: (item) => item.seasonName || (item.season?.seasonName) || null,
    },
    Crop: {
        extractor: (item) => item.cropName || (item.crop?.cropName) || null,
    },
    Variety: {
        extractor: (item) => item.varietyName || null,
    },
    'Name of Variety': {
        extractor: (item) => item.varietyName || null,
    },
    Area: {
        extractor: (item) => item.areaHectare !== undefined ? String(item.areaHectare) : (item.areaInHa !== undefined ? String(item.areaInHa) : null),
    },
    'Area (in ha)': {
        extractor: (item) => item.areaHectare !== undefined ? String(item.areaHectare) : (item.areaInHa !== undefined ? String(item.areaInHa) : null),
    },
    'Demo Yield (Avg)': {
        extractor: (item) => item.yieldAvg !== undefined ? String(item.yieldAvg) : (item.demoYieldAvg !== undefined ? String(item.demoYieldAvg) : null),
    },
    '% Increase': {
        extractor: (item) => item.yieldIncreasePercent !== undefined ? `${item.yieldIncreasePercent}%` : (item.percentIncrease !== undefined ? `${item.percentIncrease}%` : null),
    },

    // ARYA fields
    Year: {
        extractor: (item) => item.yearName || (item.year?.yearName) || null,
    },
    Enterprise: {
        extractor: (item) => item.enterpriseName || (item.enterprise?.enterpriseName) || null,
    },
    Trainings: {
        extractor: (item) => item.noOfTraining !== undefined ? String(item.noOfTraining) : null,
    },
    Participants: {
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

    // CRA & NARI & FPO & NICRA fields
    Villages: {
        extractor: (item) => item.noOfVillages !== undefined ? String(item.noOfVillages) : null,
    },
    'Village Name': {
        extractor: (item) => item.villageName || null,
    },
    Farmers: {
        extractor: (item) => item.noOfFarmers !== undefined ? String(item.noOfFarmers) : null,
    },
    Households: {
        extractor: (item) => item.noOfHouseholds !== undefined ? String(item.noOfHouseholds) : null,
    },
    'Activity Type': {
        extractor: (item) => item.activityType || null,
    },
    Activity: {
        extractor: (item) => item.activity || null,
    },
    Activities: {
        extractor: (item) => item.noOfActivities !== undefined ? String(item.noOfActivities) : null,
    },
    Gardens: {
        extractor: (item) => item.noOfGardens !== undefined ? String(item.noOfGardens) : null,
    },
    Beneficiaries: {
        extractor: (item) => item.noOfBeneficiaries !== undefined ? String(item.noOfBeneficiaries) : null,
    },
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
    Courses: {
        extractor: (item) => item.noOfCourses !== undefined ? String(item.noOfCourses) : null,
    },
    // Soil and Water Testing
    'KVK NAME': {
        extractor: (item) => item.kvk?.kvkName || item.kvkName || null,
        priority: 7,
    },
    'KVK Name': {
        extractor: (item) => item.kvk?.kvkName || item.kvkName || null,
        priority: 7,
    },
    'Equipment Name': {
        extractor: (item) => item.equipmentName || null,
    },
    'Quantity': {
        extractor: (item) => item.quantity !== undefined ? String(item.quantity) : null,
    },
    'Analysis': {
        extractor: (item) => item.analysisName || null,
    },
    'No. of samples Analyzed': {
        extractor: (item) => item.samplesAnalysed !== undefined ? String(item.samplesAnalysed) : null,
    },
    'No. of Villages Covered': {
        extractor: (item) => item.villagesNumber !== undefined ? String(item.villagesNumber) : null,
    },
    'Amount Released': {
        extractor: (item) => item.amountRealized !== undefined ? `₹${item.amountRealized.toLocaleString('en-IN')}` : null,
    },
    'No. Of Activities Conducted': {
        extractor: (item) => item.activitiesConducted !== undefined ? String(item.activitiesConducted) : null,
    },
    'Soil Health Cards Distributed': {
        extractor: (item) => item.soilHealthCardDistributed !== undefined ? String(item.soilHealthCardDistributed) : null,
    },
    'Name(s) of VIP(s) Involved': {
        extractor: (item) => item.vipNames || null,
    },
    'Total No. of Participants attended the program': {
        extractor: (item) => item.participants !== undefined ? String(item.participants) : null,
    },
    'No. of VIP(s)': {
        extractor: (item) => item.vipNames ? String(item.vipNames.split(',').length) : '0',
    },
    'Reporting Year': {
        extractor: (item) => item.reportingYearLabel || item.reportingYear || null,
    },
    'Start Date': {
        extractor: (item) => {
            if (!item.startDate) return null;
            try {
                const date = new Date(item.startDate);
                return date.toLocaleDateString('en-GB');
            } catch { return null; }
        }
    },
    'End Date': {
        extractor: (item) => {
            if (!item.endDate) return null;
            try {
                const date = new Date(item.endDate);
                return date.toLocaleDateString('en-GB');
            } catch { return null; }
        }
    },
    'Event Date': {
        extractor: (item) => {
            const dateVal = item.eventDate || item.event_date || item['Event Date'];
            if (!dateVal) return null;
            try {
                const date = new Date(dateVal);
                return date.toLocaleDateString('en-GB');
            } catch { return null; }
        }
    },
    // Award Fields
    Award: {
        extractor: (item) => item.awardName || item.award_name || null,
        priority: 5,
    },
    Amount: {
        extractor: (item) => {
            if (item.amount === undefined || item.amount === null) return null;
            return `₹${Number(item.amount).toLocaleString('en-IN')}`;
        },
        priority: 5,
    },
    Achievement: {
        extractor: (item) => item.achievement || null,
        priority: 5,
    },
    'Conferring Authority': {
        extractor: (item) => item.conferringAuthority || item.conferring_authority || null,
        priority: 5,
    },
    'Head Scientist': {
        extractor: (item) => item.headScientist || item.head_scientist || null,
    },
    'Farmer Name': {
        extractor: (item) => item.farmerName || item.farmer_name || null,
    },
    'Address': {
        extractor: (item) => item.address || null,
    },
    'Contact Number': {
        extractor: (item) => item.contactNumber || item.contact_number || null,
    },
    'Staff': {
        extractor: (item) => item.staffName || item.staff_name || null,
    },
    'Course': {
        extractor: (item) => item.courseName || item.course_name || null,
    },
    'Organizer': {
        extractor: (item) => item.organizerVenue || item.organizer_venue || null,
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
