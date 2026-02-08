import { ENTITY_TYPES } from '../constants/entityTypes';

// Extended entity type for all masters
export type ExtendedEntityType = typeof ENTITY_TYPES[keyof typeof ENTITY_TYPES];

// Map route paths to entity types
export const getEntityTypeFromPath = (path: string): ExtendedEntityType | null => {
    // Basic masters
    if (path.includes('/zones')) return ENTITY_TYPES.ZONES
    if (path.includes('/states')) return ENTITY_TYPES.STATES
    if (path.includes('/districts')) return ENTITY_TYPES.DISTRICTS
    if (path.includes('/organizations') || path.includes('/universities')) return ENTITY_TYPES.ORGANIZATIONS

    // OFT/FLD masters
    if (path === '/all-master/oft/subject') return ENTITY_TYPES.OFT_SUBJECTS
    if (path === '/all-master/oft/thematic-area') return ENTITY_TYPES.OFT_THEMATIC_AREAS
    if (path === '/all-master/fld/sector') return ENTITY_TYPES.FLD_SECTORS
    if (path === '/all-master/fld/thematic-area') return ENTITY_TYPES.FLD_THEMATIC_AREAS
    if (path === '/all-master/fld/category') return ENTITY_TYPES.FLD_CATEGORIES
    if (path === '/all-master/fld/sub-category') return ENTITY_TYPES.FLD_SUBCATEGORIES
    if (path === '/all-master/fld/crop') return ENTITY_TYPES.FLD_CROPS
    if (path === '/all-master/cfld-crop') return ENTITY_TYPES.CFLD_CROPS

    // Training, Extension & Events masters
    if (path === '/all-master/training-type') return ENTITY_TYPES.TRAINING_TYPES
    if (path === '/all-master/training-area') return ENTITY_TYPES.TRAINING_AREAS
    if (path === '/all-master/training-thematic') return ENTITY_TYPES.TRAINING_THEMATIC_AREAS
    if (path === '/all-master/extension-activity') return ENTITY_TYPES.EXTENSION_ACTIVITIES
    if (path === '/all-master/other-extension-activity') return ENTITY_TYPES.OTHER_EXTENSION_ACTIVITIES
    if (path === '/all-master/events') return ENTITY_TYPES.EVENTS

    // Production & Projects masters
    if (path === '/all-master/product-category') return ENTITY_TYPES.PRODUCT_CATEGORIES
    if (path === '/all-master/product-type') return ENTITY_TYPES.PRODUCT_TYPES
    if (path === '/all-master/product') return ENTITY_TYPES.PRODUCTS
    if (path === '/all-master/cra-croping-system') return ENTITY_TYPES.CRA_CROPPING_SYSTEMS
    if (path === '/all-master/cra-farming-system') return ENTITY_TYPES.CRA_FARMING_SYSTEMS
    if (path === '/all-master/arya-enterprise') return ENTITY_TYPES.ARYA_ENTERPRISES

    // Publication masters
    if (path === '/all-master/publication-item') return ENTITY_TYPES.PUBLICATION_ITEMS

    // About KVK entities
    if (path === '/forms/about-kvk/bank-account') return ENTITY_TYPES.KVK_BANK_ACCOUNTS
    if (path === '/forms/about-kvk/employee-details') return ENTITY_TYPES.KVK_EMPLOYEES
    if (path === '/forms/about-kvk/staff-transferred') return ENTITY_TYPES.KVK_STAFF_TRANSFERRED
    if (path === '/forms/about-kvk/infrastructure') return ENTITY_TYPES.KVK_INFRASTRUCTURE
    if (path === '/forms/about-kvk/vehicles') return ENTITY_TYPES.KVK_VEHICLES
    if (path === '/forms/about-kvk/vehicle-details') return ENTITY_TYPES.KVK_VEHICLE_DETAILS
    if (path === '/forms/about-kvk/equipments') return ENTITY_TYPES.KVK_EQUIPMENTS
    if (path === '/forms/about-kvk/equipment-details') return ENTITY_TYPES.KVK_EQUIPMENT_DETAILS
    if (path === '/forms/about-kvk/farm-implements') return ENTITY_TYPES.KVK_FARM_IMPLEMENTS
    if (path === '/forms/about-kvk/details') return ENTITY_TYPES.KVKS
    if (path === '/forms/about-kvk/view-kvks') return ENTITY_TYPES.KVKS

    return null
}

// Get ID field name based on entity type
export const getIdField = (entityType: ExtendedEntityType): string => {
    switch (entityType) {
        case ENTITY_TYPES.ZONES: return 'zoneId'
        case ENTITY_TYPES.STATES: return 'stateId'
        case ENTITY_TYPES.DISTRICTS: return 'districtId'
        case ENTITY_TYPES.ORGANIZATIONS: return 'orgId'
        case ENTITY_TYPES.OFT_SUBJECTS: return 'oftSubjectId'
        case ENTITY_TYPES.OFT_THEMATIC_AREAS: return 'oftThematicAreaId'
        case ENTITY_TYPES.FLD_SECTORS: return 'sectorId'
        case ENTITY_TYPES.FLD_THEMATIC_AREAS: return 'thematicAreaId'
        case ENTITY_TYPES.FLD_CATEGORIES: return 'categoryId'
        case ENTITY_TYPES.FLD_SUBCATEGORIES: return 'subCategoryId'
        case ENTITY_TYPES.FLD_CROPS: return 'cropId'
        case ENTITY_TYPES.CFLD_CROPS: return 'cfldId'
        case ENTITY_TYPES.TRAINING_TYPES: return 'trainingTypeId'
        case ENTITY_TYPES.TRAINING_AREAS: return 'trainingAreaId'
        case ENTITY_TYPES.TRAINING_THEMATIC_AREAS: return 'trainingThematicAreaId'
        case ENTITY_TYPES.EXTENSION_ACTIVITIES: return 'extensionActivityId'
        case ENTITY_TYPES.OTHER_EXTENSION_ACTIVITIES: return 'otherExtensionActivityId'
        case ENTITY_TYPES.EVENTS: return 'eventId'
        case ENTITY_TYPES.PRODUCT_CATEGORIES: return 'productCategoryId'
        case ENTITY_TYPES.PRODUCT_TYPES: return 'productTypeId'
        case ENTITY_TYPES.PRODUCTS: return 'productId'
        case ENTITY_TYPES.CRA_CROPPING_SYSTEMS: return 'craCropingSystemId'
        case ENTITY_TYPES.CRA_FARMING_SYSTEMS: return 'farmingSystemId'
        case ENTITY_TYPES.ARYA_ENTERPRISES: return 'aryaEnterpriseId'
        case ENTITY_TYPES.PUBLICATION_ITEMS: return 'publicationId'
        default: return 'id'
    }
}

// Get field value from item, handling nested objects
export const getFieldValue = (item: any, field: string): string => {
    // Direct field access
    if (item[field] !== undefined && item[field] !== null && typeof item[field] !== 'object') return String(item[field])

    // Handle nested fields for related data
    if (field === 'zoneName') {
        // For states and districts: item.zone.zoneName
        if (item.zone?.zoneName) return item.zone.zoneName
        // For organizations: item.state.zone.zoneName
        if (item.state?.zone?.zoneName) return item.state.zone.zoneName
    }

    if (field === 'stateName' && item.state?.stateName) return item.state.stateName
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

    if (item[field] !== undefined && item[field] !== null) {
        if (typeof item[field] === 'object') return '-'
        return String(item[field])
    }

    return '-'
}
