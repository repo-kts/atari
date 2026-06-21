const prisma = require('../config/prisma.js');

/**
 * Whitelist of master tables the migration UI may list as FK options.
 * Keyed by the `master` name a module spec references in its `foreignKeys`.
 * Whitelisting (vs accepting arbitrary model names from the client) keeps the
 * generic options endpoint safe.
 */
const MASTER_CATALOG = {
    kvk: { model: 'kvk', idField: 'kvkId', nameField: 'kvkName' },
    bankAccountTypeMaster: {
        model: 'bankAccountTypeMaster',
        idField: 'bankAccountTypeId',
        nameField: 'name',
    },
    sanctionedPost: {
        model: 'sanctionedPost',
        idField: 'sanctionedPostId',
        nameField: 'postName',
    },
    jobTypeMaster: { model: 'jobTypeMaster', idField: 'jobTypeId', nameField: 'name' },
    discipline: { model: 'discipline', idField: 'disciplineId', nameField: 'disciplineName' },
    staffCategory: {
        model: 'staffCategoryMaster',
        idField: 'staffCategoryId',
        nameField: 'categoryName',
    },
    payScale: { model: 'payScaleMaster', idField: 'payScaleId', nameField: 'scaleName' },
    payLevel: { model: 'payLevelMaster', idField: 'payLevelId', nameField: 'levelName' },
    infraMaster: {
        model: 'kvkInfrastructureMaster',
        idField: 'infraMasterId',
        nameField: 'name',
    },
    vehicleStatus: {
        model: 'vehiclePresentStatusMaster',
        idField: 'vehicleStatusId',
        nameField: 'statusLabel',
    },
    assetFundingSource: {
        model: 'assetFundingSourceMaster',
        idField: 'assetFundingSourceId',
        nameField: 'name',
    },
    // The parent vehicle, used by the vehicle-details FK picker.
    vehicle: { model: 'kvkVehicle', idField: 'vehicleId', nameField: 'vehicleName' },
    // The parent equipment, used by the equipment-details FK picker.
    kvkEquipment: { model: 'kvkEquipment', idField: 'equipmentId', nameField: 'equipmentName' },
    kvkStaff: { model: 'kvkStaff', idField: 'kvkStaffId', nameField: 'staffName' },
    season: { model: 'season', idField: 'seasonId', nameField: 'seasonName' },
    district: { model: 'districtMaster', idField: 'districtId', nameField: 'districtName' },
    // The parent agri drone, used by the agri-drone-demonstration FK picker.
    agriDrone: { model: 'kvkAgriDrone', idField: 'agriDroneId', nameField: 'pilotName' },
    oftSubject: { model: 'oftSubject', idField: 'oftSubjectId', nameField: 'subjectName' },
    oftThematicArea: {
        model: 'oftThematicArea',
        idField: 'oftThematicAreaId',
        nameField: 'thematicAreaName',
    },
    sector: { model: 'sector', idField: 'sectorId', nameField: 'sectorName' },
    fldThematicArea: {
        model: 'fldThematicArea',
        idField: 'thematicAreaId',
        nameField: 'thematicAreaName',
    },
    fldCategory: {
        model: 'fldCategory',
        idField: 'categoryId',
        nameField: 'categoryName',
    },
    fldSubcategory: {
        model: 'fldSubcategory',
        idField: 'subCategoryId',
        nameField: 'subCategoryName',
    },
    fldCrop: { model: 'fldCrop', idField: 'cropId', nameField: 'cropName' },
    cfldCrop: { model: 'fLDCropMaster', idField: 'cfldId', nameField: 'cropName' },
    cropType: { model: 'cropType', idField: 'typeId', nameField: 'typeName' },
    extensionActivity: { model: 'extensionActivity', idField: 'extensionActivityId', nameField: 'extensionName' },
    equipmentType: { model: 'equipmentTypeMaster', idField: 'equipmentTypeId', nameField: 'name' },
    equipmentMaster: { model: 'equipmentMaster', idField: 'equipmentMasterId', nameField: 'name' },
    equipmentStatus: { model: 'equipmentPresentStatusMaster', idField: 'equipmentStatusId', nameField: 'statusLabel' },
    unit: { model: 'unit', idField: 'unitId', nameField: 'unitName' },
    trainingType: { model: 'trainingType', idField: 'trainingTypeId', nameField: 'trainingTypeName' },
    trainingArea: { model: 'trainingArea', idField: 'trainingAreaId', nameField: 'trainingAreaName' },
    trainingThematicArea: { model: 'trainingThematicArea', idField: 'trainingThematicAreaId', nameField: 'trainingThematicAreaName' },
    trainingClientele: { model: 'clienteleMaster', idField: 'clienteleId', nameField: 'name' },
    trainingFundingSource: { model: 'fundingSourceMaster', idField: 'fundingSourceId', nameField: 'name' },
    courseCoordinator: { model: 'courseCoordinatorMaster', idField: 'coordinatorId', nameField: 'name' },
    // FldActivity master — what kvk_extension_activity.activityId references.
    fldActivity: { model: 'fldActivity', idField: 'activityId', nameField: 'activityName' },
    // OtherExtensionActivity master — what kvk_other_extension_activity.activityTypeId references.
    otherExtensionActivity: { model: 'otherExtensionActivity', idField: 'otherExtensionActivityId', nameField: 'otherExtensionName' },
    // ImportantDay master — what kvk_important_day_celebration.importantDayId references.
    importantDay: { model: 'importantDay', idField: 'importantDayId', nameField: 'dayName' },
    // Product hierarchy — what kvk_production_supply.{category,type,product} reference.
    productCategory: { model: 'productCategory', idField: 'productCategoryId', nameField: 'productCategoryName' },
    productType: { model: 'productType', idField: 'productTypeId', nameField: 'productCategoryType' },
    product: { model: 'product', idField: 'productId', nameField: 'productName' },
    // SoilWaterAnalysis master — what kvk_soil_water_analysis.analysisId references.
    soilWaterAnalysis: { model: 'soilWaterAnalysis', idField: 'soilWaterAnalysisId', nameField: 'analysisName' },
    // Publication type master — what kvk_publication_details.publicationId references.
    publication: { model: 'publication', idField: 'publicationId', nameField: 'publicationName' },
    // CRA system masters — what cra_details.{croppingSystemId,farmingSystemId} reference.
    craCropingSystem: { model: 'craCropingSystem', idField: 'craCropingSystemId', nameField: 'cropName' },
    craFarmingSystem: { model: 'craFarmingSystem', idField: 'craFarmingSystemId', nameField: 'farmingSystemName' },
    // NARI masters — nutrition garden references activity + garden type.
    nariActivity: { model: 'nariActivity', idField: 'nariActivityId', nameField: 'activityName' },
    nutritionGardenType: { model: 'nutritionGardenType', idField: 'nutritionGardenTypeId', nameField: 'name' },
    cropCategory: { model: 'cropCategory', idField: 'cropCategoryId', nameField: 'name' },
    // ARYA enterprise master — what arya_current_year/arya_prev_year.enterpriseId references.
    enterprise: { model: 'enterprise', idField: 'enterpriseId', nameField: 'enterpriseName' },
    // TSP/SCSP masters — what tsp_scsp.{tspScspTypeId,activityId} reference.
    tspScspType: { model: 'tspScspTypeMaster', idField: 'tspScspTypeId', nameField: 'typeName' },
    tspScspActivity: { model: 'tspScspActivities', idField: 'tspScspActivityId', nameField: 'activityName' },
    // NICRA details masters — what nicra_details.{nicraCategoryId,nicraSubCategoryId} reference.
    nicraCategory: { model: 'nicraCategory', idField: 'nicraCategoryId', nameField: 'categoryName' },
    nicraSubCategory: { model: 'nicraSubCategory', idField: 'nicraSubCategoryId', nameField: 'subCategoryName' },
    // NICRA seed-bank/fodder-bank master — what nicra_intervention.seedBankFodderBankId references.
    nicraSeedBankFodderBank: { model: 'nicraSeedBankFodderBankMaster', idField: 'nicraSeedBankFodderBankId', nameField: 'name' },
    // NICRA dignitary-type master — what nicra_dignitaries_visited.dignitaryTypeId references.
    nicraDignitaryType: { model: 'nicraDignitaryTypeMaster', idField: 'nicraDignitaryTypeId', nameField: 'name' },
    // NICRA PI-type master — what nicra_pi_copi.piTypeId references.
    nicraPiType: { model: 'nicraPiTypeMaster', idField: 'nicraPiTypeId', nameField: 'name' },
    // Natural-farming activity master — what physical_info / financial_information.activityId reference.
    naturalFarmingActivity: { model: 'naturalFarmingActivityMaster', idField: 'naturalFarmingActivityId', nameField: 'activityName' },
    // Natural-farming soil-parameter master — what soil_data_information.soilParameterId references.
    naturalFarmingSoilParameter: { model: 'naturalFarmingSoilParameterMaster', idField: 'naturalFarmingSoilParameterId', nameField: 'parameterName' },
};

function getMaster(key) {
    const m = MASTER_CATALOG[key];
    if (!m) throw new Error(`Unknown master "${key}"`);
    return m;
}

/** @returns {Promise<Array<{id:number,label:string}>>} */
async function listMasterOptions(key) {
    const m = getMaster(key);
    const rows = await prisma[m.model].findMany({
        select: { [m.idField]: true, [m.nameField]: true },
        orderBy: { [m.nameField]: 'asc' },
    });
    return rows.map(r => ({ id: r[m.idField], label: r[m.nameField] }));
}

module.exports = { MASTER_CATALOG, getMaster, listMasterOptions };
