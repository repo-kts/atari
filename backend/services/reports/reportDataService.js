const reportRepository = require('../../repositories/reports/reportRepository.js');
const oftReportRepository = require('../../repositories/reports/oftReport/index.js');
const cfldReportRepository = require('../../repositories/reports/cfldReport/index.js');
const craReportRepository = require('../../repositories/reports/craReport/index.js');
const fpoReportRepository = require('../../repositories/reports/fpoReport/index.js');
const drmrReportRepository = require('../../repositories/reports/drmrReport/index.js');
const nariReportRepository = require('../../repositories/reports/nariReport/index.js');
const aryaReportRepository = require('../../repositories/reports/aryaReport/index.js');
const csisaReportRepository = require('../../repositories/reports/csisaReport/index.js');
const nicraReportRepository = require('../../repositories/reports/nicraReport/index.js');
const tspScspReportRepository = require('../../repositories/reports/tspScspReport/index.js');
const seedHubReportRepository = require('../../repositories/reports/seedHubReport/index.js');
const naturalFarmingReportRepository = require('../../repositories/reports/naturalFarmingReport/index.js');
const otherProgrammeReportRepository = require('../../repositories/reports/otherProgrammeReport/index.js');
const specialProgrammeReportRepository = require('../../repositories/reports/specialProgrammeReport/index.js');
const functionalLinkageReportRepository = require('../../repositories/reports/functionalLinkageReport/index.js');
const successStoryReportRepository = require('../../repositories/reports/successStoryReport/index.js');
const entrepreneurshipReportRepository = require('../../repositories/reports/entrepreneurshipReport/index.js');
const kvkImpactActivityReportRepository = require('../../repositories/reports/kvkImpactActivityReport/index.js');
const demonstrationUnitReportRepository = require('../../repositories/reports/demonstrationUnitReport/index.js');
const instructionalFarmCropReportRepository = require('../../repositories/reports/instructionalFarmCropReport/index.js');
const productionUnitReportRepository = require('../../repositories/reports/productionUnitReport/index.js');
const instructionalFarmLivestockReportRepository = require('../../repositories/reports/instructionalFarmLivestockReport/index.js');
const hostelUtilizationReportRepository = require('../../repositories/reports/hostelUtilizationReport/index.js');
const staffQuartersUtilizationReportRepository = require('../../repositories/reports/staffQuartersUtilizationReport/index.js');
const rainwaterHarvestingReportRepository = require('../../repositories/reports/rainwaterHarvestingReport/index.js');
const agriDroneReportRepository = require('../../repositories/reports/agriDroneReport/index.js');
const fldStateCategoryReportRepository = require('../../repositories/reports/fldStateCategoryReport/index.js');
const trainingCapacityReportRepository = require('../../repositories/reports/trainingCapacityReport/index.js');
const extensionOutreachReportRepository = require('../../repositories/reports/extensionOutreachReport/index.js');
const otherExtensionContentReportRepository = require('../../repositories/reports/otherExtensionContentReport/index.js');
const technologyWeekCelebrationReportRepository = require('../../repositories/reports/technologyWeekCelebrationReport/index.js');
const celebrationDaysReportRepository = require('../../repositories/reports/celebrationDaysReport/index.js');
const productionSupplyPageReportRepository = require('../../repositories/reports/productionSupplyPageReport/index.js');
const soilWaterEquipmentReportRepository = require('../../repositories/reports/soilWaterEquipmentReport/index.js');
const soilWaterAnalysisReportRepository = require('../../repositories/reports/soilWaterAnalysisReport/index.js');
const worldSoilDayReportRepository = require('../../repositories/reports/worldSoilDayReport/index.js');
const miscReportRepository = require('../../repositories/reports/miscReport/index.js');
const digitalInfoReportRepository = require('../../repositories/reports/digitalInfoReport/index.js');
const swachhtaReportRepository = require('../../repositories/reports/swachhtaReport/index.js');
const meetingsReportRepository = require('../../repositories/reports/meetingsReport/index.js');
const publicationDetailsReportRepository = require('../../repositories/reports/publicationDetailsReportRepository.js');
const kvkAwardReportRepository = require('../../repositories/reports/kvkAwardReportRepository.js');
const scientistAwardReportRepository = require('../../repositories/reports/scientistAwardReportRepository.js');
const farmerAwardReportRepository = require('../../repositories/reports/farmerAwardReportRepository.js');
const hrdProgramReportRepository = require('../../repositories/reports/hrdProgramReportRepository.js');
const operationalAreaReportRepository = require('../../repositories/reports/operationalAreaReportRepository.js');
const villageAdoptionReportRepository = require('../../repositories/reports/villageAdoptionReportRepository.js');
const priorityThrustAreaReportRepository = require('../../repositories/reports/priorityThrustAreaReportRepository.js');
const budgetDetailReportRepository = require('../../repositories/reports/budgetDetailReportRepository.js');
const projectBudgetReportRepository = require('../../repositories/reports/projectBudgetReportRepository.js');
const revolvingFundReportRepository = require('../../repositories/reports/revolvingFundReportRepository.js');
const revenueGenerationReportRepository = require('../../repositories/reports/revenueGenerationReportRepository.js');
const resourceGenerationReportRepository = require('../../repositories/reports/resourceGenerationReportRepository.js');
const { getSectionConfig } = require('../../config/reportConfig.js');
const { normalizeReportKvkId } = require('../../utils/reportKvkId.js');
const cacheService = require('../cache/redisCacheService.js');
const CacheKeyBuilder = require('../../utils/cacheKeyBuilder.js');
const { getSectionDataTTL, getKvkInfoTTL } = require('../../config/cacheConfig.js');

