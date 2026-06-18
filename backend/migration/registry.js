/**
 * Module spec registry. Add a new module by requiring its spec here — the UI
 * dropdown and all engine endpoints pick it up automatically.
 */
const specs = [
    require('./modules/bankAccount.js'),
    require('./modules/employee.js'),
    require('./modules/infrastructure.js'),
    require('./modules/oft.js'),
    require('./modules/vehicle.js'),
    require('./modules/vehicleDetails.js'),
    require('./modules/equipment.js'),
    require('./modules/equipmentDetails.js'),
    require('./modules/fld.js'),
    require('./modules/cfldTechnicalParameter.js'),
    require('./modules/cfldExtensionActivity.js'),
    require('./modules/cfldBudgetUtilization.js'),
    require('./modules/training.js'),
    require('./modules/extensionActivity.js'),
    require('./modules/otherExtensionActivity.js'),
    require('./modules/technologyWeek.js'),
    require('./modules/celebrationDay.js'),
    require('./modules/productionSupply.js'),
    require('./modules/soilWaterAnalysis.js'),
    require('./modules/publication.js'),
    require('./modules/kvkAward.js'),
    require('./modules/scientistAward.js'),
    require('./modules/farmerAward.js'),
    require('./modules/hrdProgram.js'),
    require('./modules/craDetails.js'),
    require('./modules/craExtensionActivity.js'),
    require('./modules/fpoCbbo.js'),
    require('./modules/fpoManagement.js'),
    require('./modules/drmrDetails.js'),
    require('./modules/drmrActivity.js'),
    require('./modules/nariNutritionGarden.js'),
    require('./modules/nariBioFortifiedCrop.js'),
    require('./modules/nariValueAddition.js'),
    require('./modules/nariTrainingProgramme.js'),
    require('./modules/nariExtensionActivity.js'),
    require('./modules/aryaCurrentYear.js'),
    require('./modules/aryaPrevYear.js'),
    require('./modules/csisa.js'),
    require('./modules/tspScsp.js'),
    require('./modules/nicraBasicInfo.js'),
    require('./modules/nicraDetails.js'),
    require('./modules/nicraTraining.js'),
    require('./modules/nicraExtensionActivity.js'),
];

const byKey = new Map(specs.map(s => [s.key, s]));

function listModules() {
    return specs.map(s => ({
        key: s.key,
        label: s.label,
        model: s.model,
        foreignKeys: s.foreignKeys || {},
    }));
}

function getModule(key) {
    const spec = byKey.get(key);
    if (!spec) throw new Error(`Unknown module "${key}"`);
    return spec;
}

module.exports = { listModules, getModule };
