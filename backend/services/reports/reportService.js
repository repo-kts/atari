const reportDataService = require('./reportDataService.js');
const pdfGenerationService = require('./pdfGenerationService.js');
const reportExcelService = require('./reportExcelService.js');
const reportWordService = require('./reportWordService.js');
const reportAggregationService = require('./reportAggregationService.js');
const { validateSectionIds, getAllSections } = require('../../config/reportConfig.js');

/**
 * Report Service
 * Main service orchestrating report generation
 */
class ReportService {
    /**
     * Generate KVK report
     */
    async generateKvkReport(kvkId, options = {}) {
        const {
            sectionIds = [],
            filters = {},
            generatedBy = 'System',
        } = options;

        // Validate section IDs
        if (sectionIds.length === 0) {
            // If no sections specified, include all sections
            const allSections = getAllSections();
            sectionIds.push(...allSections.map(s => s.id));
        }

        validateSectionIds(sectionIds);

        // Get KVK info for header
        const kvkInfo = await reportDataService.getKvkInfoForHeader(kvkId);

        // Fetch data for all selected sections in parallel
        const sectionsData = await reportDataService.getMultipleSectionData(
            sectionIds,
            kvkId,
            filters
        );

        // Generate PDF
        const pdfBuffer = await pdfGenerationService.generateReportPDF(
            kvkInfo,
            sectionsData,
            filters,
            generatedBy
        );

        return {
            pdfBuffer,
            kvkInfo,
            sectionsData,
        };
    }

    /**
     * Generate KVK report as a structured Excel workbook (same structure as PDF).
     */
    async generateKvkReportExcel(kvkId, options = {}) {
        const { sectionIds = [], filters = {}, generatedBy = 'System' } = options;
        if (sectionIds.length === 0) {
            sectionIds.push(...getAllSections().map(s => s.id));
        }
        validateSectionIds(sectionIds);

        const kvkInfo = await reportDataService.getKvkInfoForHeader(kvkId);
        const sectionsData = await reportDataService.getMultipleSectionData(sectionIds, kvkId, filters);
        const excelBuffer = await reportExcelService.generateReportExcel(kvkInfo, sectionsData, filters, generatedBy);

        return { excelBuffer, kvkInfo, sectionsData };
    }

    /**
     * Generate KVK report as a Word document (same structure as the PDF).
     */
    async generateKvkReportWord(kvkId, options = {}) {
        const { sectionIds = [], filters = {}, generatedBy = 'System' } = options;
        if (sectionIds.length === 0) {
            sectionIds.push(...getAllSections().map(s => s.id));
        }
        validateSectionIds(sectionIds);

        const kvkInfo = await reportDataService.getKvkInfoForHeader(kvkId);
        const sectionsData = await reportDataService.getMultipleSectionData(sectionIds, kvkId, filters);
        const wordBuffer = await reportWordService.generateReportWord(kvkInfo, sectionsData, filters, generatedBy);

        return { wordBuffer, kvkInfo, sectionsData };
    }

    /**
     * Get report configuration (available sections)
     */
    getReportConfig() {
        const sections = getAllSections();
        return {
            sections: sections.map(s => ({
                id: s.id,
                title: s.title,
                description: s.description,
                subsection: s.subsection,
                parentSectionId: s.parentSectionId,
                dataSource: s.dataSource,
            })),
        };
    }

    /**
     * Get report data without generating PDF (for preview)
     */
    async getReportData(kvkId, options = {}) {
        const {
            sectionIds = [],
            filters = {},
        } = options;

        // Validate section IDs
        if (sectionIds.length === 0) {
            const allSections = getAllSections();
            sectionIds.push(...allSections.map(s => s.id));
        }

        validateSectionIds(sectionIds);

        // Get KVK info
        const kvkInfo = await reportDataService.getKvkInfoForHeader(kvkId);

        // Fetch data for all selected sections
        const sectionsData = await reportDataService.getMultipleSectionData(
            sectionIds,
            kvkId,
            filters
        );

        return {
            kvkInfo,
            sectionsData,
        };
    }

    /**
     * Generate aggregated report for multiple KVKs
     */
    async generateAggregatedReport(scope, options = {}) {
        const {
            sectionIds = [],
            filters = {},
            generatedBy = 'System',
        } = options;

        // Validate section IDs
        if (sectionIds.length === 0) {
            const allSections = getAllSections();
            sectionIds.push(...allSections.map(s => s.id));
        }

        validateSectionIds(sectionIds);

        // Get KVK IDs for the scope
        const kvkIds = await reportAggregationService.getKvkIdsForScope(scope);
        
        if (kvkIds.length === 0) {
            throw new Error('No KVKs found for the selected scope');
        }

        // Aggregate data for all selected sections
        const sectionsData = await reportAggregationService.aggregateMultipleSections(
            sectionIds,
            kvkIds,
            filters
        );

        // Build aggregated KVK info for header
        const kvkInfo = await this._buildAggregatedKvkInfo(scope, kvkIds);

        // Generate PDF
        const pdfBuffer = await pdfGenerationService.generateReportPDF(
            kvkInfo,
            sectionsData,
            filters,
            generatedBy
        );

        return {
            pdfBuffer,
            kvkInfo,
            sectionsData,
            kvkCount: kvkIds.length,
        };
    }