/**
 * Report Data Service
 * Fetches and transforms data for report generation
 */
class ReportDataService {
    /**
     * Get data for a specific section (with caching)
     */
    async getSectionData(sectionId, kvkId, filters = {}) {
        const sectionConfig = getSectionConfig(sectionId);
        if (!sectionConfig) {
            throw new Error(`Section ${sectionId} not found`);
        }

        const effectiveKvkId = normalizeReportKvkId(kvkId);
        if (effectiveKvkId == null) {
            throw new Error('Invalid or missing KVK ID');
        }

        // Apply filters based on section configuration
        const sectionFilters = this._buildSectionFilters(sectionConfig, filters);
        const hasFilters = Object.keys(sectionFilters).length > 0;

        // Build cache key
        const cacheKey = CacheKeyBuilder.sectionData(effectiveKvkId, sectionId, sectionFilters);
        const ttl = getSectionDataTTL(hasFilters);

        // Try to get from cache first
        const cached = await cacheService.get(cacheKey);
        if (cached !== null) {
            return cached;
        }

        // Fetch from database
        let rawData;
        const dataSource = sectionConfig.dataSource;

        switch (dataSource) {
            case 'kvk':
                rawData = await reportRepository.getKvkBasicInfo(effectiveKvkId);
                break;
            case 'kvkBankAccounts':
                rawData = await reportRepository.getKvkBankAccounts(effectiveKvkId, sectionFilters);
                break;
            case 'kvkEmployees':
                rawData = await reportRepository.getKvkEmployees(effectiveKvkId, sectionFilters);
                break;
            case 'kvkEmployeesHeads':
                rawData = await reportRepository.getKvkEmployeeHeads(effectiveKvkId, sectionFilters);
                break;
            case 'kvkStaffTransferred':
                rawData = await reportRepository.getKvkStaffTransferred(effectiveKvkId, sectionFilters);
                break;
            case 'kvkInfrastructure':
                rawData = await reportRepository.getKvkInfrastructure(effectiveKvkId, sectionFilters);
                break;
            case 'kvkVehicles':
                rawData = await reportRepository.getKvkVehicles(effectiveKvkId, sectionFilters);
                break;
            case 'kvkVehicleDetails':
                rawData = await reportRepository.getKvkVehicleDetails(effectiveKvkId, sectionFilters);
                break;
            case 'kvkEquipments':
                rawData = await reportRepository.getKvkEquipments(effectiveKvkId, sectionFilters);
                break;
            case 'kvkEquipmentRecords':
                rawData = await reportRepository.getKvkEquipmentRecords(effectiveKvkId, sectionFilters);
                break;
            case 'kvkFarmImplements':
                rawData = await reportRepository.getKvkFarmImplements(effectiveKvkId, sectionFilters);
                break;
            case 'oftSummary': {
                const [summaryRecords, subjects] = await Promise.all([
                    oftReportRepository.getOftSummaryData(effectiveKvkId, sectionFilters),
                    oftReportRepository.getOftSubjectsWithThematicAreas(),
                ]);
                rawData = { records: summaryRecords, subjects };
                break;
            }
            case 'oftDetailCards':
                rawData = await oftReportRepository.getOftDetailCards(effectiveKvkId, sectionFilters);
                break;
            case 'cfldCombined':
                rawData = await cfldReportRepository.getCfldCombinedData(effectiveKvkId, sectionFilters);
                break;
            case 'cfldExtensionActivity':
                rawData = await cfldReportRepository.getCfldExtensionActivityData(effectiveKvkId, sectionFilters);
                break;
            case 'cfldBudgetUtilization':
                rawData = await cfldReportRepository.getCfldBudgetUtilizationData(effectiveKvkId, sectionFilters);
                break;
            case 'craDetails':
                rawData = await craReportRepository.getCraDetailsData(effectiveKvkId, sectionFilters);
                break;
            case 'craExtensionActivity':
                rawData = await craReportRepository.getCraExtensionActivityData(effectiveKvkId, sectionFilters);
                break;
            case 'fpoCbboDetails':
                rawData = await fpoReportRepository.getFpoCbboDetailsData(effectiveKvkId, sectionFilters);
                break;
            case 'fpoManagement':
                rawData = await fpoReportRepository.getFpoManagementData(effectiveKvkId, sectionFilters);
                break;
            case 'drmrDetails':
                rawData = await drmrReportRepository.getDrmrDetailsData(effectiveKvkId, sectionFilters);
                break;
            case 'drmrActivity':
                rawData = await drmrReportRepository.getDrmrActivityData(effectiveKvkId, sectionFilters);
                break;
            case 'nariBioFortified':
                rawData = await nariReportRepository.getNariBioFortifiedData(effectiveKvkId, sectionFilters);
                break;
            case 'nariValueAddition':
                rawData = await nariReportRepository.getNariValueAdditionData(effectiveKvkId, sectionFilters);
                break;
            case 'nariNutritionGarden':
                rawData = await nariReportRepository.getNariNutritionGardenData(effectiveKvkId, sectionFilters);
                break;
            case 'nariTraining':
                rawData = await nariReportRepository.getNariTrainingData(effectiveKvkId, sectionFilters);
                break;
            case 'nariExtension':
                rawData = await nariReportRepository.getNariExtensionData(effectiveKvkId, sectionFilters);
                break;
            case 'aryaCurrent':
                rawData = await aryaReportRepository.getAryaCurrentData(effectiveKvkId, sectionFilters);
                break;
            case 'aryaPrevYear':
                rawData = await aryaReportRepository.getAryaPrevData(effectiveKvkId, sectionFilters);
                break;
            case 'nicraBasic':
                rawData = await nicraReportRepository.getNicraBasicData(effectiveKvkId, sectionFilters);
                break;
            case 'nicraTraining':
                rawData = await nicraReportRepository.getNicraTrainingData(effectiveKvkId, sectionFilters);
                break;
            case 'nicraIntervention':
                rawData = await nicraReportRepository.getNicraInterventionData(effectiveKvkId, sectionFilters);
                break;
            case 'nicraExtensionActivity':
                rawData = await nicraReportRepository.getNicraExtensionActivityData(effectiveKvkId, sectionFilters);
                break;
            case 'nicraFarmImplement':
                rawData = await nicraReportRepository.getNicraFarmImplementData(effectiveKvkId, sectionFilters);
                break;
            case 'nicraVcrmc':
                rawData = await nicraReportRepository.getNicraVcrmcData(effectiveKvkId, sectionFilters);
                break;
            case 'nicraSoilHealth':
                rawData = await nicraReportRepository.getNicraSoilHealthData(effectiveKvkId, sectionFilters);
                break;
            case 'naturalFarmingPhysical':
                rawData = await naturalFarmingReportRepository.getNaturalFarmingPhysicalInfoData(effectiveKvkId, sectionFilters);
                break;
            case 'naturalFarmingDemonstration':
                rawData = await naturalFarmingReportRepository.getNaturalFarmingDemonstrationData(effectiveKvkId, sectionFilters);
                break;
            case 'naturalFarmingFarmersPracticing':
                rawData = await naturalFarmingReportRepository.getNaturalFarmingFarmersPracticingData(effectiveKvkId, sectionFilters);
                break;
            case 'naturalFarmingSoilData':
                rawData = await naturalFarmingReportRepository.getNaturalFarmingSoilData(effectiveKvkId, sectionFilters);
                break;
            case 'naturalFarmingBudgetExpenditure':
                rawData = await naturalFarmingReportRepository.getNaturalFarmingBudgetExpenditureData(effectiveKvkId, sectionFilters);
                break;
            case 'agriDroneIntroduction':
                rawData = await agriDroneReportRepository.getAgriDroneIntroductionData(effectiveKvkId, sectionFilters);
                break;
            case 'agriDroneDemonstrationDetails':
                rawData = await agriDroneReportRepository.getAgriDroneDemonstrationDetailsData(effectiveKvkId, sectionFilters);
                break;
            case 'csisa':
                rawData = await csisaReportRepository.getCsisaData(effectiveKvkId, sectionFilters);
                break;
            case 'tspScsp':
                rawData = await tspScspReportRepository.getCombinedTspScspData(effectiveKvkId, sectionFilters);
                break;
            case 'tsp':
                rawData = await tspScspReportRepository.getTspData(effectiveKvkId, sectionFilters);
                break;
            case 'scsp':
                rawData = await tspScspReportRepository.getScspData(effectiveKvkId, sectionFilters);
                break;
            case 'seedHub':
                rawData = await seedHubReportRepository.getSeedHubData(effectiveKvkId, sectionFilters);
                break;
            case 'otherProgrammes':
                rawData = await otherProgrammeReportRepository.getOtherProgrammeData(effectiveKvkId, sectionFilters);
                break;
            case 'specialProgramme':
                rawData = await specialProgrammeReportRepository.getSpecialProgrammeData(effectiveKvkId, sectionFilters);
                break;
            case 'functionalLinkage':
                rawData = await functionalLinkageReportRepository.getFunctionalLinkageData(effectiveKvkId, sectionFilters);
                break;
            case 'successStory':
                rawData = await successStoryReportRepository.getSuccessStoryData(effectiveKvkId, sectionFilters);
                break;
            case 'entrepreneurship':
                rawData = await entrepreneurshipReportRepository.getEntrepreneurshipData(effectiveKvkId, sectionFilters);
                break;
            case 'kvkImpactActivity':
                rawData = await kvkImpactActivityReportRepository.getKvkImpactActivityData(effectiveKvkId, sectionFilters);
                break;
            case 'demonstrationUnit':
                rawData = await demonstrationUnitReportRepository.getDemonstrationUnitData(effectiveKvkId, sectionFilters);
                break;
            case 'instructionalFarmCrop':
                rawData = await instructionalFarmCropReportRepository.getInstructionalFarmCropData(effectiveKvkId, sectionFilters);
                break;
            case 'productionUnit':
                rawData = await productionUnitReportRepository.getProductionUnitData(effectiveKvkId, sectionFilters);
                break;
            case 'instructionalFarmLivestock':
                rawData = await instructionalFarmLivestockReportRepository.getInstructionalFarmLivestockData(effectiveKvkId, sectionFilters);
                break;
            case 'hostelUtilization':
                rawData = await hostelUtilizationReportRepository.getHostelUtilizationData(effectiveKvkId, sectionFilters);
                break;
            case 'staffQuartersUtilization':
                rawData = await staffQuartersUtilizationReportRepository.getStaffQuartersUtilizationData(effectiveKvkId, sectionFilters);
                break;
            case 'rainwaterHarvesting':
                rawData = await rainwaterHarvestingReportRepository.getRainwaterHarvestingData(effectiveKvkId, sectionFilters);
                break;
            case 'fldStateCategoryReport':
                rawData = await fldStateCategoryReportRepository.getFldStateCategoryReportData(effectiveKvkId, sectionFilters);
                break;
            case 'trainingCapacityReport':
                rawData = await trainingCapacityReportRepository.getTrainingCapacityReportData(effectiveKvkId, sectionFilters);
                break;
            case 'extensionOutreachReport':
                rawData = await extensionOutreachReportRepository.getExtensionOutreachReportData(effectiveKvkId, sectionFilters);
                break;
            case 'otherExtensionContentReport':
                rawData = await otherExtensionContentReportRepository.getOtherExtensionContentReportData(effectiveKvkId, sectionFilters);
                break;
            case 'technologyWeekCelebrationReport':
                rawData = await technologyWeekCelebrationReportRepository.getTechnologyWeekCelebrationReportData(effectiveKvkId, sectionFilters);
                break;
            case 'celebrationDaysReport':
                rawData = await celebrationDaysReportRepository.getCelebrationDaysReportData(effectiveKvkId, sectionFilters);
                break;
            case 'productionSupplyReport':
                rawData = await productionSupplyPageReportRepository.getProductionSupplyReportData(effectiveKvkId, sectionFilters);
                break;
            case 'soilWaterEquipmentReport':
                rawData = await soilWaterEquipmentReportRepository.getSoilWaterEquipmentReportData(effectiveKvkId, sectionFilters);
                break;
            case 'soilWaterAnalysisReport':
                rawData = await soilWaterAnalysisReportRepository.getSoilWaterAnalysisReportData(effectiveKvkId, sectionFilters);
                break;
            case 'worldSoilDayReport':
                rawData = await worldSoilDayReportRepository.getWorldSoilDayReportData(effectiveKvkId, sectionFilters);
                break;
            case 'prevalentDiseasesCrops':
                rawData = await miscReportRepository.getPrevalentDiseasesCrops(effectiveKvkId, sectionFilters);
                break;
            case 'prevalentDiseasesLivestock':
                rawData = await miscReportRepository.getPrevalentDiseasesLivestock(effectiveKvkId, sectionFilters);
                break;
            case 'nykTraining':
                rawData = await miscReportRepository.getNykTraining(effectiveKvkId, sectionFilters);
                break;
            case 'ppvFraPlantVarieties':
                rawData = await miscReportRepository.getPpvFraPlantVarieties(effectiveKvkId, sectionFilters);
                break;
            case 'ppvFraTraining':
                rawData = await miscReportRepository.getPpvFraTraining(effectiveKvkId, sectionFilters);
                break;
            case 'vipVisitors':
                rawData = await miscReportRepository.getVipVisitors(effectiveKvkId, sectionFilters);
                break;
            case 'raweFetFit':
                rawData = await miscReportRepository.getRaweFetFit(effectiveKvkId, sectionFilters);
                break;
            case 'kisanSarathi':
                rawData = await digitalInfoReportRepository.getKisanSarathi(effectiveKvkId, sectionFilters);
                break;
            case 'mobileApp':
                rawData = await digitalInfoReportRepository.getMobileApp(effectiveKvkId, sectionFilters);
                break;
            case 'kmas':
                rawData = await digitalInfoReportRepository.getKmas(effectiveKvkId, sectionFilters);
                break;
            case 'webPortal':
                rawData = await digitalInfoReportRepository.getWebPortal(effectiveKvkId, sectionFilters);
                break;
            case 'msgDetails':
                rawData = await digitalInfoReportRepository.getMsgDetails(effectiveKvkId, sectionFilters);
                break;
            case 'swachhtaSewa':
                rawData = await swachhtaReportRepository.getSwachhtaSewa(effectiveKvkId, sectionFilters);
                break;
            case 'swachhtaPakhwada':
                rawData = await swachhtaReportRepository.getSwachhtaPakhwada(effectiveKvkId, sectionFilters);
                break;
            case 'swachhtaBudget':
                rawData = await swachhtaReportRepository.getSwachhtaBudget(effectiveKvkId, sectionFilters);
                break;
            case 'sacMeetings':
                rawData = await meetingsReportRepository.getSacMeetings(effectiveKvkId, sectionFilters);
                break;
            case 'otherMeetings':
                rawData = await meetingsReportRepository.getOtherMeetings(effectiveKvkId, sectionFilters);
                break;
            case 'kvkPublicationDetails':
                rawData = await publicationDetailsReportRepository.getKvPublicationDetailsReportData(
                    effectiveKvkId,
                    sectionFilters,
                );
                break;
            case 'kvkAward':
                rawData = await kvkAwardReportRepository.getKvkAwardReportData(effectiveKvkId, sectionFilters);
                break;
            case 'scientistAward':
                rawData = await scientistAwardReportRepository.getScientistAwardReportData(
                    effectiveKvkId,
                    sectionFilters,
                );
                break;
            case 'farmerAward':
                rawData = await farmerAwardReportRepository.getFarmerAwardReportData(
                    effectiveKvkId,
                    sectionFilters,
                );
                break;
            case 'hrdProgram':
                rawData = await hrdProgramReportRepository.getHrdProgramReportData(
                    effectiveKvkId,
                    sectionFilters,
                );
                break;
            case 'operationalArea':
                rawData = await operationalAreaReportRepository.getOperationalAreaReportData(
                    effectiveKvkId,
                    sectionFilters,
                );
                break;
            case 'villageAdoption':
                rawData = await villageAdoptionReportRepository.getVillageAdoptionReportData(
                    effectiveKvkId,
                    sectionFilters,
                );
                break;
            case 'priorityThrustArea':
                rawData = await priorityThrustAreaReportRepository.getPriorityThrustAreaReportData(
                    effectiveKvkId,
                    sectionFilters,
                );
                break;
            case 'budgetDetail':
                rawData = await budgetDetailReportRepository.getBudgetDetailReportData(
                    effectiveKvkId,
                    sectionFilters,
                );
                break;
            case 'projectBudget':
                rawData = await projectBudgetReportRepository.getProjectBudgetReportData(
                    effectiveKvkId,
                    sectionFilters,
                );
                break;
            case 'revolvingFund':
                rawData = await revolvingFundReportRepository.getRevolvingFundReportData(
                    effectiveKvkId,
                    sectionFilters,
                );
                break;
            case 'revenueGeneration':
                rawData = await revenueGenerationReportRepository.getRevenueGenerationReportData(
                    effectiveKvkId,
                    sectionFilters,
                );
                break;
            case 'resourceGeneration':
                rawData = await resourceGenerationReportRepository.getResourceGenerationReportData(
                    effectiveKvkId,
                    sectionFilters,
                );
                break;
            default:
                throw new Error(`Unknown data source: ${dataSource}`);
        }

        // OFT sections pass raw data to templates (complex nested structures)
        const skipTransform = dataSource === 'oftSummary'
            || dataSource === 'oftDetailCards'
            || dataSource === 'cfldCombined'
            || dataSource === 'cfldExtensionActivity'
            || dataSource === 'cfldBudgetUtilization'
            || dataSource === 'craDetails'
            || dataSource === 'craExtensionActivity'
            || dataSource === 'fpoCbboDetails'
            || dataSource === 'fpoManagement'
            || dataSource === 'drmrDetails'
            || dataSource === 'drmrActivity'
            || dataSource === 'nariNutritionGarden'
            || dataSource === 'nariBioFortified'
            || dataSource === 'nariValueAddition'
            || dataSource === 'nariTraining'
            || dataSource === 'nariExtension'
            || dataSource === 'aryaCurrent'
            || dataSource === 'aryaPrevYear'
            || dataSource === 'nicraBasic'
            || dataSource === 'nicraTraining'
            || dataSource === 'nicraIntervention'
            || dataSource === 'nicraExtensionActivity'
            || dataSource === 'nicraFarmImplement'
            || dataSource === 'nicraVcrmc'
            || dataSource === 'nicraSoilHealth'
            || dataSource === 'naturalFarmingPhysical'
            || dataSource === 'naturalFarmingDemonstration'
            || dataSource === 'naturalFarmingFarmersPracticing'
            || dataSource === 'naturalFarmingSoilData'
            || dataSource === 'naturalFarmingBudgetExpenditure'
            || dataSource === 'agriDroneIntroduction'
            || dataSource === 'agriDroneDemonstrationDetails'
            || dataSource === 'csisa'
            || dataSource === 'tspScsp'
            || dataSource === 'tsp'
            || dataSource === 'scsp'
            || dataSource === 'fldStateCategoryReport'
            || dataSource === 'trainingCapacityReport'
            || dataSource === 'extensionOutreachReport'
            || dataSource === 'otherExtensionContentReport'
            || dataSource === 'technologyWeekCelebrationReport'
            || dataSource === 'celebrationDaysReport'
            || dataSource === 'productionSupplyReport'
            || dataSource === 'soilWaterEquipmentReport'
            || dataSource === 'soilWaterAnalysisReport'
            || dataSource === 'worldSoilDayReport'
            || dataSource === 'prevalentDiseasesCrops'
            || dataSource === 'prevalentDiseasesLivestock'
            || dataSource === 'nykTraining'
            || dataSource === 'ppvFraPlantVarieties'
            || dataSource === 'ppvFraTraining'
            || dataSource === 'vipVisitors'
            || dataSource === 'raweFetFit'
            || dataSource === 'kisanSarathi'
            || dataSource === 'mobileApp'
            || dataSource === 'kmas'
            || dataSource === 'webPortal'
            || dataSource === 'msgDetails'
            || dataSource === 'swachhtaSewa'
            || dataSource === 'swachhtaPakhwada'
            || dataSource === 'swachhtaBudget'
            || dataSource === 'sacMeetings'
            || dataSource === 'otherMeetings';
        const skipTransformWithSeedHub = skipTransform
            || dataSource === 'seedHub'
            || dataSource === 'otherProgrammes'
            || dataSource === 'specialProgramme'
            || dataSource === 'functionalLinkage'
            || dataSource === 'successStory'
            || dataSource === 'entrepreneurship'
            || dataSource === 'kvkImpactActivity'
            || dataSource === 'demonstrationUnit'
            || dataSource === 'instructionalFarmCrop'
            || dataSource === 'productionUnit'
            || dataSource === 'instructionalFarmLivestock'
            || dataSource === 'hostelUtilization'
            || dataSource === 'staffQuartersUtilization'
            || dataSource === 'rainwaterHarvesting'
            || dataSource === 'kvkPublicationDetails'
            || dataSource === 'kvkAward'
            || dataSource === 'scientistAward'
            || dataSource === 'farmerAward'
            || dataSource === 'hrdProgram'
            || dataSource === 'operationalArea'
            || dataSource === 'villageAdoption'
            || dataSource === 'priorityThrustArea'
            || dataSource === 'budgetDetail'
            || dataSource === 'projectBudget'
            || dataSource === 'revolvingFund'
            || dataSource === 'revenueGeneration'
            || dataSource === 'resourceGeneration';

        // Transform data according to section configuration
        const transformedData = skipTransformWithSeedHub ? rawData : this._transformSectionData(rawData, sectionConfig);

        // Build standardized structure
        const result = {
            sectionId,
            data: transformedData,
            metadata: {
                recordCount: Array.isArray(transformedData) ? transformedData.length : (transformedData ? 1 : 0),
                lastUpdated: new Date(),
                filters: sectionFilters
            }
        };

        // Cache the result
        await cacheService.set(cacheKey, result, ttl);

        return result;
    }

