const exportHelper = require('../utils/exportHelper');
const reportTemplateService = require('../services/reports/reportTemplateService.js');
const { getAllSections, getSectionByCustomTemplate } = require('../config/reportConfig.js');
const { formatReportingYear } = require('../utils/reportingYearUtils.js');
const { NF_DEMONSTRATION_PARAMETER_DEFS } = require('../repositories/reports/naturalFarmingReport/nfDemonstrationConstants.js');
const { normalizeDemonstrationExportRow } = require('../repositories/reports/naturalFarmingReport/demonstrationInfoReportRepository.js');
const { normalizeFarmersPracticingExportRow } = require('../repositories/reports/naturalFarmingReport/farmersPracticingReportRepository.js');
const {
    inferSoilTablesFromRecords,
    prepareNfSoilExportPayload,
    groupUnassignedSoilRowsByParameterName,
} = require('../repositories/reports/naturalFarmingReport/soilDataReportRepository.js');
const { resolveBudgetTemplatePayload } = require('../repositories/reports/naturalFarmingReport/budgetExpenditureReportRepository.js');
const {
    resolveAgriDroneIntroductionPayload,
    enrichAgriDroneIntroductionExport,
} = require('../repositories/reports/agriDroneReport/agriDroneIntroductionReportRepository.js');
const { resolveAgriDroneDemonstrationDetailsPayload } = require('../repositories/reports/agriDroneReport/agriDroneDemonstrationDetailsReportRepository.js');
const {
    enrichFldListWithResults,
    resolveFldPageReportPayload,
} = require('../repositories/reports/fldPageReport/fldPageReportPayload.js');
const {
    generateFldPageExcelBuffer,
    generateFldPageWordBuffer,
} = require('../utils/fldPageExport.js');
const { resolveTrainingsPageReportPayload } = require('../repositories/reports/trainingsPageReport/trainingsPageReportPayload.js');
const {
    generateTrainingsPageExcelBuffer,
    generateTrainingsPageWordBuffer,
} = require('../utils/trainingsPageExport.js');
const { resolveExtensionActivityPagePayload } = require('../repositories/reports/extensionOutreachReport/extensionOutreachReportRepository.js');
const {
    generateExtensionActivityPageExcelBuffer,
    generateExtensionActivityPageWordBuffer,
} = require('../utils/extensionActivityPageExport.js');

const DRMR_ACTIVITY_ROW_CONFIG = [
    { activityType: 'TRAINING', itemLabel: 'Training (Capacity building /skill development etc)', unitFallback: 'Days', valueKey: 'training_count', prefix: 'training_count_' },
    { activityType: 'FRONTLINE_DEMONSTRATION', itemLabel: 'Area under FLDs', unitFallback: 'Hectare', valueKey: 'fld_count', prefix: 'fld_count_', group: 'Frontline demonstrations (FLDs) and other demonstrations' },
    { activityType: 'AWARENESS_CAMP', itemLabel: 'Awareness camps, exposure visit etc', unitFallback: 'N/A', valueKey: 'awareness_count', prefix: 'awareness_count_' },
    { activityType: 'INPUT_SEEDS', itemLabel: 'Seeds (Field Crops)', unitFallback: 'Kg', valueKey: 'seeds_qty', prefix: 'seeds_qty_', group: 'Input Distribution' },
    { activityType: 'INPUT_SMALL_EQUIPMENT', itemLabel: 'Small equipments (Upto Rs.2000)', unitFallback: 'Number', valueKey: 'small_equip_qty', prefix: 'small_equip_qty_' },
    { activityType: 'INPUT_LARGE_EQUIPMENT', itemLabel: 'Large equipments (more than Rs.2000)', unitFallback: 'Number', valueKey: 'large_equip_qty', prefix: 'large_equip_qty_' },
    { activityType: 'INPUT_FERTILIZER', itemLabel: 'Fertilizers (NPK)/ Secondary/ Micro Fertilizers', unitFallback: 'Kg', valueKey: 'fertilizer_qty', prefix: 'fertilizer_qty_' },
    { activityType: 'INPUT_PPC', itemLabel: 'Plant Protection chemicals', unitFallback: 'Lit.', valueKey: 'pp_chemicals_qty', prefix: 'pp_chemicals_qty_' },
    { activityType: 'LITERATURE_DISTRIBUTION', itemLabel: 'Distribution of Literature', unitFallback: 'N/A', valueKey: 'lecture_count', prefix: 'lecture_count_' },
    { activityType: 'KISAN_MELA', itemLabel: 'Kisan Mela', unitFallback: 'N/A', valueKey: 'kisan_mela_count', prefix: 'kisan_mela_count_' },
    { activityType: 'OTHER', itemLabel: 'Any other (specify)', unitFallback: 'N/A', valueKey: 'any_other_count', prefix: 'any_other_count_' },
];

const exportData = async (req, res) => {
    try {
        const {
            title,
            headers,
            rows,
            format,
            templateKey,
            rawData
        } = req.body;

        if (!title || !headers || !rows || !format) {
            return res.status(400).json({ message: 'Missing required fields: title, headers, rows, format' });
        }

        let buffer;
        let contentType;
        let fileName = `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().getTime()}`;

        let effectiveRawData = rawData;
        if (templateKey === 'nf-soil-data-information' && rawData) {
            effectiveRawData = await prepareNfSoilExportPayload(rawData);
        }
        if (templateKey === 'nf-budget-expenditure-information' && rawData) {
            effectiveRawData = resolveBudgetTemplatePayload(rawData);
        }
        if (templateKey === 'agri-drone-introduction' && rawData) {
            effectiveRawData = await enrichAgriDroneIntroductionExport(rawData);
        }
        if (templateKey === 'fld-page-report' && rawData) {
            effectiveRawData = await enrichFldListWithResults(rawData);
        }
        if (templateKey === 'trainings-page-report' && rawData) {
            effectiveRawData = rawData;
        }
        if (templateKey === 'extension-activities-page-report' && rawData) {
            effectiveRawData = rawData;
        }

        const tabularData = (templateKey && rawData)
            ? buildTabularDataFromTemplate(templateKey, effectiveRawData, headers, rows, format)
            : {
                headers,
                rows: rows.map(row => row.map(cell => formatExportValue(cell, format)))
            };

        switch (format.toLowerCase()) {
            case 'pdf':
                const html = templateKey
                    ? await generateCustomTemplateHTML(templateKey, effectiveRawData, title)
                    : generateHTML(title, headers, rows);

                buffer = await exportHelper.generatePDF(html);
                contentType = 'application/pdf';
                fileName += '.pdf';
                break;
            case 'excel':
                if (templateKey === 'fld-page-report') {
                    buffer = await generateFldPageExcelBuffer(
                        title,
                        resolveFldPageReportPayload(effectiveRawData),
                    );
                } else if (templateKey === 'trainings-page-report') {
                    buffer = await generateTrainingsPageExcelBuffer(
                        title,
                        resolveTrainingsPageReportPayload(effectiveRawData),
                    );
                } else if (templateKey === 'extension-activities-page-report') {
                    buffer = await generateExtensionActivityPageExcelBuffer(
                        title,
                        resolveExtensionActivityPagePayload(effectiveRawData),
                    );
                } else {
                    buffer = await exportHelper.generateExcel(title, tabularData.headers, tabularData.rows);
                }
                contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                fileName += '.xlsx';
                break;
            case 'word':
                if (templateKey === 'fld-page-report') {
                    buffer = await generateFldPageWordBuffer(
                        title,
                        resolveFldPageReportPayload(effectiveRawData),
                    );
                } else if (templateKey === 'trainings-page-report') {
                    buffer = await generateTrainingsPageWordBuffer(
                        title,
                        resolveTrainingsPageReportPayload(effectiveRawData),
                    );
                } else if (templateKey === 'extension-activities-page-report') {
                    buffer = await generateExtensionActivityPageWordBuffer(
                        title,
                        resolveExtensionActivityPagePayload(effectiveRawData),
                    );
                } else {
                    buffer = await exportHelper.generateWord(title, tabularData.headers, tabularData.rows);
                }
                contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                fileName += '.docx';
                break;
            default:
                return res.status(400).json({ message: 'Invalid format. Supported: pdf, excel, word' });
        }

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.send(buffer);

    } catch (error) {
        console.error('Export Error:', error);
        res.status(500).json({ message: 'Failed to export data', error: error.message });
    }
};

async function generateCustomTemplateHTML(templateKey, rawData, title) {
    const normalizedData = Array.isArray(rawData)
        ? rawData
        : (rawData ? [rawData] : []);

    const matchedSection = getSectionByCustomTemplate(templateKey) || getAllSections().find(section => section.customTemplate === templateKey);

    return await reportTemplateService.generateStandaloneCustomTemplateHTML(
        templateKey,
        normalizedData,
        {
            sectionId: matchedSection?.id
                || (templateKey === 'fld-page-report' ? 'fld-page'
                    : templateKey === 'trainings-page-report' ? 'trainings-page'
                        : templateKey === 'extension-activities-page-report' ? 'extension-activities-page' : '1.1'),
            title: matchedSection?.title || title,
            customSectionLabel: matchedSection?.customSectionLabel,
        }
    );
}

function buildTabularDataFromTemplate(templateKey, rawData, fallbackHeaders, fallbackRows, format) {
    if (templateKey === 'fld-page-report' || templateKey === 'trainings-page-report'
        || templateKey === 'extension-activities-page-report') {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }
    if (templateKey === 'cra-details-state-wise') {
        return buildCraDetailsTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'cra-extension-activity') {
        return buildCraExtensionTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'fpo-cbbo-details') {
        return buildFpoCbboTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'fpo-management-details') {
        return buildFpoManagementTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'drmr-details') {
        return buildDrmrDetailsTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'nari-nutrition-garden') {
        return buildNariNutritionGardenTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'drmr-activity') {
        return buildDrmrActivityTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'nari-bio-fortified') {
        return buildNariBioFortifiedTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'nari-training') {
        return buildNariTrainingTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'nari-extension') {
        return buildNariExtensionTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'arya-current') {
        return buildAryaCurrentTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'arya-prev-year') {
        return buildAryaPrevYearTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'csisa') {
        return buildCsisaTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'nari-value-addition') {
        return buildNariValueAdditionTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }

    if (templateKey === 'nicra-basic') {
        return buildNicraBasicTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'nicra-training') {
        return buildNicraTrainingTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'seed-hub') {
        return buildSeedHubTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'other-programmes') {
        return buildOtherProgrammesTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'nicra-intervention') {
        return buildNicraInterventionTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'nicra-extension') {
        return buildNicraExtensionTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'nicra-farm-implement') {
        return buildNicraFarmImplementTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'nicra-vcrmc') {
        return buildNicraVcrmcTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'nicra-soil-health') {
        return buildNicraSoilHealthTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'natural-farming-physical') {
        return buildNaturalFarmingPhysicalTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'nf-demonstration-information') {
        return buildNaturalFarmingDemonstrationTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'nf-farmers-practicing-information') {
        return buildNaturalFarmingFarmersPracticingTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'nf-soil-data-information') {
        return buildNfSoilDataTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'nf-budget-expenditure-information') {
        return buildNfBudgetExpenditureTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'agri-drone-introduction') {
        return buildAgriDroneIntroductionTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'agri-drone-demonstration-details') {
        return buildAgriDroneDemonstrationDetailsTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'tsp') {
        return buildTspTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'scsp') {
        return buildScspTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'tsp-scsp') {
        return buildTspScspTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }

    if (templateKey === 'special-programme') {
        return buildSpecialProgrammeTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'functional-linkage') {
        return buildFunctionalLinkageTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'success-story') {
        return buildSuccessStoryTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'entrepreneurship') {
        return buildEntrepreneurshipTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'kvk-impact-activity') {
        return buildKvkImpactActivityTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'demonstration-unit') {
        return buildDemonstrationUnitTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'instructional-farm-crop') {
        return buildInstructionalFarmCropTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'production-unit') {
        return buildProductionUnitTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'instructional-farm-livestock') {
        return buildInstructionalFarmLivestockTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'hostel-utilization') {
        return buildHostelUtilizationTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'staff-quarters') {
        return buildStaffQuartersTabularData(rawData, format, fallbackHeaders, fallbackRows);
    }
    if (templateKey === 'rainwater-harvesting') {
        return buildRainwaterHarvestingTabularData(rawData, format, fallbackHeaders, fallbackRows);

    }

    const section = getSectionByCustomTemplate(templateKey) || getAllSections().find(s => s.customTemplate === templateKey);
    if (!section || !Array.isArray(section.fields) || section.fields.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }

    const normalizedData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    const mappedHeaders = section.fields.map(field => field.displayName);
    const mappedRows = normalizedData.map(record => {
        return section.fields.map(field => {
            const value = getNestedValue(record, field.dbField);
            return formatExportValue(value, format);
        });
    });

    return { headers: mappedHeaders, rows: mappedRows };
}

function buildNariNutritionGardenTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const normalizedData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (normalizedData.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }

    const headers = [
        'Name of Nutri-Smart Village',
        'Name of State',
        'Name of District',
        'Activity Type',
        'Type of Nutritional Garden',
        'Number',
        'Area(sqm)',
        'General M',
        'General F',
        'General T',
        'OBC M',
        'OBC F',
        'OBC T',
        'SC M',
        'SC F',
        'SC T',
        'ST M',
        'ST F',
        'ST T',
        'Grand Total M',
        'Grand Total F',
        'Grand Total T',
    ];

    const rows = normalizedData.map(row => {
        const generalM = Number(row.generalM ?? row.genMale ?? 0);
        const generalF = Number(row.generalF ?? row.genFemale ?? 0);
        const obcM = Number(row.obcM ?? row.obcMale ?? 0);
        const obcF = Number(row.obcF ?? row.obcFemale ?? 0);
        const scM = Number(row.scM ?? row.scMale ?? 0);
        const scF = Number(row.scF ?? row.scFemale ?? 0);
        const stM = Number(row.stM ?? row.stMale ?? 0);
        const stF = Number(row.stF ?? row.stFemale ?? 0);
        const totalM = generalM + obcM + scM + stM;
        const totalF = generalF + obcF + scF + stF;
        const totalT = totalM + totalF;

        return [
            formatExportValue(row.nameOfNutriSmartVillage || row.villageName || '-', format),
            formatExportValue(row.stateName || '-', format),
            formatExportValue(row.districtName || '-', format),
            formatExportValue(row.activityName || '-', format),
            formatExportValue(row.typeOfNutritionalGarden || row.gardenType || '-', format),
            formatExportValue(row.number ?? 0, format),
            formatExportValue(row.areaSqm ?? 0, format),
            generalM, generalF, generalM + generalF,
            obcM, obcF, obcM + obcF,
            scM, scF, scM + scF,
            stM, stF, stM + stF,
            totalM, totalF, totalT,
        ];
    });

    return { headers, rows };
}

function buildDrmrDetailsTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const normalizedData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (normalizedData.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }

    const headers = [
        'Name of KVK',
        'Varieties used in IP',
        'Situations (Irrigated/Rainfed)',
        'Varieties used in FP',
        'Yield IP (Kg/ha)',
        'Yield FP (Kg/ha)',
        'YIOFP (%)',
        'COC IP (Rs./ha)',
        'COC FP (Rs./ha)',
        'GMR IP (Rs./ha)',
        'GMR FP (Rs./ha)',
        'ANMR IP (Rs./ha)',
        'ANMR FP (Rs./ha)',
        'B:C ratio IP',
        'B:C ratio FP',
    ];

    const rows = normalizedData.map(row => [
        formatExportValue(row.kvkName || '-', format),
        formatExportValue(row.varietiesUsedInIp || row.varietyImprovedPractice || '-', format),
        formatExportValue(row.situation || row.situations || '-', format),
        formatExportValue(row.varietiesUsedInFp || row.varietyFarmerPractice || '-', format),
        formatExportValue(row.yieldImprovedKgPerHa ?? row.yieldImproved ?? 0, format),
        formatExportValue(row.yieldFarmerKgPerHa ?? row.yieldFarmerPractise ?? 0, format),
        formatExportValue(row.yieldIncreasePercent ?? 0, format),
        formatExportValue(row.costImprovedPerHa ?? row.costImproved ?? 0, format),
        formatExportValue(row.costFarmerPerHa ?? row.costFarmerPractise ?? 0, format),
        formatExportValue(row.grossReturnImprovedPerHa ?? row.grossReturnImproved ?? 0, format),
        formatExportValue(row.grossReturnFarmerPerHa ?? row.grossReturnFarmerPractise ?? 0, format),
        formatExportValue(row.netReturnImprovedPerHa ?? row.netReturnImproved ?? 0, format),
        formatExportValue(row.netReturnFarmerPerHa ?? row.netReturnFarmerPractise ?? 0, format),
        formatExportValue(row.bcRatioImproved ?? 0, format),
        formatExportValue(row.bcRatioFarmer ?? row.bcRatioFarmerPractise ?? 0, format),
    ]);

    return { headers, rows };
}

function buildDrmrActivityTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const normalizedData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (normalizedData.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }

    const headers = [
        'KVK',
        'Reporting Year',
        'Item/Activity',
        'Unit',
        'Quantity',
        'General M',
        'General F',
        'General T',
        'OBC M',
        'OBC F',
        'OBC T',
        'SC M',
        'SC F',
        'SC T',
        'ST M',
        'ST F',
        'ST T',
        'Grand Total M',
        'Grand Total F',
        'Grand Total T',
    ];

    const rows = [];
    normalizedData.forEach(record => {
        const kvkName = record.kvkName || '-';
        const year = record.reportingYear || '-';
        const activitiesMap = Array.isArray(record.activities)
            ? record.activities.reduce((acc, activity) => {
                if (activity?.activityType) {
                    acc[activity.activityType] = activity;
                }
                return acc;
            }, {})
            : {};

        DRMR_ACTIVITY_ROW_CONFIG.forEach(config => {
            const activity = activitiesMap[config.activityType] || {};
            const quantity = firstDefined(
                activity.quantityOrSpecification,
                activity.specification,
                activity.quantity,
                record[config.valueKey],
                0
            );
            const unit = firstDefined(activity.unit, record[`${config.valueKey}_unit`], config.unitFallback, '-');

            const generalM = toNum(firstDefined(activity.generalM, record[`${config.prefix}general_m`], 0));
            const generalF = toNum(firstDefined(activity.generalF, record[`${config.prefix}general_f`], 0));
            const obcM = toNum(firstDefined(activity.obcM, record[`${config.prefix}obc_m`], 0));
            const obcF = toNum(firstDefined(activity.obcF, record[`${config.prefix}obc_f`], 0));
            const scM = toNum(firstDefined(activity.scM, record[`${config.prefix}sc_m`], 0));
            const scF = toNum(firstDefined(activity.scF, record[`${config.prefix}sc_f`], 0));
            const stM = toNum(firstDefined(activity.stM, record[`${config.prefix}st_m`], 0));
            const stF = toNum(firstDefined(activity.stF, record[`${config.prefix}st_f`], 0));

            const generalT = generalM + generalF;
            const obcT = obcM + obcF;
            const scT = scM + scF;
            const stT = stM + stF;
            const totalM = generalM + obcM + scM + stM;
            const totalF = generalF + obcF + scF + stF;
            const totalT = totalM + totalF;

            rows.push([
                formatExportValue(kvkName, format),
                formatExportValue(year, format),
                formatExportValue(config.itemLabel, format),
                formatExportValue(unit, format),
                formatExportValue(quantity, format),
                formatExportValue(generalM, format),
                formatExportValue(generalF, format),
                formatExportValue(generalT, format),
                formatExportValue(obcM, format),
                formatExportValue(obcF, format),
                formatExportValue(obcT, format),
                formatExportValue(scM, format),
                formatExportValue(scF, format),
                formatExportValue(scT, format),
                formatExportValue(stM, format),
                formatExportValue(stF, format),
                formatExportValue(stT, format),
                formatExportValue(totalM, format),
                formatExportValue(totalF, format),
                formatExportValue(totalT, format),
            ]);
        });
    });

    return { headers, rows };
}

function buildFpoManagementTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const normalizedData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (normalizedData.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }

    const headers = [
        'Name of the FPO',
        'Address of FPO',
        'Registration No',
        'Date of Registration',
        'Proposed Activity',
        'Commodity identified',
        'Total No. of BOM Members',
        'Total no of farmers attached',
        'Financial position (Rupees in lakh)',
        'Success indicator',
    ];

    const rows = normalizedData.map(row => [
        formatExportValue(row.fpoName || '-', format),
        formatExportValue(row.address || row.fpoAddress || '-', format),
        formatExportValue(row.registrationNumber || row.registrationNo || '-', format),
        formatExportValue(row.registrationDate || '-', format),
        formatExportValue(row.proposedActivity || '-', format),
        formatExportValue(row.commodityIdentified || '-', format),
        formatExportValue(row.totalBomMembers ?? row.bomMembersCount ?? 0, format),
        formatExportValue(row.totalFarmersAttached ?? row.farmersAttachedCount ?? 0, format),
        formatExportValue(row.financialPositionLakh ?? row.financialPosition ?? 0, format),
        formatExportValue(row.successIndicator || '-', format),
    ]);

    return { headers, rows };
}

function buildFpoCbboTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const normalizedData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (normalizedData.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }

    const headers = [
        'Name of state',
        'Name of district',
        'No. of blocks allocated',
        'No. of FPOs registered as CBBO',
        'Average no of members per FPO',
        'No. of FPO received management cost',
        'No. of FPO received equity grant',
        'Tech. backstopping provided to no. of FPOs',
        'No. of training programme organized for FPOs for technology backstopping as CBBO',
        'Training received by FPO members',
        'Assistance to no. of FPOs in economic activities',
        'Is business plan prepared for FPOs as CBBOs',
        'Is business plan prepared for FPOs as without CBBOs',
        'No. of FPOs doing business',
    ];

    const rows = normalizedData.map(row => [
        formatExportValue(row.stateName || '-', format),
        formatExportValue(row.districtName || '-', format),
        formatExportValue(row.blocksAllocated ?? 0, format),
        formatExportValue(row.fposRegisteredAsCbbo ?? 0, format),
        formatExportValue(row.avgMembersPerFpo ?? 0, format),
        formatExportValue(row.fposReceivedManagementCost ?? 0, format),
        formatExportValue(row.fposReceivedEquityGrant ?? 0, format),
        formatExportValue(row.techBackstoppingProvided ?? 0, format),
        formatExportValue(row.trainingProgrammeOrganized ?? 0, format),
        formatExportValue(row.trainingReceivedByMembers || '-', format),
        formatExportValue(row.assistanceInEconomicActivities ?? 0, format),
        formatExportValue(row.businessPlanPreparedWithCbbo || '-', format),
        formatExportValue(row.businessPlanPreparedWithoutCbbo || '-', format),
        formatExportValue(row.fposDoingBusiness ?? 0, format),
    ]);

    return { headers, rows };
}

function buildCraExtensionTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const normalizedData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (normalizedData.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }

    const headers = [
        'KVK',
        'Name of Extension Activity',
        'Within State/Out of State',
        'Exposure visit (no.)',
        'Start Date',
        'End Date',
        'General M',
        'General F',
        'General T',
        'OBC M',
        'OBC F',
        'OBC T',
        'SC M',
        'SC F',
        'SC T',
        'ST M',
        'ST F',
        'ST T',
        'Total M',
        'Total F',
        'Total T',
    ];

    const rows = normalizedData.map(row => {
        const generalM = Number(row.generalM ?? row.genM ?? 0);
        const generalF = Number(row.generalF ?? row.genF ?? 0);
        const obcM = Number(row.obcM ?? 0);
        const obcF = Number(row.obcF ?? 0);
        const scM = Number(row.scM ?? 0);
        const scF = Number(row.scF ?? 0);
        const stM = Number(row.stM ?? 0);
        const stF = Number(row.stF ?? 0);
        const generalT = generalM + generalF;
        const obcT = obcM + obcF;
        const scT = scM + scF;
        const stT = stM + stF;
        const totalM = generalM + obcM + scM + stM;
        const totalF = generalF + obcF + scF + stF;
        const totalT = totalM + totalF;

        return [
            formatExportValue(row.kvkName || '-', format),
            formatExportValue(row.extensionActivityName || row.activityName || '-', format),
            formatExportValue(row.withinStateOrOutState || row.withinStateWithoutState || '-', format),
            formatExportValue(row.exposureVisitNo ?? row.exposureVisit ?? 0, format),
            formatExportValue(row.startDate || '-', format),
            formatExportValue(row.endDate || '-', format),
            generalM, generalF, generalT,
            obcM, obcF, obcT,
            scM, scF, scT,
            stM, stF, stT,
            totalM, totalF, totalT,
        ];
    });

    return { headers, rows };
}

function buildCraDetailsTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const normalizedData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (normalizedData.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }

    const headers = [
        'State',
        'Season',
        'Technology demonstrated / interventions',
        'Cropping system',
        'Farming system crop under demonstration',
        'Area under demonstration (in ac)',
        'Crop yield (q/ha)',
        'System productivity (q/ha)',
        'Total return (Rs./ha)',
        'Yield obtained under farmer practice (q/ha)',
        'General M',
        'General F',
        'General T',
        'OBC M',
        'OBC F',
        'OBC T',
        'SC M',
        'SC F',
        'SC T',
        'ST M',
        'ST F',
        'ST T',
        'Total M',
        'Total F',
        'Total T',
    ];

    const rows = normalizedData.map(row => {
        const generalM = Number(row.generalM || 0);
        const generalF = Number(row.generalF || 0);
        const obcM = Number(row.obcM || 0);
        const obcF = Number(row.obcF || 0);
        const scM = Number(row.scM || 0);
        const scF = Number(row.scF || 0);
        const stM = Number(row.stM || 0);
        const stF = Number(row.stF || 0);

        const generalT = generalM + generalF;
        const obcT = obcM + obcF;
        const scT = scM + scF;
        const stT = stM + stF;
        const totalM = generalM + obcM + scM + stM;
        const totalF = generalF + obcF + scF + stF;
        const totalT = totalM + totalF;

        return [
            formatExportValue(row.stateName || row.state?.stateName || '-', format),
            formatExportValue(row.seasonName || row.season || '-', format),
            formatExportValue(row.interventions || row.technologyDemonstrated || '-', format),
            formatExportValue(row.croppingSystem || row.cropingSystem || '-', format),
            formatExportValue(row.farmingSystemName || '-', format),
            formatExportValue(row.areaInAcre ?? 0, format),
            formatExportValue(row.cropYield ?? 0, format),
            formatExportValue(row.systemProductivity ?? 0, format),
            formatExportValue(row.totalReturn ?? 0, format),
            formatExportValue(row.farmerPracticeYield ?? 0, format),
            generalM, generalF, generalT,
            obcM, obcF, obcT,
            scM, scF, scT,
            stM, stF, stT,
            totalM, totalF, totalT,
        ];
    });

    return { headers, rows };
}

/**
 * NARI Bio-fortified Crops – Excel / DOCX tabular export (Section 2.16)
 *
 * Emits two logical header groups in a single flat sheet:
 *   Part A – crop-level columns + beneficiary M/F/T per category + grand total
 *   Part B – consumption pattern columns (marks unavailable fields as '-')
 *
 * Robust key fallbacks handle both the report-repository payload shape and the
 * raw frontend module-export shape from the forms API.
 */
function buildNariBioFortifiedTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const normalizedData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (normalizedData.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }

    const headers = [
        // Part A – crop details
        'S.No.',
        'Name of Nutri-Smart Village',
        'Season',
        'Activity Type',
        'Category of Crop',
        'Name of Crop',
        'Variety',
        'Area (ha)',
        // Part A – beneficiary counts
        'General M', 'General F', 'General T',
        'OBC M',     'OBC F',     'OBC T',
        'SC M',      'SC F',      'SC T',
        'ST M',      'ST F',      'ST T',
        'Grand Total M', 'Grand Total F', 'Grand Total T',
        // Part B – consumption pattern
        'Production/yield',
        'Consumption (gm/day/person)',
        'Form of Consumption',
        'No. of Days of Consumption in a Year',
    ];

    const rows = normalizedData.map((row, idx) => {
        const generalM = Number(row.generalM ?? row.genMale  ?? 0);
        const generalF = Number(row.generalF ?? row.genFemale ?? 0);
        const generalT = Number(row.generalT)  || (generalM + generalF);
        const obcM     = Number(row.obcM  ?? row.obcMale   ?? 0);
        const obcF     = Number(row.obcF  ?? row.obcFemale ?? 0);
        const obcT     = Number(row.obcT)  || (obcM + obcF);
        const scM      = Number(row.scM   ?? row.scMale    ?? 0);
        const scF      = Number(row.scF   ?? row.scFemale  ?? 0);
        const scT      = Number(row.scT)   || (scM + scF);
        const stM      = Number(row.stM   ?? row.stMale    ?? 0);
        const stF      = Number(row.stF   ?? row.stFemale  ?? 0);
        const stT      = Number(row.stT)   || (stM + stF);
        const grandM   = Number(row.grandM) || (generalM + obcM + scM + stM);
        const grandF   = Number(row.grandF) || (generalF + obcF + scF + stF);
        const grandT   = grandM + grandF;

        return [
            idx + 1,
            formatExportValue(row.nameOfNutriSmartVillage || row.villageName || '-', format),
            formatExportValue(row.seasonName    || '-', format),
            formatExportValue(row.activityName  || '-', format),
            formatExportValue(row.cropCategoryName || row.cropCategory || '-', format),
            formatExportValue(row.nameOfCrop || row.cropName || '-', format),
            formatExportValue(row.variety    || '-', format),
            formatExportValue(row.areaHa     ?? 0,   format),
            generalM, generalF, generalT,
            obcM,     obcF,     obcT,
            scM,      scF,      scT,
            stM,      stF,      stT,
            grandM,   grandF,   grandT,
            // Part B – not stored in DB yet → placeholder
            formatExportValue(row.productionYield          || '-', format),
            formatExportValue(row.consumptionGmPerDayPerson || '-', format),
            formatExportValue(row.formOfConsumption         || '-', format),
            formatExportValue(row.daysOfConsumptionPerYear  || '-', format),
        ];
    });

    return { headers, rows };
}

/**
 * NARI Value Addition – Excel / DOCX tabular export (Section 2.17)
 *
 * Emits the value-addition summary with beneficiary category counts and
 * includes the beneficiary-product detail fields with robust fallbacks.
 */
function buildNariValueAdditionTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const normalizedData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (normalizedData.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }

    const headers = [
        'S.No.',
        'Name of Nutri-Smart Village',
        'Name of Crop',
        'Name of Value-added Product',
        'Activity Type',
        'General M', 'General F', 'General T',
        'OBC M', 'OBC F', 'OBC T',
        'SC M', 'SC F', 'SC T',
        'ST M', 'ST F', 'ST T',
        'Grand Total M', 'Grand Total F', 'Grand Total T',
        'Amount Produced(Kg)',
        'Market Price(Rs/kg)',
        'Net Income(Rs)',
        'Self-life of Produce',
        'FSSAI Certification',
        'FSSAI Certification No.',
    ];

    const rows = normalizedData.map((row, idx) => {
        const generalM = Number(row.generalM ?? row.genMale ?? 0);
        const generalF = Number(row.generalF ?? row.genFemale ?? 0);
        const obcM = Number(row.obcM ?? row.obcMale ?? 0);
        const obcF = Number(row.obcF ?? row.obcFemale ?? 0);
        const scM = Number(row.scM ?? row.scMale ?? 0);
        const scF = Number(row.scF ?? row.scFemale ?? 0);
        const stM = Number(row.stM ?? row.stMale ?? 0);
        const stF = Number(row.stF ?? row.stFemale ?? 0);
        const grandM = generalM + obcM + scM + stM;
        const grandF = generalF + obcF + scF + stF;
        const grandT = grandM + grandF;

        return [
            idx + 1,
            formatExportValue(row.nameOfNutriSmartVillage || row.villageName || '-', format),
            formatExportValue(row.nameOfCrop || row.cropName || '-', format),
            formatExportValue(row.nameOfValueAddedProduct || row.productName || '-', format),
            formatExportValue(row.activityName || '-', format),
            generalM, generalF, generalM + generalF,
            obcM, obcF, obcM + obcF,
            scM, scF, scM + scF,
            stM, stF, stM + stF,
            grandM, grandF, grandT,
            formatExportValue(row.amountProducedKg || '-', format),
            formatExportValue(row.marketPricePerKg || '-', format),
            formatExportValue(row.netIncomeRs || '-', format),
            formatExportValue(row.shelfLifeOfProduce || '-', format),
            formatExportValue(row.fssaiCertification || '-', format),
            formatExportValue(row.fssaiCertificationNo || '-', format),
        ];
    });

    return { headers, rows };
}

/**
 * NARI Training Programmes – Excel / DOCX tabular export (Section 2.18)
 *
 * Stable 24-column layout matching the PDF report:
 *   S.No. | Village | Activity | Area of Training | Title of Training |
 *   On/Off Campus | Venue | Days | Courses |
 *   General M/F/T | OBC M/F/T | SC M/F/T | ST M/F/T | Grand Total M/F/T
 */
function buildNariTrainingTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const normalizedData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (normalizedData.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }

    const headers = [
        'S.No.',
        'Name of Nutri Smart Village',
        'Activity Type',
        'Area of Training',
        'Title of Training',
        'On Campus/Off Campus',
        'Venue',
        'No of Days',
        'No of Courses',
        'General M', 'General F', 'General T',
        'OBC M',     'OBC F',     'OBC T',
        'SC M',      'SC F',      'SC T',
        'ST M',      'ST F',      'ST T',
        'Grand Total M', 'Grand Total F', 'Grand Total T',
    ];

    const rows = normalizedData.map((row, idx) => {
        const generalM = Number(row.generalM ?? row.genMale   ?? 0);
        const generalF = Number(row.generalF ?? row.genFemale ?? 0);
        const generalT = Number(row.generalT) || (generalM + generalF);
        const obcM     = Number(row.obcM  ?? row.obcMale   ?? 0);
        const obcF     = Number(row.obcF  ?? row.obcFemale ?? 0);
        const obcT     = Number(row.obcT) || (obcM + obcF);
        const scM      = Number(row.scM   ?? row.scMale    ?? 0);
        const scF      = Number(row.scF   ?? row.scFemale  ?? 0);
        const scT      = Number(row.scT)  || (scM + scF);
        const stM      = Number(row.stM   ?? row.stMale    ?? 0);
        const stF      = Number(row.stF   ?? row.stFemale  ?? 0);
        const stT      = Number(row.stT)  || (stM + stF);
        const grandM   = Number(row.grandM) || (generalM + obcM + scM + stM);
        const grandF   = Number(row.grandF) || (generalF + obcF + scF + stF);
        const grandT   = grandM + grandF;

        const campusLabel = row.campusTypeLabel
            || (row.campusType === 'ON_CAMPUS'  ? 'On Campus'
              : row.campusType === 'OFF_CAMPUS' ? 'Off Campus'
              : row.campusType || '-');

        return [
            idx + 1,
            formatExportValue(row.nameOfNutriSmartVillage || row.villageName || '-', format),
            formatExportValue(row.activityName   || '-', format),
            formatExportValue(row.areaOfTraining || '-', format),
            formatExportValue(row.titleOfTraining || '-', format),
            formatExportValue(campusLabel, format),
            formatExportValue(row.venue || '-', format),
            Number(row.noOfDays    ?? 0),
            Number(row.noOfCourses ?? 0),
            generalM, generalF, generalT,
            obcM,     obcF,     obcT,
            scM,      scF,      scT,
            stM,      stF,      stT,
            grandM,   grandF,   grandT,
        ];
    });

    return { headers, rows };
}

