const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');

const SCHEMA_MODELS = [
    ['backend/prisma/superadmin/zones/zone_schema.prisma', 'Zone'],
    ['backend/prisma/superadmin/zones/zone_schema.prisma', 'StateMaster'],
    ['backend/prisma/superadmin/zones/zone_schema.prisma', 'DistrictMaster'],
    ['backend/prisma/superadmin/zones/zone_schema.prisma', 'OrgMaster'],
    ['backend/prisma/superadmin/zones/zone_schema.prisma', 'UniversityMaster'],
    ['backend/prisma/superadmin/masters/extension_activity_type.prisma', 'FldActivity'],
    ['backend/prisma/superadmin/events.prisma', 'Event'],
    ['backend/prisma/kvk/achievements/projects/tcp_scsp_schema.prisma', 'TspScspTypeMaster'],
    ['backend/prisma/kvk/achievements/projects/natural_farming/physical_info_schema.prisma', 'NaturalFarmingActivityMaster'],
    ['backend/prisma/superadmin/masters/equipment_master.prisma', 'EquipmentMaster'],
    ['backend/prisma/kvk/soil_water_testing/equipment_schema.prisma', 'SoilWaterAnalysis'],
    ['backend/prisma/superadmin/masters/asset_present_status_master.prisma', 'VehiclePresentStatusMaster'],
    ['backend/prisma/superadmin/masters/asset_present_status_master.prisma', 'EquipmentPresentStatusMaster'],
    ['backend/prisma/kvk/achievements/projects/nari/bio_fortified_crops_schema.prisma', 'CropCategory'],
    ['backend/prisma/kvk/achievements/projects/nicra/nicra_details_schema.prisma', 'NicraSubCategory'],
    ['backend/prisma/kvk/achievements/projects/nicra/intervention_schema.prisma', 'NicraSeedBankFodderBankMaster'],
    ['backend/prisma/kvk/achievements/projects/nicra/dignitaries_visited_schema.prisma', 'NicraDignitaryTypeMaster'],
    ['backend/prisma/kvk/achievements/projects/nicra/pi_copi_schema.prisma', 'NicraPiTypeMaster'],
    ['backend/prisma/superadmin/masters/financial_project.prisma', 'FinancialProject'],
    ['backend/prisma/superadmin/masters/kvk_impact_area.prisma', 'ImpactSpecificAreaMaster'],
    ['backend/prisma/superadmin/masters/enterprise_type.prisma', 'EnterpriseTypeMaster'],
    ['backend/prisma/superadmin/masters/programme_type.prisma', 'ProgrammeTypeMaster'],
    ['backend/prisma/superadmin/masters/ppv_fra_training_type.prisma', 'PpvFraTrainingTypeMaster'],
    ['backend/prisma/kvk/misc/vip_visitors_schema.prisma', 'DignitaryType'],
    ['backend/prisma/superadmin/publication.prisma', 'Publication'],
];

function modelBlock(source, modelName) {
    const match = source.match(new RegExp(`model\\s+${modelName}\\s*\\{([\\s\\S]*?)\\n\\}`));
    assert.ok(match, `model ${modelName} should exist`);
    return match[1];
}

test('every previously unsupported master model stores isOther', () => {
    const missing = [];
    for (const [relativeFile, modelName] of SCHEMA_MODELS) {
        const source = fs.readFileSync(path.join(ROOT, relativeFile), 'utf8');
        if (!/^\s*isOther\s+Boolean\b/m.test(modelBlock(source, modelName))) {
            missing.push(modelName);
        }
    }
    assert.deepEqual(missing, []);
});

