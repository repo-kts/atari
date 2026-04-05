const exportHelper = require('../utils/exportHelper');
const reportTemplateService = require('../services/reports/reportTemplateService.js');
const { getAllSections, getSectionByCustomTemplate } = require('../config/reportConfig.js');
const { formatReportingYear } = require('../utils/reportingYearUtils.js');

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

        const tabularData = (templateKey && rawData)
            ? buildTabularDataFromTemplate(templateKey, rawData, headers, rows, format)
            : {
                headers,
                rows: rows.map(row => row.map(cell => formatExportValue(cell, format)))
            };

        switch (format.toLowerCase()) {
            case 'pdf':
                const html = templateKey
                    ? await generateCustomTemplateHTML(templateKey, rawData, title)
                    : generateHTML(title, headers, rows);

                buffer = await exportHelper.generatePDF(html);
                contentType = 'application/pdf';
                fileName += '.pdf';
                break;
            case 'excel':
                buffer = await exportHelper.generateExcel(title, tabularData.headers, tabularData.rows);
                contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                fileName += '.xlsx';
                break;
            case 'word':
                buffer = await exportHelper.generateWord(title, tabularData.headers, tabularData.rows);
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
            sectionId: matchedSection?.id || '1.1',
            title: matchedSection?.title || title,
            customSectionLabel: matchedSection?.customSectionLabel,
        }
    );
}

function buildTabularDataFromTemplate(templateKey, rawData, fallbackHeaders, fallbackRows, format) {
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
    if (templateKey === 'nari-value-addition') {
        return buildNariValueAdditionTabularData(rawData, format, fallbackHeaders, fallbackRows);
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