/**
 * NARI Extension Activities – Excel / DOCX tabular export (Section 2.19)
 */
function buildNariExtensionTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const normalizedData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (normalizedData.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }

    const headers = [
        'S.No.',
        'Name of Nutri Smart Village',
        'Title/Type of Activity',
        'No. of activities',
        'General M', 'General F', 'General T',
        'OBC M', 'OBC F', 'OBC T',
        'SC M', 'SC F', 'SC T',
        'ST M', 'ST F', 'ST T',
        'Grand Total M', 'Grand Total F', 'Grand Total T',
    ];

    const rows = normalizedData.map((row, idx) => {
        const generalM = Number(row.generalM ?? row.genMale ?? 0);
        const generalF = Number(row.generalF ?? row.genFemale ?? 0);
        const obcM = Number(row.obcM ?? row.obcMale ?? 0);
        const obcF = Number(row.obcF ?? row.obcFemale ?? 0);
        const scM = Number(row.scM ?? row.scMale ?? 0);
        const scF = Number(row.scF ?? row.scFemale ?? 0);
        const stM = Number(row.stM ?? row.stMale ?? 0);
        const stF = Number(row.stF ?? row.stFemale ?? 0);
        const grandM = Number(row.grandM) || (generalM + obcM + scM + stM);
        const grandF = Number(row.grandF) || (generalF + obcF + scF + stF);
        const grandT = grandM + grandF;

        return [
            idx + 1,
            formatExportValue(row.nameOfNutriSmartVillage || row.villageName || '-', format),
            formatExportValue(row.titleOrTypeOfActivity || row.activityOrganized || row.activityName || '-', format),
            formatExportValue(row.noOfActivities ?? 0, format),
            generalM, generalF, generalM + generalF,
            obcM, obcF, obcM + obcF,
            scM, scF, scM + scF,
            stM, stF, stM + stF,
            grandM, grandF, grandT,
        ];
    });

    return { headers, rows };
}

function buildAryaCurrentTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const normalizedData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (normalizedData.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }

    const headers = [
        'Name of Enterprise',
        'No. of Training conducted',
        'Units Male',
        'Units Female',
        'Rural youth trained Male',
        'Rural youth trained Female',
        'Viable units (functional units)',
        'Closed units (non functional)',
        'Average size of each entrepreneurial unit',
        'Total Production/unit/year',
        'Per unit cost of Production',
        'Sale value of produce',
        'Economic Gains / unit',
        'Employment generated (mandays)',
    ];

    const rows = normalizedData.map(row => {
        const perUnitCost = Number(row.perUnitCostOfProduction ?? row.perUnitCost ?? 0);
        const saleValue = Number(row.saleValueOfProduce ?? row.saleValue ?? 0);
        const economicGains = Number(row.economicGainsPerUnit ?? (saleValue - perUnitCost));

        return [
            formatExportValue(row.enterpriseName || '-', format),
            Number(row.trainingsConducted ?? row.trainingConducted ?? row.trainings ?? 0),
            Number(row.unitsMale ?? row.unitsEstablishedMale ?? 0),
            Number(row.unitsFemale ?? row.unitsEstablishedFemale ?? 0),
            Number(row.youthMale ?? row.youthTrainedMale ?? 0),
            Number(row.youthFemale ?? row.youthTrainedFemale ?? 0),
            Number(row.viableUnits ?? 0),
            Number(row.closedUnits ?? 0),
            Number(row.avgSizeOfUnit ?? row.avgUnitSize ?? 0),
            Number(row.totalProductionPerYear ?? row.totalProduction ?? 0),
            perUnitCost,
            saleValue,
            economicGains,
            Number(row.employmentGeneratedMandays ?? row.employmentGenerated ?? 0),
        ];
    });

    return { headers, rows };
}

function buildAryaPrevYearTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const normalizedData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (normalizedData.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }

    const headers = [
        'State',
        'KVK',
        'Name of Enterprise',
        'Units Male',
        'Units Female',
        'No. of non-functional entrepreneurial unit closed',
        'Date of Closing',
        'No. of non-functional entrepreneurial unit restarted',
        'Date of Restart',
        'No. of Unit',
        'Unit capacity',
        'Fixed cost',
        'Variable cost',
        'Total production/unit/year',
        'Gross cost of production/unit/year',
        'Gross return per unit/year',
        'Net benefit / unit/year',
        'Employment Family',
        'Employment Other than Family',
        'Employment Total',
        'No. of persons visited entrepreneur unit',
    ];

    const rows = normalizedData.map(row => [
        formatExportValue(row.stateName || '-', format),
        formatExportValue(row.kvkName || '-', format),
        formatExportValue(row.enterpriseName || '-', format),
        Number(row.unitsMale ?? row.unitsEstablishedMale ?? 0),
        Number(row.unitsFemale ?? row.unitsEstablishedFemale ?? 0),
        Number(row.nonFunctionalUnitsClosed ?? row.unitsClosed ?? row.totalClosed ?? 0),
        formatExportValue(row.dateOfClosing ?? row.closingDate ?? '-', format),
        Number(row.nonFunctionalUnitsRestarted ?? row.unitsRestarted ?? row.totalRestarted ?? 0),
        formatExportValue(row.dateOfRestart ?? row.restartDate ?? '-', format),
        Number(row.numberOfUnits ?? row.noOfUnit ?? 0),
        Number(row.unitCapacity ?? 0),
        Number(row.fixedCost ?? 0),
        Number(row.variableCost ?? 0),
        Number(row.totalProductionPerUnitYear ?? row.totalProductionPerUnit ?? 0),
        Number(row.grossCostPerUnitYear ?? row.grossCost ?? 0),
        Number(row.grossReturnPerUnitYear ?? row.grossValue ?? 0),
        Number(row.netBenefitPerUnitYear ?? row.netBenefit ?? 0),
        Number(row.employmentFamilyMandays ?? row.employmentFamily ?? 0),
        Number(row.employmentOtherMandays ?? row.employmentOther ?? 0),
        Number((row.employmentFamilyMandays ?? row.employmentFamily ?? 0) + (row.employmentOtherMandays ?? row.employmentOther ?? 0)),
        Number(row.personsVisitedUnit ?? row.personsVisited ?? 0),
    ]);

    return { headers, rows };
}

function buildNicraBasicTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const normalized = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (normalized.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }
    const headers = [
        'KVK',
        'RF Normal',
        'RF Received',
        'Temp Max',
        'Temp Min',
        '>10 days',
        '>15 days',
        '>20 days',
        'Intensive rain >60 mm',
        'Water depth (cm)',
        'Duration (days)',
    ];
    const rows = normalized.map(r => [
        formatExportValue(r.kvkName || '-', format),
        Number(r.rfMmDistrictNormal ?? r.rfNormal ?? 0),
        Number(r.rfMmDistrictReceived ?? r.rfReceived ?? 0),
        Number(r.maxTemperature ?? 0),
        Number(r.minTemperature ?? 0),
        Number(r.dry10 ?? 0),
        Number(r.dry15 ?? 0),
        Number(r.dry20 ?? 0),
        Number(r.intensiveRain ?? 0),
        Number(r.waterDepth ?? 0),
        // Derive duration from start/end when available, else leave blank
        (() => {
            const start = r.startDate ? new Date(r.startDate) : null;
            const end = r.endDate ? new Date(r.endDate) : null;
            if (start && end && !isNaN(start) && !isNaN(end)) {
                const ms = end - start;
                return Math.round(ms / (1000 * 60 * 60 * 24));
            }
            return '';
        })(),
    ]);
    return { headers, rows };
}

function buildNicraTrainingTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const arr = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (arr.length === 0) return { headers: fallbackHeaders, rows: fallbackRows };
    const headers = [
        'Title of the training course',
        'Start Date',
        'End Date',
        'Duration (days)',
        'Training Type',
        'Gen M','Gen F','Gen T',
        'OBC M','OBC F','OBC T',
        'SC M','SC F','SC T',
        'ST M','ST F','ST T',
        'Total M','Total F','Total T',
    ];
    const rows = arr.map(r => [
        formatExportValue(r.titleOfTraining || '-', format),
        formatExportValue(r.startDate ? new Date(r.startDate).toISOString().slice(0,10) : '-', format),
        formatExportValue(r.endDate ? new Date(r.endDate).toISOString().slice(0,10) : '-', format),
        Number(r.durationDays ?? 0),
        formatExportValue(r.campusType || '-', format),
        Number(r.genM ?? 0), Number(r.genF ?? 0), Number(r.genT ?? 0),
        Number(r.obcM ?? 0), Number(r.obcF ?? 0), Number(r.obcT ?? 0),
        Number(r.scM ?? 0), Number(r.scF ?? 0), Number(r.scT ?? 0),
        Number(r.stM ?? 0), Number(r.stF ?? 0), Number(r.stT ?? 0),
        Number(r.totM ?? 0), Number(r.totF ?? 0), Number(r.totT ?? 0),
    ]);
    return { headers, rows };
}
function buildSeedHubTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const normalized = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (normalized.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }
    const headers = [
        'KVK',
        'Season',
        'Crop',
        'Variety',
        'Area covered (ha)',
        'Yield (Q/ha)',
        'Qty produced (Q)',
        'Qty sale out (Q)',
        'Farmers purchased',
        'Qty sale to farmers (Q)',
        'Villages covered',
        'Qty sale to other org (Q)',
        'Amount generated (Lakh)',
        'Total amount in project (Lakh)',
    ];
    const rows = normalized.map(r => [
        formatExportValue(r.kvkName || '-', format),
        formatExportValue(r.season || '-', format),
        formatExportValue(r.cropName || '-', format),
        formatExportValue(r.varietyName || '-', format),
        Number(r.areaCoveredHa ?? 0),
        Number(r.yieldQPerHa ?? 0),
        Number(r.quantityProducedQ ?? 0),
        Number(r.quantitySaleOutQ ?? 0),
        Number(r.farmersPurchased ?? 0),
        Number(r.quantitySaleToFarmersQ ?? 0),
        Number(r.villagesCovered ?? 0),
        Number(r.quantitySaleToOtherOrgQ ?? 0),
        Number(r.amountGeneratedLakh ?? 0),
        Number(r.totalAmountPresentLakh ?? 0),
    ]);
    return { headers, rows };
}

function buildOtherProgrammesTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const arr = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (arr.length === 0) return { headers: fallbackHeaders, rows: fallbackRows };
    const headers = [
        'KVK',
        'Name of the programme',
        'Date',
        'Venue',
        'Purpose',
        'General M','General F','General T',
        'OBC M','OBC F','OBC T',
        'SC M','SC F','SC T',
        'ST M','ST F','ST T',
        'Grand M','Grand F','Grand T',
    ];
    const rows = arr.map(r => [
        formatExportValue(r.kvkName || '-', format),
        formatExportValue(r.programmeName || '-', format),
        formatExportValue(r.programmeDate ? new Date(r.programmeDate).toISOString().slice(0,10) : '-', format),
        formatExportValue(r.venue || '-', format),
        formatExportValue(r.purpose || '-', format),
        Number(r.genM ?? 0), Number(r.genF ?? 0), Number(r.genT ?? 0),
        Number(r.obcM ?? 0), Number(r.obcF ?? 0), Number(r.obcT ?? 0),
        Number(r.scM ?? 0), Number(r.scF ?? 0), Number(r.scT ?? 0),
        Number(r.stM ?? 0), Number(r.stF ?? 0), Number(r.stT ?? 0),
        Number(r.grandM ?? 0), Number(r.grandF ?? 0), Number(r.grandT ?? 0),
    ]);
    return { headers, rows };
}

function buildNicraInterventionTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const arr = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (arr.length === 0) return { headers: fallbackHeaders, rows: fallbackRows };
    const headers = [
        'State',
        'KVK',
        'Seed bank - Crop with variety',
        'Seed bank - Quantity (q)',
        'Fodder bank - Crop with variety',
        'Fodder bank - Quantity (q)',
    ];
    const rows = arr.map(r => [
        formatExportValue(r.stateName || '-', format),
        formatExportValue(r.kvkName || '-', format),
        formatExportValue(r.bankType?.toLowerCase().includes('seed') ? (r.cropWithVariety || '-') : '', format),
        r.bankType?.toLowerCase().includes('seed') ? Number(r.quantityQ ?? 0) : '',
        formatExportValue(r.bankType?.toLowerCase().includes('fodder') ? (r.cropWithVariety || '-') : '', format),
        r.bankType?.toLowerCase().includes('fodder') ? Number(r.quantityQ ?? 0) : '',
    ]);
    return { headers, rows };
}

function buildNicraExtensionTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const pickFirst = (...values) => {
        for (const value of values) {
            if (value !== null && value !== undefined && value !== '') return value;
        }
        return '';
    };
    const resolveStateName = (row) => pickFirst(
        row?.stateName,
        row?.state,
        row?.kvk?.stateName,
        row?.kvk?.state?.stateName,
        row?.kvks?.stateName,
        row?.kvks?.state?.stateName
    );
    const resolveKvkName = (row) => pickFirst(
        row?.kvkName,
        row?.kvk?.kvkName,
        row?.kvks?.kvkName
    );
    const normalize = (r) => {
        if (r && (r.generalM !== undefined || r.genMale !== undefined)) {
            const genM = Number(r.genM ?? r.genMale ?? r.generalM ?? 0);
            const genF = Number(r.genF ?? r.genFemale ?? r.generalF ?? 0);
            const obcM = Number(r.obcM ?? r.obcMale ?? 0);
            const obcF = Number(r.obcF ?? r.obcFemale ?? 0);
            const scM = Number(r.scM ?? r.scMale ?? 0);
            const scF = Number(r.scF ?? r.scFemale ?? 0);
            const stM = Number(r.stM ?? r.stMale ?? 0);
            const stF = Number(r.stF ?? r.stFemale ?? 0);
            const genT = genM + genF, obcT = obcM + obcF, scT = scM + scF, stT = stM + stF;
            const totM = genM + obcM + scM + stM;
            const totF = genF + obcF + scF + stF;
            return {
                stateName: resolveStateName(r),
                kvkName: resolveKvkName(r),
                activityName: r.activityName || r.activity || '',
                numProgrammes: Number(r.numProgrammes ?? 1),
                genM, genF, genT, obcM, obcF, obcT, scM, scF, scT, stM, stF, stT, totM, totF, totT: totM + totF,
            };
        }
        return r;
    };
    const rawArr = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    const arr = rawArr.map(normalize);
    if (arr.length === 0) return { headers: fallbackHeaders, rows: fallbackRows };
    const headers = [
        'State','KVK','Name of the activity','Number of Programmes',
        'Gen M','Gen F','Gen T',
        'OBC M','OBC F','OBC T',
        'SC M','SC F','SC T',
        'ST M','ST F','ST T',
        'Total M','Total F','Total T',
    ];
    const rows = arr.map(r => [
        formatExportValue(r.stateName || '-', format),
        formatExportValue(r.kvkName || '-', format),
        formatExportValue(r.activityName || '-', format),
        Number(r.numProgrammes ?? 0),
        Number(r.genM ?? 0), Number(r.genF ?? 0), Number(r.genT ?? 0),
        Number(r.obcM ?? 0), Number(r.obcF ?? 0), Number(r.obcT ?? 0),
        Number(r.scM ?? 0), Number(r.scF ?? 0), Number(r.scT ?? 0),
        Number(r.stM ?? 0), Number(r.stF ?? 0), Number(r.stT ?? 0),
        Number(r.totM ?? 0), Number(r.totF ?? 0), Number(r.totT ?? 0),
    ]);
    return { headers, rows };
}

function buildNicraFarmImplementTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const pickFirst = (...values) => {
        for (const value of values) {
            if (value !== null && value !== undefined && value !== '') return value;
        }
        return '';
    };
    const resolveStateName = (row) => pickFirst(
        row?.stateName,
        row?.state,
        row?.kvk?.stateName,
        row?.kvk?.state?.stateName,
        row?.kvks?.stateName,
        row?.kvks?.state?.stateName
    );
    const resolveKvkName = (row) => pickFirst(
        row?.kvkName,
        row?.kvk?.kvkName,
        row?.kvks?.kvkName
    );
    const arr = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (arr.length === 0) return { headers: fallbackHeaders, rows: fallbackRows };
    const headers = [
        'State','KVK','Name of farm implement/equipment',
        'Gen M','Gen F','Gen T',
        'OBC M','OBC F','OBC T',
        'SC M','SC F','SC T',
        'ST M','ST F','ST T',
        'Total M','Total F','Total T',
        'Area covered (ha)',
        'Used (hours)',
        'Revenue generated (Rs.)',
        'Expenditure repairing (Rs.)',
    ];
    const rows = arr.map(r => [
        formatExportValue(resolveStateName(r) || '-', format),
        formatExportValue(resolveKvkName(r) || '-', format),
        formatExportValue(r.nameOfFarmImplement || r.nameOfFarmImplementEquipment || '-', format),
        Number(r.genM ?? r.generalM ?? r.genMale ?? 0), Number(r.genF ?? r.generalF ?? r.genFemale ?? 0), Number(r.genT ?? 0),
        Number(r.obcM ?? 0), Number(r.obcF ?? 0), Number(r.obcT ?? 0),
        Number(r.scM ?? 0), Number(r.scF ?? 0), Number(r.scT ?? 0),
        Number(r.stM ?? 0), Number(r.stF ?? 0), Number(r.stT ?? 0),
        Number(r.totM ?? 0), Number(r.totF ?? 0), Number(r.totT ?? 0),
        Number(r.areaCovered ?? r.areaCoveredByFarmImplement ?? 0),
        Number(r.farmImplementUsedHours ?? r.farmImplementUsedInHours ?? 0),
        Number(r.revenueGeneratedRs ?? r.revenueGeneratedByFarmImplement ?? 0),
        Number(r.expenditureIncurredRepairingRs ?? r.expenditureIncurredOnRepairing ?? 0),
    ]);
    return { headers, rows };
}

function buildNicraVcrmcTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const arr = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (arr.length === 0) return { headers: fallbackHeaders, rows: fallbackRows };
    const headers = [
        'State','KVK','Village name','VCRMC Constitution date',
        'Members Male','Members Female','Members Total',
        'Meetings organized (no.)','Date of VCRMC meeting',
        'Name of Secretary','Name of President','Major decision taken',
    ];
    const rows = arr.map(r => [
        formatExportValue(r.stateName || '-', format),
        formatExportValue(r.kvkName || '-', format),
        formatExportValue(r.villageName || '-', format),
        formatExportValue(r.vcrmcConstitutionDate ? new Date(r.vcrmcConstitutionDate).toISOString().slice(0,10) : '-', format),
        Number(r.membersMale ?? 0), Number(r.membersFemale ?? 0), Number(r.membersTotal ?? 0),
        Number(r.meetingsOrganized ?? 0),
        formatExportValue(r.dateOfMeeting ? new Date(r.dateOfMeeting).toISOString().slice(0,10) : '-', format),
        formatExportValue(r.nameOfSecretary || '-', format),
        formatExportValue(r.nameOfPresident || '-', format),
        formatExportValue(r.majorDecisionTaken || '-', format),
    ]);
    return { headers, rows };
}

function buildNicraSoilHealthTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const arr = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (arr.length === 0) return { headers: fallbackHeaders, rows: fallbackRows };
    const headers = [
        'State','KVK',
        'No. of soil samples collected',
        'No. of samples analysed',
        'SHC issued',
        'Gen M','Gen F','Gen T',
        'OBC M','OBC F','OBC T',
        'SC M','SC F','SC T',
        'ST M','ST F','ST T',
        'Total M','Total F','Total T',
    ];
    const rows = arr.map(r => [
        formatExportValue(r.stateName || '-', format),
        formatExportValue(r.kvkName || '-', format),
        Number(r.noOfSoilSamplesCollected ?? 0),
        Number(r.noOfSamplesAnalysed ?? 0),
        Number(r.shcIssued ?? 0),
        Number(r.genM ?? r.generalM ?? r.genMale ?? 0), Number(r.genF ?? r.generalF ?? r.genFemale ?? 0), Number(r.genT ?? 0),
        Number(r.obcM ?? 0), Number(r.obcF ?? 0), Number(r.obcT ?? 0),
        Number(r.scM ?? 0), Number(r.scF ?? 0), Number(r.scT ?? 0),
        Number(r.stM ?? 0), Number(r.stF ?? 0), Number(r.stT ?? 0),
        Number(r.totM ?? 0), Number(r.totF ?? 0), Number(r.totT ?? 0),
    ]);
    return { headers, rows };
}

function buildNaturalFarmingPhysicalTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const NF_OTHER_KEY = '__other_activities__';
    const resolved = resolveNFPhysicalGrouped(rawData);
    const activityGroups = resolved.activityGroups || {};
    const activityOrder  = resolved.activityOrder || [];
    const activityNames  = resolved.activityNames || [];
    const stateAggregates = Array.isArray(resolved.stateAggregates) ? resolved.stateAggregates : [];
    const rows = [];

    // ── State-wise aggregate table (dynamic activity columns) ──
    if (stateAggregates.length > 0) {
        rows.push([formatExportValue('State-wise overall Physical Information', format)]);
        const aggHeader = ['S.No.', 'State', ...activityNames, 'Other activities', 'Total programmes', 'Total M', 'Total F', 'Total T'];
        rows.push(aggHeader);
        stateAggregates.forEach((r, idx) => {
            const actCols = activityNames.map(a => Number(r[a] ?? 0));
            rows.push([
                idx + 1,
                formatExportValue(r.stateName || '-', format),
                ...actCols,
                Number(r.other ?? 0),
                Number(r.totalProgrammes ?? 0),
                Number(r.totM ?? 0),
                Number(r.totF ?? 0),
                Number(r.totT ?? 0),
            ]);
        });
        rows.push([]); // blank separator
    }

    // ── Dynamic activity detail tables ──
    const emitActivity = (title, arr) => {
        if (!arr || arr.length === 0) return;
        rows.push([formatExportValue(title, format)]);
        rows.push([
            'S.No.', 'Title of programme', 'Date', 'Venue',
            'Gen M', 'Gen F', 'Gen T',
            'OBC M', 'OBC F', 'OBC T',
            'SC M', 'SC F', 'SC T',
            'ST M', 'ST F', 'ST T',
            'Total M', 'Total F', 'Total T',
            'Remarks',
        ]);
        arr.forEach((r, idx) => {
            rows.push([
                idx + 1,
                formatExportValue(r.trainingTitle || r.activityName || '-', format),
                formatExportValue(r.trainingDate || '-', format),
                formatExportValue(r.venue || '-', format),
                Number(r.genM ?? 0), Number(r.genF ?? 0), Number(r.genT ?? 0),
                Number(r.obcM ?? 0), Number(r.obcF ?? 0), Number(r.obcT ?? 0),
                Number(r.scM ?? 0), Number(r.scF ?? 0), Number(r.scT ?? 0),
                Number(r.stM ?? 0), Number(r.stF ?? 0), Number(r.stT ?? 0),
                Number(r.totM ?? 0), Number(r.totF ?? 0), Number(r.totT ?? 0),
                formatExportValue(r.remarks || '-', format),
            ]);
        });
        rows.push([]);
    };

    const emitOther = (arr) => {
        if (!arr || arr.length === 0) return;
        rows.push([formatExportValue('Other activities', format)]);
        rows.push(['S.No.', 'Name of the Innovative programme organized', 'Significance of innovative programme', 'Remarks']);
        arr.forEach((r, idx) => {
            rows.push([
                idx + 1,
                formatExportValue(r.innovativeProgrammeName || '-', format),
                formatExportValue(r.significanceOfInnovativeProgramme || '-', format),
                formatExportValue(r.remarks || '-', format),
            ]);
        });
    };

    // Iterate over all activity categories in insertion order
    for (const key of activityOrder) {
        if (key === NF_OTHER_KEY) {
            emitOther(activityGroups[key]);
        } else {
            emitActivity(key, activityGroups[key]);
        }
    }

    const headers = rows[1] || fallbackHeaders;
    return { headers, rows: rows.length ? rows : fallbackRows };
}

