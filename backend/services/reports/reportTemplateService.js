const { getSectionConfig, getAllSections, buildSectionNumbering } = require('../../config/reportConfig.js');
const { renderSimpleTableSection } = require('./formsTemplate/aboutkvkTemplates/simpleTableTemplate.js');
const { renderEmployeeContactsSection } = require('./formsTemplate/aboutkvkTemplates/employeeContactsTemplate.js');
const { renderEmployeesFullSection } = require('./formsTemplate/aboutkvkTemplates/employeesFullTemplate.js');
const { renderStaffTransferredSection } = require('./formsTemplate/aboutkvkTemplates/staffTransferredTemplate.js');
const { renderVehiclesSection } = require('./formsTemplate/aboutkvkTemplates/vehiclesTemplate.js');
const { renderLandDetailsSection } = require('./formsTemplate/aboutkvkTemplates/landDetailsTemplate.js');
const { renderVehicleDetailsSection } = require('./formsTemplate/aboutkvkTemplates/vehicleDetailsTemplate.js');
const { renderEquipmentRecordsSection } = require('./formsTemplate/aboutkvkTemplates/equipmentRecordsTemplate.js');
const { renderEquipmentDetailsSection } = require('./formsTemplate/aboutkvkTemplates/equipmentDetailsTemplate.js');
const { renderAboutKvkSection } = require('./formsTemplate/aboutkvkTemplates/aboutKvkTemplate.js');
const { renderOftSummarySection } = require('./formsTemplate/oftTemplates/oftSummaryTemplate.js');
const { renderOftDetailCardsSection } = require('./formsTemplate/oftTemplates/oftDetailCardsTemplate.js');
const { renderOftCombinedSection } = require('./formsTemplate/oftTemplates/oftCombinedTemplate.js');
const { renderCfldCombinedSection } = require('./formsTemplate/projectTemplates/cfldCombinedTemplate.js');
const { renderCfldExtensionActivitySection } = require('./formsTemplate/projectTemplates/cfldExtensionActivityTemplate.js');
const { renderCfldBudgetUtilizationSection } = require('./formsTemplate/projectTemplates/cfldBudgetUtilizationTemplate.js');
const { renderCraDetailsStateWiseSection } = require('./formsTemplate/projectTemplates/craDetailsStateWiseTemplate.js');
const { renderCraExtensionActivitySection } = require('./formsTemplate/projectTemplates/craExtensionActivityTemplate.js');
const { renderFpoCbboDetailsSection } = require('./formsTemplate/projectTemplates/fpoCbboDetailsTemplate.js');
const { renderFpoManagementDetailsSection } = require('./formsTemplate/projectTemplates/fpoManagementDetailsTemplate.js');
const { renderDrmrDetailsSection } = require('./formsTemplate/projectTemplates/drmrDetailsTemplate.js');
const { renderDrmrActivitySection } = require('./formsTemplate/projectTemplates/drmrActivityTemplate.js');
const { renderNariBioFortifiedSection } = require('./formsTemplate/projectTemplates/nariBioFortifiedTemplate.js');
const { renderNariTrainingSection } = require('./formsTemplate/projectTemplates/nariTrainingTemplate.js');
const { renderCsisaSection } = require('./formsTemplate/projectTemplates/csisaTemplate.js');
const { renderNariExtensionSection } = require('./formsTemplate/projectTemplates/nariExtensionTemplate.js');
const { renderNariNutritionGardenSection } = require('./formsTemplate/projectTemplates/nariNutritionGardenTemplate.js');
const { renderNariValueAdditionSection } = require('./formsTemplate/projectTemplates/nariValueAdditionTemplate.js');
const { renderNicraBasicSection } = require('./formsTemplate/projectTemplates/nicraBasicTemplate.js');
const { renderAryaCurrentSection } = require('./formsTemplate/projectTemplates/aryaCurrentTemplate.js');
const { renderAryaPrevYearSection } = require('./formsTemplate/projectTemplates/aryaPrevYearTemplate.js');
const { renderTspSection } = require('./formsTemplate/projectTemplates/tspTemplate.js');
const { renderScspSection } = require('./formsTemplate/projectTemplates/scspTemplate.js');
const {
    renderTspScspSection,
    renderTspActivitiesSection,
    renderScspActivitiesSection,
} = require('./formsTemplate/projectTemplates/tspScspTemplate.js');
const { renderSeedHubSection } = require('./formsTemplate/projectTemplates/seedHubTemplate.js');
const { renderOtherProgrammesSection } = require('./formsTemplate/projectTemplates/otherProgrammesTemplate.js');
const { renderNicraTrainingSection } = require('./formsTemplate/projectTemplates/nicraTrainingTemplate.js');
const { renderFunctionalLinkageSection } = require('./formsTemplate/projectTemplates/functionalLinkageTemplate.js');
const { renderSuccessStorySection } = require('./formsTemplate/projectTemplates/successStoryTemplate.js');
const { renderEntrepreneurshipSection } = require('./formsTemplate/projectTemplates/entrepreneurshipTemplate.js');
const { renderKvkImpactActivitySection } = require('./formsTemplate/projectTemplates/kvkImpactActivityTemplate.js');
const { renderDemonstrationUnitSection } = require('./formsTemplate/projectTemplates/demonstrationUnitTemplate.js');
const { renderInstructionalFarmCropSection } = require('./formsTemplate/projectTemplates/instructionalFarmCropTemplate.js');
const { renderProductionUnitSection } = require('./formsTemplate/projectTemplates/productionUnitTemplate.js');
const { renderInstructionalFarmLivestockSection } = require('./formsTemplate/projectTemplates/instructionalFarmLivestockTemplate.js');
const { renderHostelUtilizationSection } = require('./formsTemplate/projectTemplates/hostelUtilizationTemplate.js');
const { renderStaffQuartersUtilizationSection } = require('./formsTemplate/projectTemplates/staffQuartersTemplate.js');
const { renderRainwaterHarvestingSection } = require('./formsTemplate/projectTemplates/rainwaterHarvestingTemplate.js');
const { renderNicraInterventionSection } = require('./formsTemplate/projectTemplates/nicraInterventionTemplate.js');
const { renderNicraExtensionSection } = require('./formsTemplate/projectTemplates/nicraExtensionTemplate.js');
const { renderNicraFarmImplementSection } = require('./formsTemplate/projectTemplates/nicraFarmImplementTemplate.js');
const { renderNicraVcrmcSection } = require('./formsTemplate/projectTemplates/nicraVcrmcTemplate.js');
const { renderNicraSoilHealthSection } = require('./formsTemplate/projectTemplates/nicraSoilHealthTemplate.js');
const { renderNicraPiCopiSection } = require('./formsTemplate/projectTemplates/nicraPiCopiTemplate.js');
const { renderNfGeographicalSection } = require('./formsTemplate/projectTemplates/nfGeographicalTemplate.js');
const { renderNfBeneficiariesSection } = require('./formsTemplate/projectTemplates/nfBeneficiariesTemplate.js');
const { renderNicraDetailsReportSection } = require('./formsTemplate/projectTemplates/nicraDetailsReportTemplate.js');
const { renderNicraConvergenceReportSection } = require('./formsTemplate/projectTemplates/nicraConvergenceReportTemplate.js');
const { renderNicraDignitariesReportSection } = require('./formsTemplate/projectTemplates/nicraDignitariesReportTemplate.js');
const { renderNaturalFarmingPhysicalSection } = require('./formsTemplate/projectTemplates/naturalFarmingPhysicalTemplate.js');
const { renderNfDemonstrationInformationSection } = require('./formsTemplate/projectTemplates/nfDemonstrationInformationTemplate.js');
const { renderNfFarmersPracticingInformationSection } = require('./formsTemplate/projectTemplates/nfFarmersPracticingInformationTemplate.js');
const { renderNfSoilDataInformationSection } = require('./formsTemplate/projectTemplates/nfSoilDataInformationTemplate.js');
const { renderNfBudgetExpenditureInformationSection } = require('./formsTemplate/projectTemplates/nfBudgetExpenditureInformationTemplate.js');
const { renderFldPageReportSection } = require('./formsTemplate/achievementTemplates/fldPageReportTemplate.js');
const { renderFldStateCategoryReportSection } = require('./formsTemplate/achievementTemplates/fldStateCategoryReportTemplate.js');
const { renderTechnicalAchievementSummarySection } = require('./formsTemplate/achievementTemplates/technicalAchievementSummaryTemplate.js');
const { renderTrainingCapacityReportSection } = require('./formsTemplate/achievementTemplates/trainingCapacityReportTemplate.js');
const { renderTrainingsPageReportSection } = require('./formsTemplate/achievementTemplates/trainingsPageReportTemplate.js');
const { renderExtensionOutreachReportSection } = require('./formsTemplate/achievementTemplates/extensionOutreachReportTemplate.js');
const { renderExtensionActivityPageReportSection } = require('./formsTemplate/achievementTemplates/extensionActivityPageReportTemplate.js');
const { renderOtherExtensionContentPageReportSection } = require('./formsTemplate/achievementTemplates/otherExtensionContentPageReportTemplate.js');
const { renderOtherExtensionContentMatrixReportSection } = require('./formsTemplate/achievementTemplates/otherExtensionContentMatrixReportTemplate.js');
const { renderTechnologyWeekCelebrationPageReportSection } = require('./formsTemplate/achievementTemplates/technologyWeekCelebrationPageReportTemplate.js');
const { renderTechnologyWeekStateSummaryReportSection } = require('./formsTemplate/achievementTemplates/technologyWeekStateSummaryReportTemplate.js');
const { renderCelebrationDaysPageReportSection } = require('./formsTemplate/achievementTemplates/celebrationDaysPageReportTemplate.js');
const { renderCelebrationDaysStateMatrixReportSection } = require('./formsTemplate/achievementTemplates/celebrationDaysStateMatrixReportTemplate.js');
const { renderProductionSupplyPageReportSection } = require('./formsTemplate/achievementTemplates/productionSupplyPageReportTemplate.js');
const { renderSoilWaterEquipmentPageReportSection } = require('./formsTemplate/achievementTemplates/soilWaterEquipmentPageReportTemplate.js');
const { renderSoilWaterSamplesBPageReportSection } = require('./formsTemplate/achievementTemplates/soilWaterSamplesBPageReportTemplate.js');
const { renderSoilWaterAnalysisDetailStateReportSection } = require('./formsTemplate/achievementTemplates/soilWaterAnalysisDetailStateReportTemplate.js');
const { renderSoilWaterAnalysisDetailReportSection } = require('./formsTemplate/achievementTemplates/soilWaterAnalysisDetailReportTemplate.js');
const { renderWorldSoilDayPageReportSection } = require('./formsTemplate/achievementTemplates/worldSoilDayPageReportTemplate.js');
const { renderPublicationDetailsDetailedSection } = require('./formsTemplate/achievementTemplates/publicationDetailsDetailedTemplate.js');
const { renderPublicationPageReportSection } = require('./formsTemplate/achievementTemplates/publicationPageReportTemplate.js');
const { renderKvkAwardDetailedSection } = require('./formsTemplate/achievementTemplates/kvkAwardDetailedTemplate.js');
const { renderKvkAwardSummarySection } = require('./formsTemplate/achievementTemplates/kvkAwardSummaryTemplate.js');
const { renderKvkAwardDetailedGroupedSection } = require('./formsTemplate/achievementTemplates/kvkAwardDetailedGroupedTemplate.js');
const { renderScientistAwardDetailedSection } = require('./formsTemplate/achievementTemplates/scientistAwardDetailedTemplate.js');
const { renderScientistAwardSummarySection } = require('./formsTemplate/achievementTemplates/scientistAwardSummaryTemplate.js');
const { renderFarmerAwardSummarySection } = require('./formsTemplate/achievementTemplates/farmerAwardSummaryTemplate.js');
const { renderFarmerAwardDetailedGroupedSection } = require('./formsTemplate/achievementTemplates/farmerAwardDetailedGroupedTemplate.js');
const { renderHrdProgrammesSection } = require('./formsTemplate/achievementTemplates/hrdProgrammesTemplate.js');
const { renderDistrictLevelDataSection } = require('./formsTemplate/districtVillageTemplates/districtLevelDataTemplate.js');
const { renderOperationalAreaDetailsSection } = require('./formsTemplate/districtVillageTemplates/operationalAreaDetailsTemplate.js');
const { renderVillageAdoptionProgrammeSection } = require('./formsTemplate/districtVillageTemplates/villageAdoptionProgrammeTemplate.js');
const { renderPriorityThrustAreaSection } = require('./formsTemplate/districtVillageTemplates/priorityThrustAreaTemplate.js');
const { renderBudgetDetailsSection } = require('./formsTemplate/financialPerformanceTemplates/budgetDetailsTemplate.js');
const { renderProjectBudgetSection } = require('./formsTemplate/financialPerformanceTemplates/projectBudgetTemplate.js');
const { renderRevolvingFundSection } = require('./formsTemplate/financialPerformanceTemplates/revolvingFundTemplate.js');
const { renderRevenueGenerationSection } = require('./formsTemplate/financialPerformanceTemplates/revenueGenerationTemplate.js');
const { renderResourceGenerationSection } = require('./formsTemplate/financialPerformanceTemplates/resourceGenerationTemplate.js');
const {
    renderPrevalentDiseasesCropsSection,
    renderPrevalentDiseasesLivestockSection,
} = require('./formsTemplate/miscTemplates/prevalentDiseasesTemplate.js');
const { renderNykTrainingSection } = require('./formsTemplate/miscTemplates/nykTrainingTemplate.js');
const { renderPpvFraPlantVarietiesSection } = require('./formsTemplate/miscTemplates/ppvFraPlantVarietiesTemplate.js');
const { renderPpvFraTrainingSection } = require('./formsTemplate/miscTemplates/ppvFraTrainingTemplate.js');
const { renderVipVisitorsSection } = require('./formsTemplate/miscTemplates/vipVisitorsTemplate.js');
const { renderRaweFetFitSection } = require('./formsTemplate/miscTemplates/raweFetFitTemplate.js');
const { renderKisanSarathiSection } = require('./formsTemplate/digitalInfoTemplates/kisanSarathiTemplate.js');
const { renderMobileAppSection } = require('./formsTemplate/digitalInfoTemplates/mobileAppTemplate.js');
const { renderWebPortalSection } = require('./formsTemplate/digitalInfoTemplates/webPortalTemplate.js');
const { renderKmasSection } = require('./formsTemplate/digitalInfoTemplates/kmasTemplate.js');
const { renderMsgDetailsSection } = require('./formsTemplate/digitalInfoTemplates/msgDetailsTemplate.js');
const { renderSwachhtaSewaSection } = require('./formsTemplate/swachhtaTemplates/swachhtaSewaTemplate.js');
const { renderSwachhtaPakhwadaSection } = require('./formsTemplate/swachhtaTemplates/swachhtaPakhwadaTemplate.js');
const { renderSwachhtaBudgetSection } = require('./formsTemplate/swachhtaTemplates/swachhtaBudgetTemplate.js');
const { renderSacMeetingSection } = require('./formsTemplate/meetingsTemplates/sacMeetingTemplate.js');
const { renderOtherMeetingSection } = require('./formsTemplate/meetingsTemplates/otherMeetingTemplate.js');
const { renderAgriDroneIntroductionSection } = require('./formsTemplate/projectTemplates/nfAgriDroneIntroductionTemplate.js');
const { renderAgriDroneDemonstrationDetailsSection } = require('./formsTemplate/projectTemplates/nfAgriDroneDemonstrationDetailsTemplate.js');

