const exportHelper = require('../utils/exportHelper');
const reportTemplateService = require('../services/reports/reportTemplateService.js');
const { getAllSections, getSectionByCustomTemplate } = require('../config/reportConfig.js');
const { formatReportingYear } = require('../utils/reportingYearUtils.js');

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

function getNestedValue(obj, path) {
    if (!obj || !path) return null;
    return path.split('.').reduce((acc, key) => {
        if (acc === null || acc === undefined) return null;
        return acc[key] !== undefined ? acc[key] : null;
    }, obj);
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