/**
 * Natural Farming — Demonstration Information: long-format rows (one per parameter per demonstration).
 */
function buildNaturalFarmingDemonstrationTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const flat = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (flat.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }

    const headers = [
        'Sl.',
        'Demo ID',
        'Reporting year',
        'State',
        'District',
        'KVK / Farmer',
        'Address & contact',
        'Agro-climatic zone',
        'Cropping pattern',
        'Latitude (N)',
        'Longitude (E)',
        'Activity',
        'Crop',
        'Variety',
        'Season',
        'NF technology / components',
        'Area (ha)',
        'Detail of farmer practice',
        'Parameter',
        'Performance without NF',
        'Performance with NF',
        'Farmer feedback',
    ];

    const rows = [];
    let sl = 0;

    flat.forEach((raw) => {
        const rec = normalizeDemonstrationExportRow(raw);
        if (!rec) return;
        NF_DEMONSTRATION_PARAMETER_DEFS.forEach((def, pi) => {
            sl += 1;
            rows.push([
                sl,
                rec.demonstrationInfoId ?? '-',
                formatExportValue(rec.reportingYear ?? '', format),
                formatExportValue(rec.stateName ?? '', format),
                formatExportValue(rec.districtName ?? '', format),
                formatExportValue(rec.kvkFarmerLabel ?? '', format),
                formatExportValue(rec.addressWithContact ?? '', format),
                formatExportValue(rec.agroClimaticZone ?? '', format),
                formatExportValue(rec.croppingPattern ?? '', format),
                formatExportValue(rec.latitude != null ? rec.latitude : '', format),
                formatExportValue(rec.longitude != null ? rec.longitude : '', format),
                formatExportValue(rec.activityName ?? '', format),
                formatExportValue(rec.crop ?? '', format),
                formatExportValue(rec.variety ?? '', format),
                formatExportValue(rec.seasonName ?? '', format),
                formatExportValue(rec.naturalFarmingTechnology ?? '', format),
                formatExportValue(rec.areaInHa != null ? rec.areaInHa : '', format),
                formatExportValue(rec.farmerPracticeDetails ?? '', format),
                formatExportValue(def.label, format),
                formatExportValue(rec[def.withoutKey], format),
                formatExportValue(rec[def.withKey], format),
                pi === 0 ? formatExportValue(rec.farmerFeedback ?? '', format) : '',
            ]);
        });
    });

    return { headers, rows: rows.length ? rows : fallbackRows };
}

/**
 * Natural Farming — Farmers already practicing: long-format rows (one per parameter per record).
 */
function buildNaturalFarmingFarmersPracticingTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const flat = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (flat.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }

    const headers = [
        'Sl.',
        'Record ID',
        'Reporting year',
        'State',
        'District',
        'KVK / Farmer',
        'Address & contact',
        'Agro-climatic zone',
        'Cropping pattern',
        'Latitude (N)',
        'Longitude (E)',
        'Activity',
        'Crop',
        'Variety',
        'Season',
        'NF technology / components',
        'Area (ha)',
        'Detail of farmer practice',
        'Parameter',
        'Without NF practice',
        'With NF practice',
        'Farmer feedback',
    ];

    const rows = [];
    let sl = 0;

    flat.forEach((raw) => {
        const rec = normalizeFarmersPracticingExportRow(raw);
        if (!rec) return;
        NF_DEMONSTRATION_PARAMETER_DEFS.forEach((def, pi) => {
            sl += 1;
            rows.push([
                sl,
                rec.farmersPracticingId ?? '-',
                formatExportValue(rec.reportingYear ?? '', format),
                formatExportValue(rec.stateName ?? '', format),
                formatExportValue(rec.districtName ?? '', format),
                formatExportValue(rec.kvkFarmerLabel ?? '', format),
                formatExportValue(rec.addressWithContact ?? '', format),
                formatExportValue(rec.agroClimaticZone ?? '', format),
                formatExportValue(rec.croppingPattern ?? '', format),
                formatExportValue(rec.latitude != null ? rec.latitude : '', format),
                formatExportValue(rec.longitude != null ? rec.longitude : '', format),
                formatExportValue(rec.activityName ?? '', format),
                formatExportValue(rec.crop ?? '', format),
                formatExportValue(rec.variety ?? '', format),
                formatExportValue(rec.seasonName ?? '', format),
                formatExportValue(rec.naturalFarmingTechnology ?? '', format),
                formatExportValue(rec.areaInHa != null ? rec.areaInHa : '', format),
                formatExportValue(rec.farmerPracticeDetails ?? '', format),
                formatExportValue(def.label, format),
                formatExportValue(rec[def.withoutKey], format),
                formatExportValue(rec[def.withKey], format),
                pi === 0 ? formatExportValue(rec.farmerFeedback ?? '', format) : '',
            ]);
        });
    });

    return { headers, rows: rows.length ? rows : fallbackRows };
}

function buildNfSoilDataTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const payload = rawData && typeof rawData === 'object' && !Array.isArray(rawData) && Array.isArray(rawData.tables)
        ? rawData
        : inferSoilTablesFromRecords(rawData);
    const tables = payload.tables || [];
    const unassigned = payload.unassignedRows;

    const headers = [
        'Section',
        'Soil parameter (master)',
        'Season',
        'Crop',
        'pH (before crop sowing)',
        'EC (dS/m) before',
        'OC (%) before',
        'N (Kg/ha) before',
        'P (Kg/ha) before',
        'K (Kg/ha) before',
        'Soil Microbes (cfu) before',
        'pH (after harvesting)',
        'EC (dS/m) after',
        'OC (%) after',
        'N (Kg/ha) after',
        'P (Kg/ha) after',
        'K (Kg/ha) after',
        'Soil Microbes (cfu) after',
    ];

    const pushRows = (subtitle, rows) => {
        const out = [];
        for (const r of rows || []) {
            out.push([
                formatExportValue(subtitle, format),
                formatExportValue(r.parameterName ?? '', format),
                formatExportValue(r.seasonName ?? '', format),
                formatExportValue(r.crop ?? '', format),
                formatExportValue(r.phBefore, format),
                formatExportValue(r.ecBefore, format),
                formatExportValue(r.ocBefore, format),
                formatExportValue(r.nBefore, format),
                formatExportValue(r.pBefore, format),
                formatExportValue(r.kBefore, format),
                formatExportValue(r.soilMicrobesBefore, format),
                formatExportValue(r.phAfter, format),
                formatExportValue(r.ecAfter, format),
                formatExportValue(r.ocAfter, format),
                formatExportValue(r.nAfter, format),
                formatExportValue(r.pAfter, format),
                formatExportValue(r.kAfter, format),
                formatExportValue(r.soilMicrobesAfter, format),
            ]);
        }
        return out;
    };

    const rows = [];
    tables.forEach((t) => {
        rows.push(...pushRows(t.subtitle || '', t.rows));
    });
    if (unassigned && unassigned.length > 0) {
        groupUnassignedSoilRowsByParameterName(unassigned).forEach(({ subtitle, rows: chunk }) => {
            rows.push(...pushRows(subtitle, chunk));
        });
    }

    if (rows.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }
    return { headers, rows };
}

function buildNfBudgetExpenditureTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const payload = resolveBudgetTemplatePayload(rawData);
    const rows = payload.rows || [];
    const headers = [
        'Name of activity',
        'Number of activities organized',
        'Budget sanction (Rs)',
        'Budget expenditure (Rs)',
        'Total Budget Expenditure (Rs)',
    ];
    const out = rows.map((r) => [
        formatExportValue(r.activityLabel, format),
        formatExportValue(r.numberOfActivities, format),
        formatExportValue(r.budgetSanction, format),
        formatExportValue(r.budgetExpenditure, format),
        formatExportValue(r.totalBudgetExpenditure, format),
    ]);
    if (out.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }
    return { headers, rows: out };
}

function buildAgriDroneIntroductionTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const payload = resolveAgriDroneIntroductionPayload(rawData);
    const rows = payload.rows || [];
    const headers = ['S.No.', 'Name of parameter', 'Details of parameter'];
    const out = [];
    for (const r of rows) {
        if (r._spacer) {
            out.push(['', '', '']);
            continue;
        }
        out.push([
            formatExportValue(r.sNo, format),
            formatExportValue(r.parameterName, format),
            formatExportValue(r.details, format),
        ]);
    }
    if (out.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }
    return { headers, rows: out };
}

const AGRI_DRONE_DEMO_FLAT_HEADERS = [
    'Demos on',
    'Name of district',
    'Date of demonstration',
    'Place of demonstration',
    'Crop Name',
    'No. of demos',
    'Area covered under demos (area in ha)',
    'General M',
    'General F',
    'General T',
    'OBC M',
    'OBC F',
    'OBC T',
    'SC M',
    'SC F',
    'SC T',
    'ST M',
    'ST F',
    'ST T',
    'Grand Total M',
    'Grand Total F',
    'Grand Total T',
];

function buildAgriDroneDemonstrationDetailsTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const payload = resolveAgriDroneDemonstrationDetailsPayload(rawData);
    const rows = payload.rows || [];
    const out = rows.map((r) => [
        formatExportValue(r.demonstrationsOn, format),
        formatExportValue(r.districtName, format),
        formatExportValue(r.dateOfDemonstration, format),
        formatExportValue(r.placeOfDemonstration, format),
        formatExportValue(r.cropName, format),
        formatExportValue(r.noOfDemos, format),
        formatExportValue(r.areaHa, format),
        formatExportValue(r.generalM, format),
        formatExportValue(r.generalF, format),
        formatExportValue(r.generalT, format),
        formatExportValue(r.obcM, format),
        formatExportValue(r.obcF, format),
        formatExportValue(r.obcT, format),
        formatExportValue(r.scM, format),
        formatExportValue(r.scF, format),
        formatExportValue(r.scT, format),
        formatExportValue(r.stM, format),
        formatExportValue(r.stF, format),
        formatExportValue(r.stT, format),
        formatExportValue(r.grandM, format),
        formatExportValue(r.grandF, format),
        formatExportValue(r.grandT, format),
    ]);
    if (out.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }
    return { headers: AGRI_DRONE_DEMO_FLAT_HEADERS, rows: out };
}

/**
 * Resolve raw data into dynamic grouped format for Natural Farming Physical Info.
 * Handles both the pre-grouped object from the report service and flat arrays from the form page.
 */
