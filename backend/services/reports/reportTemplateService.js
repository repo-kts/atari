const { getSectionConfig, getAllSections } = require('../../config/reportConfig.js');
const { renderSimpleTableSection } = require('./formsTemplate/aboutkvkTemplates/simpleTableTemplate.js');
const { renderEmployeeContactsSection } = require('./formsTemplate/aboutkvkTemplates/employeeContactsTemplate.js');
const { renderEmployeesFullSection } = require('./formsTemplate/aboutkvkTemplates/employeesFullTemplate.js');
const { renderVehiclesSection } = require('./formsTemplate/aboutkvkTemplates/vehiclesTemplate.js');
const { renderVehicleDetailsSection } = require('./formsTemplate/aboutkvkTemplates/vehicleDetailsTemplate.js');
const { renderEquipmentRecordsSection } = require('./formsTemplate/aboutkvkTemplates/equipmentRecordsTemplate.js');
const { renderAboutKvkSection } = require('./formsTemplate/aboutkvkTemplates/aboutKvkTemplate.js');
const { renderOftSummarySection } = require('./formsTemplate/oftTemplates/oftSummaryTemplate.js');
const { renderOftDetailCardsSection } = require('./formsTemplate/oftTemplates/oftDetailCardsTemplate.js');
const { renderOftCombinedSection } = require('./formsTemplate/oftTemplates/oftCombinedTemplate.js');
const { renderCfldCombinedSection } = require('./formsTemplate/projectTemplates/cfldCombinedTemplate.js');
const { renderCfldExtensionActivitySection } = require('./formsTemplate/projectTemplates/cfldExtensionActivityTemplate.js');
const { renderCfldBudgetUtilizationSection } = require('./formsTemplate/projectTemplates/cfldBudgetUtilizationTemplate.js');
const { renderCraDetailsStateWiseSection } = require('./formsTemplate/projectTemplates/craDetailsStateWiseTemplate.js');

/**
 * Report Template Service
 * Generates HTML templates for PDF reports
 */
class ReportTemplateService {
    constructor() {
        this.customTemplateHandlers = {
            'about-kvk-view': renderAboutKvkSection.bind(this),
            'about-kvk-bank-accounts': renderSimpleTableSection.bind(this),
            'about-kvk-employee-contacts': renderEmployeeContactsSection.bind(this),
            'about-kvk-employees-full': renderEmployeesFullSection.bind(this),
            'about-kvk-vehicles': renderVehiclesSection.bind(this),
            'about-kvk-vehicle-details': renderVehicleDetailsSection.bind(this),
            'about-kvk-equipment-records': renderEquipmentRecordsSection.bind(this),
            'about-kvk-equipment-record': renderEquipmentRecordsSection.bind(this),
            'about-kvk-equipment-details': renderEquipmentRecordsSection.bind(this),
            'oft-summary': renderOftSummarySection.bind(this),
            'oft-detail-cards': renderOftDetailCardsSection.bind(this),
            'oft-combined': renderOftCombinedSection.bind(this),
            'cfld-combined': renderCfldCombinedSection.bind(this),
            'cfld-extension-activity': renderCfldExtensionActivitySection.bind(this),
            'cfld-budget-utilization': renderCfldBudgetUtilizationSection.bind(this),
            'cra-details-state-wise': renderCraDetailsStateWiseSection.bind(this),
        };
    }

