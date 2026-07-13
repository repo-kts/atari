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
        'BasicMasterForms.tsx': 5,
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