const STANDALONE_KVK_GROUP_TEMPLATES = new Set([
    'nari-value-addition',
    'nari-training',
    'nari-extension',
    'agri-drone-introduction',
    'agri-drone-demonstration-details',
    'fpo-cbbo-details',
    'fpo-management-details',
    'drmr-details',
    'drmr-activity',
    'cra-details-state-wise',
    'cra-extension-activity',
    'csisa',
    'seed-hub',
    'other-programmes',
]);
const fs = require('fs');
const path = require('path');

// Embed a Devanagari-capable font so Hindi text (e.g. SAC meeting "Salient
// Recommendations") renders in PDFs even in serverless Chromium, which ships
// with no Indic fonts. Base64 data-URI = no network / file-path dependency.
// Loaded once at module init and reused for every report.
const DEVANAGARI_FONT_CSS = (() => {
    try {
        const fontPath = path.join(__dirname, '../../assets/fonts/NotoSansDevanagari-Regular.ttf');
        const b64 = fs.readFileSync(fontPath).toString('base64');
        return `
    @font-face {
        font-family: 'Noto Sans Devanagari';
        font-style: normal;
        font-weight: 400 700;
        src: url(data:font/ttf;base64,${b64}) format('truetype');
    }`;
    } catch (e) {
        console.warn('Devanagari font not embedded (Hindi text may not render in PDF):', e.message);
        return '';
    }
})();

