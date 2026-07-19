/**
 * KVK Module Wipe Registry  ── TEMPORARY MIGRATION TOOL ──
 *
 * Maps a frontend `entityType` (the string DataManagementView already computes
 * from the route) to the Prisma model(s) whose rows make up that module. The
 * "Delete All" button on each KVK form page wipes every row of these models for
 * the requesting user's OWN kvkId — used to clear bad data between migration
 * re-imports. Masters are never listed here and the about-kvk `Kvk` identity
 * row itself is intentionally excluded.
 *
 * Every model name is asserted against the live Prisma datamodel at load time:
 * a typo / renamed model throws on boot instead of silently failing (or worse,
 * touching the wrong table) at delete time. Each listed model must carry a
 * `kvkId` scalar so the wipe can be scoped — this is also asserted.
 *
 * Child rows are removed via the schema's `onDelete: Cascade` relations, so a
 * module usually needs only its primary table here. When a module's children do
 * NOT cascade, list them child-first before the parent.
 */

const prisma = require('../../config/prisma.js');

// entityType  →  { label, models: [PrismaModelName, ...] }   (child-first)
const REGISTRY = {
    // ── About KVK ──────────────────────────────────────────────────────
    // NOTE: `kvks` (the Kvk identity row) is deliberately NOT wipeable.
    'kvk-bank-accounts': { label: 'Bank Accounts', models: ['KvkBankAccount'] },
    'kvk-employees': { label: 'Employee Details', models: ['KvkStaff'] },
    'kvk-infrastructure': { label: 'Infrastructure', models: ['KvkInfrastructure'] },
    'kvk-land-details': { label: 'Land Details', models: ['KvkLandDetail'] },
    'kvk-vehicles': { label: 'Vehicles', models: ['KvkVehicle'] },
    'kvk-vehicle-details': { label: 'Vehicle Details', models: ['KvkVehicleDetail'] },
    'kvk-equipments': { label: 'Equipments', models: ['KvkEquipment'] },
    'kvk-equipment-details': { label: 'Equipment Details', models: ['KvkEquipmentDetail'] },

    // ── Achievements ───────────────────────────────────────────────────
    'achievement-oft': { label: 'OFT', models: ['Kvkoft'] },
    'achievement-fld': { label: 'FLD', models: ['KvkFldIntroduction'] },
    'achievement-fld-extension-training': { label: 'FLD Extension Training', models: ['FldExtension'] },
    'achievement-fld-technical-feedback': { label: 'FLD Technical Feedback', models: ['FldTechnicalFeedback'] },
    'achievement-training': { label: 'Trainings', models: ['TrainingAchievement'] },
    'achievement-extension': { label: 'Extension Activities', models: ['KvkExtensionActivity'] },
    'achievement-other-extension': { label: 'Other Extension Activities', models: ['KvkOtherExtensionActivity'] },
    'achievement-technology-week': { label: 'Technology Week', models: ['KvkTechnologyWeekCelebration'] },
    'achievement-celebration-days': { label: 'Celebration Days', models: ['KvkImportantDayCelebration'] },
    'achievement-production-supply': { label: 'Production & Supply', models: ['KvkProductionSupply'] },
    'achievement-publication-details': { label: 'Publication Details', models: ['KvkPublicationDetails'] },
    'achievement-soil-equipment': { label: 'Soil & Water Equipment', models: ['KkvSoilWaterEquipment'] },
    'achievement-soil-analysis': { label: 'Soil & Water Analysis', models: ['KkvSoilWaterAnalysis'] },
    'achievement-world-soil-day': { label: 'World Soil Day', models: ['KkvWorldSoilCelebration'] },
    'achievement-hrd': { label: 'HRD', models: ['HrdProgram'] },
    'achievement-award-kvk': { label: 'KVK Awards', models: ['KvkAward'] },
    'achievement-award-scientist': { label: 'Scientist Awards', models: ['ScientistAward'] },
    'achievement-award-farmer': { label: 'Farmer Awards', models: ['FarmerAward'] },

    // ── Projects ───────────────────────────────────────────────────────
    'project-cfld-technical-param': { label: 'CFLD Technical Parameters', models: ['CfldTechnicalParameter'] },
    'project-cfld-extension-activity': { label: 'CFLD Extension Activities', models: ['ExtensionActivityOrganized'] },
    'project-cfld-budget': { label: 'CFLD Budget Utilization', models: ['KvkBudgetUtilization'] },
    'project-cra-details': { label: 'CRA Details', models: ['CraDetails'] },
    'project-cra-extension-activity': { label: 'CRA Extension Activities', models: ['CraExtensionActivity'] },
    'project-fpo-details': { label: 'FPO Details', models: ['FpoCbboDetails'] },
    'project-fpo-management': { label: 'FPO Management', models: ['FpoManagement'] },
    'project-drmr-details': { label: 'DRMR Details', models: ['DrmrDetails'] },
    'project-drmr-activity': { label: 'DRMR Activities', models: ['DrmrActivity'] },
    'project-nari-nutri-garden': { label: 'NARI Nutrition Garden', models: ['NariNutritionalGarden'] },
    'project-nari-bio-fortified': { label: 'NARI Bio-Fortified Crops', models: ['NariBioFortifiedCrop'] },
    'project-nari-value-addition': { label: 'NARI Value Addition', models: ['NariValueAddition'] },
    'project-nari-training': { label: 'NARI Training', models: ['NariTrainingProgramme'] },
    'project-nari-extension': { label: 'NARI Extension', models: ['NariExtensionActivity'] },
    'project-arya-current': { label: 'ARYA Current Year', models: ['AryaCurrentYear'] },
    'project-arya-evaluation': { label: 'ARYA Previous Year', models: ['AryaPrevYear'] },
    'project-csisa': { label: 'CSISA', models: ['Csisa'] },
    'project-tsp-scsp': { label: 'TSP/SCSP', models: ['TspScsp'] },
    'project-nicra-basic': { label: 'NICRA Basic Info', models: ['NicraBasicInfo'] },
    'project-nicra-details': { label: 'NICRA Details', models: ['NicraDetails'] },
    'project-nicra-training': { label: 'NICRA Training', models: ['NicraTraining'] },
    'project-nicra-extension': { label: 'NICRA Extension', models: ['NicraExtensionActivity'] },
    'project-nicra-intervention': { label: 'NICRA Interventions', models: ['NicraIntervention'] },
    'project-nicra-revenue': { label: 'NICRA Revenue Generated', models: ['NicraRevenueGenerated'] },
    'project-nicra-custom-hiring': { label: 'NICRA Farm Implements', models: ['NicraFarmImplement'] },
    'project-nicra-vcrmc': { label: 'NICRA VCRMC', models: ['NicraVcrmc'] },
    'project-nicra-soil-health': { label: 'NICRA Soil Health', models: ['NicraSoilHealthCard'] },
    'project-nicra-convergence': { label: 'NICRA Convergence', models: ['NicraConvergenceProgramme'] },
    'project-nicra-dignitaries': { label: 'NICRA Dignitaries Visited', models: ['NicraDignitariesVisited'] },
    'project-nicra-pi-copi': { label: 'NICRA PI/Co-PI', models: ['NicraPiCopi'] },
    'project-natural-farming-geo': { label: 'Natural Farming Geographical', models: ['GeographicalInfo'] },
    'project-natural-farming-physical': { label: 'Natural Farming Physical', models: ['PhysicalInfo'] },
    'project-natural-farming-demo': { label: 'Natural Farming Demonstration', models: ['DemonstrationInfo'] },
    'project-natural-farming-farmers': { label: 'Natural Farming Farmers', models: ['FarmersPracticingNaturalFarming'] },
    'project-natural-farming-beneficiaries': { label: 'Natural Farming Beneficiaries', models: ['BeneficiariesDetails'] },
    'project-natural-farming-soil': { label: 'Natural Farming Soil Data', models: ['SoilDataInformation'] },
    'project-natural-farming-budget': { label: 'Natural Farming Financial', models: ['FinancialInformation'] },
    'project-agri-drone': { label: 'Agri Drone', models: ['KvkAgriDrone'] },
    'project-agri-drone-demo': { label: 'Agri Drone Demonstrations', models: ['KvkAgriDroneDemonstration'] },
    'project-seed-hub': { label: 'Seed Hub', models: ['KvkSeedHubProgram'] },
    'project-other': { label: 'Other KVK Programmes', models: ['KvkOtherProgramme'] },

    // ── Miscellaneous ──────────────────────────────────────────────────
    'misc-prevalent-diseases-crops': { label: 'Prevalent Diseases (Crops)', models: ['PrevalentDiseasesInCrop'] },
    'misc-prevalent-diseases-livestock': { label: 'Prevalent Diseases (Livestock)', models: ['PrevalentDiseasesOnLivestock'] },
    'misc-ppv-fra-training': { label: 'PPV & FRA Training', models: ['PpvFraTraining'] },
    'misc-ppv-fra-plant-varieties': { label: 'PPV & FRA Plant Varieties', models: ['PpvFraPlantVarieties'] },
    'misc-rawe-fet': { label: 'RAWE / FET', models: ['RaweFetFitProgramme'] },
    'misc-vip-visitors': { label: 'VIP Visitors', models: ['VipVisitor'] },

    // ── Performance Indicators ─────────────────────────────────────────
    'performance-impact-kvk-activities': { label: 'Impact: KVK Activities', models: ['KvkImpactActivity'] },
    'performance-impact-entrepreneurship': { label: 'Impact: Entrepreneurship', models: ['Entrepreneurship'] },
    'performance-impact-success-stories': { label: 'Impact: Success Stories', models: ['SuccessStory'] },
    'performance-district-level': { label: 'District Level Data', models: ['DistrictLevelData'] },
    'performance-operational-area': { label: 'Operational Area', models: ['OperationalArea'] },
    'performance-village-adoption': { label: 'Village Adoption', models: ['VillageAdoption'] },
    'performance-priority-thrust': { label: 'Priority Thrust Areas', models: ['PriorityThrustArea'] },
    'performance-demonstration-units': { label: 'Demonstration Units', models: ['DemonstrationUnit'] },
    'performance-instructional-farm-crops': { label: 'Instructional Farm (Crops)', models: ['InstructionalFarmCrop'] },
    'performance-production-units': { label: 'Production Units', models: ['ProductionUnit'] },
    'performance-instructional-farm-livestock': { label: 'Instructional Farm (Livestock)', models: ['InstructionalFarmLivestock'] },
    'performance-hostel': { label: 'Hostel Utilization', models: ['HostelUtilization'] },
    'performance-staff-quarters': { label: 'Staff Quarters Utilization', models: ['StaffQuartersUtilization'] },
    'performance-rainwater-harvesting': { label: 'Rainwater Harvesting', models: ['RainwaterHarvesting'] },
    'performance-budget-details': { label: 'Budget Details', models: ['BudgetDetail'] },
    'performance-project-budget': { label: 'Project Budget', models: ['ProjectBudget'] },
    'performance-revolving-fund': { label: 'Revolving Fund', models: ['RevolvingFund'] },
    'performance-revenue-generation': { label: 'Revenue Generation', models: ['RevenueGeneration'] },
    'performance-resource-generation': { label: 'Resource Generation', models: ['ResourceGeneration'] },
    'performance-functional-linkage': { label: 'Functional Linkages', models: ['FunctionalLinkage'] },

    // ── Digital Information ────────────────────────────────────────────
    'misc-digital-mobile-app': { label: 'Mobile App', models: ['MobileApp'] },
    'misc-digital-web-portal': { label: 'Web Portal', models: ['WebPortal'] },
    'misc-digital-kisan-sarathi': { label: 'Kisan Sarathi', models: ['KisanSarathi'] },
    'misc-digital-kisan-mobile-advisory': { label: 'Kisan Mobile Advisory', models: ['Kmas'] },
    'misc-digital-other-channels': { label: 'Other Channels', models: ['MsgDetails'] },

    // ── Swachhta Bharat Abhiyaan ───────────────────────────────────────
    'misc-swachhta-sewa': { label: 'Swachhta Hi Sewa', models: ['SwachhtaHiSewa'] },
    'misc-swachhta-pakhwada': { label: 'Swachhta Pakhwada', models: ['SwachhtaPakhwada'] },
    'misc-swachhta-budget': { label: 'Swachhta Quarterly Expenditure', models: ['SwachhQuarterlyExpenditure'] },

    // ── Meetings ───────────────────────────────────────────────────────
    'misc-meetings-sac': { label: 'SAC Meetings', models: ['SacMeeting'] },
    'misc-meetings-other': { label: 'Other Meetings', models: ['AtariMeeting'] },
};