    /**
     * Get data for multiple sections in parallel
     */
    async getMultipleSectionData(sectionIds, kvkId, filters = {}) {
        const promises = sectionIds.map(sectionId =>
            this.getSectionData(sectionId, kvkId, filters).catch(error => ({
                sectionId,
                error: error.message,
                data: null,
                metadata: {
                    recordCount: 0,
                    lastUpdated: new Date(),
                    filters: {}
                }
            }))
        );

        const results = await Promise.all(promises);
        const dataMap = {};

        results.forEach(result => {
            if (result.error) {
                dataMap[result.sectionId] = {
                    sectionId: result.sectionId,
                    error: result.error,
                    data: null,
                    metadata: result.metadata || {
                        recordCount: 0,
                        lastUpdated: new Date(),
                        filters: {}
                    }
                };
            } else {
                // Ensure consistent structure
                dataMap[result.sectionId] = {
                    sectionId: result.sectionId,
                    data: result.data,
                    metadata: result.metadata || {
                        recordCount: Array.isArray(result.data) ? result.data.length : (result.data ? 1 : 0),
                        lastUpdated: new Date(),
                        filters: result.metadata?.filters || {}
                    }
                };
            }
        });

        return dataMap;
    }

    /**
     * Build filters for a section based on its configuration
     */
    _buildSectionFilters(sectionConfig, globalFilters) {
        const sectionFilters = {};

        // Only apply filters if section has date/year fields
        const dateFieldsLen = sectionConfig.filters?.dateFields?.length ?? 0;
        const yearFieldsLen = sectionConfig.filters?.yearFields?.length ?? 0;
        if (dateFieldsLen > 0 || yearFieldsLen > 0) {
            if (globalFilters.startDate) {
                sectionFilters.startDate = globalFilters.startDate;
            }
            if (globalFilters.endDate) {
                sectionFilters.endDate = globalFilters.endDate;
            }
            if (globalFilters.year) {
                sectionFilters.year = globalFilters.year;
            }
        }

        return sectionFilters;
    }