/**
 * Report Template Service
 * Generates HTML templates for PDF reports
 */
class ReportTemplateService {
    constructor() {
        this.customTemplateHandlers = {
            'about-kvk-view': renderAboutKvkSection.bind(this),
            'about-kvk-land': renderLandDetailsSection.bind(this),
            'about-kvk-bank-accounts': renderSimpleTableSection.bind(this),
            'about-kvk-employee-contacts': renderEmployeeContactsSection.bind(this),
            'about-kvk-employees-full': renderEmployeesFullSection.bind(this),
            'about-kvk-staff-transferred': renderStaffTransferredSection.bind(this),
            'about-kvk-vehicles': renderVehiclesSection.bind(this),
            'about-kvk-vehicle-details': renderVehicleDetailsSection.bind(this),
            'about-kvk-equipment-records': renderEquipmentRecordsSection.bind(this),
            'about-kvk-equipment-record': renderEquipmentRecordsSection.bind(this),
            'about-kvk-equipment-details': renderEquipmentRecordsSection.bind(this),
            'about-kvk-equipment-details-table': renderEquipmentDetailsSection.bind(this),
            'oft-summary': renderOftSummarySection.bind(this),
            'oft-detail-cards': renderOftDetailCardsSection.bind(this),
            'oft-combined': renderOftCombinedSection.bind(this),
            'cfld-combined': renderCfldCombinedSection.bind(this),
            'cfld-extension-activity': renderCfldExtensionActivitySection.bind(this),
            'cfld-budget-utilization': renderCfldBudgetUtilizationSection.bind(this),
            'cra-details-state-wise': renderCraDetailsStateWiseSection.bind(this),
            'cra-extension-activity': renderCraExtensionActivitySection.bind(this),
            'fpo-cbbo-details': renderFpoCbboDetailsSection.bind(this),
            'fpo-management-details': renderFpoManagementDetailsSection.bind(this),
            'drmr-details': renderDrmrDetailsSection.bind(this),
            'drmr-activity': renderDrmrActivitySection.bind(this),
            'nari-nutrition-garden': renderNariNutritionGardenSection.bind(this),
            'nari-bio-fortified': renderNariBioFortifiedSection.bind(this),
            'nari-training': renderNariTrainingSection.bind(this),
            'csisa': renderCsisaSection.bind(this),
            'nari-extension': renderNariExtensionSection.bind(this),
            'nari-value-addition': renderNariValueAdditionSection.bind(this),
            'arya-current': renderAryaCurrentSection.bind(this),
            'arya-prev-year': renderAryaPrevYearSection.bind(this),
            'nicra-details': renderNicraDetailsReportSection.bind(this),
            'nicra-convergence': renderNicraConvergenceReportSection.bind(this),
            'nicra-dignitaries': renderNicraDignitariesReportSection.bind(this),
            'nicra-basic': renderNicraBasicSection.bind(this),
            'nicra-training': renderNicraTrainingSection.bind(this),
            'nicra-intervention': renderNicraInterventionSection.bind(this),
            'nicra-extension': renderNicraExtensionSection.bind(this),
            'nicra-farm-implement': renderNicraFarmImplementSection.bind(this),
            'nicra-vcrmc': renderNicraVcrmcSection.bind(this),
            'nicra-soil-health': renderNicraSoilHealthSection.bind(this),
            'nicra-pi-copi': renderNicraPiCopiSection.bind(this),
            'natural-farming-geo': renderNfGeographicalSection.bind(this),
            'natural-farming-beneficiaries': renderNfBeneficiariesSection.bind(this),
            'tsp': renderTspActivitiesSection.bind(this),
            'scsp': renderScspActivitiesSection.bind(this),
            'tsp-scsp': renderTspScspSection.bind(this),
            'seed-hub': renderSeedHubSection.bind(this),
            'other-programmes': renderOtherProgrammesSection.bind(this),
            'natural-farming-physical': renderNaturalFarmingPhysicalSection.bind(this),
            'nf-demonstration-information': renderNfDemonstrationInformationSection.bind(this),
            'nf-farmers-practicing-information': renderNfFarmersPracticingInformationSection.bind(this),
            'nf-soil-data-information': renderNfSoilDataInformationSection.bind(this),
            'nf-budget-expenditure-information': renderNfBudgetExpenditureInformationSection.bind(this),
            'fld-page-report': renderFldPageReportSection.bind(this),
            'fld-state-category-report': renderFldStateCategoryReportSection.bind(this),
            'technical-achievement-summary': renderTechnicalAchievementSummarySection.bind(this),
            'training-capacity-report': renderTrainingCapacityReportSection.bind(this),
            'trainings-page-report': renderTrainingsPageReportSection.bind(this),
            'extension-outreach-report': renderExtensionOutreachReportSection.bind(this),
            'extension-activities-page-report': renderExtensionActivityPageReportSection.bind(this),
            'other-extension-content-page-report': renderOtherExtensionContentPageReportSection.bind(this),
            'other-extension-content-matrix-report': renderOtherExtensionContentMatrixReportSection.bind(this),
            'technology-week-celebration-page-report': renderTechnologyWeekCelebrationPageReportSection.bind(this),
            'technology-week-state-summary-report': renderTechnologyWeekStateSummaryReportSection.bind(this),
            'celebration-days-page-report': renderCelebrationDaysPageReportSection.bind(this),
            'celebration-days-state-matrix-report': renderCelebrationDaysStateMatrixReportSection.bind(this),
            'production-supply-page-report': renderProductionSupplyPageReportSection.bind(this),
            'soil-water-equipment-page-report': renderSoilWaterEquipmentPageReportSection.bind(this),
            'soil-water-samples-b-page-report': renderSoilWaterSamplesBPageReportSection.bind(this),
            'soil-water-analysis-state-report': renderSoilWaterAnalysisDetailStateReportSection.bind(this),
            'soil-water-analysis-detail-report': renderSoilWaterAnalysisDetailReportSection.bind(this),
            'world-soil-day-page-report': renderWorldSoilDayPageReportSection.bind(this),
            'publication-details-detailed': renderPublicationDetailsDetailedSection.bind(this),
            'publication-page-report': renderPublicationPageReportSection.bind(this),
            'kvk-award-detailed': renderKvkAwardDetailedSection.bind(this),
            'kvk-award-summary-report': renderKvkAwardSummarySection.bind(this),
            'kvk-award-detailed-report': renderKvkAwardDetailedGroupedSection.bind(this),
            'scientist-award-detailed': renderScientistAwardDetailedSection.bind(this),
            'scientist-award-summary-report': renderScientistAwardSummarySection.bind(this),
            'farmer-award-summary-report': renderFarmerAwardSummarySection.bind(this),
            'farmer-award-detailed-report': renderFarmerAwardDetailedGroupedSection.bind(this),
            'hrd-programmes-report': renderHrdProgrammesSection.bind(this),
            'district-level-data-report': renderDistrictLevelDataSection.bind(this),
            'operational-area-details-report': renderOperationalAreaDetailsSection.bind(this),
            'village-adoption-programme-report': renderVillageAdoptionProgrammeSection.bind(this),
            'priority-thrust-area-report': renderPriorityThrustAreaSection.bind(this),
            'financial-budget-details-report': renderBudgetDetailsSection.bind(this),
            'financial-project-budget-report': renderProjectBudgetSection.bind(this),
            'financial-revolving-fund-report': renderRevolvingFundSection.bind(this),
            'financial-revenue-generation-report': renderRevenueGenerationSection.bind(this),
            'financial-resource-generation-report': renderResourceGenerationSection.bind(this),
            'agri-drone-introduction': renderAgriDroneIntroductionSection.bind(this),
            'agri-drone-demonstration-details': renderAgriDroneDemonstrationDetailsSection.bind(this),
            'arya-current': renderAryaCurrentSection.bind(this),
            'arya-prev-year': renderAryaPrevYearSection.bind(this),
            'functional-linkage': renderFunctionalLinkageSection.bind(this),
            'success-story': renderSuccessStorySection.bind(this),
            'entrepreneurship': renderEntrepreneurshipSection.bind(this),
            'kvk-impact-activity': renderKvkImpactActivitySection.bind(this),
            'demonstration-unit': renderDemonstrationUnitSection.bind(this),
            'instructional-farm-crop': renderInstructionalFarmCropSection.bind(this),
            'production-unit': renderProductionUnitSection.bind(this),
            'instructional-farm-livestock': renderInstructionalFarmLivestockSection.bind(this),
            'hostel-utilization': renderHostelUtilizationSection.bind(this),
            'staff-quarters': renderStaffQuartersUtilizationSection.bind(this),
            'rainwater-harvesting': renderRainwaterHarvestingSection.bind(this),
            'misc-prevalent-diseases-crops': renderPrevalentDiseasesCropsSection.bind(this),
            'misc-prevalent-diseases-livestock': renderPrevalentDiseasesLivestockSection.bind(this),
            'misc-nyk-training': renderNykTrainingSection.bind(this),
            'misc-ppv-fra-plant-varieties': renderPpvFraPlantVarietiesSection.bind(this),
            'misc-ppv-fra-training': renderPpvFraTrainingSection.bind(this),
            'misc-vip-visitors': renderVipVisitorsSection.bind(this),
            'misc-rawe-fet-fit': renderRaweFetFitSection.bind(this),
            'di-kisan-sarathi': renderKisanSarathiSection.bind(this),
            'di-mobile-app': renderMobileAppSection.bind(this),
            'di-web-portal': renderWebPortalSection.bind(this),
            'di-kmas': renderKmasSection.bind(this),
            'di-msg-details': renderMsgDetailsSection.bind(this),
            'swachhta-sewa': renderSwachhtaSewaSection.bind(this),
            'swachhta-pakhwada': renderSwachhtaPakhwadaSection.bind(this),
            'swachhta-budget': renderSwachhtaBudgetSection.bind(this),
            'meetings-sac': renderSacMeetingSection.bind(this),
            'meetings-other': renderOtherMeetingSection.bind(this),
        };
    }