// Lowercase-first-letter Prisma client accessor, e.g. KvkBankAccount → kvkBankAccount
function toAccessor(modelName) {
    return modelName.charAt(0).toLowerCase() + modelName.slice(1);
}

// ── Boot-time integrity check ─────────────────────────────────────────
// Fail loudly if any registry model is unknown or not kvk-scoped.
(function assertRegistry() {
    const dm = prisma._runtimeDataModel;
    if (!dm || !dm.models) {
        console.warn('[kvkModuleWipeRegistry] could not access Prisma datamodel; skipping integrity check');
        return;
    }
    const problems = [];
    for (const [entityType, def] of Object.entries(REGISTRY)) {
        for (const modelName of def.models) {
            const model = dm.models[modelName];
            if (!model) {
                problems.push(`${entityType}: unknown model "${modelName}"`);
                continue;
            }
            const hasKvkId = (model.fields || []).some((f) => f.name === 'kvkId');
            if (!hasKvkId) {
                problems.push(`${entityType}: model "${modelName}" has no kvkId field`);
            }
        }
    }
    if (problems.length) {
        throw new Error(
            '[kvkModuleWipeRegistry] invalid entries:\n  ' + problems.join('\n  ')
        );
    }
})();

function getWipeSpec(entityType) {
    return REGISTRY[entityType] || null;
}

module.exports = { REGISTRY, getWipeSpec, toAccessor };
