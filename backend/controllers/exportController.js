const exportHelper = require('../utils/exportHelper');
const reportTemplateService = require('../services/reports/reportTemplateService.js');
const { getAllSections } = require('../config/reportConfig.js');
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
            ? buildTabularDataFromTemplate(templateKey, rawData, headers, rows)
            : {
                headers,
                rows: rows.map(row => row.map(cell => formatExportValue(cell, format)))
            };

        switch (format.toLowerCase()) {
            case 'pdf':
                const html = templateKey
                    ? generateCustomTemplateHTML(templateKey, rawData, title)
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

function generateCustomTemplateHTML(templateKey, rawData, title) {
    const normalizedData = Array.isArray(rawData)
        ? rawData
        : (rawData ? [rawData] : []);

    return reportTemplateService.generateStandaloneCustomTemplateHTML(
        templateKey,
        normalizedData,
        {
            sectionId: '1.1',
            title,
        }
    );
}

function buildTabularDataFromTemplate(templateKey, rawData, fallbackHeaders, fallbackRows) {
    const sections = getAllSections();
    const section = sections.find(s => s.customTemplate === templateKey);
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
            <div class="meta">PROJECT ATARI • GENERATEDjjj ON ${date.toUpperCase()}</div>
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
        <div class="footer">
            Confidential Document • Project Atari System Generated Report • ${date}
        </div>
    </body>
    </html>
    `;
}

module.exports = {
    exportData
};