    /**
     * Generate complete HTML for the report
     */
    /**
     * Pick the sections that have data (and aren't excluded), and order them to
     * match the curated taxonomy index. Shared by the PDF and Excel exports so
     * both use the exact same section set, order, and numbering.
     */
    _selectAndOrderSections(sectionsData) {
        const sections = getAllSections();
        const selectedSections = sections.filter(s => {
            if (s.hideInReport) return false;
            const sectionData = sectionsData[s.id];
            return sectionData &&
                !sectionData.error &&
                sectionData.data !== null &&
                sectionData.data !== undefined;
        });

        // Curated/clean index numbering (raw section.id values are unreliable).
        const numbering = buildSectionNumbering(selectedSections);

        // Order to match the curated index (taxonomy), not raw section-id order —
        // otherwise e.g. HR (2.59) prints before Awards (2.56).
        const orderIndex = new Map();
        let oi = 0;
        for (const chapter of numbering.chapters) {
            const featureLists = chapter.type === 'grouped'
                ? (chapter.groups || []).map(g => g.features || [])
                : [(chapter.sections || [])];
            for (const list of featureLists) {
                for (const f of list) {
                    const sid = String(f.sectionId);
                    if (sid && !orderIndex.has(sid)) orderIndex.set(sid, oi++);
                }
            }
        }
        const rank = (id) => (orderIndex.has(String(id)) ? orderIndex.get(String(id)) : Number.MAX_SAFE_INTEGER);
        const orderedSections = [...selectedSections].sort((a, b) => rank(a.id) - rank(b.id));

        return { orderedSections, numbering };
    }

    /**
     * Render every selected section to its own HTML chunk plus index metadata.
     * Returns { numbering, chunks: [{ sectionId, chapter, sectionNumber,
     * sectionTitle, featureNumber, featureTitle, html }] }. Used by both the PDF
     * (chunks joined) and the Excel export (one sheet per chunk).
     */
    async generateSectionChunks(sectionsData, reportContext = {}) {
        const { orderedSections, numbering } = this._selectAndOrderSections(sectionsData);
        const chunks = await this._renderSectionChunks(
            orderedSections, sectionsData, reportContext, numbering.headingById,
        );
        return { numbering, chunks };
    }

    async generateReportHTML(kvkInfo, sectionsData, filters, generatedBy) {
        const reportContext = {
            isAggregatedReport: kvkInfo?.kvkId === null || kvkInfo?.kvkId === undefined,
            isStandalone: false,
        };
        const { numbering, chunks } = await this.generateSectionChunks(sectionsData, reportContext);
        const sectionsBody = chunks.map(c => c.html).join('');

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KVK Comprehensive Report</title>
    ${this._getStyles()}
</head>
<body>
    ${this._generateCoverPage(kvkInfo, filters, generatedBy)}
    ${this._generateTableOfContents(numbering.chapters)}
    <div class="sections-container">
        ${sectionsBody}
    </div>
</body>
</html>`;

        return html;
    }

    /**
     * Generate standalone HTML document for a custom template.
     * Reuses the same custom-template handlers used by all-reports flow.
     */
    async generateStandaloneCustomTemplateHTML(templateKey, data, options = {}) {
        const { sectionId = '1.1', title = 'Custom Report', isAggregatedReport = false } = options;
        const fullSection = getSectionConfig(sectionId);
        const pseudoSection = {
            id: sectionId,
            title,
            ...(fullSection?.exportTitle ? { exportTitle: fullSection.exportTitle } : {}),
            ...(fullSection?.fields?.length ? { fields: fullSection.fields } : {}),
        };
        const sectionConfig = { customTemplate: templateKey };
        const sectionAnchorId = `section-${sectionId.replace(/\./g, '-')}`;
        const reportContext = {
            isAggregatedReport: Boolean(isAggregatedReport),
            isStandalone: true,
        };
        const renderedSection = await this._generateCustomSection(
            pseudoSection,
            data,
            sectionConfig,
            sectionAnchorId,
            true,
            reportContext
        );

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this._escapeHtml(title)}</title>
    ${this._getStyles()}
</head>
<body>
    <div class="sections-container">
        ${renderedSection}
    </div>
</body>
</html>`;
    }

    /**
     * Generate cover page HTML
     */
    _generateCoverPage(kvkInfo, filters, generatedBy) {
        const reportPeriod = this._formatReportPeriod(filters);
        const generatedDate = new Date().toLocaleString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        return `
<div class="page cover-page">
    <div class="cover-content">
        <h1 class="report-title">KVK Comprehensive Report</h1>
        <div class="kvk-info-box">
            <h2>${this._escapeHtml(kvkInfo.kvkName)}</h2>
            <div class="kvk-details">
                <p><strong>Address:</strong> ${this._escapeHtml(kvkInfo.address)}</p>
                <p><strong>Email:</strong> ${this._escapeHtml(kvkInfo.email)}</p>
                <p><strong>Mobile:</strong> ${this._escapeHtml(kvkInfo.mobile)}</p>
                <p><strong>Zone:</strong> ${this._escapeHtml(kvkInfo.zone)}</p>
                <p><strong>State:</strong> ${this._escapeHtml(kvkInfo.state)}</p>
                <p><strong>District:</strong> ${this._escapeHtml(kvkInfo.district)}</p>
                <p><strong>Organization:</strong> ${this._escapeHtml(kvkInfo.organization)}</p>
                ${kvkInfo.university ? `<p><strong>University:</strong> ${this._escapeHtml(kvkInfo.university)}</p>` : ''}
                <p><strong>Host Organization:</strong> ${this._escapeHtml(kvkInfo.hostOrg)}</p>
                <p><strong>Year of Sanction:</strong> ${kvkInfo.yearOfSanction}</p>
            </div>
        </div>
        <div class="report-meta">
            <p><strong>Report Period:</strong> ${reportPeriod}</p>
        </div>
    </div>
</div>`;
    }