    /**
     * Transform raw data according to section configuration
     */
    _transformSectionData(rawData, sectionConfig) {
        if (!rawData) {
            return null;
        }

        // Handle single object (like KVK basic info)
        if (!Array.isArray(rawData)) {
            return this._transformSingleRecord(rawData, sectionConfig);
        }

        // Handle array of records
        return rawData.map(record => this._transformSingleRecord(record, sectionConfig));
    }

    /**
     * Transform a single record according to field configuration
     */
    _transformSingleRecord(record, sectionConfig) {
        const transformed = {};

        sectionConfig.fields.forEach(field => {
            const value = this._getNestedValue(record, field.dbField);

            // Skip optional fields that are null/undefined
            if (field.optional && (value === null || value === undefined)) {
                return;
            }

            // Transform based on field type
            transformed[field.displayName] = this._formatFieldValue(value, field);
        });

        return transformed;
    }

    /**
     * Get nested value from object using dot notation
     */
    _getNestedValue(obj, path) {
        return path.split('.').reduce((current, prop) => {
            return current && current[prop] !== undefined ? current[prop] : null;
        }, obj);
    }

    /**
     * Format field value based on type
     */
    _formatFieldValue(value, field) {
        if (value === null || value === undefined) {
            return field.optional ? null : '-';
        }

        switch (field.type) {
            case 'raw':
                return value;
            case 'date':
                if (value instanceof Date) {
                    return value.toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    });
                }
                if (typeof value === 'string') {
                    const date = new Date(value);
                    if (!isNaN(date.getTime())) {
                        return date.toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        });
                    }
                }
                return String(value);

            case 'currency':
                if (typeof value === 'number') {
                    return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                }
                return String(value);

            case 'boolean':
                return value ? 'Yes' : 'No';

            case 'image':
                // Handle JSON-encoded image and caption
                if (typeof value === 'string' && value.startsWith('{"image":')) {
                    try {
                        const parsed = JSON.parse(value);
                        return parsed.image || null;
                    } catch (e) {
                        // Not valid JSON, return as is
                    }
                }
                // Return image path or placeholder
                return value || null;

            default:
                return String(value);
        }
    }

    /**
     * Get KVK basic info for report header (with caching)
     */
    async getKvkInfoForHeader(kvkId) {
        const effectiveKvkId = normalizeReportKvkId(kvkId);
        if (effectiveKvkId == null) {
            throw new Error('Invalid or missing KVK ID');
        }

        const cacheKey = CacheKeyBuilder.kvkInfo(effectiveKvkId);
        const ttl = getKvkInfoTTL();

        // Try to get from cache first
        const cached = await cacheService.get(cacheKey);
        if (cached !== null) {
            return cached;
        }

        // Fetch from database
        const kvk = await reportRepository.getKvkBasicInfo(effectiveKvkId);
        if (!kvk) {
            throw new Error(`KVK with ID ${effectiveKvkId} not found`);
        }

        const result = {
            kvkId: kvk.kvkId,
            kvkName: kvk.kvkName,
            address: kvk.address,
            email: kvk.email,
            mobile: kvk.mobile,
            zone: kvk.zone?.zoneName || '',
            state: kvk.state?.stateName || '',
            district: kvk.district?.districtName || '',
            organization: kvk.org?.orgName || '',
            university: kvk.university?.universityName || null,
            hostOrg: kvk.hostOrg,
            yearOfSanction: kvk.yearOfSanction,
        };

        // Cache the result
        await cacheService.set(cacheKey, result, ttl);

        return result;
    }

    /**
     * Invalidate cache for a KVK's section data
     */
    async invalidateKvkSectionCache(kvkId, sectionId = null) {
        if (sectionId) {
            const pattern = CacheKeyBuilder.kvkSectionPattern(kvkId, sectionId);
            await cacheService.invalidatePattern(pattern);
        } else {
            const pattern = CacheKeyBuilder.kvkSectionsPattern(kvkId);
            await cacheService.invalidatePattern(pattern);
        }
    }

    /**
     * Invalidate cache for KVK info
     */
    async invalidateKvkInfoCache(kvkId) {
        const key = CacheKeyBuilder.kvkInfo(kvkId);
        await cacheService.del(key);
    }
}

module.exports = new ReportDataService();