    /**
     * Generate aggregated (super-admin) report as a structured Excel workbook.
     */
    async generateAggregatedReportExcel(scope, options = {}) {
        const { sectionIds = [], filters = {}, generatedBy = 'System' } = options;
        if (sectionIds.length === 0) {
            sectionIds.push(...getAllSections().map(s => s.id));
        }
        validateSectionIds(sectionIds);

        const kvkIds = await reportAggregationService.getKvkIdsForScope(scope);
        if (kvkIds.length === 0) {
            throw new Error('No KVKs found for the selected scope');
        }

        const sectionsData = await reportAggregationService.aggregateMultipleSections(sectionIds, kvkIds, filters);
        const kvkInfo = await this._buildAggregatedKvkInfo(scope, kvkIds);
        const excelBuffer = await reportExcelService.generateReportExcel(kvkInfo, sectionsData, filters, generatedBy);

        return { excelBuffer, kvkInfo, sectionsData, kvkCount: kvkIds.length };
    }

    /**
     * Generate aggregated (super-admin) report as a Word document (matches PDF).
     */
    async generateAggregatedReportWord(scope, options = {}) {
        const { sectionIds = [], filters = {}, generatedBy = 'System' } = options;
        if (sectionIds.length === 0) {
            sectionIds.push(...getAllSections().map(s => s.id));
        }
        validateSectionIds(sectionIds);

        const kvkIds = await reportAggregationService.getKvkIdsForScope(scope);
        if (kvkIds.length === 0) {
            throw new Error('No KVKs found for the selected scope');
        }

        const sectionsData = await reportAggregationService.aggregateMultipleSections(sectionIds, kvkIds, filters);
        const kvkInfo = await this._buildAggregatedKvkInfo(scope, kvkIds);
        const wordBuffer = await reportWordService.generateReportWord(kvkInfo, sectionsData, filters, generatedBy);

        return { wordBuffer, kvkInfo, sectionsData, kvkCount: kvkIds.length };
    }

    /**
     * Get aggregated report data without generating PDF
     */
    async getAggregatedReportData(scope, options = {}) {
        const {
            sectionIds = [],
            filters = {},
        } = options;

        // Validate section IDs
        if (sectionIds.length === 0) {
            const allSections = getAllSections();
            sectionIds.push(...allSections.map(s => s.id));
        }

        validateSectionIds(sectionIds);

        // Get KVK IDs for the scope
        const kvkIds = await reportAggregationService.getKvkIdsForScope(scope);
        
        if (kvkIds.length === 0) {
            throw new Error('No KVKs found for the selected scope');
        }

        // Aggregate data for all selected sections
        const sectionsData = await reportAggregationService.aggregateMultipleSections(
            sectionIds,
            kvkIds,
            filters
        );

        // Build aggregated KVK info
        const kvkInfo = await this._buildAggregatedKvkInfo(scope, kvkIds);

        return {
            kvkInfo,
            sectionsData,
            kvkCount: kvkIds.length,
        };
    }

    /**
     * Build aggregated KVK info for report header
     */
    async _buildAggregatedKvkInfo(scope, kvkIds) {
        const prisma = require('../../config/prisma.js');

        // Get first KVK for basic structure
        const firstKvk = await prisma.kvk.findUnique({
            where: { kvkId: kvkIds[0] },
            include: {
                zone: { select: { zoneName: true } },
                state: { select: { stateName: true } },
                district: { select: { districtName: true } },
                org: { select: { orgName: true } },
            },
        });

        // All KVKs covered by this report — listed on the cover page.
        const kvks = await prisma.kvk.findMany({
            where: { kvkId: { in: kvkIds } },
            select: { kvkName: true },
            orderBy: { kvkName: 'asc' },
        });
        const kvkList = kvks.map(k => k.kvkName).filter(Boolean);

        const many = (ids, plural, single) =>
            ids && ids.length > 1 ? plural : single;

        return {
            kvkId: null,
            isAggregated: true,
            reportType: this._resolveReportType(scope),
            kvkCount: kvkIds.length,
            kvkList,
            kvkName: `Aggregated Report (${kvkIds.length} KVKs)`,
            zone: many(scope.zoneIds, 'Multiple Zones', firstKvk?.zone?.zoneName || ''),
            state: many(scope.stateIds, 'Multiple States', firstKvk?.state?.stateName || ''),
            organization: many(scope.orgIds, 'Multiple Organizations', firstKvk?.org?.orgName || ''),
            university: null,
        };
    }

    /**
     * Report type = the scope level the user selected, most specific first.
     * Mirrors the Report Scope tabs (Zone / State / District / Org / KVK).
     */
    _resolveReportType(scope) {
        if (scope.kvkIds && scope.kvkIds.length) return 'KVK';
        if (scope.orgIds && scope.orgIds.length) return 'Org';
        if (scope.districtIds && scope.districtIds.length) return 'District';
        if (scope.stateIds && scope.stateIds.length) return 'State';
        if (scope.zoneIds && scope.zoneIds.length) return 'Zone';
        return 'All KVKs';
    }
}

module.exports = new ReportService();