test('every all-master form renders an Other checkbox for each editable entity', () => {
    const expectedCheckboxes = {
        // Zone, State, District, Organization and University are structural
        // masters and intentionally do not support custom "Other" values.
        'BasicMasterForms.tsx': 0,
        'OftFldForms.tsx': 9,
        'TrainingExtensionForms.tsx': 8,
        'ProductionProjectForms.tsx': 11,
        // Equipment Type and Vehicle Type share one render branch.
        'OtherMastersForms.tsx': 35,
        'PublicationForms.tsx': 1,
    };
    const formsDir = path.join(ROOT, 'frontend/src/pages/dashboard/shared/forms');

    for (const [file, expected] of Object.entries(expectedCheckboxes)) {
        const source = fs.readFileSync(path.join(formsDir, file), 'utf8');
        const actual = (source.match(/<IsOtherCheckbox\b/g) || []).length;
        assert.equal(actual, expected, `${file} should render ${expected} Other checkboxes`);
    }
});

const COMPLETE_DOWNSTREAM_CONSUMERS = [
    ['backend/prisma/kvk/about-kvk/employee_schema.prisma', 'KvkStaff', 'disciplineOther'],
    ['backend/prisma/kvk/achievements/projects/cfld/extension_activity_schema.prisma', 'ExtensionActivityOrganized', 'activityOther'],
    ['backend/prisma/kvk/achievements/projects/cfld/budget_utilization_schema.prisma', 'KvkBudgetUtilization', 'cropOther'],
    ['backend/prisma/kvk/achievements/fld/technical_feedback_schema.prisma', 'FldTechnicalFeedback', 'cropOther'],
    ['backend/prisma/kvk/achievements/projects/natural_farming/demonstration_info_schema.prisma', 'DemonstrationInfo', 'staffCategoryOther'],
    ['backend/prisma/kvk/performance-indicators/impact/kvk_activities_schema.prisma', 'KvkImpactActivity', 'specificAreaOther'],
    ['backend/prisma/kvk/performance-indicators/impact/entrepreneurship_schema.prisma', 'Entrepreneurship', 'enterpriseTypeOther'],
    ['backend/prisma/kvk/achievements/fld/fld_schema.prisma', 'KvkFldIntroduction', 'seasonOther'],
    ['backend/prisma/kvk/achievements/oft_schema.prisma', 'Kvkoft', 'seasonOther'],
    ['backend/prisma/kvk/achievements/projects/climate_resilient/cra_details_schema.prisma', 'CraDetails', 'seasonOther'],
    ['backend/prisma/kvk/achievements/projects/csisa_schema.prisma', 'Csisa', 'seasonOther'],
    ['backend/prisma/kvk/achievements/projects/nari/bio_fortified_crops_schema.prisma', 'NariBioFortifiedCrop', 'seasonOther'],
    ['backend/prisma/kvk/achievements/projects/natural_farming/demonstration_info_schema.prisma', 'DemonstrationInfo', 'seasonOther'],
    ['backend/prisma/kvk/achievements/projects/natural_farming/soil_data_info_schema.prisma', 'SoilDataInformation', 'seasonOther'],
    ['backend/prisma/kvk/achievements/projects/nicra/nicra_details_schema.prisma', 'NicraDetails', 'seasonOther'],
    ['backend/prisma/kvk/achievements/projects/seed_hub_schema.prisma', 'KvkSeedHubProgram', 'seasonOther'],
    ['backend/prisma/kvk/performance-indicators/infrastructure/instructional_farm_crops_schema.prisma', 'InstructionalFarmCrop', 'seasonOther'],
];

test('every approved downstream selector has nullable specify-other storage', () => {
    for (const [relativeFile, modelName, field] of COMPLETE_DOWNSTREAM_CONSUMERS) {
        const source = fs.readFileSync(path.join(ROOT, relativeFile), 'utf8');
        assert.match(
            modelBlock(source, modelName),
            new RegExp(`^\\s*${field}\\s+String\\?(?:\\s|$)`, 'm'),
            `${modelName} should store ${field}`,
        );
    }
});

