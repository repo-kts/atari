/**
 * Field Names Constants
 *
 * Single source of truth for all field names used in tables, forms, and data display.
 * This ensures consistency across the entire application and makes it easy to update
 * field names in one place.
 *
 * Naming Convention:
 * - All field names use camelCase (e.g., `kvkName`, `reportingYear`, `zoneName`)
 * - Table headers will automatically format these for display (split and uppercase)
 * - Special cases with units like "totalCost (Rs.)" are kept as-is
 *
 * Usage:
 *   import { FIELD_NAMES, FIELD_GROUPS } from '@/constants/fieldNames';
 *   fields: FIELD_GROUPS.ZONE_MASTER
 */

export const FIELD_NAMES = {
    // Common Fields
    ID: 'id',
    NAME: 'name',
    DATE: 'date',
    REMARK: 'remark',
    REMARKS: 'remarks',
    DATE_OF_BIRTH: 'dateOfBirth',

    // Basic Master Fields
    ZONE_NAME: 'zoneName',
    STATE_NAME: 'stateName',
    DISTRICT_NAME: 'districtName',
    ORG_NAME: 'orgName',
    ORGANIZATION_NAME: 'organizationName',
    UNIVERSITY_NAME: 'universityName',
    ORGANIZATION_ORG_NAME: 'organization.orgName',

    // OFT/FLD Master Fields
    SUBJECT_NAME: 'subjectName',
    THEMATIC_AREA_NAME: 'thematicAreaName',
    THEMATIC_AREAS_COUNT: 'thematicAreasCount',
    SECTOR_NAME: 'sectorName',
    CATEGORY_NAME: 'categoryName',
    SUB_CATEGORY_NAME: 'subCategoryName',
    CATEGORIES_COUNT: 'categoriesCount',
    SUB_CATEGORIES_COUNT: 'subCategoriesCount',
    CROPS_COUNT: 'cropsCount',
    CROP_NAME: 'cropName',
    ACTIVITY_NAME: 'activityName',
    SEASON_NAME: 'seasonName',
    CROP_TYPE_NAME: 'cropTypeName',

    // Training Master Fields
    TRAINING_TYPE: 'trainingType',
    TRAINING_AREA_NAME: 'trainingAreaName',
    TRAINING_THEMATIC_AREA: 'trainingThematicArea',

    // Product Master Fields
    PRODUCT_CATEGORY_NAME: 'productCategoryName',
    PRODUCT_CATEGORY_TYPE: 'productCategoryType',
    PRODUCT_NAME: 'productName',

    // CRA Master Fields
    FARMING_SYSTEM_NAME: 'farmingSystemName',

    // ARYA Master Fields
    ENTERPRISE_NAME: 'enterpriseName',

    // Publication Master Fields
    PUBLICATION_ITEM: 'publicationItem',

    // Other Master Fields
    LEVEL_NAME: 'levelName',
    DISCIPLINE_NAME: 'disciplineName',
    POST_NAME: 'postName',
    YEAR_NAME: 'yearName',
    TYPE_NAME: 'typeName',
    DAY_NAME: 'dayName',
    EVENT_NAME: 'eventName',

    // FLD Related Fields
    FLD: 'fld',
    FLD_NAME: 'fldName',
    FLD_ID: 'fldId',

    // Activity Fields
    ACTIVITY: 'activity',
    ACTIVITY_ID: 'activityId',
    ACTIVITY_DATE: 'activityDate',
    NUMBER_OF_ACTIVITIES: 'numberOfActivities',
    NO_OF_ACTIVITIES: 'noOfActivities',
    EXTENSION_ACTIVITIES_ORGANIZED: 'extensionActivitiesOrganized',
    TYPE_OF_ACTIVITIES: 'typeOfActivities',
    NO_OF_ACTIVITIES_CONDUCTED: 'noOfActivitiesConducted',

    // Participant Fields
    NUMBER_OF_PARTICIPANTS: 'numberOfParticipants',
    NO_OF_PARTICIPANTS: 'noOfParticipants',
    TOTAL_PARTICIPANTS: 'totalParticipants',
    PARTICIPANTS: 'participants',
    NO_OF_FARMERS_ATTENDED: 'noOfFarmersAttended',
    TOTAL_TRAINED_FARMERS: 'totalTrainedFarmers',
    TOTAL_PARTICIPANTS_ATTENDED: 'totalParticipantsAttended',

    // Crop Fields
    CROP: 'crop',
    CROP_ID: 'cropId',

    // Feedback Fields
    FEEDBACK: 'feedback',

    // Reporting Fields
    REPORTING_YEAR: 'reportingYear',
    REPORTING_YEAR_ID: 'reportingYearId',

    // Date Fields
    START_DATE: 'startDate',
    END_DATE: 'endDate',
    EVENT_DATE: 'eventDate',
    DATE_OF_REGISTRATION: 'dateOfRegistration',
    DATE_OF_JOINING: 'dateOfJoining',
    CLOSING_DATE: 'closingDate',
    RESTARTED_DATE: 'restartedDate',

    // KVK Fields
    KVK: 'kvk',
    KVK_NAME: 'kvkName',
    KVK_ID: 'kvkId',
    KVK_NAME_BEFORE_TRANSFER: 'kvkNameBeforeTransfer',
    LATEST_KVK_NAME: 'latestKvkName',
    YEAR_OF_SANCTION: 'yearOfSanction',

    // Category Fields
    CATEGORY: 'category',
    SUB_CATEGORY: 'subCategory',

    // Staff Fields
    STAFF: 'staff',
    STAFF_NAME: 'staffName',
    STAFF_ID: 'staffId',
    POSITION: 'position',
    SANCTIONED_POST: 'sanctionedPost',
    PAY_SCALE: 'payScale',
    JOB_TYPE: 'jobType',
    DETAILS_OF_ALLOWENCES: 'detailsOfAllowences',
    TRANSFER_STATUS: 'transferStatus',

    // Technology Fields
    TECHNOLOGY_NAME: 'technologyName',
    NAME_OF_TECHNOLOGY_DEMONSTRATED: 'nameOfTechnologyDemonstrated',
    RELATED_CROP_LIVESTOCK_TECHNOLOGY: 'relatedCropLivestockTechnology',

    // Status Fields
    ONGOING_COMPLETED: 'ongoingCompleted',
    STATUS: 'status',
    PRESENT_STATUS: 'presentStatus',

    // Problem Fields
    PROBLEM_DIAGNOSED: 'problemDiagnosed',

    // Trial Fields
    TRIAL_ON_FORM: 'trialOnForm',

    // Area Fields
    AREA: 'area',
    AREA_HA: 'areaHa',
    AREA_PRACTICING: 'areaPracticing',
    PLINTH_AREA_SQ_M: 'plinthAreaSqM',

    // Yield Fields
    YIELD: 'yield',
    DEMO_YIELD_AVG: 'demoYieldAvg',
    PERCENT_INCREASE: 'percentIncrease',

    // Month/Year Fields
    MONTH: 'month',
    YEAR: 'year',
    SEASON: 'season',

    // Type Fields
    TYPE: 'type',
    VARIETY: 'variety',

    // Fund Fields
    OVERALL_FUND_ALLOCATION: 'overallFundAllocation',
    SOURCE_OF_FUNDING: 'sourceOfFunding',
    SOURCE_OF_FUND: 'sourceOfFund',
    BUDGET_SANCTION: 'budgetSanction',
    BUDGET_EXPENDITURE: 'budgetExpenditure',
    COST_SANCTIONED: 'costSanctioned',
    FUNDS: 'funds',
    AMOUNT: 'amount',
    AMOUNT_REALIZED: 'amountRealized',
    AMOUNT_RELEASED: 'amountReleased',

    // Village Fields
    VILLAGE: 'village',
    VILLAGE_NAME: 'villageName',
    VILLAGES: 'villages',
    VILLAGES_COVERED: 'villagesCovered',
    NO_OF_VILLAGES_COVERED: 'noOfVillagesCovered',
    VILLAGE_COVERED_NO: 'villageCoveredNo',
    BLOCK_COVERED_NO: 'blockCoveredNo',
    DISTRICT_COVERED_NO: 'districtCoveredNo',
    BLOCKS_COVERED: 'blocksCovered',

    // Contact Fields
    MOBILE: 'mobile',
    EMAIL: 'email',
    ADDRESS: 'address',
    CONTACT_NUMBER: 'contactNumber',
    LOCATION: 'location',

    // Bank Account Fields
    ACCOUNT_TYPE: 'accountType',
    ACCOUNT_NAME: 'accountName',
    BANK_NAME: 'bankName',
    ACCOUNT_NUMBER: 'accountNumber',

    // Infrastructure Fields
    INFRA_MASTER_NAME: 'infraMasterName',
    NOT_YET_STARTED: 'notYetStarted',
    COMPLETED_PLINTH_LEVEL: 'completedPlinthLevel',
    COMPLETED_LINTEL_LEVEL: 'completedLintelLevel',
    COMPLETED_ROOF_LEVEL: 'completedRoofLevel',
    TOTALLY_COMPLETED: 'totallyCompleted',
    UNDER_USE: 'underUse',

    // Vehicle Fields
    VEHICLE_NAME: 'vehicleName',
    REGISTRATION_NO: 'registrationNo',
    REGISTRATION_NUMBER: 'registrationNumber',
    YEAR_OF_PURCHASE: 'yearOfPurchase',
    TOTAL_COST: 'totalCost',
    TOTAL_COST_RS: 'totalCost (Rs)',
    TOTAL_COST_RS_DOT: 'totalCost (Rs.)',
    TOTAL_RUN: 'totalRun',
    TOTAL_RUN_KMS: 'totalRun (Kms)',

    // Equipment Fields
    EQUIPMENT_NAME: 'equipmentName',

    // Farm Implement Fields
    IMPLEMENT_NAME: 'implementName',

    // Training Fields
    TRAINING_PROGRAM: 'trainingProgram',
    TRAINING_TITLE: 'trainingTitle',
    VENUE: 'venue',
    TRAINING_DISCIPLINE: 'trainingDiscipline',
    THEMATIC_AREA: 'thematicArea',
    ORGANIZER: 'organizer',
    COURSE: 'course',

    // Extension Activity Fields
    NAME_OF_EXTENSION_ACTIVITIES: 'nameOfExtensionActivities',
    NATURE_OF_EXTENSION_ACTIVITY: 'natureOfExtensionActivity',
    PLACE_OF_ACTIVITY: 'placeOfActivity',

    // Important Days Fields
    IMPORTANT_DAYS: 'importantDays',

    // Production & Supply Fields
    QUANTITY: 'quantity',

    // Publication Fields
    ITEM_NAME: 'itemName',
    TITLE: 'title',
    AUTHOR_NAME: 'authorName',
    JOURNAL_NAME: 'journalName',

    // Soil & Water Testing Fields
    ANALYSIS: 'analysis',
    NO_OF_SAMPLES_ANALYZED: 'noOfSamplesAnalyzed',
    SOIL_HEALTH_CARDS_DISTRIBUTED: 'soilHealthCardsDistributed',
    NO_OF_VIPS: 'noOfVips',
    VIP_NAMES: 'vipNames',

    // Award Fields
    AWARD: 'award',
    ACHIEVEMENT: 'achievement',
    CONFERRING_AUTHORITY: 'conferringAuthority',
    HEAD_SCIENTIST: 'headScientist',
    FARMER_NAME: 'farmerName',

    // HRD Fields

    // FPO Fields
    NO_OF_BLOCKS_ALLOCATED: 'noOfBlocksAllocated',
    NO_OF_FPOS_REGISTERED_AS_CBBO: 'noOfFposRegisteredAsCbbo',
    AVERAGE_MEMBERS_PER_FPO: 'averageMembersPerFpo',
    NAME_OF_THE_FPO: 'nameOfTheFpo',
    ADDRESS_OF_FPO: 'addressOfFpo',
    TOTAL_NUMBER_OF_BOM_MEMBERS: 'totalNumberOfBomMembers',
    FINANCIAL_POSITION: 'financialPosition',

    // ARYA Fields
    ENTERPRISE: 'enterprise',
    VIABLE_UNITS: 'viableUnits',
    CLOSED_UNITS: 'closedUnits',
    NO_OF_GROUPS_FORMED: 'noOfGroupsFormed',
    NO_OF_GROUPS_ACTIVE: 'noOfGroupsActive',
    TOTAL_CLOSED: 'totalClosed',
    TOTAL_RESTARTED: 'totalRestarted',

    // NARI Fields
    GARDENS: 'gardens',
    BENEFICIARIES: 'beneficiaries',
    FARMERS_INFLUENCED: 'farmersInfluenced',

    // Natural Farming Fields
    LAND_HOLDING: 'landHolding',
    // Agri-Drone Fields
    PROJECT_IMPLEMENTING_CENTRE_NAME: 'projectImplementingCentreName',
    COMPANY_OF_DRONE: 'companyOfDrone',
    MODEL_OF_DRONE: 'modelOfDrone',
    NO_OF_AGRI_DRONES_SANCTIONED: 'noOfAgriDronesSanctioned',
    NO_OF_AGRI_DRONES_PURCHASED: 'noOfAgriDronesPurchased',

    // CSISA Fields

    // TSP/SCSP Fields

    // NICRA Fields
    HOUSEHOLDS: 'households',
    FARMERS: 'farmers',

    // Photo/Resume Fields
    PHOTO: 'photo',
    RESUME: 'resume',
} as const;

