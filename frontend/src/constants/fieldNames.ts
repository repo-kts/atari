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
    PURPOSE: 'purpose',

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
    SPECIFIC_AREA_NAME: 'specificAreaName',

    // Product Master Fields
    PRODUCT_CATEGORY_NAME: 'productCategoryName',
    PRODUCT_CATEGORY_TYPE: 'productCategoryType',
    PRODUCT_NAME: 'productName',

    // CRA Master Fields
    FARMING_SYSTEM_NAME: 'farmingSystemName',

    // ARYA Master Fields
    ENTERPRISE_NAME: 'enterpriseName',
    ENTERPRISE_TYPE_NAME: 'enterpriseTypeName',

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
    AREA_IN_ACRE: 'areaInAcre',
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
    EXPENDITURE: 'expenditure',
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
    ANALYSIS_NAME: 'analysisName',
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

    // CFLD Fields
    TECHNOLOGY_DEMONSTRATED: 'technologyDemonstrated',
    NUMBER_OF_FARMERS: 'numberOfFarmers',
    DISTRICT_YIELD: 'districtYield',
    STATE_YIELD: 'stateYield',
    POTENTIAL_YIELD: 'potentialYield',
    ACTION: 'action',

    // CRA Fields
    WITHIN_STATE_WITHOUT_STATE: 'withinStateWithoutState',
    EXPOSURE_VISIT_NO: 'exposureVisitNo',
    NUMBER_OF_FARMERS_UNDER_EXPOSURE: 'numberOfFarmersUnderExposure',

    // FPO Fields
    TRAINING_RECEIVED_BY_FPO_MEMBERS: 'trainingReceivedByFpoMembers',
    IS_BUSINESS_PLAN_PREPARED: 'isBusinessPlanPrepared',
    NO_OF_FPO_RECEIVED_MANAGEMENT_COST: 'noOfFpoReceivedManagementCost',

    // DRMR Fields
    VARIETIES_USED_IN_IP: 'varietiesUsedInIp',
    SITUATIONS: 'situations',
    VARIETIES_USED_IN_FP: 'varietiesUsedInFp',
    NET_RETURN_IMPROVED_PRACTICE: 'netReturnImprovedPractice',
    NET_RETURN_FARMER_PRACTICE: 'netReturnFarmerPractice',
    FRONTLINE_DEMONSTRATION: 'frontlineDemonstration',
    AWARENESS_CAMPS: 'awarenessCamps',
    DISTRIBUTION_OF_LITERATURE: 'distributionOfLiterature',
    KISAN_MELA: 'kisanMela',

    // NARI Fields
    NAME_OF_NUTRI_SMART_VILLAGE: 'nameOfNutriSmartVillage',
    TYPE_OF_NUTRITIONAL_GARDEN: 'typeOfNutritionalGarden',
    NUMBERS: 'numbers',
    AREA_SQM: 'areaSqm',
    CATEGORY_OF_CROP: 'categoryOfCrop',
    NAME_OF_VALUE_ADDED_PRODUCT: 'nameOfValueAddedProduct',
    AREA_OF_TRAINING: 'areaOfTraining',
    TITLE_OF_TRAINING: 'titleOfTraining',

    // TSP/SCSP Fields
    NO_OF_TRAINING: 'noOfTraining',

    // NICRA Fields
    RF_MM_DISTRICT_NORMAL: 'rfMmDistrictNormal',
    RF_MM_DISTRICT_RECEIVED: 'rfMmDistrictReceived',
    MAX_TEMPERATURE: 'maxTemperature',
    MIN_TEMPERATURE: 'minTemperature',
    SEED_BANK_FODDER_BANK: 'seedBankFodderBank',
    QUANTITY_IN_Q: 'quantityInQ',
    REVENUE: 'revenue',
    TOTAL: 'total',
    NAME_OF_FARM_IMPLEMENT_EQUIPMENT: 'nameOfFarmImplementEquipment',
    NO_OF_FARMERS_USED_IMPLEMENT: 'noOfFarmersUsedImplement',
    AREA_COVERED_BY_FARM_IMPLEMENT: 'areaCoveredByFarmImplement',
    FARM_IMPLEMENT_USED_IN_HOURS: 'farmImplementUsedInHours',
    REVENUE_GENERATED_BY_FARM_IMPLEMENT: 'revenueGeneratedByFarmImplement',
    EXPENDITURE_INCURRED_ON_REPAIRING: 'expenditureIncurredOnRepairing',
    VCRMC_CONSTITUTION_DATE: 'vcrmcConstitutionDate',
    VCRMC_MEMBERS_NO: 'vcrmcMembersNo',
    MEETINGS_ORGANIZED_BY_VCRMC: 'meetingsOrganizedByVcrmc',
    DATE_OF_VCRMC_MEETING: 'dateOfVcrmcMeeting',
    NAME_OF_SECRETARY: 'nameOfSecretary',
    NAME_OF_PRESIDENT: 'nameOfPresident',
    NO_OF_SOIL_SAMPLES_COLLECTED: 'noOfSoilSamplesCollected',
    NO_OF_SAMPLES_ANALYSED: 'noOfSamplesAnalysed',
    SHC_ISSUED: 'shcIssued',
    NO_OF_FARMERS_BENEFITTED: 'noOfFarmersBenefitted',
    DEVELOPMENT_SCHEME_PROGRAMME: 'developmentSchemeProgramme',
    NATURE_OF_WORK: 'natureOfWork',
    VIP_EXPERTS: 'vipExperts',
    DATE_OF_VISITED: 'dateOfVisited',
    PI_CO_PI: 'piCoPi',
    CONSTITUTION_DATE: 'constitutionDate',
    MEETINGS_ORGANIZED: 'meetingsOrganized',
    MEETING_DATE: 'meetingDate',
    AMOUNT_RS: 'amountRs',
    QUANTITY_Q: 'quantityQ',
    REPORTING_DATE: 'reportingDate',
    MONTH_YEAR: 'monthYear',
    DRY_SPELL_10_DAYS: 'dry10',
    DRY_SPELL_15_DAYS: 'dry15',
    DRY_SPELL_20_DAYS: 'dry20',
    INTENSIVE_RAIN_60MM: 'intensiveRain',
    WATER_DEPTH: 'waterDepth',

    // Natural Farming Fields
    AGRO_CLIMATIC_ZONE: 'agroClimaticZone',
    FARMING_SITUATION_OF_SELECTED_FARMER: 'farmingSituationOfSelectedFarmer',
    LATITUDE_N: 'latitudeN',
    LONGITUDE_E: 'longitudeE',
    TITLE_OF_NATURAL_FARMING_TRAINING_PROGRAMME: 'titleOfNaturalFarmingTrainingProgramme',
    DATE_OF_TRAINING: 'dateOfTraining',
    VENUE_OF_PROGRAMME: 'venueOfProgramme',
    NAME_OF_INNOVATIVE_PROGRAMME: 'innovativeProgrammeName',
    SIGNIFICANCE_OF_INNOVATIVE_PROGRAMME: 'significanceOfInnovativeProgramme',
    NORMAL_CROPS_GROWN: 'normalCropsGrown',
    PRACTICING_YEAR_OF_NATURAL_FARMING: 'practicingYearOfNaturalFarming',
    NUMBER_OF_BLOCK: 'noOfBlocks',
    NUMBER_OF_VILLAGE: 'noOfVillages',
    NUMBER_OF_TRAINING: 'totalTrainedFarmers',
    NO_OF_FARMERS_INFLUENCED_TO_ADOPT_NATURAL_FARMING: 'farmersInfluenced',
    BEFORE_PH: 'beforePh',
    BEFORE_EC: 'beforeEc',
    BEFORE_OC: 'beforeOc',
    AFTER_PH: 'afterPh',
    AFTER_EC: 'afterEc',
    AFTER_OC: 'afterOc',
    TOTAL_BUDGET_EXPENDITURE: 'totalBudgetExpenditure',

    // Agri-Drone Fields
    DISTRICT: 'district',
    DEMONSTRATIONS_ON: 'demonstrationsOn',
    DEMONSTRATIONS_ON_NAME: 'demonstrationsOnName',
    PARAMETER_NAME: 'parameterName',
    DATE_OF_DEMONS: 'dateOfDemons',
    PLACE_OF_DEMONS: 'placeOfDemons',
    NO_OF_DEMOS: 'noOfDemos',
    AREA_COVERED_UNDER_DEMOS: 'areaCoveredUnderDemos',
    NO_OF_FARMERS: 'noOfFarmers',
    DEMO_AMOUNT_SANCTIONED: 'demoAmountSanctioned',
    DEMO_AMOUNT_UTILISED: 'demoAmountUtilised',
    PILOT_NAME: 'pilotName',
    PILOT_CONTACT: 'pilotContact',
    TARGET_AREA_HA: 'targetAreaHa',
    OPERATION_TYPE: 'operationType',
    ADVANTAGES_OBSERVED: 'advantagesObserved',

    // Other Programmes Fields
    NAME_OF_THE_PROGRAMME: 'nameOfTheProgramme',
    DATE_OF_THE_PROGRAMME: 'dateOfTheProgramme',

    // Performance Indicator Fields
    NAME_OF_SPECIFIC_AREA: 'nameOfSpecificArea',
    BRIEF_DETAILS_OF_THE_AREA: 'briefDetailsOfTheArea',
    HORIZONTAL_SPREAD: 'horizontalSpread',
    PERCENT_OF_ADOPTION: 'percentOfAdoption',
    NAME_OF_THE_ENTREPRENEUR: 'nameOfTheEntrepreneur',
    NAME_OF_THE_ENTERPRISE: 'nameOfTheEnterprise',
    TYPE_OF_ENTERPRISE: 'typeOfEnterprise',
    NO_OF_MEMBERS_ASSOCIATED: 'noOfMembersAssociated',
    ANNUAL_INCOME: 'annualIncome',
    REVENUE_OF_THE_ENTERPRISE: 'revenueOfTheEnterprise',
    FARMING_EXPERIENCE: 'farmingExperience',
    EXPERIENCE_IN_ENTERPRISE: 'experienceInEnterprise',
    MAJOR_ACHIEVEMENT: 'majorAchievement',
    TITLE_OF_THE_SUCCESS_STORY: 'titleOfTheSuccessStory',
    ITEMS: 'items',
    INFORMATION: 'information',
    TALUK: 'taluk',
    BLOCK: 'block',
    MAJOR_CROPS: 'majorCrops',
    MAJOR_PROBLEMS_IDENTIFIED: 'majorProblemsIdentified',
    IDENTIFIED_THRUST_AREAS: 'identifiedThrustAreas',
    ACTION_TAKEN_FOR_DEVELOPMENT: 'actionTakenForDevelopment',
    THRUST_AREA: 'thrustArea',
    NAME_OF_DEMO_UNIT: 'nameOfDemoUnit',
    YEAR_OF_ESTT: 'yearOfEstt',
    AREA_SQ_MT: 'areaSqMt',
    NAME_OF_THE_ANIMAL: 'nameOfTheAnimal',
    SPECIES_BREED_VARIETY: 'speciesBreedVariety',
    TYPE_OF_PRODUCE: 'typeOfProduce',
    MONTHS: 'months',
    NO_OF_TRAINEES_STAYED: 'noOfTraineesStayed',
    TRAINEE_DAYS: 'traineeDays',
    NO_OF_STAFF_QUARTERS: 'noOfStaffQuarters',
    DATE_OF_COMPLETION: 'dateOfCompletion',
    NO_OF_TRAINING_PROGRAMME_CONDUCTED: 'noOfTrainingProgrammeConducted',
    NO_OF_DEMONSTRATIONS: 'noOfDemonstrations',
    NO_OF_PLANT_MATERIAL_PRODUCED: 'noOfPlantMaterialProduced',
    VISIT_BY_THE_FARMERS: 'visitByTheFarmers',
    VISIT_BY_THE_OFFICIALS: 'visitByTheOfficials',
    VARIETY_BREED: 'varietyBreed',
    PRODUCE: 'produce',
    COST_OF_INPUTS: 'costOfInputs',
    GROSS_INCOME: 'grossIncome',
    REASON_FOR_SHORT_FALL: 'reasonForShortFall',
    WHETHER_STAFF_QUARTERS_COMPLETED: 'isCompleted',
    OCCUPANCY_DETAILS: 'occupancyDetails',
    QTY_KG: 'quantityKg',
    QTY_Q: 'quantityQ',
    SALARY_ALLOCATION: 'salaryAllocation',
    SALARY_EXPENDITURE: 'salaryExpenditure',
    GENERAL_MAIN_GRANT_ALLOCATION: 'generalMainGrantAllocation',
    GENERAL_MAIN_GRANT_EXPENDITURE: 'generalMainGrantExpenditure',
    CAPITAL_MAIN_GRANT_ALLOCATION: 'capitalMainGrantAllocation',
    CAPITAL_MAIN_GRANT_EXPENDITURE: 'capitalMainGrantExpenditure',
    PROJECT_NAME: 'projectName',
    FUNDING_AGENCY: 'fundingAgency',
    BUDGET_ESTIMATE: 'budgetEstimate',
    BUDGET_ALLOCATED: 'budgetAllocated',
    BUDGET_RELEASED: 'budgetReleased',
    UNSPENT_BALANCE: 'unspentBalance',
    OPENING_BALANCE: 'openingBalance',
    INCOME_DURING_THE_YEAR: 'incomeDuringTheYear',
    EXPENDITURE_DURING_THE_YEAR: 'expenditureDuringTheYear',
    CLOSING: 'closing',
    KIND: 'kind',
    NAME_OF_HEAD: 'nameOfHead',
    INCOME_RS: 'incomeRs',
    SPONSORING_AGENCY: 'sponsoringAgency',
    NAME_OF_THE_PROGRAMME_PERF: 'nameOfTheProgrammePerf',
    PURPOSE_OF_THE_PROGRAMME: 'purposeOfTheProgramme',
    SOURCES_OF_FUND: 'sourcesOfFund',
    AMOUNT_RS_LAKHS: 'amountRsLakhs',
    INFRASTRUCTURE_CREATED: 'infrastructureCreated',
    NAME_OF_ORGANIZATION: 'nameOfOrganization',
    NATURE_OF_LINKAGE: 'natureOfLinkage',
    PROGRAMME_TYPE: 'programmeType',
    NAME_OF_THE_PROGRAMME_SCHEME: 'nameOfTheProgrammeScheme',
    DATE_MONTH_OF_INITIATION: 'dateMonthOfInitiation',

    // Miscellaneous Fields
    NAME_OF_THE_DISEASE: 'nameOfTheDisease',
    DATE_OF_OUTBREAK: 'dateOfOutbreak',
    AREA_AFFECTED: 'areaAffected',
    PERCENT_COMMODITY_LOSS: 'commodityLossPercent',
    PREVENTIVE_MEASURES_TAKEN: 'preventiveMeasuresArea',
    LIVESTOCK_TYPE: 'livestockType',
    MORTALITY_COUNT: 'mortalityCount',
    ANIMALS_TREATED: 'animalsTreated',
    PREVENTIVE_MEASURES: 'preventiveMeasures',
    SPECIES_AFFECTED: 'speciesAffected',
    NUMBER_OF_DEATH: 'numberOfDeath',
    MORBIDITY_RATE: 'morbidityRate',
    NUMBER_OF_ANIMALS_VACCINATED: 'numberOfAnimalsVaccinated',
    TITLE_OF_THE_TRAINING_PROGRAMME: 'programmeTitle',
    MALE: 'totalMale',
    FEMALE: 'totalFemale',
    AMOUNT_OF_FUND_RECEIVED: 'fundReceived',
    RESOURCE_PERSON: 'resourcePerson',
    ATTACHMENT_TYPE: 'attachmentType',
    ATTACHMENT: 'attachment',
    NUMBER_OF_STUDENT: 'numberOfStudent',
    NO_OF_DAYS_STAYED: 'noOfDaysStayed',
    DATE_OF_VISIT: 'dateOfVisit',
    TYPE_OF_DIGNITARIES: 'typeOfDignitaries',
    NAME_OF_HONBLE_MINISTER: 'nameOfHonbleMinister',
    SALIENT_POINTS: 'salientPoints',
    NUMBER_OF_MOBILE_APPS_DEVELOPED: 'numberOfAppsDeveloped',
    NAME_OF_THE_APPS: 'nameOfApp',
    LANGUAGE_OF_THE_APPS: 'languageOfApp',
    MEANT_FOR: 'meantFor',
    NO_OF_TIMES_DOWNLOADED: 'numberOfTimesDownloaded',
    NO_OF_VISITORS_VISITED: 'noOfVisitors',
    NO_OF_FARMERS_REGISTERED: 'noOfFarmersRegistered',
    NO_OF_FARMERS_REGISTERED_KSP: 'noOfFarmersRegisteredOnKspPortal',
    PHONE_CALL_ADDRESSED: 'phoneCallAddressed',
    ANSWERED_CALL: 'phoneCallAnswered',
    NO_OF_FARMERS_COVERED: 'noOfFarmersCovered',
    NO_OF_ADVISORIES_SENT: 'noOfAdvisoriesSent',
    TYPE_OF_MESSAGES_CROP: 'crop',
    TYPE_OF_MESSAGES_LIVESTOCK: 'livestock',
    TYPE_OF_MESSAGES_WEATHER: 'weather',
    TYPE_OF_MESSAGES_MARKETING: 'marketing',
    TYPE_OF_MESSAGES_AWARENESS: 'awareness',
    TYPE_OF_MESSAGES_OTHER_ENTERPRISES: 'otherEnterprises',
    TYPE_OF_MESSAGES_ANY_OTHER: 'anyOther',
    ADVISORIES_THROUGH_TEXT_MESSAGES: 'textNoOfFarmersCovered', // Mapping to schema
    NO_OF_FARMERS_SENT_TEXT_MESSAGES: 'textNoOfAdvisoriesSent',
    ADVISORIES_THROUGH_WHATSAPP: 'whatsappNoOfFarmersCovered',
    NO_OF_FARMERS_SENT_WHATSAPP: 'whatsappNoOfAdvisoriesSent',
    ADVISORIES_THROUGH_SOCIAL_MEDIA: 'socialNoOfFarmersCovered',
    NO_OF_FARMERS_SENT_SOCIAL_MEDIA: 'socialNoOfAdvisoriesSent',
    ADVISORIES_THROUGH_WEATHER_ADVISORY_BULLETIN: 'weatherNoOfFarmersCovered',
    NO_OF_FARMERS_SENT_WEATHER_ADVISORY_BULLETIN: 'weatherNoOfAdvisoriesSent',
    DATE_DURATION_OF_OBSERVATION: 'dateDurationOfObservation',
    TOTAL_NO_OF_ACTIVITIES_UNDERTAKEN: 'totalNoOfActivitiesUndertaken',
    NO_OF_STAFFS: 'noOfStaffs',
    NO_OF_OTHERS: 'noOfOthers',
    NO_OF_TOTAL: 'noOfTotal',
    VERMICOMPOSTING_NO_OF_VILLAGE_COVERED: 'vermicompostingNoOfVillageCovered',
    VERMICOMPOSTING_TOTAL_EXPENDITURE: 'vermicompostingTotalExpenditure',
    OTHER_NO_OF_VILLAGE_COVERED: 'otherNoOfVillageCovered',
    OTHER_TOTAL_EXPENDITURE: 'otherTotalExpenditure',
    NO_OF_PARTICIPANTS_PERF: 'noOfParticipantsPerf',
    TOTAL_STATUTORY_MEMBERS_PRESENT: 'totalStatutoryMembersPresent',
    SALIENT_RECOMMENDATIONS: 'salientRecommendations',
    ACTION_TAKEN: 'actionTaken',
    REASON: 'reason',
    FILE: 'file',
    TYPE_OF_MEETING: 'typeOfMeeting',
    AGENDA: 'agenda',
    REPRESENTATIVE_FROM_ATARI: 'representativeFromAtari',
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
    SOIL_WATER_ANALYSIS_MASTER: [FIELD_NAMES.ANALYSIS_NAME] as const,
    NICRA_CATEGORY_MASTER: [FIELD_NAMES.CATEGORY_NAME] as const,
    NICRA_SUB_CATEGORY_MASTER: [FIELD_NAMES.SUB_CATEGORY_NAME, FIELD_NAMES.CATEGORY_NAME] as const,
    NICRA_SEED_BANK_FODDER_BANK_MASTER: [FIELD_NAMES.SEED_BANK_FODDER_BANK] as const,
    IMPACT_SPECIFIC_AREA_MASTER: [FIELD_NAMES.SPECIFIC_AREA_NAME] as const,
    ENTERPRISE_TYPE_MASTER: [FIELD_NAMES.ENTERPRISE_TYPE_NAME] as const,
    ACCOUNT_TYPE_MASTER: [FIELD_NAMES.ACCOUNT_TYPE] as const,
    PROGRAMME_TYPE_MASTER: [FIELD_NAMES.PROGRAMME_TYPE] as const,
    PPV_FRA_TRAINING_TYPE_MASTER: [FIELD_NAMES.TYPE_NAME] as const,

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
        FIELD_NAMES.REPORTING_YEAR,
        FIELD_NAMES.CROP,
        FIELD_NAMES.TECHNOLOGY_DEMONSTRATED,
        FIELD_NAMES.AREA_HA,
        FIELD_NAMES.NUMBER_OF_FARMERS,
        FIELD_NAMES.DISTRICT_YIELD,
        FIELD_NAMES.STATE_YIELD,
        FIELD_NAMES.POTENTIAL_YIELD,
        FIELD_NAMES.STATUS,
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
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.SEASON,
        FIELD_NAMES.TECHNOLOGY_DEMONSTRATED,
        FIELD_NAMES.AREA_IN_ACRE,
        FIELD_NAMES.NUMBER_OF_FARMERS,
    ] as const,
    CRA_EXTENSION_ACTIVITY: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.NAME_OF_EXTENSION_ACTIVITIES,
        FIELD_NAMES.START_DATE,
        FIELD_NAMES.END_DATE,
        FIELD_NAMES.WITHIN_STATE_WITHOUT_STATE,
        FIELD_NAMES.EXPOSURE_VISIT_NO,
        FIELD_NAMES.NUMBER_OF_FARMERS_UNDER_EXPOSURE,
    ] as const,

    // Projects Routes - FPO
    FPO_DETAILS: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.NO_OF_BLOCKS_ALLOCATED,
        FIELD_NAMES.NO_OF_FPOS_REGISTERED_AS_CBBO,
        FIELD_NAMES.TRAINING_RECEIVED_BY_FPO_MEMBERS,
        FIELD_NAMES.IS_BUSINESS_PLAN_PREPARED,
        FIELD_NAMES.NO_OF_FPO_RECEIVED_MANAGEMENT_COST,
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
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.VARIETIES_USED_IN_IP,
        FIELD_NAMES.SITUATIONS,
        FIELD_NAMES.VARIETIES_USED_IN_FP,
        FIELD_NAMES.NET_RETURN_IMPROVED_PRACTICE,
        FIELD_NAMES.NET_RETURN_FARMER_PRACTICE,
    ] as const,
    DRMR_ACTIVITY: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.START_DATE,
        FIELD_NAMES.END_DATE,
        FIELD_NAMES.TRAINING_PROGRAM,
        FIELD_NAMES.FRONTLINE_DEMONSTRATION,
        FIELD_NAMES.AWARENESS_CAMPS,
        FIELD_NAMES.DISTRIBUTION_OF_LITERATURE,
        FIELD_NAMES.KISAN_MELA,
    ] as const,

    // Projects Routes - NARI
    NARI_NUTRI_SMART: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.NAME_OF_NUTRI_SMART_VILLAGE,
        FIELD_NAMES.TYPE_OF_NUTRITIONAL_GARDEN,
        FIELD_NAMES.NUMBERS,
        FIELD_NAMES.AREA_SQM,
    ] as const,
    NARI_BIO_FORTIFIED: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.NAME_OF_NUTRI_SMART_VILLAGE,
        FIELD_NAMES.SEASON,
        FIELD_NAMES.ACTIVITY,
        FIELD_NAMES.CATEGORY_OF_CROP,
    ] as const,
    NARI_VALUE_ADDITION: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.NAME_OF_NUTRI_SMART_VILLAGE,
        FIELD_NAMES.CROP_NAME,
        FIELD_NAMES.NAME_OF_VALUE_ADDED_PRODUCT,
        FIELD_NAMES.ACTIVITY,
    ] as const,
    NARI_TRAINING_PROGRAMM: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.NAME_OF_NUTRI_SMART_VILLAGE,
        FIELD_NAMES.AREA_OF_TRAINING,
        FIELD_NAMES.ACTIVITY,
        FIELD_NAMES.TITLE_OF_TRAINING,
    ] as const,
    NARI_EXTENSION_ACTIVITIES: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.NAME_OF_NUTRI_SMART_VILLAGE,
        FIELD_NAMES.ACTIVITY,
        FIELD_NAMES.ACTIVITY_NAME,
        FIELD_NAMES.NO_OF_ACTIVITIES,
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
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.TYPE,
        FIELD_NAMES.ACTIVITY,
        FIELD_NAMES.NO_OF_TRAINING,
        FIELD_NAMES.BENEFICIARIES,
    ] as const,

    // Projects Routes - NICRA
    NICRA_BASIC_INFORMATION: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.RF_MM_DISTRICT_NORMAL,
        FIELD_NAMES.RF_MM_DISTRICT_RECEIVED,
        FIELD_NAMES.MAX_TEMPERATURE,
        FIELD_NAMES.MIN_TEMPERATURE,
    ] as const,
    NICRA_DETAILS: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.CROP_NAME,
        FIELD_NAMES.SEASON_NAME,
        FIELD_NAMES.TECHNOLOGY_DEMONSTRATED,
        FIELD_NAMES.NUMBER_OF_FARMERS,
    ] as const,
    NICRA_TRAINING: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.TRAINING_TITLE,
        FIELD_NAMES.START_DATE,
        FIELD_NAMES.END_DATE,
        FIELD_NAMES.NO_OF_FARMERS_ATTENDED,
    ] as const,
    NICRA_EXTENSION_ACTIVITY: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.ACTIVITY_NAME,
        FIELD_NAMES.PLACE_OF_ACTIVITY,
        FIELD_NAMES.START_DATE,
        FIELD_NAMES.END_DATE,
        FIELD_NAMES.NO_OF_FARMERS_ATTENDED,
    ] as const,
    NICRA_OTHERS_INTERVENTION: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.START_DATE,
        FIELD_NAMES.END_DATE,
        FIELD_NAMES.SEED_BANK_FODDER_BANK,
        FIELD_NAMES.CROP,
        FIELD_NAMES.VARIETY,
        FIELD_NAMES.QUANTITY_Q,
    ] as const,
    NICRA_OTHERS_REVENUE_GENERATED: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.REPORTING_YEAR,
        FIELD_NAMES.REVENUE,
    ] as const,
    NICRA_OTHERS_CUSTOM_HIRING: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.NAME_OF_FARM_IMPLEMENT_EQUIPMENT,
        FIELD_NAMES.NO_OF_FARMERS_USED_IMPLEMENT,
        FIELD_NAMES.AREA_COVERED_BY_FARM_IMPLEMENT,
        FIELD_NAMES.FARM_IMPLEMENT_USED_IN_HOURS,
        FIELD_NAMES.REVENUE_GENERATED_BY_FARM_IMPLEMENT,
        FIELD_NAMES.EXPENDITURE_INCURRED_ON_REPAIRING,
    ] as const,
    NICRA_OTHERS_VCRMC: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.VILLAGE_NAME,
        FIELD_NAMES.CONSTITUTION_DATE,
        FIELD_NAMES.MEETINGS_ORGANIZED,
        FIELD_NAMES.MEETING_DATE,
        FIELD_NAMES.NAME_OF_SECRETARY,
        FIELD_NAMES.NAME_OF_PRESIDENT,
        'maleMembers',
        'femaleMembers',
    ] as const,
    NICRA_OTHERS_SOIL_HEALTH_CARD: [
        FIELD_NAMES.START_DATE,
        FIELD_NAMES.END_DATE,
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.NO_OF_SOIL_SAMPLES_COLLECTED,
        FIELD_NAMES.NO_OF_SAMPLES_ANALYSED,
        FIELD_NAMES.SHC_ISSUED,
    ] as const,
    NICRA_OTHERS_CONVERGENCE_PROGRAMME: [
        FIELD_NAMES.START_DATE,
        FIELD_NAMES.END_DATE,
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.DEVELOPMENT_SCHEME_PROGRAMME,
        FIELD_NAMES.NATURE_OF_WORK,
        FIELD_NAMES.AMOUNT_RS,
    ] as const,
    NICRA_OTHERS_DIGNITARIES_VISITED: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.TYPE,
        FIELD_NAMES.NAME,
        FIELD_NAMES.DATE_OF_VISIT,
        FIELD_NAMES.REMARK,
    ] as const,
    NICRA_OTHERS_PI_COPI_LIST: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.START_DATE,
        FIELD_NAMES.END_DATE,
        FIELD_NAMES.TYPE,
        FIELD_NAMES.NAME,
    ] as const,

    // Projects Routes - Natural Farming
    NATURAL_FARMING_GEOGRAPHICAL_INFORMATION: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.START_DATE,
        FIELD_NAMES.END_DATE,
        FIELD_NAMES.AGRO_CLIMATIC_ZONE,
        FIELD_NAMES.FARMING_SITUATION_OF_SELECTED_FARMER,
        FIELD_NAMES.LATITUDE_N,
        FIELD_NAMES.LONGITUDE_E,
    ] as const,
    NATURAL_FARMING_PHYSICAL_INFORMATION: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.ACTIVITY_NAME,
        FIELD_NAMES.TITLE_OF_NATURAL_FARMING_TRAINING_PROGRAMME,
        FIELD_NAMES.DATE_OF_TRAINING,
        FIELD_NAMES.VENUE_OF_PROGRAMME,
        FIELD_NAMES.PARTICIPANTS,
    ] as const,
    NATURAL_FARMING_DEMONSTRATION: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.FARMER_NAME,
        FIELD_NAMES.ACTIVITY_NAME,
        FIELD_NAMES.CROP,
        FIELD_NAMES.VARIETY,
    ] as const,
    NATURAL_FARMING_FARMERS_PRACTICING: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.FARMER_NAME,
        FIELD_NAMES.ADDRESS,
        FIELD_NAMES.NORMAL_CROPS_GROWN,
        FIELD_NAMES.PRACTICING_YEAR_OF_NATURAL_FARMING,
    ] as const,
    NATURAL_FARMING_BENEFICIARIES: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.NUMBER_OF_BLOCK,
        FIELD_NAMES.NUMBER_OF_VILLAGE,
        FIELD_NAMES.NUMBER_OF_TRAINING,
        FIELD_NAMES.NO_OF_FARMERS_INFLUENCED_TO_ADOPT_NATURAL_FARMING,
    ] as const,
    NATURAL_FARMING_SOIL_DATA: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.SEASON,
        FIELD_NAMES.TYPE,
        FIELD_NAMES.CROP,
        FIELD_NAMES.BEFORE_PH,
        FIELD_NAMES.BEFORE_EC,
        FIELD_NAMES.BEFORE_OC,
        FIELD_NAMES.AFTER_PH,
        FIELD_NAMES.AFTER_EC,
        FIELD_NAMES.AFTER_OC,
    ] as const,
    NATURAL_FARMING_BUDGET_EXPENDITURE: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.ACTIVITY_NAME,
        FIELD_NAMES.NUMBER_OF_ACTIVITIES,
        FIELD_NAMES.BUDGET_SANCTION,
        FIELD_NAMES.BUDGET_EXPENDITURE,
        FIELD_NAMES.TOTAL_BUDGET_EXPENDITURE,
    ] as const,

    // Projects Routes - Agri-Drone
    AGRI_DRONE_INTRODUCTION: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.YEAR,
        FIELD_NAMES.PROJECT_IMPLEMENTING_CENTRE_NAME,
        FIELD_NAMES.COMPANY_OF_DRONE,
        FIELD_NAMES.MODEL_OF_DRONE,
        FIELD_NAMES.NO_OF_AGRI_DRONES_SANCTIONED,
        FIELD_NAMES.NO_OF_AGRI_DRONES_PURCHASED,
        FIELD_NAMES.COST_SANCTIONED,
    ] as const,
    AGRI_DRONE_DEMONSTRATION: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.PROJECT_IMPLEMENTING_CENTRE_NAME,
        FIELD_NAMES.DISTRICT,
        FIELD_NAMES.DATE_OF_DEMONS,
        FIELD_NAMES.PLACE_OF_DEMONS,
        FIELD_NAMES.CROP_NAME,
        FIELD_NAMES.NO_OF_DEMOS,
        FIELD_NAMES.AREA_COVERED_UNDER_DEMOS,
        FIELD_NAMES.NO_OF_FARMERS,
    ] as const,

    // Projects Routes - Seed Hub
    SEED_HUB_PROGRAM: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.SEASON,
        FIELD_NAMES.CROP_NAME,
        FIELD_NAMES.VARIETY,
        FIELD_NAMES.AREA_HA,
        FIELD_NAMES.YIELD,
    ] as const,

    // Projects Routes - Other Programmes
    OTHER_PROGRAM: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.NAME_OF_THE_PROGRAMME,
        FIELD_NAMES.DATE_OF_THE_PROGRAMME,
        FIELD_NAMES.VENUE,
        FIELD_NAMES.PURPOSE,
        FIELD_NAMES.NO_OF_PARTICIPANTS,
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
        FIELD_NAMES.PUBLICATION_ITEM,
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
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.START_DATE,
        FIELD_NAMES.END_DATE,
        FIELD_NAMES.ANALYSIS,
        FIELD_NAMES.NO_OF_SAMPLES_ANALYZED,
        FIELD_NAMES.NO_OF_VILLAGES_COVERED,
        FIELD_NAMES.AMOUNT_RELEASED,
    ] as const,

    // Achievements Routes - World Soil Day
    WORLD_SOIL_DAY: [
        FIELD_NAMES.KVK_NAME,
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

    // Performance Indicator Routes - Impact
    PERFORMANCE_IMPACT_KVK_ACTIVITIES: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.NAME_OF_SPECIFIC_AREA,
        FIELD_NAMES.BRIEF_DETAILS_OF_THE_AREA,
        FIELD_NAMES.NO_OF_FARMERS_BENEFITTED,
        FIELD_NAMES.HORIZONTAL_SPREAD,
        FIELD_NAMES.PERCENT_OF_ADOPTION,
    ] as const,
    PERFORMANCE_IMPACT_ENTREPRENEURSHIP: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.NAME_OF_THE_ENTREPRENEUR,
        FIELD_NAMES.NAME_OF_THE_ENTERPRISE,
        FIELD_NAMES.TYPE_OF_ENTERPRISE,
        FIELD_NAMES.NO_OF_MEMBERS_ASSOCIATED,
        FIELD_NAMES.ANNUAL_INCOME,
        FIELD_NAMES.REVENUE_OF_THE_ENTERPRISE,
    ] as const,
    PERFORMANCE_IMPACT_SUCCESS_STORIES: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.FARMER_NAME,
        FIELD_NAMES.FARMING_EXPERIENCE,
        FIELD_NAMES.EXPERIENCE_IN_ENTERPRISE,
        FIELD_NAMES.MAJOR_ACHIEVEMENT,
        FIELD_NAMES.TITLE_OF_THE_SUCCESS_STORY,
    ] as const,

    // Performance Indicator Routes - District & Village
    PERFORMANCE_DISTRICT_LEVEL: [
        FIELD_NAMES.KVK,
        FIELD_NAMES.REPORTING_YEAR,
        FIELD_NAMES.ITEMS,
        FIELD_NAMES.INFORMATION,
    ] as const,
    PERFORMANCE_OPERATIONAL_AREA: [
        FIELD_NAMES.KVK,
        FIELD_NAMES.REPORTING_YEAR,
        FIELD_NAMES.TALUK,
        FIELD_NAMES.BLOCK,
        FIELD_NAMES.VILLAGE_NAME,
        FIELD_NAMES.MAJOR_CROPS,
        FIELD_NAMES.MAJOR_PROBLEMS_IDENTIFIED,
        FIELD_NAMES.IDENTIFIED_THRUST_AREAS,
    ] as const,
    PERFORMANCE_VILLAGE_ADOPTION: [
        FIELD_NAMES.KVK,
        FIELD_NAMES.REPORTING_YEAR,
        FIELD_NAMES.VILLAGE_NAME,
        FIELD_NAMES.BLOCK,
        FIELD_NAMES.ACTION_TAKEN_FOR_DEVELOPMENT,
    ] as const,
    PERFORMANCE_PRIORITY_THRUST: [
        FIELD_NAMES.KVK,
        FIELD_NAMES.REPORTING_YEAR,
        FIELD_NAMES.THRUST_AREA,
    ] as const,

    // Performance Indicator Routes - Infrastructure
    PERFORMANCE_DEMONSTRATION_UNITS: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.NAME_OF_DEMO_UNIT,
        FIELD_NAMES.YEAR_OF_ESTT,
        FIELD_NAMES.AREA_SQ_MT,
    ] as const,
    PERFORMANCE_INSTRUCTIONAL_FARM_CROPS: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.CROP_NAME,
        FIELD_NAMES.AREA_HA,
    ] as const,
    PERFORMANCE_PRODUCTION_UNITS: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.PRODUCT_NAME,
        FIELD_NAMES.QUANTITY,
    ] as const,
    PERFORMANCE_INSTRUCTIONAL_FARM_LIVESTOCK: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.NAME_OF_THE_ANIMAL,
        FIELD_NAMES.SPECIES_BREED_VARIETY,
        FIELD_NAMES.TYPE_OF_PRODUCE,
    ] as const,
    PERFORMANCE_HOSTEL: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.MONTHS,
        FIELD_NAMES.NO_OF_TRAINEES_STAYED,
        FIELD_NAMES.TRAINEE_DAYS,
    ] as const,
    PERFORMANCE_STAFF_QUARTERS: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.NO_OF_STAFF_QUARTERS,
        FIELD_NAMES.DATE_OF_COMPLETION,
        FIELD_NAMES.REMARK,
    ] as const,
    PERFORMANCE_RAINWATER_HARVESTING: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.NO_OF_TRAINING_PROGRAMME_CONDUCTED,
        FIELD_NAMES.NO_OF_DEMONSTRATIONS,
        FIELD_NAMES.NO_OF_PLANT_MATERIAL_PRODUCED,
        FIELD_NAMES.VISIT_BY_THE_FARMERS,
        FIELD_NAMES.VISIT_BY_THE_OFFICIALS,
    ] as const,

    // Performance Indicator Routes - Financial
    PERFORMANCE_BUDGET_DETAILS: [
        FIELD_NAMES.KVK,
        FIELD_NAMES.SALARY_ALLOCATION,
        FIELD_NAMES.SALARY_EXPENDITURE,
        FIELD_NAMES.GENERAL_MAIN_GRANT_ALLOCATION,
        FIELD_NAMES.GENERAL_MAIN_GRANT_EXPENDITURE,
        FIELD_NAMES.CAPITAL_MAIN_GRANT_ALLOCATION,
        FIELD_NAMES.CAPITAL_MAIN_GRANT_EXPENDITURE,
    ] as const,
    PERFORMANCE_PROJECT_BUDGET: [
        FIELD_NAMES.KVK,
        FIELD_NAMES.PROJECT_NAME,
        FIELD_NAMES.FUNDING_AGENCY,
        FIELD_NAMES.BUDGET_ESTIMATE,
        FIELD_NAMES.BUDGET_ALLOCATED,
        FIELD_NAMES.BUDGET_RELEASED,
        FIELD_NAMES.EXPENDITURE,
        FIELD_NAMES.UNSPENT_BALANCE,
    ] as const,
    PERFORMANCE_REVOLVING_FUND: [
        FIELD_NAMES.KVK,
        FIELD_NAMES.REPORTING_YEAR,
        FIELD_NAMES.OPENING_BALANCE,
        FIELD_NAMES.INCOME_DURING_THE_YEAR,
        FIELD_NAMES.EXPENDITURE_DURING_THE_YEAR,
        FIELD_NAMES.CLOSING,
        FIELD_NAMES.KIND,
    ] as const,
    PERFORMANCE_REVENUE_GENERATION: [
        FIELD_NAMES.KVK,
        FIELD_NAMES.NAME_OF_HEAD,
        FIELD_NAMES.INCOME_RS,
        FIELD_NAMES.SPONSORING_AGENCY,
    ] as const,
    PERFORMANCE_RESOURCE_GENERATION: [
        FIELD_NAMES.KVK,
        FIELD_NAMES.NAME_OF_THE_PROGRAMME_PERF,
        FIELD_NAMES.PURPOSE_OF_THE_PROGRAMME,
        FIELD_NAMES.SOURCES_OF_FUND,
        FIELD_NAMES.AMOUNT_RS_LAKHS,
        FIELD_NAMES.INFRASTRUCTURE_CREATED,
    ] as const,

    // Performance Indicator Routes - Linkages
    PERFORMANCE_FUNCTIONAL_LINKAGE: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.NAME_OF_ORGANIZATION,
        FIELD_NAMES.NATURE_OF_LINKAGE,
    ] as const,
    PERFORMANCE_SPECIAL_PROGRAMMES: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.PROGRAMME_TYPE,
        FIELD_NAMES.NAME_OF_THE_PROGRAMME_SCHEME,
        FIELD_NAMES.DATE_MONTH_OF_INITIATION,
    ] as const,

    // Miscellaneous Routes - Diseases
    MISC_DISEASES_CROPS: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.NAME_OF_THE_DISEASE,
        FIELD_NAMES.CROP,
        FIELD_NAMES.DATE_OF_OUTBREAK,
        FIELD_NAMES.AREA_AFFECTED,
        FIELD_NAMES.PERCENT_COMMODITY_LOSS,
        FIELD_NAMES.PREVENTIVE_MEASURES_TAKEN,
    ] as const,
    MISC_DISEASES_LIVESTOCK: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.NAME_OF_THE_DISEASE,
        FIELD_NAMES.LIVESTOCK_TYPE,
        FIELD_NAMES.DATE_OF_OUTBREAK,
        FIELD_NAMES.MORTALITY_COUNT,
        FIELD_NAMES.ANIMALS_TREATED,
        FIELD_NAMES.PREVENTIVE_MEASURES,
    ] as const,

    // Miscellaneous Routes - Nehru Yuva Kendra
    MISC_NEHRU_YUVA_KENDRA: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.TITLE_OF_THE_TRAINING_PROGRAMME,
        FIELD_NAMES.START_DATE,
        FIELD_NAMES.END_DATE,
        FIELD_NAMES.MALE,
        FIELD_NAMES.FEMALE,
        FIELD_NAMES.AMOUNT_OF_FUND_RECEIVED,
    ] as const,

    // Miscellaneous Routes - PPV & FRA
    MISC_PPV_FRA_TRAINING: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.DATE,
        FIELD_NAMES.TITLE,
        FIELD_NAMES.TYPE,
        FIELD_NAMES.VENUE,
        FIELD_NAMES.RESOURCE_PERSON,
        FIELD_NAMES.NO_OF_PARTICIPANTS,
    ] as const,
    MISC_PPV_FRA_PLANT_VARIETIES: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.YEAR,
        FIELD_NAMES.CROP_NAME,
        FIELD_NAMES.REGISTRATION_NO,
        FIELD_NAMES.FARMER_NAME,
        FIELD_NAMES.BLOCK,
        FIELD_NAMES.DISTRICT,
    ] as const,

    // Miscellaneous Routes - RAWE/FET
    MISC_RAWE_FET: [
        FIELD_NAMES.START_DATE,
        FIELD_NAMES.END_DATE,
        FIELD_NAMES.KVK,
        FIELD_NAMES.ATTACHMENT_TYPE,
        FIELD_NAMES.ATTACHMENT,
        FIELD_NAMES.NUMBER_OF_STUDENT,
        FIELD_NAMES.NO_OF_DAYS_STAYED,
    ] as const,

    // Miscellaneous Routes - VIP Visitors
    MISC_VIP_VISITORS: [
        FIELD_NAMES.KVK,
        FIELD_NAMES.DATE_OF_VISIT,
        FIELD_NAMES.TYPE_OF_DIGNITARIES,
        FIELD_NAMES.NAME_OF_HONBLE_MINISTER,
        FIELD_NAMES.SALIENT_POINTS,
    ] as const,

    // Miscellaneous Routes - Digital
    MISC_DIGITAL_MOBILE_APP: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.NUMBER_OF_MOBILE_APPS_DEVELOPED,
        FIELD_NAMES.NAME_OF_THE_APPS,
        FIELD_NAMES.LANGUAGE_OF_THE_APPS,
        FIELD_NAMES.MEANT_FOR,
        FIELD_NAMES.NO_OF_TIMES_DOWNLOADED,
    ] as const,
    MISC_DIGITAL_WEB_PORTAL: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.NO_OF_VISITORS_VISITED,
        FIELD_NAMES.NO_OF_FARMERS_REGISTERED,
    ] as const,
    MISC_DIGITAL_KISAN_SARATHI: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.NO_OF_FARMERS_REGISTERED_KSP,
        FIELD_NAMES.PHONE_CALL_ADDRESSED,
        FIELD_NAMES.ANSWERED_CALL,
    ] as const,
    MISC_DIGITAL_KISAN_MOBILE_ADVISORY: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.NO_OF_FARMERS_COVERED,
        FIELD_NAMES.NO_OF_ADVISORIES_SENT,
        FIELD_NAMES.TYPE_OF_MESSAGES_CROP,
        FIELD_NAMES.TYPE_OF_MESSAGES_LIVESTOCK,
        FIELD_NAMES.TYPE_OF_MESSAGES_WEATHER,
        FIELD_NAMES.TYPE_OF_MESSAGES_MARKETING,
        FIELD_NAMES.TYPE_OF_MESSAGES_AWARENESS,
        FIELD_NAMES.TYPE_OF_MESSAGES_OTHER_ENTERPRISES,
        FIELD_NAMES.TYPE_OF_MESSAGES_ANY_OTHER,
    ] as const,
    MISC_DIGITAL_OTHER_CHANNELS: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.ADVISORIES_THROUGH_TEXT_MESSAGES,
        FIELD_NAMES.NO_OF_FARMERS_SENT_TEXT_MESSAGES,
        FIELD_NAMES.ADVISORIES_THROUGH_WHATSAPP,
        FIELD_NAMES.NO_OF_FARMERS_SENT_WHATSAPP,
        FIELD_NAMES.ADVISORIES_THROUGH_SOCIAL_MEDIA,
        FIELD_NAMES.NO_OF_FARMERS_SENT_SOCIAL_MEDIA,
        FIELD_NAMES.ADVISORIES_THROUGH_WEATHER_ADVISORY_BULLETIN,
        FIELD_NAMES.NO_OF_FARMERS_SENT_WEATHER_ADVISORY_BULLETIN,
    ] as const,

    // Miscellaneous Routes - Swachhta
    MISC_SWACHHTA_SEWA: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.DATE_DURATION_OF_OBSERVATION,
        FIELD_NAMES.TOTAL_NO_OF_ACTIVITIES_UNDERTAKEN,
        FIELD_NAMES.NO_OF_STAFFS,
        FIELD_NAMES.NO_OF_FARMERS,
        FIELD_NAMES.NO_OF_OTHERS,
        FIELD_NAMES.NO_OF_TOTAL,
    ] as const,
    MISC_SWACHHTA_PAKHWADA: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.DATE_DURATION_OF_OBSERVATION,
        FIELD_NAMES.TOTAL_NO_OF_ACTIVITIES_UNDERTAKEN,
        FIELD_NAMES.NO_OF_STAFFS,
        FIELD_NAMES.NO_OF_FARMERS,
        FIELD_NAMES.NO_OF_OTHERS,
        FIELD_NAMES.NO_OF_TOTAL,
    ] as const,
    MISC_SWACHHTA_BUDGET: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.VERMICOMPOSTING_NO_OF_VILLAGE_COVERED,
        FIELD_NAMES.VERMICOMPOSTING_TOTAL_EXPENDITURE,
        FIELD_NAMES.OTHER_NO_OF_VILLAGE_COVERED,
        FIELD_NAMES.OTHER_TOTAL_EXPENDITURE,
    ] as const,

    // Miscellaneous Routes - Meetings
    MISC_MEETINGS_SAC: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.START_DATE,
        FIELD_NAMES.END_DATE,
        FIELD_NAMES.NO_OF_PARTICIPANTS_PERF,
        FIELD_NAMES.TOTAL_STATUTORY_MEMBERS_PRESENT,
        FIELD_NAMES.SALIENT_RECOMMENDATIONS,
        FIELD_NAMES.ACTION_TAKEN,
        FIELD_NAMES.REASON,
        FIELD_NAMES.FILE,
    ] as const,
    MISC_MEETINGS_OTHER: [
        FIELD_NAMES.KVK_NAME,
        FIELD_NAMES.DATE,
        FIELD_NAMES.TYPE_OF_MEETING,
        FIELD_NAMES.AGENDA,
        FIELD_NAMES.REPRESENTATIVE_FROM_ATARI,
    ] as const,
} as const;