    /**
     * Generate complete HTML for the report
     */
    generateReportHTML(kvkInfo, sectionsData, filters, generatedBy) {
        const sections = getAllSections();
        const reportContext = {
            isAggregatedReport: kvkInfo?.kvkId === null || kvkInfo?.kvkId === undefined,
            isStandalone: false,
        };
        // Filter sections that have valid data (not errors, not null/undefined)
        const selectedSections = sections.filter(s => {
            const sectionData = sectionsData[s.id];
            return sectionData &&
                !sectionData.error &&
                sectionData.data !== null &&
                sectionData.data !== undefined;
        });

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
    ${this._generateTableOfContents(selectedSections)}
    <div class="sections-container">
        ${this._generateSectionPages(selectedSections, sectionsData, reportContext)}
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
        const { sectionId = '1.1', title = 'Custom Report' } = options;
        const pseudoSection = { id: sectionId, title };
        const sectionConfig = { customTemplate: templateKey };
        const sectionAnchorId = `section-${sectionId.replace(/\./g, '-')}`;
        const reportContext = {
            isAggregatedReport: false,
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
    _generateTableOfContents(selectedSections) {
        let tocHtml = `
<div class="page toc-page">
    <h1 class="toc-title">Table of Contents</h1>
    <ul class="toc-list">`;

        selectedSections.forEach((section, index) => {
            const pageNumber = index + 3; // Cover page + TOC + sections start at page 3
            const sectionId = `section-${section.id.replace(/\./g, '-')}`;
            tocHtml += `
        <li class="toc-item">
            <a href="#${sectionId}" class="toc-link">
                <span class="toc-section-id">${section.id}</span>
                <span class="toc-section-title">${this._escapeHtml(section.title)}</span>
                <span class="toc-page-number">${pageNumber}</span>
            </a>
        </li>`;
        });

        tocHtml += `
    </ul>
</div>`;

        return tocHtml;
    }

    /**
     * Generate section pages with unique IDs for TOC linking
     */
    _generateSectionPages(selectedSections, sectionsData, reportContext = {}) {
        let html = '';
        let isFirstSection = true;

        selectedSections.forEach(section => {
            const sectionConfig = getSectionConfig(section.id);
            const sectionData = sectionsData[section.id];
            const sectionId = `section-${section.id.replace(/\./g, '-')}`;

            // Check for errors or missing data
            if (!sectionData || sectionData.error) {
                html += this._generateEmptySection(section, sectionData?.error, sectionId, isFirstSection);
                isFirstSection = false;
                return;
            }

            // Access data from standardized structure
            const data = sectionData.data;
            if (data === null || data === undefined) {
                html += this._generateEmptySection(section, null, sectionId, isFirstSection);
                isFirstSection = false;
                return;
            }

            // Generate section based on format
            if (sectionConfig.format === 'custom') {
                html += this._generateCustomSection(section, data, sectionConfig, sectionId, isFirstSection, reportContext);
            } else if (sectionConfig.format === 'formatted-text') {
                html += this._generateFormattedTextSection(section, data, sectionId, isFirstSection);
            } else if (sectionConfig.format === 'table') {
                html += this._generateTableSection(section, data, sectionId, isFirstSection);
            } else if (sectionConfig.format === 'grouped-table') {
                html += this._generateGroupedTableSection(section, data, sectionId, isFirstSection);
            }

            isFirstSection = false;
        });

        return html;
    }

    /**
     * Generate custom section using dedicated template keys
     */
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

        for (const path of candidatePaths) {
            const value = path.includes('.')
                ? this._getNestedValue(obj, path)
                : obj[path];

            if (value !== null && value !== undefined && value !== '') {
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
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: 'Arial', 'Helvetica', sans-serif;
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

    .toc-item {
        margin: 8px 0;
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

    .section-title {
        font-size: 10pt;
        font-weight: bold;
        color: #000000;
        margin-bottom: 10px;
        padding-bottom: 6px;
        border-bottom: 0.2px solid #000000;
        page-break-after: avoid;
    }

    .data-table,
    .grouped-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
        margin-bottom: 10px;
        border: 0.2px solid #000000;
        font-size: 8pt;
        page-break-inside: avoid;
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
        page-break-inside: avoid;
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
            page-break-inside: avoid;
        }
        
        .section-title {
            page-break-after: avoid;
        }
    }
</style>`;
    }
}

module.exports = new ReportTemplateService(); 