    /**
     * Generate table of contents with clickable links
     */
    _generateTableOfContents(chapters) {
        const anchorFor = (sectionId) => `section-${String(sectionId).replace(/\./g, '-')}`;
        const tocItem = (number, title, sectionId, cls) => `
        <li class="toc-item ${cls}">
            <a href="#${anchorFor(sectionId)}" class="toc-link">
                <span class="toc-section-id">${number}</span>
                <span class="toc-section-title">${this._escapeHtml(title)}</span>
            </a>
        </li>`;

        let tocHtml = `
<div class="page toc-page">
    <h1 class="toc-title">Table of Contents</h1>
    <ul class="toc-list">`;

        chapters.forEach((chapter) => {
            // Chapter heading row, e.g. "1. About KVK"
            tocHtml += `
        <li class="toc-chapter">
            <span class="toc-chapter-id">${chapter.number}.</span>
            <span class="toc-chapter-title">${this._escapeHtml(chapter.title)}</span>
        </li>`;

            if (chapter.type === 'grouped') {
                // List the group row (e.g. "2.2 On Farm Trial") followed by its
                // lettered features (e.g. "2.2.A OFT Summary"), each a clickable
                // link that jumps to the backing section.
                chapter.groups.forEach((group) => {
                    const firstSection = group.features[0] && group.features[0].sectionId;
                    tocHtml += tocItem(group.number, group.label, firstSection, 'toc-group');
                    group.features.forEach((feature) => {
                        if (!feature.label || !feature.number) return;
                        tocHtml += tocItem(feature.number, feature.label, feature.sectionId, 'toc-subitem');
                    });
                });
            } else {
                chapter.sections.forEach((s) => {
                    tocHtml += tocItem(s.number, s.title, s.sectionId, '');
                });
            }
        });

        tocHtml += `
    </ul>
</div>`;

        return tocHtml;
    }

    /**
     * Render each selected section to its own HTML chunk (with chapter/feature
     * headers applied) plus the index metadata for that section. Returns an array
     * of { sectionId, chapter, sectionNumber, sectionTitle, featureNumber,
     * featureTitle, html }.
     */
    async _renderSectionChunks(selectedSections, sectionsData, reportContext = {}, headingById = new Map()) {
        const chunks = [];
        let isFirstSection = true;
        const seenChapters = new Set(); // chapter header shown once per chapter
        const seenSections = new Set(); // section (group) heading shown once per group

        for (const rawSection of selectedSections) {
            const sectionConfig = getSectionConfig(rawSection.id);
            const sectionData = sectionsData[rawSection.id];
            const sectionId = `section-${rawSection.id.replace(/\./g, '-')}`;

            // Section heading = group ("1.1 Basic Information"), shown once per
            // group; subsection = feature ("1.1.A KVKs Details"). On later
            // features of the same group, the feature becomes the main heading so
            // the section isn't repeated. Data/anchor lookups keep the real id.
            const heading = headingById.get(String(rawSection.id));
            const firstInGroup = heading ? !seenSections.has(heading.sectionNumber) : true;
            if (heading) seenSections.add(heading.sectionNumber);
            const promoteFeature = heading && heading.featureNumber && !firstInGroup;

            const section = heading
                ? {
                    ...rawSection,
                    id: promoteFeature ? heading.featureNumber : heading.sectionNumber,
                    title: promoteFeature ? heading.featureTitle : heading.sectionTitle,
                    featureNumber: heading.featureNumber,
                    featureTitle: heading.featureTitle,
                }
                : rawSection;

            let chunk;

            // Check for errors or missing data
            if (!sectionData || sectionData.error) {
                chunk = this._generateEmptySection(section, sectionData?.error, sectionId, isFirstSection);
            } else if (sectionData.data === null || sectionData.data === undefined) {
                chunk = this._generateEmptySection(section, null, sectionId, isFirstSection);
            } else {
                const data = sectionData.data;
                // Generate section based on format (custom handlers may return Promises, e.g. oft-combined)
                if (sectionConfig.format === 'custom') {
                    chunk = await Promise.resolve(this._generateCustomSection(section, data, sectionConfig, sectionId, isFirstSection, reportContext));
                } else if (sectionConfig.format === 'formatted-text') {
                    chunk = this._generateFormattedTextSection(section, data, sectionId, isFirstSection);
                } else if (sectionConfig.format === 'table') {
                    chunk = this._generateTableSection(section, data, sectionId, isFirstSection);
                } else if (sectionConfig.format === 'grouped-table') {
                    chunk = this._generateGroupedTableSection(section, data, sectionId, isFirstSection);
                }
            }

            chunks.push({
                sectionId: rawSection.id,
                chapter: heading?.chapter || '',
                sectionNumber: heading?.sectionNumber || rawSection.id,
                sectionTitle: heading?.sectionTitle || rawSection.title,
                featureNumber: heading?.featureNumber || null,
                featureTitle: heading?.featureTitle || null,
                html: this._withSectionHeaders(chunk || '', heading, seenChapters, firstInGroup),
            });
            isFirstSection = false;
        }

        return chunks;
    }

    /**
     * Decorate a section page:
     *  - a centered chapter header ("About KVK") shown once, on the first page
     *    of each chapter;
     *  - a subsection heading ("1.1.A KVKs Details") under the section title
     *    ("1.1 Basic Information") — only on the group's first feature, so the
     *    section heading isn't repeated on later features.
     */
    _withSectionHeaders(chunk, heading, seenChapters, firstInGroup) {
        if (!chunk || !heading) return chunk;
        const titleStart = chunk.indexOf('<h1 class="section-title"');
        if (titleStart === -1) return chunk;

        let result = chunk;

        // Subsection heading under the section title — only when the section
        // title is the group (i.e. the group's first feature).
        if (firstInGroup && heading.featureNumber) {
            const titleEnd = result.indexOf('</h1>', titleStart);
            if (titleEnd !== -1) {
                const insertAt = titleEnd + '</h1>'.length;
                const sub = `<h2 class="section-subtitle">${heading.featureNumber} ${this._escapeHtml(heading.featureTitle || '')}</h2>`;
                result = result.slice(0, insertAt) + sub + result.slice(insertAt);
            }
        }

        // Chapter header once, before the section title.
        if (heading.chapter && !seenChapters.has(heading.chapter)) {
            seenChapters.add(heading.chapter);
            const header = `<div class="report-chapter-header">${this._escapeHtml(heading.chapter)}</div>`;
            const idx = result.indexOf('<h1 class="section-title"');
            result = result.slice(0, idx) + header + result.slice(idx);
        }

        return result;
    }

    /**
     * Generate custom section using dedicated template keys
     */
    _getStandaloneKvkName(row) {
        const candidates = [
            row?.kvkName,
            row?.kvk?.kvkName,
            row?.data?.kvkName,
            row?.data?.kvk?.kvkName,
            row?.kvk?.name,
            row?.institution?.kvkName,
        ];
        const name = candidates.find((value) => value !== null && value !== undefined && String(value).trim());
        return name ? String(name).trim() : 'KVK not specified';
    }

    _renderStandaloneKvkHeading(kvkName) {
        return `<h2 class="module-kvk-heading" style="font-size:8.5pt;font-weight:bold;background:#dce6f1;padding:3px 6px;margin:6px 0 5px;page-break-after:avoid;break-after:avoid;">KVK: ${this._escapeHtml(kvkName)}</h2>`;
    }

    _injectStandaloneKvkHeading(html, kvkName) {
        const heading = this._renderStandaloneKvkHeading(kvkName);
        const output = String(html || '');
        if (/<h1 class="section-title">[\s\S]*?<\/h1>/.test(output)) {
            return output.replace(/(<h1 class="section-title">[\s\S]*?<\/h1>)/, `$1\n${heading}`);
        }
        return `${heading}\n${output}`;
    }

    _stripStandaloneSectionShell(html) {
        return String(html || '')
            .replace(/^\s*<div\b[^>]*class="[^"]*section-page[^"]*"[^>]*>\s*/i, '')
            .replace(/<h1 class="section-title">[\s\S]*?<\/h1>\s*/i, '')
            .replace(/\s*<\/div>\s*$/i, '')
            .trim();
    }