const DOWNSTREAM_UI_CONTRACTS = [
    ['frontend/src/pages/dashboard/shared/forms/AboutKvkForms.tsx', 'disciplineOther'],
    ['frontend/src/pages/dashboard/shared/forms/projects/CfldForms.tsx', 'activityOther'],
    ['frontend/src/pages/dashboard/shared/forms/projects/CfldForms.tsx', 'cropOther'],
    ['frontend/src/pages/dashboard/shared/forms/OftFldForms.tsx', 'cropOther'],
    ['frontend/src/pages/dashboard/shared/forms/projects/NaturalFarmingForms.tsx', 'staffCategoryOther'],
    ['frontend/src/pages/dashboard/shared/forms/performance-indicators/ImpactForms.tsx', 'specificAreaOther'],
    ['frontend/src/pages/dashboard/shared/forms/performance-indicators/ImpactForms.tsx', 'enterpriseTypeOther'],
    ['frontend/src/pages/dashboard/shared/forms/OftFldForms.tsx', 'seasonOther'],
    ['frontend/src/pages/dashboard/shared/forms/projects/CraForms.tsx', 'seasonOther'],
    ['frontend/src/pages/dashboard/shared/forms/projects/CsisaForms.tsx', 'seasonOther'],
    ['frontend/src/pages/dashboard/shared/forms/projects/NariForms.tsx', 'seasonOther'],
    ['frontend/src/pages/dashboard/shared/forms/projects/NaturalFarmingForms.tsx', 'seasonOther'],
    ['frontend/src/pages/dashboard/shared/forms/projects/NicraForms.tsx', 'seasonOther'],
    ['frontend/src/pages/dashboard/shared/forms/projects/SeedHubForms.tsx', 'seasonOther'],
    ['frontend/src/pages/dashboard/shared/forms/performance-indicators/InfrastructurePerformanceForms.tsx', 'seasonOther'],
];

test('every approved downstream form conditionally renders and clears specify-other input', () => {
    for (const [relativeFile, field] of DOWNSTREAM_UI_CONTRACTS) {
        const source = fs.readFileSync(path.join(ROOT, relativeFile), 'utf8');
        assert.match(source, /useOtherSpecify|isOther[A-Z]\w*Selected/, `${relativeFile} should inspect the selected option's isOther flag`);
        assert.match(source, /isOther/, `${relativeFile} should preserve the master option's isOther flag`);
        assert.match(source, /<SpecifyOtherInput\b/, `${relativeFile} should render SpecifyOtherInput`);
        assert.match(source, new RegExp(`['\"]${field}['\"]|\\.${field}\\b`), `${relativeFile} should bind ${field}`);
    }
});

const DOWNSTREAM_REPOSITORY_CONTRACTS = [
    ['backend/repositories/forms/aboutKvkRepository.js', 'disciplineOther'],
    ['backend/repositories/forms/cfldExtensionActivityRepository.js', 'activityOther'],
    ['backend/repositories/forms/cfldBudgetUtilizationRepository.js', 'cropOther'],
    ['backend/repositories/forms/fldTechnicalFeedbackRepository.js', 'cropOther'],
    ['backend/repositories/forms/naturalFarmingRepository.js', 'staffCategoryOther'],
    ['backend/repositories/forms/kvkImpactActivityRepository.js', 'specificAreaOther'],
    ['backend/repositories/forms/entrepreneurshipRepository.js', 'enterpriseTypeOther'],
    ['backend/repositories/forms/fldRepository.js', 'seasonOther'],
    ['backend/repositories/forms/oftRepository.js', 'seasonOther'],
    ['backend/repositories/forms/craDetailsRepository.js', 'seasonOther'],
    ['backend/repositories/forms/csisaRepository.js', 'seasonOther'],
    ['backend/repositories/forms/nariBioFortifiedCropRepository.js', 'seasonOther'],
    ['backend/repositories/forms/naturalFarmingRepository.js', 'seasonOther'],
    ['backend/repositories/forms/nicraDetailsRepository.js', 'seasonOther'],
    ['backend/repositories/forms/seedHubRepository.js', 'seasonOther'],
    ['backend/repositories/forms/instructionalFarmCropRepository.js', 'seasonOther'],
];