/**
 * Field name groups for specific features/routes
 * These can be used to quickly reference all fields for a feature
 */
export const FIELD_GROUPS = {
    // All Masters - Basic Masters
    ZONE_MASTER: [FIELD_NAMES.ZONE_NAME] as const,
    STATE_MASTER: [FIELD_NAMES.ZONE_NAME, FIELD_NAMES.STATE_NAME] as const,
    DISTRICT_MASTER: [FIELD_NAMES.ZONE_NAME, FIELD_NAMES.STATE_NAME, FIELD_NAMES.DISTRICT_NAME] as const,
    ORGANIZATION_MASTER: [FIELD_NAMES.ZONE_NAME, FIELD_NAMES.STATE_NAME, FIELD_NAMES.DISTRICT_NAME, FIELD_NAMES.ORG_NAME] as const,
    UNIVERSITY_MASTER: ['organization.orgName', FIELD_NAMES.UNIVERSITY_NAME] as const,

    // All Masters - OFT Masters
    OFT_SUBJECT_MASTER: [FIELD_NAMES.SUBJECT_NAME, FIELD_NAMES.THEMATIC_AREAS_COUNT] as const,
    OFT_THEMATIC_AREA_MASTER: [FIELD_NAMES.THEMATIC_AREA_NAME, FIELD_NAMES.SUBJECT_NAME] as const,

    // All Masters - FLD Masters
    FLD_SECTOR_MASTER: [FIELD_NAMES.SECTOR_NAME, FIELD_NAMES.CATEGORIES_COUNT] as const,
    FLD_THEMATIC_AREA_MASTER: [FIELD_NAMES.THEMATIC_AREA_NAME, FIELD_NAMES.SECTOR_NAME] as const,
    FLD_CATEGORY_MASTER: [FIELD_NAMES.CATEGORY_NAME, FIELD_NAMES.SECTOR_NAME, FIELD_NAMES.SUB_CATEGORIES_COUNT] as const,
    FLD_SUBCATEGORY_MASTER: [FIELD_NAMES.SUB_CATEGORY_NAME, FIELD_NAMES.CATEGORY_NAME, FIELD_NAMES.SECTOR_NAME, FIELD_NAMES.CROPS_COUNT] as const,
    FLD_CROP_MASTER: [FIELD_NAMES.CROP_NAME, FIELD_NAMES.SUB_CATEGORY_NAME, FIELD_NAMES.CATEGORY_NAME] as const,
    FLD_ACTIVITY_MASTER: [FIELD_NAMES.ACTIVITY_NAME] as const,

    // All Masters - CFLD Masters
    CFLD_CROP_MASTER: [FIELD_NAMES.SEASON_NAME, FIELD_NAMES.CROP_TYPE_NAME, FIELD_NAMES.CROP_NAME] as const,

    // All Masters - Training Masters
    TRAINING_TYPE_MASTER: [FIELD_NAMES.TRAINING_TYPE] as const,
    TRAINING_AREA_MASTER: [FIELD_NAMES.TRAINING_TYPE, FIELD_NAMES.TRAINING_AREA_NAME] as const,
    TRAINING_THEMATIC_AREA_MASTER: [FIELD_NAMES.TRAINING_AREA_NAME, FIELD_NAMES.TRAINING_THEMATIC_AREA] as const,
    TRAINING_CLIENTELE_MASTER: [FIELD_NAMES.NAME] as const,
    FUNDING_SOURCE_MASTER: [FIELD_NAMES.NAME] as const,

    // All Masters - Extension & Events
    EXTENSION_ACTIVITY_MASTER: [FIELD_NAMES.NAME] as const,
    OTHER_EXTENSION_ACTIVITY_MASTER: [FIELD_NAMES.NAME] as const,
    EVENTS_MASTER: [FIELD_NAMES.EVENT_NAME] as const,

    // All Masters - Product Masters
    PRODUCT_CATEGORY_MASTER: [FIELD_NAMES.PRODUCT_CATEGORY_NAME] as const,
    PRODUCT_TYPE_MASTER: [FIELD_NAMES.PRODUCT_CATEGORY_NAME, FIELD_NAMES.PRODUCT_CATEGORY_TYPE] as const,
    PRODUCT_MASTER: [FIELD_NAMES.PRODUCT_CATEGORY_NAME, FIELD_NAMES.PRODUCT_CATEGORY_TYPE, FIELD_NAMES.PRODUCT_NAME] as const,

    // All Masters - CRA Masters
    CRA_CROPPING_SYSTEM_MASTER: [FIELD_NAMES.SEASON_NAME, FIELD_NAMES.CROP_NAME] as const,
    CRA_FARMING_SYSTEM_MASTER: [FIELD_NAMES.SEASON_NAME, FIELD_NAMES.FARMING_SYSTEM_NAME] as const,

    // All Masters - ARYA Masters
    ARYA_ENTERPRISE_MASTER: [FIELD_NAMES.ENTERPRISE_NAME] as const,

    // All Masters - Publications
    PUBLICATION_ITEM_MASTER: [FIELD_NAMES.PUBLICATION_ITEM] as const,

    // All Masters - Other Masters
    STAFF_CATEGORY_MASTER: [FIELD_NAMES.CATEGORY_NAME] as const,
    PAY_LEVEL_MASTER: [FIELD_NAMES.LEVEL_NAME] as const,
    DISCIPLINE_MASTER: [FIELD_NAMES.DISCIPLINE_NAME] as const,
    SANCTIONED_POST_MASTER: [FIELD_NAMES.POST_NAME] as const,
    SEASON_MASTER: [FIELD_NAMES.SEASON_NAME] as const,
    YEAR_MASTER: [FIELD_NAMES.YEAR_NAME] as const,
    CROP_TYPE_MASTER: [FIELD_NAMES.TYPE_NAME] as const,
    INFRASTRUCTURE_MASTER: [FIELD_NAMES.NAME] as const,
    IMPORTANT_DAY_MASTER: [FIELD_NAMES.DAY_NAME] as const,

    // About KVK Routes
    VIEW_KVKS: [
        FIELD_NAMES.ZONE_NAME,
        FIELD_NAMES.STATE_NAME,
        FIELD_NAMES.ORGANIZATION_NAME,
        FIELD_NAMES.DISTRICT_NAME,
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.MOBILE,
        FIELD_NAMES.EMAIL,
        FIELD_NAMES.ADDRESS,
        FIELD_NAMES.YEAR_OF_SANCTION,
    ] as const,
    BANK_ACCOUNT_DETAILS: [
        FIELD_NAMES.KVK,
        FIELD_NAMES.ACCOUNT_TYPE,
        FIELD_NAMES.ACCOUNT_NAME,
        FIELD_NAMES.BANK_NAME,
        FIELD_NAMES.LOCATION,
        FIELD_NAMES.ACCOUNT_NUMBER,
    ] as const,
    EMPLOYEE_DETAILS: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.PHOTO,
        FIELD_NAMES.RESUME,
        FIELD_NAMES.STAFF_NAME,
        FIELD_NAMES.POSITION,
        FIELD_NAMES.MOBILE,
        FIELD_NAMES.EMAIL,
        FIELD_NAMES.SANCTIONED_POST,
        FIELD_NAMES.PAY_SCALE,
        FIELD_NAMES.DATE_OF_JOINING,
        FIELD_NAMES.JOB_TYPE,
        FIELD_NAMES.DETAILS_OF_ALLOWENCES,
        FIELD_NAMES.CATEGORY,
        FIELD_NAMES.TRANSFER_STATUS,
    ] as const,
    STAFF_TRANSFERRED: [
        FIELD_NAMES.STAFF_NAME,
        FIELD_NAMES.KVK_NAME_BEFORE_TRANSFER,
        FIELD_NAMES.LATEST_KVK_NAME,
    ] as const,
    INFRASTRUCTURE_DETAILS: [
        FIELD_NAMES.KVK,
        FIELD_NAMES.INFRA_MASTER_NAME,
        FIELD_NAMES.NOT_YET_STARTED,
        FIELD_NAMES.COMPLETED_PLINTH_LEVEL,
        FIELD_NAMES.COMPLETED_LINTEL_LEVEL,
        FIELD_NAMES.COMPLETED_ROOF_LEVEL,
        FIELD_NAMES.TOTALLY_COMPLETED,
        FIELD_NAMES.PLINTH_AREA_SQ_M,
        FIELD_NAMES.UNDER_USE,
        FIELD_NAMES.SOURCE_OF_FUNDING,
    ] as const,
    VIEW_VEHICLES: [
        FIELD_NAMES.VEHICLE_NAME,
        FIELD_NAMES.REGISTRATION_NO,
        FIELD_NAMES.YEAR_OF_PURCHASE,
        FIELD_NAMES.TOTAL_COST,
        FIELD_NAMES.TOTAL_RUN,
        FIELD_NAMES.PRESENT_STATUS,
    ] as const,
    VEHICLE_DETAILS: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.VEHICLE_NAME,
        FIELD_NAMES.REGISTRATION_NUMBER,
        FIELD_NAMES.YEAR_OF_PURCHASE,
        FIELD_NAMES.TOTAL_COST_RS_DOT,
        FIELD_NAMES.TOTAL_RUN_KMS,
        FIELD_NAMES.REPORTING_YEAR,
        FIELD_NAMES.PRESENT_STATUS,
    ] as const,
    VIEW_EQUIPMENTS: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.EQUIPMENT_NAME,
        FIELD_NAMES.YEAR_OF_PURCHASE,
        FIELD_NAMES.TOTAL_COST_RS,
        FIELD_NAMES.PRESENT_STATUS,
        FIELD_NAMES.SOURCE_OF_FUND,
    ] as const,
    EQUIPMENT_DETAILS: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.EQUIPMENT_NAME,
        FIELD_NAMES.YEAR_OF_PURCHASE,
        FIELD_NAMES.TOTAL_COST_RS,
        FIELD_NAMES.REPORTING_YEAR,
        FIELD_NAMES.PRESENT_STATUS,
        FIELD_NAMES.SOURCE_OF_FUND,
    ] as const,
    FARM_IMPLEMENT_DETAILS: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.IMPLEMENT_NAME,
        FIELD_NAMES.YEAR_OF_PURCHASE,
        FIELD_NAMES.TOTAL_COST_RS,
        FIELD_NAMES.PRESENT_STATUS,
        FIELD_NAMES.SOURCE_OF_FUND,
    ] as const,

    // Projects Routes - CFLD
    CFLD_TECHNICAL_PARAMETER: [
        FIELD_NAMES.MONTH,
        FIELD_NAMES.TYPE,
        FIELD_NAMES.SEASON,
        FIELD_NAMES.CROP,
        FIELD_NAMES.VARIETY,
        FIELD_NAMES.AREA,
        'Demo Yield (Avg)',
        FIELD_NAMES.PERCENT_INCREASE,
    ] as const,
    CFLD_EXTENSION_ACTIVITY: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.SEASON,
        FIELD_NAMES.EXTENSION_ACTIVITIES_ORGANIZED,
        FIELD_NAMES.DATE,
        FIELD_NAMES.PLACE_OF_ACTIVITY,
        FIELD_NAMES.NO_OF_FARMERS_ATTENDED,
    ] as const,
    CFLD_BUDGET_UTILIZATION: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.CROP,
        FIELD_NAMES.SEASON,
        FIELD_NAMES.OVERALL_FUND_ALLOCATION,
    ] as const,

    // Projects Routes - CRA
    CRA_DETAILS: [
        FIELD_NAMES.MONTH,
        FIELD_NAMES.YEAR,
        FIELD_NAMES.VILLAGES,
        FIELD_NAMES.FARMERS,
        FIELD_NAMES.AREA_HA,
    ] as const,
    CRA_EXTENSION_ACTIVITY: [
        FIELD_NAMES.MONTH,
        FIELD_NAMES.YEAR,
        'Activity Type',
        FIELD_NAMES.ACTIVITY,
        FIELD_NAMES.PARTICIPANTS,
    ] as const,

    // Projects Routes - FPO
    FPO_DETAILS: [
        FIELD_NAMES.REPORTING_YEAR,
        FIELD_NAMES.NO_OF_BLOCKS_ALLOCATED,
        FIELD_NAMES.NO_OF_FPOS_REGISTERED_AS_CBBO,
        FIELD_NAMES.AVERAGE_MEMBERS_PER_FPO,
    ] as const,
    FPO_MANAGEMENT: [
        FIELD_NAMES.KVK_NAME,
        'Registration No',
        FIELD_NAMES.DATE_OF_REGISTRATION,
        FIELD_NAMES.NAME_OF_THE_FPO,
        FIELD_NAMES.ADDRESS_OF_FPO,
        FIELD_NAMES.TOTAL_NUMBER_OF_BOM_MEMBERS,
        FIELD_NAMES.FINANCIAL_POSITION,
    ] as const,

    // Projects Routes - DRMR
    DRMR_DETAILS: [
        FIELD_NAMES.MONTH,
        FIELD_NAMES.YEAR,
        FIELD_NAMES.CROP,
        FIELD_NAMES.VARIETY,
        FIELD_NAMES.AREA_HA,
    ] as const,

    // Projects Routes - NARI
    NARI_NUTRI_SMART: [
        FIELD_NAMES.MONTH,
        FIELD_NAMES.YEAR,
        FIELD_NAMES.GARDENS,
        FIELD_NAMES.AREA_HA,
        FIELD_NAMES.BENEFICIARIES,
    ] as const,
    NARI_BIO_FORTIFIED: [
        FIELD_NAMES.YEAR,
        FIELD_NAMES.VILLAGE,
        FIELD_NAMES.SEASON,
        FIELD_NAMES.ACTIVITY,
        FIELD_NAMES.CROP,
        FIELD_NAMES.VARIETY,
        FIELD_NAMES.AREA_HA,
    ] as const,

    // Projects Routes - ARYA
    ARYA_CURRENT: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.ENTERPRISE,
        FIELD_NAMES.VIABLE_UNITS,
        FIELD_NAMES.CLOSED_UNITS,
        FIELD_NAMES.START_DATE,
        FIELD_NAMES.END_DATE,
        FIELD_NAMES.NO_OF_GROUPS_FORMED,
        FIELD_NAMES.NO_OF_GROUPS_ACTIVE,
    ] as const,
    ARYA_EVALUATION: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.ENTERPRISE,
        FIELD_NAMES.TOTAL_CLOSED,
        FIELD_NAMES.CLOSING_DATE,
        FIELD_NAMES.TOTAL_RESTARTED,
        FIELD_NAMES.RESTARTED_DATE,
    ] as const,

    // Projects Routes - CSISA
    CSISA: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.SEASON,
        FIELD_NAMES.VILLAGE_COVERED_NO,
        FIELD_NAMES.BLOCK_COVERED_NO,
        FIELD_NAMES.DISTRICT_COVERED_NO,
    ] as const,

    // Projects Routes - TSP/SCSP
    TSP_SCSP: [
        FIELD_NAMES.YEAR,
        FIELD_NAMES.TYPE,
        FIELD_NAMES.ACTIVITY,
        FIELD_NAMES.BENEFICIARIES,
        FIELD_NAMES.FUNDS,
    ] as const,

    // Projects Routes - NICRA
    NICRA_BASIC_INFORMATION: [
        FIELD_NAMES.YEAR,
        FIELD_NAMES.VILLAGE_NAME,
        FIELD_NAMES.HOUSEHOLDS,
    ] as const,
    NICRA_EXTENSION_ACTIVITY: [
        FIELD_NAMES.ACTIVITY_NAME,
        FIELD_NAMES.START_DATE,
        FIELD_NAMES.END_DATE,
        FIELD_NAMES.VENUE,
    ] as const,

    // Projects Routes - Natural Farming
    NATURAL_FARMING_DEMONSTRATION: [
        FIELD_NAMES.FARMER_NAME,
        FIELD_NAMES.VILLAGE_NAME,
        FIELD_NAMES.CROP,
        FIELD_NAMES.VARIETY,
        FIELD_NAMES.SEASON,
    ] as const,
    NATURAL_FARMING_FARMERS_PRACTICING: [
        FIELD_NAMES.FARMER_NAME,
        FIELD_NAMES.VILLAGE_NAME,
        FIELD_NAMES.CONTACT_NUMBER,
        FIELD_NAMES.LAND_HOLDING,
        FIELD_NAMES.AREA_PRACTICING,
    ] as const,
    NATURAL_FARMING_BENEFICIARIES: [
        FIELD_NAMES.YEAR,
        FIELD_NAMES.BLOCKS_COVERED,
        FIELD_NAMES.VILLAGES_COVERED,
        FIELD_NAMES.TOTAL_TRAINED_FARMERS,
        FIELD_NAMES.FARMERS_INFLUENCED,
    ] as const,
    NATURAL_FARMING_BUDGET_EXPENDITURE: [
        FIELD_NAMES.YEAR,
        FIELD_NAMES.ACTIVITY_NAME,
        FIELD_NAMES.NUMBER_OF_ACTIVITIES,
        FIELD_NAMES.BUDGET_SANCTION,
        FIELD_NAMES.BUDGET_EXPENDITURE,
    ] as const,

    // Projects Routes - Agri-Drone
    AGRI_DRONE: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.YEAR,
        FIELD_NAMES.PROJECT_IMPLEMENTING_CENTRE_NAME,
        FIELD_NAMES.COMPANY_OF_DRONE,
        FIELD_NAMES.MODEL_OF_DRONE,
        FIELD_NAMES.NO_OF_AGRI_DRONES_SANCTIONED,
        FIELD_NAMES.NO_OF_AGRI_DRONES_PURCHASED,
        FIELD_NAMES.COST_SANCTIONED,
    ] as const,

    // Projects Routes - Seed Hub
    SEED_HUB_PROGRAM: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.SEASON,
        FIELD_NAMES.CROP_NAME,
        FIELD_NAMES.VARIETY,
        'Area(ha)',
        'Yield(ha)',
    ] as const,

    // Achievements Routes - OFT & FLD
    OFT: [
        FIELD_NAMES.REPORTING_YEAR,
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.STAFF,
        FIELD_NAMES.TRIAL_ON_FORM,
        FIELD_NAMES.PROBLEM_DIAGNOSED,
        FIELD_NAMES.ONGOING_COMPLETED,
    ] as const,
    FLD_BASE: [
        FIELD_NAMES.REPORTING_YEAR,
        FIELD_NAMES.START_DATE,
        FIELD_NAMES.END_DATE,
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.CATEGORY,
        FIELD_NAMES.SUB_CATEGORY,
        FIELD_NAMES.NAME_OF_TECHNOLOGY_DEMONSTRATED,
        FIELD_NAMES.ONGOING_COMPLETED,
    ] as const,
    FLD_EXTENSION_TRAINING: [
        FIELD_NAMES.FLD_NAME,
        FIELD_NAMES.ACTIVITY,
        FIELD_NAMES.DATE,
        FIELD_NAMES.NUMBER_OF_ACTIVITIES,
        FIELD_NAMES.NUMBER_OF_PARTICIPANTS,
        FIELD_NAMES.REMARK,
    ] as const,
    FLD_TECHNICAL_FEEDBACK: [
        FIELD_NAMES.FLD,
        FIELD_NAMES.CROP,
        FIELD_NAMES.FEEDBACK,
    ] as const,

    // Achievements Routes - Trainings
    TRAININGS: [
        FIELD_NAMES.REPORTING_YEAR,
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.START_DATE,
        FIELD_NAMES.END_DATE,
        FIELD_NAMES.TRAINING_PROGRAM,
        FIELD_NAMES.TRAINING_TITLE,
        FIELD_NAMES.VENUE,
        FIELD_NAMES.TRAINING_DISCIPLINE,
        FIELD_NAMES.THEMATIC_AREA,
    ] as const,

    // Achievements Routes - Extension Activities
    EXTENSION_ACTIVITIES: [
        FIELD_NAMES.REPORTING_YEAR,
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.START_DATE,
        FIELD_NAMES.END_DATE,
        FIELD_NAMES.NAME_OF_EXTENSION_ACTIVITIES,
        FIELD_NAMES.NO_OF_ACTIVITIES,
        FIELD_NAMES.NO_OF_PARTICIPANTS,
    ] as const,
    OTHER_EXTENSION: [
        FIELD_NAMES.REPORTING_YEAR,
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.NATURE_OF_EXTENSION_ACTIVITY,
        FIELD_NAMES.NO_OF_ACTIVITIES,
    ] as const,

    // Achievements Routes - Technology Week
    TECHNOLOGY_WEEK: [
        FIELD_NAMES.START_DATE,
        FIELD_NAMES.END_DATE,
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.TYPE_OF_ACTIVITIES,
        FIELD_NAMES.NO_OF_ACTIVITIES,
        FIELD_NAMES.RELATED_CROP_LIVESTOCK_TECHNOLOGY,
        FIELD_NAMES.NO_OF_PARTICIPANTS,
    ] as const,

    // Achievements Routes - Celebration Days
    CELEBRATION_DAYS: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.IMPORTANT_DAYS,
        FIELD_NAMES.EVENT_DATE,
        FIELD_NAMES.NO_OF_ACTIVITIES,
    ] as const,

    // Achievements Routes - Production & Supply
    PRODUCTION_SUPPLY: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.CATEGORY,
        FIELD_NAMES.VARIETY,
        FIELD_NAMES.QUANTITY,
    ] as const,

    // Achievements Routes - Publications
    PUBLICATIONS: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.ITEM_NAME,
        FIELD_NAMES.TITLE,
        FIELD_NAMES.AUTHOR_NAME,
        FIELD_NAMES.JOURNAL_NAME,
    ] as const,

    // Achievements Routes - Soil Equipment
    SOIL_EQUIPMENT: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.ANALYSIS,
        FIELD_NAMES.EQUIPMENT_NAME,
        FIELD_NAMES.QUANTITY,
    ] as const,

    // Achievements Routes - Soil Analysis
    SOIL_ANALYSIS: [
        'KVK NAME',
        FIELD_NAMES.START_DATE,
        FIELD_NAMES.END_DATE,
        FIELD_NAMES.ANALYSIS,
        FIELD_NAMES.NO_OF_SAMPLES_ANALYZED,
        FIELD_NAMES.NO_OF_VILLAGES_COVERED,
        FIELD_NAMES.AMOUNT_RELEASED,
    ] as const,

    // Achievements Routes - World Soil Day
    WORLD_SOIL_DAY: [
        'KVK NAME',
        FIELD_NAMES.NO_OF_ACTIVITIES_CONDUCTED,
        FIELD_NAMES.SOIL_HEALTH_CARDS_DISTRIBUTED,
        FIELD_NAMES.NO_OF_VIPS,
        FIELD_NAMES.VIP_NAMES,
        FIELD_NAMES.TOTAL_PARTICIPANTS_ATTENDED,
    ] as const,

    // Achievements Routes - Awards
    AWARDS_KVK: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.AWARD,
        FIELD_NAMES.AMOUNT,
        FIELD_NAMES.ACHIEVEMENT,
        FIELD_NAMES.CONFERRING_AUTHORITY,
    ] as const,
    AWARDS_SCIENTIST: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.HEAD_SCIENTIST,
        FIELD_NAMES.AWARD,
        FIELD_NAMES.AMOUNT,
        FIELD_NAMES.ACHIEVEMENT,
        FIELD_NAMES.CONFERRING_AUTHORITY,
    ] as const,
    AWARDS_FARMER: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.FARMER_NAME,
        FIELD_NAMES.ADDRESS,
        FIELD_NAMES.CONTACT_NUMBER,
        FIELD_NAMES.AWARD,
        FIELD_NAMES.AMOUNT,
        FIELD_NAMES.ACHIEVEMENT,
        FIELD_NAMES.CONFERRING_AUTHORITY,
    ] as const,

    // Achievements Routes - HRD
    HRD: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.STAFF,
        FIELD_NAMES.COURSE,
        FIELD_NAMES.START_DATE,
        FIELD_NAMES.END_DATE,
        FIELD_NAMES.ORGANIZER,
    ] as const,
} as const;