    _appendStandaloneKvkBlocks(firstHtml, blockHtml) {
        const output = String(firstHtml || '');
        if (/<\/div>\s*$/.test(output)) {
            return output.replace(/\s*<\/div>\s*$/i, `\n${blockHtml}\n</div>`);
        }
        return `${output}\n${blockHtml}`;
    }

    _generateCustomSection(section, data, sectionConfig, sectionId, isFirstSection, reportContext = {}) {
        const customTemplateKey = sectionConfig?.customTemplate;
        if (!customTemplateKey) {
            return this._generateEmptySection(section, 'Custom template key is missing', sectionId, isFirstSection);
        }

        const customTemplateHandler = this.customTemplateHandlers[customTemplateKey];
        if (!customTemplateHandler) {
            return this._generateEmptySection(
                section,
                `Unsupported custom template: ${customTemplateKey}`,
                sectionId,
                isFirstSection
            );
        }

        if (reportContext?.isStandalone && STANDALONE_KVK_GROUP_TEMPLATES.has(customTemplateKey)) {
            const rows = Array.isArray(data) ? data : (data ? [data] : []);
            const byKvk = new Map();
            rows.forEach((row) => {
                const kvkName = this._getStandaloneKvkName(row);
                if (!byKvk.has(kvkName)) byKvk.set(kvkName, []);
                byKvk.get(kvkName).push(row);
            });

            if (byKvk.size > 1) {
                const entries = Array.from(byKvk);
                const [firstKvkName, firstKvkRows] = entries[0];
                let firstChunk = customTemplateHandler(section, firstKvkRows, `${sectionId}-kvk-1`, isFirstSection, reportContext);
                firstChunk = this._injectStandaloneKvkHeading(firstChunk, firstKvkName);
                const extraBlocks = entries.slice(1).map(([kvkName, kvkRows], index) => {
                    const chunk = customTemplateHandler(section, kvkRows, `${sectionId}-kvk-${index + 2}`, false, reportContext);
                    const content = this._stripStandaloneSectionShell(chunk);
                    return `<div class="module-kvk-block" style="page-break-inside:auto;break-inside:auto;margin-top:5px;">${this._renderStandaloneKvkHeading(kvkName)}\n${content}</div>`;
                }).join('\n');
                return this._appendStandaloneKvkBlocks(firstChunk, extraBlocks);
            }

            if (byKvk.size === 1) {
                const [[kvkName, kvkRows]] = Array.from(byKvk);
                const chunk = customTemplateHandler(section, kvkRows, sectionId, isFirstSection, reportContext);
                return this._injectStandaloneKvkHeading(chunk, kvkName);
            }
        }

        // Handler may return a string or a Promise (async handlers like oft-combined)
        return customTemplateHandler(section, data, sectionId, isFirstSection, reportContext);
    }

    /**
     * Generic simple table renderer for custom templates (bank accounts, employees, etc.)
     */
    _generateSimpleTableSection(section, data, sectionId, isFirstSection) {
        // Delegated to forms template files to keep this service manageable.
        return renderSimpleTableSection.call(this, section, data, sectionId, isFirstSection);
    }

    /**
     * Employee contacts section (KVK, Name, Residence, Mobile, Email)
     */
    _generateEmployeeContactsSection(section, data, sectionId, isFirstSection) {
        // Delegated to forms template files to keep this service manageable.
        return renderEmployeeContactsSection.call(this, section, data, sectionId, isFirstSection);
    }

    /**
     * Employees full section with sanctioned post, DoB, discipline, pay, joining, category
     */
    _generateEmployeesFullSection(section, data, sectionId, isFirstSection) {
        // Delegated to forms template files to keep this service manageable.
        return renderEmployeesFullSection.call(this, section, data, sectionId, isFirstSection);
    }

    /**
     * Vehicles section template: S.No., KVK, Type of vehicle, Year of purchase, Cost, Total Run, Present status
     */
    _generateVehiclesSection(section, data, sectionId, isFirstSection) {
        // Delegated to forms template files to keep this service manageable.
        return renderVehiclesSection.call(this, section, data, sectionId, isFirstSection);
    }

    /**
     * Generate "About KVK" section in the official tabular layout.
     */
    _generateAboutKvkSection(section, data, sectionId, isFirstSection) {
        return renderAboutKvkSection.call(this, section, data, sectionId, isFirstSection);
    }

    /**
     * Generate formatted text section as table (for KVK basic info)
     * Field names as column headers, data in rows
     * Supports both single object and array of objects (for aggregated reports)
     */
    _generateFormattedTextSection(section, data, sectionId, isFirstSection) {
        if (!data) {
            return this._generateEmptySection(section, null, sectionId, isFirstSection);
        }

        const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

        // Handle both single object and array of objects
        const dataArray = Array.isArray(data) ? data : [data];

        if (dataArray.length === 0) {
            return this._generateEmptySection(section, null, sectionId, isFirstSection);
        }

        // Get all field names from first data object
        const firstData = dataArray[0];
        if (!firstData || typeof firstData !== 'object') {
            return this._generateEmptySection(section, null, sectionId, isFirstSection);
        }

        const fieldNames = Object.keys(firstData).filter(key => {
            // Include field if at least one row has a value
            return dataArray.some(row => row[key] !== null && row[key] !== undefined);
        });

        if (fieldNames.length === 0) {
            return this._generateEmptySection(section, null, sectionId, isFirstSection);
        }

        let html = `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <table class="data-table">
        <thead>
            <tr>
                <th class="s-no">S.No.</th>`;

        // Add field names as column headers
        fieldNames.forEach(fieldName => {
            html += `<th>${this._escapeHtml(fieldName)}</th>`;
        });

        html += `
            </tr>
        </thead>
        <tbody>`;

        // Add rows for each data object
        dataArray.forEach((rowData, index) => {
            const rowClass = index % 2 === 0 ? 'even' : 'odd';
            html += `
            <tr class="${rowClass}">
                <td class="s-no">${index + 1}.</td>`;

            // Add data values in cells
            fieldNames.forEach(fieldName => {
                const value = rowData[fieldName];
                html += `<td>${value !== null && value !== undefined ? this._escapeHtml(String(value)) : '-'}</td>`;
            });

            html += `
            </tr>`;
        });

        html += `
        </tbody>
    </table>
</div>`;

        return html;
    }