test('every approved downstream repository accepts its specify-other property', () => {
    for (const [relativeFile, field] of DOWNSTREAM_REPOSITORY_CONTRACTS) {
        const source = fs.readFileSync(path.join(ROOT, relativeFile), 'utf8');
        assert.match(source, new RegExp(`\\b${field}\\b`), `${relativeFile} should handle ${field}`);
    }
});

test('employee discipline specify-other survives frontend and backend allow-lists', () => {
    for (const relativeFile of [
        'frontend/src/services/aboutKvkApi.ts',
        'backend/repositories/forms/aboutKvkRepository.js',
    ]) {
        const source = fs.readFileSync(path.join(ROOT, relativeFile), 'utf8');
        assert.match(source, /disciplineOther/, `${relativeFile} should allow disciplineOther`);
    }
});

test('actual downstream selectors have nullable specify-other storage', () => {
    const consumers = [
        ['backend/prisma/kvk/achievements/projects/natural_farming/physical_info_schema.prisma', 'PhysicalInfo', 'activityOther'],
        ['backend/prisma/kvk/achievements/projects/natural_farming/financial_info_schema.prisma', 'FinancialInformation', 'activityOther'],
        ['backend/prisma/kvk/about-kvk/equipment_schema.prisma', 'KvkEquipmentDetail', 'equipmentStatusOther'],
        ['backend/prisma/kvk/about-kvk/vehicle_schema.prisma', 'KvkVehicleDetail', 'vehicleStatusOther'],
        ['backend/prisma/kvk/soil_water_testing/equipment_schema.prisma', 'KkvSoilWaterEquipment', 'analysisOther'],
        ['backend/prisma/kvk/soil_water_testing/analysis_details_schema.prisma', 'KkvSoilWaterAnalysis', 'analysisOther'],
        ['backend/prisma/kvk/achievements/projects/nari/bio_fortified_crops_schema.prisma', 'NariBioFortifiedCrop', 'cropCategoryOther'],
        ['backend/prisma/kvk/achievements/projects/nari/bio_fortified_crops_schema.prisma', 'NariBioFortifiedCrop', 'activityOther'],
        ['backend/prisma/kvk/achievements/projects/nari/extension_activity_schema.prisma', 'NariExtensionActivity', 'activityOther'],
        ['backend/prisma/kvk/achievements/projects/nari/training_programme_schema.prisma', 'NariTrainingProgramme', 'activityOther'],
        ['backend/prisma/kvk/achievements/projects/nari/value_addition_schema.prisma', 'NariValueAddition', 'activityOther'],
        ['backend/prisma/kvk/achievements/projects/nicra/nicra_details_schema.prisma', 'NicraDetails', 'subCategoryOther'],
        ['backend/prisma/kvk/achievements/projects/nicra/intervention_schema.prisma', 'NicraIntervention', 'seedBankFodderBankOther'],
        ['backend/prisma/kvk/achievements/projects/nicra/dignitaries_visited_schema.prisma', 'NicraDignitariesVisited', 'dignitaryTypeOther'],
        ['backend/prisma/kvk/achievements/projects/nicra/pi_copi_schema.prisma', 'NicraPiCopi', 'piTypeOther'],
        ['backend/prisma/kvk/misc/ppv_fra/training_schema.prisma', 'PpvFraTraining', 'typeOther'],
        ['backend/prisma/kvk/misc/vip_visitors_schema.prisma', 'VipVisitor', 'dignitaryTypeOther'],
        ['backend/prisma/kvk/achievements/publication_details_schema.prisma', 'KvkPublicationDetails', 'publicationOther'],
        ['backend/prisma/kvk/achievements/fld/extension_training_activitie_schema.prisma', 'FldExtension', 'activityOther'],
        ['backend/prisma/kvk/achievements/projects/climate_resilient/cra_extension_activity_schema.prisma', 'CraExtensionActivity', 'activityOther'],
    ];

    for (const [relativeFile, modelName, field] of consumers) {
        const source = fs.readFileSync(path.join(ROOT, relativeFile), 'utf8');
        assert.match(modelBlock(source, modelName), new RegExp(`^\\s*${field}\\s+String\\?(?:\\s|$)`, 'm'));
    }
});
