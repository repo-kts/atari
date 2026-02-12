import { ENTITY_TYPES } from '../constants/entityTypes';

// Extended entity type for all masters
export type ExtendedEntityType = typeof ENTITY_TYPES[keyof typeof ENTITY_TYPES];

// Re-export from entityTypeUtils for backward compatibility
import { getEntityTypeFromPathMap } from './entityTypeUtils';
export const getEntityTypeFromPath = getEntityTypeFromPathMap;

// Re-export from idFieldMap for backward compatibility
import { getIdFieldFromMap } from './idFieldMap';
export const getIdField = getIdFieldFromMap;

// Re-export from fieldValueUtils for backward compatibility
import { getFieldValueConfig } from './fieldValueUtils';
export const getFieldValue = getFieldValueConfig;

// Legacy implementation (kept for reference, will be removed)
const getFieldValueLegacy = (item: any, field: string): string => {
    // Handle date fields first (before early return)
    if (field === 'dateOfJoining') {
        if (!item.dateOfJoining) return '-'
        try {
            const date = new Date(item.dateOfJoining)
            if (isNaN(date.getTime())) return '-'
            return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        } catch {
            return '-'
        }
    }

    // Handle vehicle field name mappings (before early return)
    if (field === 'registrationNumber') {
        return item.registrationNo || '-'
    }
    if (field === 'totalCost (Rs.)' || field === 'totalCost (Rs)') {
        if (item.totalCost === undefined || item.totalCost === null) return '-'
        return `₹${item.totalCost.toLocaleString('en-IN')}`
    }
    if (field === 'totalRun (Kms)') {
        if (!item.totalRun) return '-'
        return `${item.totalRun} Kms`
    }
    if (field === 'vehicleName') {
        return item.vehicleName || '-'
    }
    if (field === 'equipmentName') {
        return item.equipmentName || '-'
    }
    if (field === 'implementName') {
        return item.implementName || '-'
    }
    if (field === 'presentStatus') {
        if (!item.presentStatus) return '-'
        // Format enum values: WORKING -> Working, GOOD_CONDITION -> Good Condition, NEW -> New
        return item.presentStatus
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char: string) => char.toUpperCase())
    }

    if (field === 'dateOfBirth') {
        if (!item.dateOfBirth) return '-'
        try {
            const date = new Date(item.dateOfBirth)
            if (isNaN(date.getTime())) return '-'
            return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
        } catch {
            return '-'
        }
    }

    // Direct field access
    if (item[field] !== undefined && item[field] !== null && typeof item[field] !== 'object') return String(item[field])

    // Handle nested fields for related data
    if (field === 'zoneName') {
        // For states and districts: item.zone.zoneName
        if (item.zone?.zoneName) return item.zone.zoneName
        // For organizations: item.district.state.zone.zoneName
        if (item.district?.state?.zone?.zoneName) return item.district.state.zone.zoneName
        // Legacy: item.state.zone.zoneName (for backward compatibility)
        if (item.state?.zone?.zoneName) return item.state.zone.zoneName
    }

    if (field === 'stateName') {
        // For districts: item.state.stateName
        if (item.state?.stateName) return item.state.stateName
        // For organizations: item.district.state.stateName
        if (item.district?.state?.stateName) return item.district.state.stateName
    }

    if (field === 'districtName') {
        // Direct field
        if (item.districtName) return item.districtName
        // Nested: item.district.districtName
        if (item.district?.districtName) return item.district.districtName
    }

    if (field === 'orgName') {
        // Direct field
        if (item.orgName) return item.orgName
    }


    if (field === 'universityName') {
        // Direct field
        if (item.universityName) return item.universityName
    }

    // Handle nested organization.orgName for universities
    if (field === 'organization.orgName' || field === 'organizationName') {
        if (item.organization?.orgName) return item.organization.orgName
        // Legacy: item.organization.uniName (for backward compatibility)
        if (item.organization?.uniName) return item.organization.uniName
    }

    // Legacy support
    if (field === 'uniName' && item.uniName) return item.uniName


    // OFT/FLD specific nested fields
    if (field === 'subjectName' && item.subject?.subjectName) return item.subject.subjectName

    // Handle sectorName - can be direct or nested through category
    if (field === 'sectorName') {
        if (item.sector?.sectorName) return item.sector.sectorName
        // For subcategories: item.category.sector.sectorName
        if (item.category?.sector?.sectorName) return item.category.sector.sectorName
    }

    if (field === 'categoryName' && item.category?.categoryName) return item.category.categoryName
    if (field === 'subCategoryName' && item.subCategory?.subCategoryName) return item.subCategory.subCategoryName

    // CFLD specific fields
    if (field === 'seasonName' && item.season?.seasonName) return item.season.seasonName
    if (field === 'cropTypeName' && item.cropType?.typeName) return item.cropType.typeName
    if (field === 'cropName' && item.CropName) return item.CropName

    // Training fields
    if (field === 'trainingType') {
        if (item.trainingTypeName) return item.trainingTypeName
        if (item.trainingType?.trainingTypeName) return item.trainingType.trainingTypeName
    }
    if (field === 'trainingAreaName') {
        if (item.trainingAreaName) return item.trainingAreaName
        if (item.trainingArea?.trainingAreaName) return item.trainingArea.trainingAreaName
    }
    if (field === 'trainingThematicArea') {
        if (item.trainingThematicAreaName) return item.trainingThematicAreaName
        if (item.trainingThematicArea?.trainingThematicAreaName) return item.trainingThematicArea.trainingThematicAreaName
    }

    // Extension & Events fields
    if (field === 'name') {
        if (item.extensionName) return item.extensionName
        if (item.otherExtensionName) return item.otherExtensionName
    }
    if (field === 'eventName' && item.eventName) return item.eventName

    // Production & Projects fields
    if (field === 'productCategoryName') {
        if (item.productCategoryName) return item.productCategoryName
        if (item.productCategory?.productCategoryName) return item.productCategory.productCategoryName
    }
    if (field === 'productCategoryType') {
        if (item.productCategoryType) return item.productCategoryType
        if (item.productType?.productCategoryType) return item.productType.productCategoryType
    }
    if (field === 'productName' && item.productName) return item.productName
    if (field === 'cropName' && item.cropName) return item.cropName
    if (field === 'farmingSystemName' && item.farmingSystemName) return item.farmingSystemName
    if (field === 'enterpriseName' && item.enterpriseName) return item.enterpriseName // Lowercase field match

    // Publication specific fields
    if (field === 'publicationItem' && item.publicationName) return item.publicationName

    // About KVK specific fields and nested objects
    if (field === 'postName') return item.post?.post_name || item.post_name || '-'
    if (field === 'casteName') return item.caste?.caste_name || item.cast_category || '-'
    if (field === 'kvkName') return item.kvk?.kvkName || item.kvkName || '-'
    if (field === 'kvk') return item.kvk?.kvkName || '-'
    if (field === 'organizationName') return item.org?.orgName || item.organization?.orgName || item.organization?.uniName || item.uniName || '-'
    if (field === 'districtName') {
        if (item.districtName) return item.districtName
        if (item.district?.districtName) return item.district.districtName
    }
    if (field === 'accountType') return item.accountType || '-'
    if (field === 'accountName') return item.accountName || '-'
    if (field === 'bankName') return item.bankName || '-'
    if (field === 'accountNumber') return item.accountNumber || '-'
    if (field === 'location') return item.location || '-'
    if (field === 'mobile') return item.mobile || '-'
    if (field === 'email') return item.email || '-'
    if (field === 'address') return item.address || '-'
    if (field === 'hostOrganizationName') return item.hostOrg || '-'
    if (field === 'yearOfSanction') return item.yearOfSanction || '-'

    // KVK Employee/Staff specific fields
    if (field === 'staffName') return item.staffName || '-'
    if (field === 'position') return item.positionOrder !== undefined && item.positionOrder !== null ? String(item.positionOrder) : '-'
    if (field === 'sanctionedPost') return item.sanctionedPost?.postName || item.postName || '-'
    if (field === 'payScale') return item.payScale || '-'
    if (field === 'payLevel') {
        if (!item.payLevel) return '-'
        // Format pay level enum (e.g., LEVEL_10 -> Level 10)
        return item.payLevel.replace(/LEVEL_/i, 'Level ').replace(/(\d+)([A-Z])/g, '$1 $2')
    }

    if (field === 'jobType') {
        if (!item.jobType) return '-'
        return item.jobType === 'PERMANENT' ? 'Permanent' : item.jobType === 'TEMPORARY' ? 'Temporary' : item.jobType
    }
    if (field === 'detailsOfAllowences' || field === 'allowances') return item.allowances || '-'
    if (field === 'category') {
        if (!item.category) return '-'
        return item.category // SC, ST, OBC, GENERAL
    }
    if (field === 'transferStatus') {
        if (!item.transferStatus) return '-'
        return item.transferStatus === 'ACTIVE' ? 'Active' : item.transferStatus === 'TRANSFERRED' ? 'Transferred' : item.transferStatus
    }
    // Staff Transferred specific fields
    if (field === 'kvkNameBeforeTransfer') {
        // Show original KVK name (where staff was first created)
        return item.originalKvk?.kvkName || item.originalKvkId ? `KVK ${item.originalKvkId}` : item.kvk?.kvkName || '-'
    }
    if (field === 'latestKvkName') {
        // Show current/latest KVK name (where staff is now)
        return item.kvk?.kvkName || item.kvkName || '-'
    }
    if (field === 'photo' || field === 'photoPath') {
        if (!item.photoPath) return '-'
        // Return a clickable link or just the filename
        return item.photoPath
    }
    if (field === 'resume' || field === 'resumePath') {
        if (!item.resumePath) return '-'
        // Return a clickable link or just the filename
        return item.resumePath
    }
    if (field === 'discipline' || field === 'disciplineName') {
        return item.discipline?.disciplineName || item.disciplineName || '-'
    }

    // Infrastructure specific fields
    if (field === 'infraMasterName') return item.infraMaster?.name || '-'
    if (field === 'notYetStarted') return item.notYetStarted ? 'Yes' : 'No'
    if (field === 'completedPlinthLevel') return item.completedPlinthLevel ? 'Yes' : 'No'
    if (field === 'completedLintelLevel') return item.completedLintelLevel ? 'Yes' : 'No'
    if (field === 'completedRoofLevel') return item.completedRoofLevel ? 'Yes' : 'No'
    if (field === 'totallyCompleted') return item.totallyCompleted ? 'Yes' : 'No'
    if (field === 'plinthAreaSqM') return item.plinthAreaSqM ? `${item.plinthAreaSqM} m²` : '-'
    if (field === 'underUse') return item.underUse ? 'Yes' : 'No'
    if (field === 'sourceOfFunding') return item.sourceOfFunding || '-'
    if (field === 'sourceOfFund') {
        // Map sourceOfFund to sourceOfFunding (for equipment and farm implements)
        return item.sourceOfFunding || item.sourceOfFund || '-'
    }

    if (item[field] !== undefined && item[field] !== null) {
        if (typeof item[field] === 'object') return '-'
        return String(item[field])
    }

    return '-'
}