function resolveNFPhysicalGrouped(rawData) {
    const NF_OTHER_KEY = '__other_activities__';
    // Already grouped (from report data service)
    if (rawData && !Array.isArray(rawData) && rawData.activityGroups) {
        return rawData;
    }
    // Flat array (from form page export)
    const flatRows = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    const activityGroups = {};
    const activityOrder = [];
    const stateMap = new Map();

    for (const raw of flatRows) {
        const r = normalizeNFPhysicalRow(raw);
        const isOther = !r.trainingTitle && !r.trainingDate && !r.venue;
        const key = isOther ? NF_OTHER_KEY : (r.activityName || 'Uncategorised');

        if (!activityGroups[key]) {
            activityGroups[key] = [];
            activityOrder.push(key);
        }
        activityGroups[key].push(r);

        const stKey = r.stateName || '-';
        if (!stateMap.has(stKey)) {
            stateMap.set(stKey, { stateName: stKey, totalProgrammes: 0, totM: 0, totF: 0, totT: 0, other: 0 });
        }
        const agg = stateMap.get(stKey);
        if (isOther) {
            agg.other += 1;
        } else {
            const aName = r.activityName || 'Uncategorised';
            if (agg[aName] === undefined) agg[aName] = 0;
            agg[aName] += 1;
        }
        agg.totalProgrammes += 1;
        agg.totM += Number(r.totM ?? 0);
        agg.totF += Number(r.totF ?? 0);
        agg.totT += Number(r.totT ?? 0);
    }
    const activityNames = activityOrder.filter(k => k !== NF_OTHER_KEY);
    const stateAggregates = Array.from(stateMap.values()).sort((a, b) => a.stateName.localeCompare(b.stateName));
    return { activityGroups, activityOrder, activityNames, stateAggregates };
}

function normalizeNFPhysicalRow(r) {
    const genM = Number(r.genM ?? r.genMale ?? r.generalM ?? 0) || 0;
    const genF = Number(r.genF ?? r.genFemale ?? r.generalF ?? 0) || 0;
    const obcM = Number(r.obcM ?? r.obcMale ?? 0) || 0;
    const obcF = Number(r.obcF ?? r.obcFemale ?? 0) || 0;
    const scM  = Number(r.scM ?? r.scMale ?? 0) || 0;
    const scF  = Number(r.scF ?? r.scFemale ?? 0) || 0;
    const stM  = Number(r.stM ?? r.stMale ?? 0) || 0;
    const stF  = Number(r.stF ?? r.stFemale ?? 0) || 0;
    const totM = genM + obcM + scM + stM;
    const totF = genF + obcF + scF + stF;
    return {
        ...r,
        trainingTitle: r.trainingTitle || '',
        trainingDate: r.trainingDate || '',
        venue: r.venue || '',
        activityName: r.activityName || (r.activityMaster && r.activityMaster.activityName) || '',
        remarks: r.remarks || '',
        innovativeProgrammeName: r.innovativeProgrammeName || '',
        significanceOfInnovativeProgramme: r.significanceOfInnovativeProgramme || '',
        stateName: r.stateName || (r.kvk && r.kvk.state && r.kvk.state.stateName) || '',
        kvkName: r.kvkName || (r.kvk && r.kvk.kvkName) || '',
        genM, genF, genT: genM + genF,
        obcM, obcF, obcT: obcM + obcF,
        scM,  scF,  scT:  scM  + scF,
        stM,  stF,  stT:  stM  + stF,
        totM, totF, totT: totM + totF,
    };
}
/**
 * CSISA – Excel / DOCX tabular export (Section 2.22)
 *
 * Each row in `rawData` is already one flattened crop-detail row
 * (parent CSISA fields repeated) as produced by csisaReportRepository.
 * Stable 20-column layout matching the PDF template.
 */
function buildCsisaTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const normalizedData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (normalizedData.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }

    const headers = [
        'Sr.No.',
        'Season',
        'Village Covered',
        'Block Covered',
        'District Covered',
        'Respondent',
        'Trial Name',
        'Area Covered (ha)',
        'Name of Crop',
        'Tech. Options',
        'Variety Name',
        'Duration (Days)',
        'Sowing Date',
        'Harvesting Date',
        'Maturity Days',
        'Grain Yield (q/ha)',
        'Cost of Cultivation (Rs/ha)',
        'Gross Return (Rs/ha)',
        'Net Return (Rs/ha)',
        'BCR',
    ];

    const rows = normalizedData.map((row, idx) => [
        idx + 1,
        formatExportValue(row.seasonName       || '-', format),
        Number(row.villagesCovered  ?? 0),
        Number(row.blocksCovered    ?? 0),
        Number(row.districtsCovered ?? 0),
        Number(row.respondents      ?? 0),
        formatExportValue(row.trialName        || '-', format),
        Number(row.areaCoveredHa   ?? 0),
        formatExportValue(row.cropName         || '-', format),
        formatExportValue(row.technologyOption || '-', format),
        formatExportValue(row.varietyName      || '-', format),
        Number(row.durationDays    ?? 0),
        formatExportValue(row.sowingDate       || '-', format),
        formatExportValue(row.harvestingDate   || '-', format),
        Number(row.daysOfMaturity  ?? 0),
        Number(row.grainYieldQPerHa ?? 0),
        Number(row.costOfCultivation ?? 0),
        Number(row.grossReturn      ?? 0),
        Number(row.netReturn        ?? 0),
        Number(row.bcr              ?? 0),
    ]);

    return { headers, rows };
}


/**
 * TSP (Tribal Sub Plan) – Excel / DOCX tabular export (Section 2.23.1)
 *
 * rawData is the structured object from tspScspReportRepository.getTspData():
 *   { activities[], fundsReceived, outcomes{}, locationDetails[], records[] }
 * We flatten to one-row-per-activity with relevant summary columns appended.
 */
function buildTspTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const d = Array.isArray(rawData) ? rawData[0] : rawData;
    if (!d || !d.activities || d.activities.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }

    const headers = [
        'KVK Name', 'Reporting Year', 'Activity',
        'Nos. (Count)', 'No. of Beneficiaries',
        'Fund Received (Rs. In lakh)',
        'Change in Family Income (%)', 'Change in Family Consumption Level (%)',
        'Change in Availability of Agricultural Implements (%)',
        'District', 'Subdistrict', 'No. of Villages Covered',
        'Village Names', 'ST Beneficiaries (M)', 'ST Beneficiaries (F)', 'ST Beneficiaries (T)',
    ];

    const rows = d.activities.map(act => [
        formatExportValue(d.kvkName || '-', format),
        formatExportValue(d.reportingYear || '-', format),
        formatExportValue(act.activityName || '-', format),
        Number(act.noOfTrainings ?? 0),
        Number(act.noOfBeneficiaries ?? 0),
        Number(d.fundsReceived ?? 0),
        Number(d.outcomes?.familyIncome?.achievement ?? 0),
        Number(d.outcomes?.consumptionLevel?.achievement ?? 0),
        Number(d.outcomes?.implementsAvailability?.achievement ?? 0),
        formatExportValue('-', format),
        formatExportValue('-', format),
        Number(0),
        formatExportValue('-', format),
        Number(0), Number(0), Number(0),
    ]);

    // Append location detail rows
    (d.locationDetails || []).forEach(loc => {
        rows.push([
            formatExportValue(d.kvkName || '-', format),
            formatExportValue(d.reportingYear || '-', format),
            formatExportValue('Location Detail', format),
            Number(0), Number(0),
            Number(d.fundsReceived ?? 0),
            Number(0), Number(0), Number(0),
            formatExportValue(loc.districtName || '-', format),
            formatExportValue(loc.subDistrict || '-', format),
            Number(loc.villagesCount ?? 0),
            formatExportValue(loc.villageNames || '-', format),
            Number(loc.stMale ?? 0),
            Number(loc.stFemale ?? 0),
            Number(loc.stTotal ?? 0),
        ]);
    });

    return { headers, rows };
}

function buildSpecialProgrammeTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const normalizedData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (normalizedData.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }

    const headers = [
        'Sr.No.',
        'Programme Type',
        'Name of the Programme/Scheme',
        'Purpose of programme',
        'Date/Month of initiation',
        'Funding agency',
        'Amount(Rs.)',
    ];

    const rows = normalizedData.map((row, idx) => [
        idx + 1,
        formatExportValue(row.programmeType || '-', format),
        formatExportValue(row.programmeName || '-', format),
        formatExportValue(row.programmePurpose || '-', format),
        formatExportValue(row.initiationDate || '-', format),
        formatExportValue(row.fundingAgency || '-', format),
        formatExportValue(row.amount || 0, format),
    ]);

    return { headers, rows };
}

/**
 * SCSP (Scheduled Caste Sub Plan) – Excel / DOCX tabular export (Section 2.23.2)
 *
 * rawData is the structured object from tspScspReportRepository.getScspData():
 *   { activities[], records[] }
 * Only section (a) – physical output.
 */
function buildScspTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const d = Array.isArray(rawData) ? rawData[0] : rawData;
    if (!d || !d.activities || d.activities.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }

    const headers = [
        'KVK Name', 'Reporting Year', 'Activity',
        'Nos. (Count)', 'No. of Beneficiaries',
    ];

    const rows = d.activities.map(act => [
        formatExportValue(d.kvkName || '-', format),
        formatExportValue(d.reportingYear || '-', format),
        formatExportValue(act.activityName || '-', format),
        Number(act.noOfTrainings ?? 0),
        Number(act.noOfBeneficiaries ?? 0),
    ]);

    return { headers, rows };
}


/**
 * Combined TSP + SCSP – Excel / DOCX module-level export (templateKey: 'tsp-scsp')
 *
 * rawData is a flat array of TspScsp form records (both types) as returned
 * by the forms repository (_mapResponse).  We split by type and render a
 * unified flat table with a Type column.
 */
function buildTspScspTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const records = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (records.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }

    const headers = [
        'KVK Name', 'Reporting Year', 'Type', 'Activity',
        'Nos. (Count)', 'No. of Beneficiaries',
        'Fund Received (Rs. In lakh)',
        'Change in Family Income (%)', 'Change in Family Consumption Level (%)',
        'Change in Availability of Agricultural Implements (%)',
        'District', 'Subdistrict', 'No. of Villages Covered',
        'Village Names', 'ST Beneficiaries (M)', 'ST Beneficiaries (F)', 'ST Beneficiaries (T)',
    ];

    const rows = records.map(r => [
        formatExportValue(r.kvkName || '-', format),
        formatExportValue(r.yearName || r.reportingYear || '-', format),
        formatExportValue(r.type || '-', format),
        formatExportValue(r.activityName || '-', format),
        Number(r.noOfTrainings ?? 0),
        Number(r.noOfBeneficiaries ?? 0),
        Number(r.fundsReceived ?? 0),
        Number(r.outcome1_achievement ?? 0),
        Number(r.outcome2_achievement ?? 0),
        Number(r.outcome3_achievement ?? 0),
        formatExportValue(r.districtName || '-', format),
        formatExportValue(r.subDistrict || '-', format),
        Number(r.villagesCount ?? 0),
        formatExportValue(r.villageNames || '-', format),
        Number(r.beneficiaryMale ?? 0),
        Number(r.beneficiaryFemale ?? 0),
        Number(r.beneficiaryTotal ?? 0),
    ]);

    return { headers, rows };
}

function buildFunctionalLinkageTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const normalizedData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (normalizedData.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }

    const headers = [
        'Sr.No.',
        'Name of Organization',
        'Nature of Linkage',
    ];

    const rows = normalizedData.map((row, idx) => [
        idx + 1,
        formatExportValue(row.organizationName || '-', format),
        formatExportValue(row.natureOfLinkage || '-', format),
    ]);

    return { headers, rows };
}

function buildSuccessStoryTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const normalizedData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (normalizedData.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }

    const headers = [
        'Sr.No.',
        'Farmer Name',
        'Story Title',
        'Enterprise',
        'Net Income',
        'Cost-Benefit Ratio',
    ];

    const rows = normalizedData.map((row, idx) => [
        idx + 1,
        formatExportValue(row.farmerName || '-', format),
        formatExportValue(row.storyTitle || '-', format),
        formatExportValue(row.enterprise || '-', format),
        formatExportValue(row.netIncome || 0, format),
        formatExportValue(row.costBenefitRatio || 0, format),
    ]);

    return { headers, rows };
}

function buildEntrepreneurshipTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const normalizedData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (normalizedData.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }

    const headers = [
        'Sr.No.',
        'Name of the entrepreneur',
        'Type of Enterprise',
        'Year of establishment',
        'Annual Income',
        'No of members',
        'Technical components',
    ];

    const rows = normalizedData.map((row, idx) => [
        idx + 1,
        formatExportValue(row.entrepreneurName || '-', format),
        formatExportValue(row.enterpriseType || '-', format),
        formatExportValue(row.yearOfEstablishment || '-', format),
        formatExportValue(row.annualIncome || 0, format),
        formatExportValue(row.membersAssociated || 0, format),
        formatExportValue(row.technicalComponents || '-', format),
    ]);

    return { headers, rows };
}

function buildKvkImpactActivityTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const normalizedData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (normalizedData.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }

    const headers = [
        'Sr.No.',
        'State',
        'District',
        'Specific Area',
        'Brief Details',
        'Farmers Benefitted',
        'Horizontal Spread',
        '% Adoption',
        'Income Before',
        'Income After',
    ];

    const rows = normalizedData.map((row, idx) => [
        idx + 1,
        formatExportValue(row.stateName || '-', format),
        formatExportValue(row.districtName || '-', format),
        formatExportValue(row.specificArea || '-', format),
        formatExportValue(row.briefDetails || '-', format),
        formatExportValue(row.farmersBenefitted || 0, format),
        formatExportValue(row.horizontalSpread || '0', format),
        formatExportValue(row.adoptionPercentage || 0, format),
        formatExportValue(row.incomeBefore || 0, format),
        formatExportValue(row.incomeAfter || 0, format),
    ]);

    return { headers, rows };
}

function buildDemonstrationUnitTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const normalizedData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (normalizedData.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }

    const headers = [
        'Sr.No.',
        'Name of Demo Unit',
        'Year of Estt.',
        'Area (Sq. mt)',
        'Variety/Breed',
        'Produce',
        'Qty.',
        'Cost of Inputs',
        'Gross Income',
        'Remarks',
    ];

    const rows = normalizedData.map((row, idx) => [
        idx + 1,
        formatExportValue(row.demoUnitName || '-', format),
        formatExportValue(row.yearOfEstablishment || '-', format),
        formatExportValue(row.area || 0, format),
        formatExportValue(row.varietyBreed || '-', format),
        formatExportValue(row.produce || '-', format),
        formatExportValue(row.quantity || 0, format),
        formatExportValue(row.costOfInputs || 0, format),
        formatExportValue(row.grossIncome || 0, format),
        formatExportValue(row.remarks || '-', format),
    ]);

    return { headers, rows };
}

function buildInstructionalFarmCropTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const normalizedData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (normalizedData.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }

    const headers = [
        'Season',
        'Name Of the Crop',
        'Area (ha)',
        'Variety',
        'Type of Produce',
        'Qty.',
        'Cost of Inputs',
        'Gross Income',
        'Remarks',
    ];

    const rows = normalizedData.map((row, idx) => [
        formatExportValue(row.seasonName || '-', format),
        formatExportValue(row.cropName || '-', format),
        formatExportValue(row.area || 0, format),
        formatExportValue(row.variety || '-', format),
        formatExportValue(row.typeOfProduce || '-', format),
        formatExportValue(row.quantity || 0, format),
        formatExportValue(row.costOfInputs || 0, format),
        formatExportValue(row.grossIncome || 0, format),
        formatExportValue(row.remarks || '-', format),
    ]);

    return { headers, rows };
}

function buildProductionUnitTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const normalizedData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (normalizedData.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }

    const headers = [
        'Sr.No.',
        'Name of the Product',
        'Qty.(Kg)',
        'Cost of Inputs',
        'Gross Income',
        'Remarks',
    ];

    const rows = normalizedData.map((row, idx) => [
        idx + 1,
        formatExportValue(row.productName || '-', format),
        formatExportValue(row.quantity || 0, format),
        formatExportValue(row.costOfInputs || 0, format),
        formatExportValue(row.grossIncome || 0, format),
        formatExportValue(row.remarks || '-', format),
    ]);

    return { headers, rows };
}

function buildInstructionalFarmLivestockTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const normalizedData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (normalizedData.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }

    const headers = [
        'Name of the Animal/Bird/Aquatics',
        'Species / Breed / Variety',
        'Type of Produce',
        'Qty.',
        'Cost of Inputs',
        'Gross Income',
        'Remarks',
    ];

    const rows = normalizedData.map((row, idx) => [
        formatExportValue(row.animalName || '-', format),
        formatExportValue(row.speciesBreed || '-', format),
        formatExportValue(row.typeOfProduce || '-', format),
        formatExportValue(row.quantity || 0, format),
        formatExportValue(row.costOfInputs || 0, format),
        formatExportValue(row.grossIncome || 0, format),
        formatExportValue(row.remarks || '-', format),
    ]);

    return { headers, rows };
}

function buildHostelUtilizationTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const normalizedData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (normalizedData.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }

    const headers = [
        'Months',
        'No. of Trainees Stayed',
        'Trainee Days (Days Stayed)',
        'Reason for Short Fall (if any)',
    ];

    const rows = normalizedData.map((row) => [
        formatExportValue(row.months || '-', format),
        formatExportValue(row.traineesStayed || 0, format),
        formatExportValue(row.traineeDays || 0, format),
        formatExportValue(row.reasonForShortFall || '-', format),
    ]);

    return { headers, rows };
}

function buildStaffQuartersTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const normalizedData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (normalizedData.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }

    const headers = [
        'Date of Completion',
        'No. of Staff Quarters',
        'Occupancy Details',
        'Remark',
    ];

    const rows = normalizedData.map((row) => [
        formatExportValue(row.dateOfCompletion || '-', format),
        formatExportValue(row.numberOfQuarters || 0, format),
        formatExportValue(row.occupancyDetails || '-', format),
        formatExportValue(row.remark || '-', format),
    ]);

    return { headers, rows };
}

function buildRainwaterHarvestingTabularData(rawData, format, fallbackHeaders, fallbackRows) {
    const normalizedData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    if (normalizedData.length === 0) {
        return { headers: fallbackHeaders, rows: fallbackRows };
    }

    const headers = [
        'Sl.',
        'No of training programme conducted',
        'No. of demonstrations',
        'No. of plant material produced',
        'Visit by the farmers (No.)',
        'Visit by the officials (No.)',
    ];

    let sl = 1;
    const rows = normalizedData.map((row) => [
        sl++,
        formatExportValue(row.trainingProgrammes || 0, format),
        formatExportValue(row.demonstrations || 0, format),
        formatExportValue(row.plantMaterial || 0, format),
        formatExportValue(row.farmerVisits || 0, format),
        formatExportValue(row.officialVisits || 0, format),
    ]);

    return { headers, rows };
}



function getNestedValue(obj, path) {
    if (!obj || !path) return null;
    return path.split('.').reduce((acc, key) => {
        if (acc === null || acc === undefined) return null;
        return acc[key] !== undefined ? acc[key] : null;
    }, obj);
}

function toNum(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function firstDefined(...candidates) {
    for (const value of candidates) {
        if (value !== null && value !== undefined && value !== '') {
            return value;
        }
    }
    return null;
}

function formatExportValue(value, format = 'csv') {
    if (value === null || value === undefined || value === '') return '-';

    // Check for JSON-encoded image and caption
    if (typeof value === 'string' && value.startsWith('{"image":')) {
        try {
            const parsed = JSON.parse(value);
            const captionText = parsed.caption ? `Caption: ${parsed.caption}` : '';

            if (format.toLowerCase() === 'pdf' && parsed.image) {
                // For PDF, render an actual image tag
                return `
                    <div style="display: flex; flex-direction: column; gap: 4px; max-width: 150px;">
                        <img src="${parsed.image}" style="max-width: 100%; height: auto; border: 0.1px solid #000;" />
                        ${captionText ? `<div style="font-size: 7px; font-style: italic;">${captionText}</div>` : ''}
                    </div>
                `.replace(/\s+/g, ' ').trim();
            } else {
                // For Excel/Word/CSV, return descriptive text
                return captionText ? `${captionText} [Image]` : '[Image]';
            }
        } catch (e) {
            // Not valid JSON, continue with normal processing
        }
    }

    if (value instanceof Date) return formatReportingYear(value);

    if (typeof value === 'object') {
        if (value instanceof Date) return formatReportingYear(value);
        if (value.yearName) return value.yearName;
        if (value.reportingYear) return formatReportingYear(value.reportingYear);
        if (value.name) return value.name;
        if (value.label) return value.label;
        if (value.value !== undefined && value.value !== null) return String(value.value);
        return '-';
    }

    if (typeof value === 'string') {
        const isYearOnly = /^\d{4}$/.test(value.trim());
        if (isYearOnly) return value.trim();

        const looksLikeDate = /^\d{4}-\d{1,2}-\d{1,2}(?:[T ].*)?$/.test(value.trim()) || value.includes('/');
        if (looksLikeDate) {
            const parsedDate = new Date(value);
            if (!Number.isNaN(parsedDate.getTime())) return formatReportingYear(parsedDate);
        }
    }

    return String(value);
}

/**
 * Generates professional HTML for PDF
 */
function generateHTML(title, headers, rows) {
    const date = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            body { 
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                color: #000; 
                margin: 0;
                padding: 6mm;
                line-height: 1.2;
            }
            .header { 
                text-align: left; 
                margin-bottom: 10px;
                border-bottom: 0.5px solid #000;
                padding-bottom: 6px;
            }
            .header h1 { 
                margin: 0; 
                font-size: 20px;
                font-weight: 700;
                letter-spacing: -0.02em;
                text-transform: uppercase;
            }
            .header .meta { 
                color: #555; 
                margin-top: 5px; 
                font-size: 11px;
                font-weight: 400;
            }
            table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 10px; 
                border: none;
            }
            th { 
                border: 0.1px solid #000;
                text-align: left; 
                padding: 6px 8px; 
                font-weight: 700; 
                font-size: 9px;
                text-transform: uppercase;
                background-color: #f2f2f2;
            }
            td { 
                padding: 5px 8px; 
                border: 0.1px solid #000; 
                font-size: 9px;
                color: #000;
                vertical-align: top;
                word-wrap: break-word;
            }
            .s-no {
                width: 30px;
                text-align: center;
                font-weight: 600;
            }
            .footer { 
                position: fixed;
                bottom: 6mm;
                left: 6mm;
                right: 6mm;
                text-align: left; 
                font-size: 9px; 
                color: #777;
                border-top: 0.5px solid #ccc;
                padding-top: 4px;
            }
            @page {
                margin: 6mm;
                size: A4;
                @bottom-right {
                    content: "Page " counter(page) " of " counter(pages);
                    font-family: 'Inter', sans-serif;
                    font-size: 9px;
                    color: #777;
                }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>${title} Report</h1>
        </div>
        <table>
            <thead>
                <tr>
                    <th class="s-no">No.</th>
                    ${headers.map(h => `<th>${h}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${rows.map((row, index) => `
                    <tr>
                        <td class="s-no">${index + 1}.</td>
                        ${row.map(cell => `<td>${cell || '-'}</td>`).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </body>
    </html>
    `;
}

module.exports = {
    exportData
};