    /**
     * Generate table section
     */
    _generateTableSection(section, data, sectionId, isFirstSection) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            return this._generateEmptySection(section, null, sectionId, isFirstSection);
        }

        // Get column headers from first record
        const headers = Object.keys(data[0]);
        const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

        let html = `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <table class="data-table">
        <thead>
            <tr>
                <th class="s-no">S.No.</th>`;

        headers.forEach(header => {
            html += `<th>${this._escapeHtml(header)}</th>`;
        });

        html += `
            </tr>
        </thead>
        <tbody>`;

        data.forEach((row, index) => {
            html += `<tr class="${index % 2 === 0 ? 'even' : 'odd'}">`;
            html += `<td class="s-no">${index + 1}.</td>`;
            headers.forEach(header => {
                const value = row[header];
                html += `<td>${value !== null && value !== undefined ? this._escapeHtml(String(value)) : '-'}</td>`;
            });
            html += `</tr>`;
        });

        html += `
        </tbody>
    </table>
</div>`;

        return html;
    }

    /**
     * Generate grouped table section (for vehicles/equipment with yearly data)
     */
    _generateGroupedTableSection(section, data, sectionId, isFirstSection) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            return this._generateEmptySection(section, null, sectionId, isFirstSection);
        }

        const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
        let html = `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>`;

        data.forEach((item, itemIndex) => {
            // Main item info
            const mainFields = Object.keys(item).filter(key =>
                !key.includes('Reporting Year') &&
                !key.includes('Total Run') &&
                !key.includes('Present Status') &&
                key !== 'reportingYear'
            );

            html += `
    <div class="grouped-item">
        <h3 class="grouped-item-title">${itemIndex + 1}. ${this._escapeHtml(String(item[mainFields[0]] || 'Item'))}</h3>
        <table class="grouped-table">
            <thead>
                <tr>
                    <th class="s-no">S.No.</th>`;

            mainFields.forEach(field => {
                html += `<th>${this._escapeHtml(field)}</th>`;
            });

            html += `
                </tr>
            </thead>
            <tbody>
                <tr class="odd">
                    <td class="s-no">1.</td>`;

            mainFields.forEach(field => {
                const value = item[field];
                html += `<td>${value !== null && value !== undefined ? this._escapeHtml(String(value)) : '-'}</td>`;
            });

            html += `
                </tr>
            </tbody>
        </table>
    </div>`;
        });

        html += `
</div>`;

        return html;
    }

    /**
     * Generate empty section
     */
    _generateEmptySection(section, error = null, sectionId = null, isFirstSection = false) {
        const message = error
            ? `Error loading data: ${this._escapeHtml(error)}`
            : 'No data available for this section.';
        const idAttr = sectionId ? `id="${sectionId}"` : '';
        const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
        return `
<div ${idAttr} class="${pageClass}">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <p class="empty-message">${message}</p>
</div>`;
    }

    _renderContactTable({ rows, nameColumnLabel, includeSanctionYear = false }) {
        const bodyRows = (rows && rows.length > 0 ? rows : [{}])
            .map((row, index) => `
            <tr>
                <td class="serial-col">${index + 1}.</td>
                <td>${this._escapeHtml(this._toDisplayValue(row.name))}</td>
                <td>${this._escapeHtml(this._toDisplayValue(row.address))}</td>
                <td>${this._escapeHtml(this._toDisplayValue(row.officePhone))}</td>
                <td>${this._escapeHtml(this._toDisplayValue(row.fax))}</td>
                <td>${this._escapeHtml(this._toDisplayValue(row.email))}</td>
                ${includeSanctionYear ? `<td>${this._escapeHtml(this._toDisplayValue(row.sanctionYear))}</td>` : ''}
            </tr>`)
            .join('');

        return `
    <table class="about-kvk-table contact-table">
        <thead>
            <tr>
                <th rowspan="2" class="serial-col">S.No.</th>
                <th rowspan="2" class="name-col">${this._escapeHtml(nameColumnLabel)}</th>
                <th rowspan="2" class="address-col">Address</th>
                <th colspan="2" class="phone-col">Telephone</th>
                <th rowspan="2" class="email-col">E-Mail</th>
                ${includeSanctionYear ? '<th rowspan="2" class="year-col">Sanction Year</th>' : ''}
            </tr>
            <tr>
                <th class="office-col">Office</th>
                <th class="fax-col">FAX</th>
            </tr>
        </thead>
        <tbody>
            ${bodyRows}
        </tbody>
    </table>`;
    }

    _renderLandTable(records) {
        const landRows = [];
        records.forEach(record => {
            const kvkName = this._toDisplayValue(this._pickValue(record, ['KVK Name', 'kvkName']));
            const details = this._normalizeLandDetails(this._pickValue(record, ['Land Details', 'landDetails']));

            if (details.length === 0) {
                landRows.push({ kvkName, item: '-', areaHa: '-' });
                return;
            }
            details.forEach(detail => {
                landRows.push({
                    kvkName,
                    item: detail.item,
                    areaHa: detail.areaHa,
                });
            });
        });

        const rows = landRows.length > 0 ? landRows : [{ kvkName: '-', item: '-', areaHa: '-' }];
        const includeKvkColumn = records.length > 1;

        const bodyRows = rows
            .map((row, index) => `
            <tr>
                <td class="serial-col">${index + 1}.</td>
                ${includeKvkColumn ? `<td>${this._escapeHtml(this._toDisplayValue(row.kvkName))}</td>` : ''}
                <td>${this._escapeHtml(this._toDisplayValue(row.item))}</td>
                <td>${this._escapeHtml(this._toDisplayValue(row.areaHa))}</td>
            </tr>`)
            .join('');

        return `
    <table class="about-kvk-table land-table">
        <thead>
            <tr>
                <th class="serial-col">S.No.</th>
                ${includeKvkColumn ? '<th>KVK Name</th>' : ''}
                <th>Item</th>
                <th class="area-col">Area (Ha)</th>
            </tr>
        </thead>
        <tbody>
            ${bodyRows}
        </tbody>
    </table>`;
    }

    _normalizeLandDetails(landDetails) {
        if (!Array.isArray(landDetails)) {
            return [];
        }

        return landDetails
            .filter(item => item && typeof item === 'object')
            .map(item => ({
                item: item.item ?? '-',
                areaHa: item.areaHa ?? '-'
            }));
    }

    _mergeAddressName(name, address) {
        const cleanName = this._toDisplayValue(name);
        const cleanAddress = this._toDisplayValue(address);

        if (cleanName === '-' && cleanAddress === '-') {
            return '-';
        }
        if (cleanName === '-') {
            return cleanAddress;
        }
        if (cleanAddress === '-') {
            return cleanName;
        }
        return `${cleanName}, ${cleanAddress}`;
    }

    _toDisplayValue(value) {
        if (value === null || value === undefined || value === '') {
            return '-';
        }
        return String(value);
    }

    _pickValue(obj, candidatePaths = []) {
        if (!obj || typeof obj !== 'object') {
            return null;
        }

        const usable = (v) => v !== null && v !== undefined && v !== '';

        for (const path of candidatePaths) {
            // Try the literal key FIRST. Transformed report rows are keyed by
            // display name, some of which contain a dot (e.g. "Cost (Rs.)").
            // Treating those as dotted nested paths split them on "." and lost
            // the value. Only fall back to nested traversal when there is no
            // literal property and the path actually looks nested (e.g.
            // "kvk.kvkName").
            let value = obj[path];
            if (!usable(value) && path.includes('.')) {
                value = this._getNestedValue(obj, path);
            }

            if (usable(value)) {
                return value;
            }
        }

        return null;
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
     * Format field value for template rendering
     */
    _formatFieldValue(value, field = {}) {
        if (value === null || value === undefined) {
            return '-';
        }
        switch (field.type) {
            case 'raw':
                return value;
            case 'date': {
                if (value instanceof Date) {
                    return value.toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                    });
                }
                const d = new Date(value);
                if (!isNaN(d.getTime())) {
                    return d.toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                    });
                }
                return String(value);
            }
            case 'currency':
                if (typeof value === 'number') {
                    return `₹${value.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}`;
                }
                return String(value);
            case 'boolean':
                return value ? 'Yes' : 'No';
            default:
                return String(value);
        }
    }

    /**
     * Format report period from filters
     */
    _formatReportPeriod(filters) {
        if (filters.year) {
            return `Year: ${filters.year}`;
        }
        if (filters.startDate && filters.endDate) {
            const start = new Date(filters.startDate).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
            const end = new Date(filters.endDate).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
            return `${start} to ${end}`;
        }
        return 'All Time';
    }

    /**
     * Escape HTML to prevent XSS
     */
    _escapeHtml(text) {
        if (text === null || text === undefined) {
            return '';
        }
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
        };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }

    /**
     * Get CSS styles for PDF - Black and white, professional official document style
     */
    _getStyles() {
        return `
<style>
    ${DEVANAGARI_FONT_CSS}
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: 'Arial', 'Helvetica', 'Noto Sans Devanagari', sans-serif;
        font-size: 8pt;
        line-height: 1.3;
        color: #000000;
        background: #FFFFFF;
    }

    .page {
        padding: 1mm;
        min-height: auto;
    }

    .cover-page {
        page-break-after: always;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
    }

    .cover-content {
        width: 100%;
    }

    .report-title {
        font-size: 14pt;
        font-weight: bold;
        color: #000000;
        margin-bottom: 30px;
        text-transform: uppercase;
    }

    .kvk-info-box {
        background: #FFFFFF;
        border: 0.2px solid #000000;
        padding: 5mm;
        margin: 6mm 0;
        text-align: left;
    }

    .kvk-info-box h2 {
        font-size: 12pt;
        color: #000000;
        margin-bottom: 15px;
        font-weight: bold;
    }

    .kvk-details p {
        margin: 6px 0;
        font-size: 8pt;
        color: #000000;
    }

    .report-meta {
        margin-top: 6mm;
        padding-top: 3mm;
        border-top: 0.2px solid #000000;
    }

    .report-meta p {
        margin: 6px 0;
        font-size: 8pt;
        color: #000000;
    }

    .toc-page {
        page-break-after: always;
        padding-top: 6mm;
    }

    .toc-title {
        font-size: 10pt;
        font-weight: bold;
        color: #000000;
        margin-bottom: 15px;
    }

    .toc-list {
        list-style: none;
        margin-top: 20px;
    }

    .toc-chapter {
        display: flex;
        gap: 6px;
        margin: 14px 0 4px 0;
        padding-bottom: 3px;
        border-bottom: 1px solid #487749;
        font-weight: bold;
        font-size: 9pt;
        color: #487749;
        text-transform: uppercase;
    }

    .toc-chapter-id {
        min-width: 20px;
    }

    .toc-group {
        display: flex;
        gap: 6px;
        margin: 8px 0 2px 16px;
        font-weight: bold;
        font-size: 8.5pt;
        color: #2d4a2f;
    }

    .toc-item {
        margin: 6px 0 6px 18px;
    }

    .toc-feature {
        margin-left: 34px;
    }

    .toc-item.toc-group {
        margin-left: 18px;
    }

    .toc-item.toc-group .toc-section-id,
    .toc-item.toc-group .toc-section-title {
        font-weight: bold;
    }

    .toc-item.toc-subitem {
        margin-left: 40px;
    }

    .toc-item.toc-subitem .toc-section-id,
    .toc-item.toc-subitem .toc-section-title {
        font-weight: normal;
        font-size: 7.5pt;
    }

    .toc-link {
        display: flex;
        width: 100%;
        color: #000000;
        text-decoration: none;
        padding: 4px 0;
        border-bottom: 0.2px solid #E0E0E0;
    }

    .toc-link:hover {
        text-decoration: underline;
    }

    .toc-section-id {
        font-weight: bold;
        width: 50px;
        font-size: 8pt;
    }

    .toc-section-title {
        flex: 1;
        font-size: 8pt;
    }

    .toc-page-number {
        font-size: 8pt;
        color: #000000;
        text-align: right;
        width: 40px;
    }

    .sections-container {
        padding: 5mm;
        page-break-inside: auto;
    }

    .section-page {
        margin-top: 4mm;
        page-break-before: auto;
        page-break-after: auto;
    }

    .section-page-first {
        margin-top: 0;
        page-break-before: auto !important;
        page-break-after: auto;
    }

    .section-page-continued {
        margin-top: 4mm;
        page-break-before: auto !important;
        page-break-after: auto;
    }

    .report-chapter-header {
        text-align: center;
        font-size: 12pt;
        font-weight: bold;
        color: #2d4a2f;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
        page-break-after: avoid;
    }

    .section-title {
        font-size: 10pt;
        font-weight: bold;
        color: #000000;
        margin-bottom: 10px;
        padding-bottom: 6px;
        border-bottom: 0.2px solid #000000;
        page-break-after: avoid;
    }

    .section-subtitle {
        font-size: 9pt;
        font-weight: bold;
        color: #000000;
        margin: 6px 0 10px 0;
        page-break-after: avoid;
    }

    /* Module-wise (standalone) export header: title + KVK, one clean underline. */
    .module-report-header {
        margin: 0 0 10px 0;
        padding-bottom: 6px;
        border-bottom: 1px solid #000000;
        page-break-after: avoid;
    }

    .module-report-title {
        font-size: 13pt;
        font-weight: bold;
        color: #000000;
        margin: 0 0 4px 0;
    }

    .module-report-sub {
        font-size: 8.5pt;
        color: #000000;
    }

    .data-table,
    .grouped-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
        margin-bottom: 10px;
        border: 0.2px solid #000000;
        font-size: 8pt;
        page-break-inside: auto;
    }

    .data-table th,
    .grouped-table th {
        background-color: #FFFFFF;
        color: #000000;
        padding: 5px 6px;
        text-align: left;
        font-weight: bold;
        border: 0.2px solid #000000;
        font-size: 8pt;
    }

    .s-no {
        width: 40px;
        text-align: center;
        font-weight: 600;
    }

    .data-table td,
    .grouped-table td {
        padding: 5px 6px;
        border: 0.2px solid #000000;
        color: #000000;
        font-size: 8pt;
        vertical-align: top;
        word-wrap: break-word;
    }

    /* Wide tables (OFT/FLD state-wise & details): fit to page width, inherit the
       (scaled) table font, tight padding, wrap long headers so nothing crops. */
    .oft-statewise,
    .report-fit {
        width: 100%;
        /* auto layout sizes columns to content, so words/numbers stay on one
           line and never overlap; the scaled font keeps it within the page. */
        table-layout: auto;
    }
    .oft-statewise th,
    .oft-statewise td,
    .report-fit th,
    .report-fit td {
        padding: 1.5px 2px;
        font-size: inherit;
        line-height: 1.1;
        /* Wrap only at spaces — never split a word or a number. */
        word-break: keep-all;
        overflow-wrap: normal;
        white-space: normal;
        text-align: center;
    }
    .oft-statewise th:first-child,
    .oft-statewise td:first-child,
    .report-fit th:first-child,
    .report-fit td:first-child {
        text-align: left;
    }

    /* Email is a long unbroken token — allow it to wrap so it never crops. */
    .report-fit th.emp-email,
    .report-fit td.emp-email {
        word-break: break-all;
        overflow-wrap: anywhere;
        text-align: left;
    }

    .data-table tr:nth-child(even),
    .grouped-table tr:nth-child(even) {
        background-color: #FAFAFA;
    }

    .data-table tr:nth-child(odd),
    .grouped-table tr:nth-child(odd) {
        background-color: #FFFFFF;
    }

    .data-table tr.even,
    .grouped-table tr.even {
        background-color: #FAFAFA;
    }

    .data-table tr.odd,
    .grouped-table tr.odd {
        background-color: #FFFFFF;
    }

    .grouped-item {
        margin-bottom: 15px;
        page-break-inside: avoid;
    }

    .grouped-item-title {
        font-size: 9pt;
        font-weight: bold;
        color: #000000;
        margin-bottom: 6px;
    }

    .empty-message {
        text-align: center;
        color: #666666;
        font-style: italic;
        margin-top: 20px;
        font-size: 8pt;
    }

    .about-kvk-report {
        margin-top: 8px;
        margin-bottom: 14px;
    }

    .about-kvk-record-title {
        font-size: 9pt;
        font-weight: bold;
        margin-bottom: 8px;
    }

    .about-kvk-heading {
        font-size: 10pt;
        font-weight: bold;
        margin: 6px 0 10px;
    }

    .about-kvk-subheading {
        font-size: 9pt;
        font-weight: bold;
        margin: 8px 0 6px;
    }

    .about-kvk-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 14px;
        border: 0.2px solid #000000;
        font-size: 8pt;
        page-break-inside: auto;
    }

    .about-kvk-table th,
    .about-kvk-table td {
        border: 0.2px solid #000000;
        padding: 5px 6px;
        vertical-align: top;
        text-align: left;
    }

    .about-kvk-table th {
        font-weight: 700;
        text-align: center;
        background-color: #FFFFFF;
    }

    .contact-table .name-col {
        width: 16%;
    }

    .contact-table .address-col {
        width: 40%;
    }

    .contact-table .phone-col {
        width: 16%;
    }

    .contact-table .office-col,
    .contact-table .fax-col {
        width: 8%;
    }

    .contact-table .email-col {
        width: 20%;
    }

    .contact-table .year-col {
        width: 8%;
    }

    .about-kvk-table .serial-col {
        width: 45px;
        text-align: center;
    }

    .land-table .area-col {
        width: 22%;
    }

    @media print {
        .page {
            page-break-after: auto;
        }
        
        .cover-page {
            page-break-after: always;
        }
        
        .toc-page {
            page-break-after: always;
        }
        
        .sections-container {
            page-break-inside: auto;
        }
        
        .section-page {
            page-break-before: auto !important;
            page-break-after: auto !important;
            page-break-inside: avoid;
        }
        
        .section-page-first {
            page-break-before: auto !important;
            margin-top: 0;
        }
        
        .section-page-continued {
            page-break-before: auto !important;
            margin-top: 4mm;
        }
        
        .data-table,
        .grouped-table {
            page-break-inside: auto;
        }
        
        .section-title {
            page-break-after: avoid;
        }
    }
</style>`;
    }
}

module.exports = new ReportTemplateService(); 
