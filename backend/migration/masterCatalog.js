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
